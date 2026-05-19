import { Building2, MapPin, Calendar, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import type { Firm } from '@/types/firm'

interface FirmCardProps {
  firm: Firm
  onClick?: () => void
}

function getHiringBadgeVariant(status: string) {
  if (status === 'Hiring') return 'hiring'
  if (status === 'Not Hiring') return 'notHiring'
  return 'notSpecified'
}

export function FirmCard({ firm, onClick }: FirmCardProps) {
  return (
    <Card
      className="hover:border-navy-300 dark:hover:border-navy-600 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-navy-50 dark:bg-navy-900/40">
              <Building2 className="h-4 w-4 text-navy-600 dark:text-navy-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-tight text-foreground">{firm.firm_name}</h3>
              <span className="text-xs text-muted-foreground font-mono">{firm.to_code}</span>
            </div>
          </div>
          <Badge variant={getHiringBadgeVariant(firm.hiring_status)} className="shrink-0">
            {firm.hiring_status}
          </Badge>
        </div>

        <div className="space-y-1.5 text-xs text-muted-foreground">
          {firm.mrs_name && (
            <div className="flex items-center gap-1.5">
              <User className="h-3 w-3 shrink-0" />
              <span>{firm.mrs_name}</span>
              {firm.mrs_designation && (
                <Badge variant={firm.mrs_designation === 'FCA' ? 'fca' : 'aca'} className="text-[10px] px-1.5 py-0">
                  {firm.mrs_designation}
                </Badge>
              )}
              {firm.mrs_number && <span className="text-xs">#{firm.mrs_number}</span>}
            </div>
          )}
          {firm.address && (
            <div className="flex items-start gap-1.5">
              <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{firm.address}</span>
            </div>
          )}
          {firm.approved_wef && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3 shrink-0" />
              <span>Approved {formatDate(firm.approved_wef)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
