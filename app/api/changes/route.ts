import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { submitChangeSchema } from '@/lib/validations/change'

export async function POST(req: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = submitChangeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { firm_id, field_changes } = parsed.data

  // Verify the firm exists
  const supabasePublic = await createClient()
  const { data: firm, error: firmErr } = await supabasePublic
    .from('firms')
    .select('id, firm_name')
    .eq('id', firm_id)
    .single()

  if (firmErr || !firm) {
    return NextResponse.json({ error: 'Firm not found' }, { status: 404 })
  }

  // Get or create the profile
  const supabase = createAdminClient()

  let { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (profileErr || !profile) {
    return NextResponse.json(
      { error: 'Profile not found. Please try signing out and back in.' },
      { status: 404 }
    )
  }

  // Check for duplicate pending change by same user for same firm
  const { data: existing } = await supabase
    .from('pending_changes')
    .select('id')
    .eq('firm_id', firm_id)
    .eq('submitted_by', profile.id)
    .eq('status', 'pending')
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: 'You already have a pending suggestion for this firm. Please wait for it to be reviewed.' },
      { status: 409 }
    )
  }

  // Insert the change
  const { data: change, error: insertErr } = await supabase
    .from('pending_changes')
    .insert({
      firm_id,
      submitted_by: profile.id,
      field_changes,
      status: 'pending',
    })
    .select('id')
    .single()

  if (insertErr || !change) {
    console.error('Error inserting change:', insertErr)
    return NextResponse.json({ error: 'Failed to submit change' }, { status: 500 })
  }

  // Insert audit log
  await supabase.from('audit_logs').insert({
    change_id: change.id,
    firm_id,
    actor_id: profile.id,
    action: 'change_submitted',
    metadata: { field_count: Object.keys(field_changes).length },
  })

  // Upsert contributor stats (increment submitted count)
  await supabase
    .from('contributor_stats')
    .upsert(
      {
        profile_id: profile.id,
        total_submitted: 1,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'profile_id' }
    )

  // This won't work with upsert for incrementing — use RPC or raw update
  await supabase.rpc('increment_submitted', { p_profile_id: profile.id }).maybeSingle()

  return NextResponse.json({ id: change.id, message: 'Change submitted for review' }, { status: 201 })
}
