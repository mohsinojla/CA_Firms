import { auth, currentUser } from '@clerk/nextjs/server'
import { isAdmin } from './constants'

export async function getAuthUser() {
  const { userId } = await auth()
  if (!userId) return null
  return currentUser()
}

export async function requireAuth() {
  const { userId } = await auth()
  if (!userId) {
    throw new Error('Unauthorized')
  }
  return userId
}

export async function requireAdmin() {
  const user = await getAuthUser()
  if (!user) throw new Error('Unauthorized')

  const email = user.emailAddresses[0]?.emailAddress
  if (!isAdmin(email)) {
    throw new Error('Forbidden: admin access required')
  }

  return user
}

export async function getSessionEmail(): Promise<string | null> {
  const user = await getAuthUser()
  return user?.emailAddresses[0]?.emailAddress ?? null
}
