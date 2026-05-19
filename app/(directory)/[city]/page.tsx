import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { FirmsTable } from '@/components/firms/firms-table'
import { FirmsTableSkeleton } from '@/components/firms/firms-table-skeleton'
import { PageWrapper } from '@/components/layout/page-wrapper'
import { CITIES } from '@/lib/constants'
import { Suspense } from 'react'

interface CityPageProps {
  params: Promise<{ city: string }>
}

export async function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }))
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { city } = await params
  const cityData = CITIES.find((c) => c.slug === city)

  if (!cityData) return {}

  return {
    title: `CA Firms in ${cityData.name}`,
    description: `Browse all registered Chartered Accountant firms in ${cityData.name}, Pakistan. Search by firm name, TO code, or MRS.`,
  }
}

async function FirmsContent({ citySlug }: { citySlug: string }) {
  const supabase = await createClient()

  const { data: cityData } = await supabase
    .from('cities')
    .select('*')
    .eq('slug', citySlug)
    .single()

  if (!cityData) notFound()

  const cityId: string = (cityData as { id: string }).id

  const { data: firms, error } = await supabase
    .from('firms')
    .select('*')
    .eq('city_id', cityId)
    .eq('is_active', true)
    .order('firm_name', { ascending: true })

  if (error) {
    throw new Error('Failed to load firms')
  }

  return (
    <FirmsTable
      initialFirms={firms ?? []}
      cityId={cityId}
    />
  )
}

export default async function CityPage({ params }: CityPageProps) {
  const { city } = await params

  const cityData = CITIES.find((c) => c.slug === city)
  if (!cityData) notFound()

  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">
          CA Firms — {cityData.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Registered Chartered Accountant firms in {cityData.name}. Community-maintained data.
        </p>
      </div>

      <Suspense fallback={<FirmsTableSkeleton />}>
        <FirmsContent citySlug={city} />
      </Suspense>
    </PageWrapper>
  )
}
