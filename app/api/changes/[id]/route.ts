import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { reviewChangeSchema } from '@/lib/validations/change'
import { isAdmin } from '@/lib/constants'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  // Verify admin
  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress
  if (!isAdmin(email)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = reviewChangeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { action, reviewer_note } = parsed.data
  const supabase = createAdminClient()

  // Get the reviewer's profile
  const { data: reviewerProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (!reviewerProfile) {
    return NextResponse.json({ error: 'Reviewer profile not found' }, { status: 404 })
  }

  try {
    if (action === 'approve') {
      const { error } = await supabase.rpc('approve_change', {
        p_change_id: id,
        p_reviewer_id: reviewerProfile.id,
        p_reviewer_note: reviewer_note ?? null,
      })
      if (error) throw error
    } else {
      const { error } = await supabase.rpc('reject_change', {
        p_change_id: id,
        p_reviewer_id: reviewerProfile.id,
        p_reviewer_note: reviewer_note ?? null,
      })
      if (error) throw error
    }
  } catch (err) {
    console.error(`Error ${action}ing change:`, err)
    const message = err instanceof Error ? err.message : 'Database error'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ message: `Change ${action}d successfully` })
}
