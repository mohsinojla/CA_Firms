'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Building2, Users, LayoutDashboard } from 'lucide-react'
import { DarkModeToggle } from '@/components/common/dark-mode-toggle'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CITIES } from '@/lib/constants'

interface SiteHeaderProps {
  isAdmin?: boolean
}

export function SiteHeader({ isAdmin = false }: SiteHeaderProps) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-navy-800 dark:bg-navy-700">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-bold text-navy-900 dark:text-white tracking-tight">
              CA Firms
            </span>
            <span className="ml-1 text-xs text-muted-foreground font-normal">Directory</span>
          </div>
        </Link>

        {/* City navigation */}
        <nav className="flex items-center gap-1">
          {CITIES.map((city) => (
            <Link
              key={city.slug}
              href={`/${city.slug}`}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md transition-colors',
                pathname === `/${city.slug}`
                  ? 'bg-navy-800 text-white dark:bg-navy-700'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              {city.name}
            </Link>
          ))}
          <Link
            href="/contributors"
            className={cn(
              'px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1.5',
              pathname === '/contributors'
                ? 'bg-navy-800 text-white dark:bg-navy-700'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            <Users className="h-3.5 w-3.5" />
            Contributors
          </Link>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2 shrink-0">
          <DarkModeToggle />

          {isAdmin && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin" className="flex items-center gap-1.5">
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </Button>
          )}

          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="navy" size="sm">
                Sign in
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'h-8 w-8',
                },
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  )
}
