import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { submitChangeSchema } from '@/lib/validations/change'
import { ADMIN_EMAILS } from '@/lib/constants'

async function notifyAdmins(firmName: string, changeId: string, fieldChanges: Record<string, { old: unknown; new: unknown }>) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://thirsty-wozniak-2eafdc.vercel.app'
  const reviewUrl = `${appUrl}/admin/pending`

  const changedFields = Object.entries(fieldChanges)
    .map(([field, { old: oldVal, new: newVal }]) =>
      `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-size:13px">${field}</td><td style="padding:4px 0;font-size:13px"><span style="color:#ef4444">${oldVal ?? '(empty)'}</span> → <span style="color:#10b981">${String(newVal)}</span></td></tr>`
    )
    .join('')

  const html = `
    <div style="font-family:sans-serif;max-width:500px">
      <h2 style="color:#1e3a5f;margin-bottom:4px">New Edit Suggestion</h2>
      <p style="color:#6b7280;margin-top:0">A community member submitted an edit for <strong>${firmName}</strong>.</p>
      <table style="border-collapse:collapse;margin:16px 0">${changedFields}</table>
      <a href="${reviewUrl}" style="display:inline-block;background:#1e3a5f;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px">Review in Admin Panel →</a>
    </div>`

  await Promise.all(
    ADMIN_EMAILS.map((to) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'CA Firms Directory <notifications@cafirms.pk>',
          to,
          subject: `New edit suggestion for ${firmName}`,
          html,
        }),
      }).catch(() => { /* don't block on email failure */ })
    )
  )
}

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

  // Notify admins — fire and forget
  notifyAdmins(firm.firm_name, change.id, field_changes as Record<string, { old: unknown; new: unknown }>)

  return NextResponse.json({ id: change.id, message: 'Change submitted for review' }, { status: 201 })
}
