import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { PageWrapper } from '@/components/layout/page-wrapper'
import { LeaderboardTable } from '@/components/contributors/leaderboard-table'
import { auth, currentUser } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/constants'
import type { ContributorWithProfile } from '@/types/firm'

export const metadata: Metadata = {
  title: 'Contributors',
  description: 'Top contributors to the CA Firms Directory. Help us build the largest CA firm database.',
}

export const dynamic = 'force-dynamic'

export default async function ContributorsPage() {
  const { userId } = await auth()
  let adminUser = false
  if (userId) {
    const user = await currentUser()
    adminUser = isAdmin(user?.emailAddresses[0]?.emailAddress)
  }

  const supabase = await createClient()

  const { data } = await supabase
    .from('contributor_stats')
    .select(`
      profile_id,
      total_submitted,
      total_approved,
      total_rejected,
      last_contribution_at,
      updated_at,
      profile:profiles!contributor_stats_profile_id_fkey (
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .gt('total_submitted', 0)
    .order('total_approved', { ascending: false })
    .limit(50)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader isAdmin={adminUser} />
      <PageWrapper>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Contributors</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Community members who help keep the CA firms directory accurate and up-to-date.
          </p>
        </div>

        <LeaderboardTable contributors={(data ?? []) as unknown as ContributorWithProfile[]} />
      </PageWrapper>
      <SiteFooter />
    </div>
  )
}
