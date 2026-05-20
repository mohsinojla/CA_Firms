'use client'

import { Building2, MapPin, Calendar, User, Mail, Phone, Globe, Hash, Users } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SuggestEditButton } from './suggest-edit-button'
import { formatDate } from '@/lib/utils'
import type { Firm } from '@/types/firm'

interface FirmDetailDialogProps {
  firm: Firm | null
  open: boolean
  onClose: () => void
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <div className="text-sm text-foreground break-words">{value}</div>
      </div>
    </div>
  )
}

export function FirmDetailDialog({ firm, open, onClose }: FirmDetailDialogProps) {
  if (!firm) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-800 dark:bg-navy-700">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-base leading-tight">{firm.firm_name}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <Hash className="h-3 w-3" />
                <span className="font-mono">{firm.to_code}</span>
                <span>•</span>
                <span>{firm.city_name}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <div className="space-y-1">
          <DetailRow
            icon={<User className="h-4 w-4" />}
            label="Managing Responsible Solicitor"
            value={
              firm.mrs_name && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span>{firm.mrs_name}</span>
                  {firm.mrs_designation && (
                    <Badge variant={firm.mrs_designation === 'FCA' ? 'fca' : 'aca'}>
                      {firm.mrs_designation}
                    </Badge>
                  )}
                  {firm.mrs_number && (
                    <span className="text-muted-foreground text-xs">Mem. #{firm.mrs_number}</span>
                  )}
                </div>
              )
            }
          />
          <DetailRow
            icon={<MapPin className="h-4 w-4" />}
            label="Address"
            value={firm.address}
          />
          <DetailRow
            icon={<Calendar className="h-4 w-4" />}
            label="Approved Since"
            value={formatDate(firm.approved_wef)}
          />
          <DetailRow
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            value={
              firm.email ? (
                <a href={`mailto:${firm.email}`} className="text-navy-700 dark:text-navy-300 hover:underline">
                  {firm.email}
                </a>
              ) : (
                <span className="text-muted-foreground italic text-xs">Not provided</span>
              )
            }
          />
          <DetailRow
            icon={<Phone className="h-4 w-4" />}
            label="Contact Number"
            value={
              firm.contact_number ? (
                <a href={`tel:${firm.contact_number}`} className="text-navy-700 dark:text-navy-300 hover:underline">
                  {firm.contact_number}
                </a>
              ) : (
                <span className="text-muted-foreground italic text-xs">Not provided</span>
              )
            }
          />
          <DetailRow
            icon={<Globe className="h-4 w-4" />}
            label="Website"
            value={
              firm.website ? (
                <a
                  href={firm.website.startsWith('http') ? firm.website : `https://${firm.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-navy-700 dark:text-navy-300 hover:underline"
                >
                  {firm.website}
                </a>
              ) : (
                <span className="text-muted-foreground italic text-xs">Not provided</span>
              )
            }
          />
        </div>

        <Separator />

        {/* Clients section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Clients</h3>
          </div>
          {firm.clients ? (
            <div className="flex flex-wrap gap-1.5">
              {firm.clients.split(',').map((client) => client.trim()).filter(Boolean).map((client) => (
                <span
                  key={client}
                  className="text-xs bg-navy-50 dark:bg-navy-900/40 text-navy-700 dark:text-navy-300 px-2 py-0.5 rounded-full border border-navy-200 dark:border-navy-700"
                >
                  {client}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground leading-relaxed">
              No clients listed yet. Help the community by contributing this firm&apos;s notable clients.
            </p>
          )}
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Know something missing or incorrect?
          </p>
          <SuggestEditButton firm={firm} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
