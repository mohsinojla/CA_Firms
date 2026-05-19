import { Card, CardContent } from '@/components/ui/card'
import { Building2, Clock, CheckCircle2, Users } from 'lucide-react'

interface StatsCardsProps {
  totalFirms: number
  pendingCount: number
  approvedToday: number
  totalContributors: number
}

export function StatsCards({
  totalFirms,
  pendingCount,
  approvedToday,
  totalContributors,
}: StatsCardsProps) {
  const stats = [
    {
      label: 'Total Firms',
      value: totalFirms.toLocaleString(),
      icon: Building2,
      color: 'text-navy-700 dark:text-navy-300',
      bg: 'bg-navy-50 dark:bg-navy-900/40',
    },
    {
      label: 'Pending Review',
      value: pendingCount.toLocaleString(),
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/40',
    },
    {
      label: 'Approved Today',
      value: approvedToday.toLocaleString(),
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/40',
    },
    {
      label: 'Contributors',
      value: totalContributors.toLocaleString(),
      icon: Users,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-900/40',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
              </div>
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
