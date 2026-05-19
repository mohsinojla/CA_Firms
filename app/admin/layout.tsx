import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/constants'
import { redirect } from 'next/navigation'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { LayoutDashboard, Clock, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/pending', label: 'Pending', icon: Clock },
  { href: '/admin/audit', label: 'Audit Log', icon: FileText },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress

  if (!isAdmin(email)) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader isAdmin />
      <div className="flex-1 container py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar nav */}
          <aside className="md:w-48 shrink-0">
            <nav className="flex md:flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
