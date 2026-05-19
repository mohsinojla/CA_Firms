import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { PendingQueue } from '@/components/admin/pending-queue'
import type { PendingChangeWithDetails } from '@/types/firm'

export const metadata: Metadata = { title: 'Pending Changes' }

export const dynamic = 'force-dynamic'

export default async function PendingPage() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('pending_changes')
    .select(`
      *,
      firm:firms!pending_changes_firm_id_fkey (
        id,
        firm_name,
        to_code,
        city_name
      ),
      submitter:profiles!pending_changes_submitted_by_fkey (
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .eq('status', 'pending')
    .order('submitted_at', { ascending: true })

  if (error) {
    return (
      <div className="text-sm text-destructive">
        Failed to load pending changes: {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Pending Changes</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review and approve or reject community contributions.
        </p>
      </div>

      <PendingQueue initialChanges={(data ?? []) as unknown as PendingChangeWithDetails[]} />
    </div>
  )
}
