import { auth } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/constants'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { currentUser } from '@clerk/nextjs/server'

export default async function DirectoryLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  let adminUser = false

  if (userId) {
    const user = await currentUser()
    const email = user?.emailAddresses[0]?.emailAddress
    adminUser = isAdmin(email)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader isAdmin={adminUser} />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  )
}
