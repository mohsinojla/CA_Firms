import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { createAdminClient } from '@/lib/supabase/admin'

interface ClerkEmailAddress {
  email_address: string
  id: string
}

interface ClerkUserEvent {
  data: {
    id: string
    email_addresses: ClerkEmailAddress[]
    primary_email_address_id: string
    first_name: string | null
    last_name: string | null
    image_url: string
  }
  type: string
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const svixId = req.headers.get('svix-id')
  const svixTimestamp = req.headers.get('svix-timestamp')
  const svixSignature = req.headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const body = await req.text()

  const wh = new Webhook(webhookSecret)
  let event: ClerkUserEvent

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkUserEvent
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'user.created' && event.type !== 'user.updated') {
    return NextResponse.json({ message: 'Ignored' })
  }

  const { id: clerkId, email_addresses, first_name, last_name, image_url } = event.data
  const primaryEmail = email_addresses.find((e) => e.id === event.data.primary_email_address_id)
  const email = primaryEmail?.email_address ?? email_addresses[0]?.email_address

  if (!email) {
    return NextResponse.json({ error: 'No email found' }, { status: 400 })
  }

  const fullName = [first_name, last_name].filter(Boolean).join(' ') || null
  const supabase = createAdminClient()

  const { error } = await supabase.from('profiles').upsert(
    {
      clerk_id: clerkId,
      email,
      full_name: fullName,
      avatar_url: image_url ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'clerk_id' }
  )

  if (error) {
    console.error('Error upserting profile:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  if (event.type === 'user.created') {
    // Initialize contributor stats
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_id', clerkId)
      .single()

    if (profile) {
      await supabase
        .from('contributor_stats')
        .upsert({ profile_id: profile.id }, { onConflict: 'profile_id', ignoreDuplicates: true })
    }
  }

  return NextResponse.json({ message: 'Profile synced' })
}
