import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { CITIES } from '@/lib/constants'

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-navy-800 dark:bg-navy-700">
                <Building2 className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-navy-900 dark:text-white">CA Firms Directory</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Community-driven directory of Chartered Accountant firms in Pakistan.
              Data is community-contributed and moderated.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Cities</h4>
            <ul className="space-y-2">
              {CITIES.map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/${city.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Community</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contributors"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contributors
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CA Firms Directory. Community-maintained.
          </p>
          <p className="text-xs text-muted-foreground">
            Data sourced from ICAP public registry.
          </p>
        </div>
      </div>
    </footer>
  )
}
