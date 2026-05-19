'use client'

import { useState, useCallback } from 'react'
import { ChangeReviewCard } from './change-review-card'
import { EmptyState } from '@/components/common/empty-state'
import { usePendingRealtime } from '@/hooks/use-pending-realtime'
import { CheckCircle2 } from 'lucide-react'
import type { PendingChangeWithDetails } from '@/types/firm'

interface PendingQueueProps {
  initialChanges: PendingChangeWithDetails[]
}

export function PendingQueue({ initialChanges }: PendingQueueProps) {
  const [changes, setChanges] = useState(initialChanges)

  const handleNewChange = useCallback((change: PendingChangeWithDetails) => {
    setChanges((prev) => {
      if (prev.some((c) => c.id === change.id)) return prev
      return [change, ...prev]
    })
  }, [])

  usePendingRealtime(handleNewChange)

  const handleReviewed = (id: string) => {
    setChanges((prev) => prev.filter((c) => c.id !== id))
  }

  if (changes.length === 0) {
    return (
      <EmptyState
        icon={<CheckCircle2 className="h-8 w-8" />}
        title="All caught up!"
        description="No pending changes to review."
      />
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{changes.length} pending review</p>
      {changes.map((change) => (
        <ChangeReviewCard
          key={change.id}
          change={change}
          onReviewed={handleReviewed}
        />
      ))}
    </div>
  )
}
