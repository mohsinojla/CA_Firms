import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getInitials, formatRelativeTime } from '@/lib/utils'
import type { ContributorWithProfile } from '@/types/firm'

interface LeaderboardTableProps {
  contributors: ContributorWithProfile[]
}

const RANK_STYLES: Record<number, string> = {
  1: 'text-amber-500 font-bold',
  2: 'text-zinc-400 font-bold',
  3: 'text-amber-700 dark:text-amber-600 font-bold',
}

const RANK_LABELS: Record<number, string> = {
  1: '🏆 Top Contributor',
  2: '🥈 Runner-up',
  3: '🥉 Third Place',
}

export function LeaderboardTable({ contributors }: LeaderboardTableProps) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/40 border-b">
          <tr>
            {['Rank', 'Contributor', 'Approved', 'Submitted', 'Rate', 'Last Active'].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {contributors.filter((c) => c.profile != null).map((c, i) => {
            const rank = i + 1
            const approvalRate = c.total_submitted > 0
              ? Math.round((c.total_approved / c.total_submitted) * 100)
              : 0

            return (
              <tr
                key={c.profile_id}
                className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${
                  rank <= 3 ? 'bg-amber-50/30 dark:bg-amber-900/10' : ''
                }`}
              >
                <td className="px-4 py-3.5">
                  <span className={`text-lg tabular-nums ${RANK_STYLES[rank] ?? 'text-muted-foreground'}`}>
                    {rank}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={c.profile?.avatar_url ?? undefined} />
                      <AvatarFallback>{getInitials(c.profile?.full_name ?? null)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium leading-tight">
                          {c.profile?.full_name ?? 'Anonymous'}
                        </p>
                        {RANK_LABELS[rank] && (
                          <Badge variant="gold" className="text-[10px] px-1.5 py-0">
                            {RANK_LABELS[rank]}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{c.profile?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {c.total_approved}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-sm tabular-nums">{c.total_submitted}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${approvalRate}%` }}
                      />
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">{approvalRate}%</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-sm text-muted-foreground whitespace-nowrap">
                  {formatRelativeTime(c.last_contribution_at)}
                </td>
              </tr>
            )
          })}
          {contributors.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-16 text-center text-sm text-muted-foreground">
                No contributors yet. Be the first!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
