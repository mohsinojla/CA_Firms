import { SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  className?: string
  action?: React.ReactNode
}

export function EmptyState({
  title = 'No results found',
  description = 'Try adjusting your search or filters.',
  icon,
  className,
  action,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      <div className="mb-4 rounded-full bg-muted p-4 text-muted-foreground">
        {icon ?? <SearchX className="h-8 w-8" />}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
