import { Badge } from '@/components/ui/badge'
import { formatRelativeTime } from '@/lib/utils'
import type { AuditLog } from '@/types/firm'

interface AuditLogTableProps {
  logs: (AuditLog & {
    firm?: { firm_name: string; to_code: string } | null
    actor?: { full_name: string | null; email: string } | null
  })[]
}

const actionConfig: Record<string, { label: string; variant: 'approved' | 'rejected' | 'pending' }> = {
  change_approved: { label: 'Approved', variant: 'approved' },
  change_rejected: { label: 'Rejected', variant: 'rejected' },
  change_submitted: { label: 'Submitted', variant: 'pending' },
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/40 border-b">
          <tr>
            {['Firm', 'Action', 'By', 'When'].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            const config = actionConfig[log.action] ?? { label: log.action, variant: 'pending' as const }
            return (
              <tr key={log.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  {log.firm ? (
                    <div>
                      <p className="text-sm font-medium leading-tight">{log.firm.firm_name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{log.firm.to_code}</p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={config.variant}>{config.label}</Badge>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm">{log.actor?.full_name ?? 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{log.actor?.email}</p>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                  {formatRelativeTime(log.created_at)}
                </td>
              </tr>
            )
          })}
          {logs.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-12 text-center text-sm text-muted-foreground">
                No audit logs yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
