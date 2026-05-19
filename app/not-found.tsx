export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Building2 } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-800 dark:bg-navy-700">
        <Building2 className="h-8 w-8 text-white" />
      </div>
      <div>
        <h1 className="text-4xl font-bold tabular-nums text-navy-900 dark:text-white">404</h1>
        <p className="mt-2 text-muted-foreground">This page doesn&apos;t exist.</p>
      </div>
      <Button variant="navy" asChild>
        <Link href="/islamabad">Back to Directory</Link>
      </Button>
    </div>
  )
}
