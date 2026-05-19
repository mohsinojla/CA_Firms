import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { AuditLogTable } from '@/components/admin/audit-log-table'

export const metadata: Metadata = { title: 'Audit Log' }

export const dynamic = 'force-dynamic'

export default async function AuditPage() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      *,
      firm:firms!audit_logs_firm_id_fkey (
        firm_name,
        to_code
      ),
      actor:profiles!audit_logs_actor_id_fkey (
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    return (
      <div className="text-sm text-destructive">
        Failed to load audit logs: {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Audit Log</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Full history of all submitted, approved, and rejected changes.
        </p>
      </div>

      <AuditLogTable logs={(data ?? []) as Parameters<typeof AuditLogTable>[0]['logs']} />
    </div>
  )
}
