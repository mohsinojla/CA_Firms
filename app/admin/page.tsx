import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { StatsCards } from '@/components/admin/stats-cards'

export const metadata: Metadata = { title: 'Admin Dashboard' }

export default async function AdminPage() {
  const supabase = createAdminClient()

  const [
    { count: totalFirms },
    { count: pendingCount },
    { count: approvedToday },
    { count: totalContributors },
  ] = await Promise.all([
    supabase.from('firms').select('*', { count: 'exact', head: true }),
    supabase
      .from('pending_changes')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('action', 'change_approved')
      .gte('created_at', new Date().toISOString().split('T')[0]),
    supabase
      .from('contributor_stats')
      .select('*', { count: 'exact', head: true })
      .gt('total_submitted', 0),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Monitor contributions and manage the directory.</p>
      </div>

      <StatsCards
        totalFirms={totalFirms ?? 0}
        pendingCount={pendingCount ?? 0}
        approvedToday={approvedToday ?? 0}
        totalContributors={totalContributors ?? 0}
      />

      <div className="rounded-lg border p-4 bg-muted/20">
        <h2 className="text-sm font-semibold mb-2">Quick Links</h2>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>→ <a href="/admin/pending" className="hover:text-foreground transition-colors underline-offset-2 hover:underline">Review pending changes</a></li>
          <li>→ <a href="/admin/audit" className="hover:text-foreground transition-colors underline-offset-2 hover:underline">View audit log</a></li>
          <li>→ <a href="/contributors" className="hover:text-foreground transition-colors underline-offset-2 hover:underline">Contributors leaderboard</a></li>
        </ul>
      </div>
    </div>
  )
}
