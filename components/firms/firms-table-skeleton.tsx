import { Skeleton } from '@/components/ui/skeleton'

export function FirmsTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search bar skeleton */}
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 max-w-sm" />
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Table header */}
      <div className="rounded-lg border overflow-hidden">
        <div className="border-b bg-muted/40 px-4 py-3 grid grid-cols-[2fr_1fr_2fr_1fr_1fr_1fr] gap-4">
          {['Firm Name', 'TO Code', 'MRS', 'City', 'Approved', 'Status'].map((h) => (
            <Skeleton key={h} className="h-4 w-20" />
          ))}
        </div>

        {/* Table rows */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="border-b last:border-0 px-4 py-4 grid grid-cols-[2fr_1fr_2fr_1fr_1fr_1fr] gap-4 items-center"
          >
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  )
}
