import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FIELD_LABELS, type EditableField } from '@/lib/constants'

interface DiffEntry {
  field: EditableField
  oldValue: string | null
  newValue: string | null
}

interface ChangeDiffViewProps {
  diffs: DiffEntry[]
  compact?: boolean
}

export function ChangeDiffView({ diffs, compact = false }: ChangeDiffViewProps) {
  const actualDiffs = diffs.filter((d) => d.oldValue !== d.newValue)

  if (actualDiffs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">No changes detected.</p>
    )
  }

  return (
    <div className={cn('space-y-2', compact && 'space-y-1.5')}>
      {actualDiffs.map((diff) => (
        <div key={diff.field} className={cn('rounded-md border overflow-hidden', compact && 'text-xs')}>
          <div className="px-3 py-1.5 bg-muted/40 border-b">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {FIELD_LABELS[diff.field]}
            </span>
          </div>
          <div className={cn('grid grid-cols-[1fr_auto_1fr] gap-2 items-center p-3', compact && 'p-2')}>
            <div className="rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 px-2 py-1.5 min-h-[2rem] flex items-center">
              <span className={cn('text-red-700 dark:text-red-400 break-all', compact ? 'text-xs' : 'text-sm')}>
                {diff.oldValue ?? <em className="opacity-60">empty</em>}
              </span>
            </div>
            <ArrowRight className={cn('shrink-0 text-muted-foreground', compact ? 'h-3 w-3' : 'h-4 w-4')} />
            <div className="rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 px-2 py-1.5 min-h-[2rem] flex items-center">
              <span className={cn('text-emerald-700 dark:text-emerald-400 break-all', compact ? 'text-xs' : 'text-sm')}>
                {diff.newValue ?? <em className="opacity-60">empty</em>}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
