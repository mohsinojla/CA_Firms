import { cn } from '@/lib/utils'

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <main className={cn('container py-8 min-h-[calc(100vh-4rem)]', className)}>
      {children}
    </main>
  )
}
