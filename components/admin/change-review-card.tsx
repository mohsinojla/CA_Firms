'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Building2, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChangeDiffView } from '@/components/contributions/change-diff-view'
import { formatRelativeTime, getInitials } from '@/lib/utils'
import { FIELD_LABELS, type EditableField } from '@/lib/constants'
import type { PendingChangeWithDetails } from '@/types/firm'

interface ChangeReviewCardProps {
  change: PendingChangeWithDetails
  onReviewed: (id: string, action: 'approve' | 'reject') => void
}

export function ChangeReviewCard({ change, onReviewed }: ChangeReviewCardProps) {
  const [note, setNote] = useState('')
  const [isLoading, setIsLoading] = useState<'approve' | 'reject' | null>(null)
  const [showNote, setShowNote] = useState(false)

  const diffs = Object.entries(change.field_changes)
    .filter(([field]) => field in FIELD_LABELS)
    .map(([field, value]) => ({
      field: field as EditableField,
      oldValue: (value as { old: string | null }).old,
      newValue: (value as { new: string | null }).new,
    }))

  const handleAction = async (action: 'approve' | 'reject') => {
    setIsLoading(action)
    try {
      const res = await fetch(`/api/changes/${change.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reviewer_note: note || undefined }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to review change')
      }

      toast.success(action === 'approve' ? 'Change approved and applied!' : 'Change rejected.')
      onReviewed(change.id, action)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <Card className="border hover:border-navy-300 dark:hover:border-navy-600 transition-colors">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-50 dark:bg-navy-900/40">
              <Building2 className="h-4.5 w-4.5 text-navy-600 dark:text-navy-400" />
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight">{change.firm.firm_name}</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{change.firm.to_code} • {change.firm.city_name}</p>
            </div>
          </div>
          <Badge variant="pending" className="shrink-0">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        </div>

        {/* Contributor */}
        <div className="flex items-center gap-2 mb-4 pb-4 border-b">
          <Avatar className="h-7 w-7">
            <AvatarImage src={change.submitter.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs">{getInitials(change.submitter.full_name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs font-medium">{change.submitter.full_name ?? 'Anonymous'}</p>
            <p className="text-xs text-muted-foreground">{change.submitter.email} • {formatRelativeTime(change.submitted_at)}</p>
          </div>
        </div>

        {/* Diff */}
        <div className="mb-4">
          <ChangeDiffView diffs={diffs} />
        </div>

        {/* Reviewer note */}
        {showNote && (
          <div className="mb-3">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note to contributor..."
              className="text-sm resize-none"
              rows={2}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 justify-between">
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
            onClick={() => setShowNote(!showNote)}
          >
            {showNote ? 'Hide note' : 'Add note'}
          </button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive border-red-200 hover:border-destructive dark:border-red-900/50"
              onClick={() => handleAction('reject')}
              disabled={!!isLoading}
            >
              <XCircle className="h-3.5 w-3.5" />
              {isLoading === 'reject' ? 'Rejecting…' : 'Reject'}
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => handleAction('approve')}
              disabled={!!isLoading}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              {isLoading === 'approve' ? 'Approving…' : 'Approve'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
