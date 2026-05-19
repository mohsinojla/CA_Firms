import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contributor_stats')
    .select(`
      profile_id,
      total_submitted,
      total_approved,
      total_rejected,
      last_contribution_at,
      updated_at,
      profile:profiles!contributor_stats_profile_id_fkey (
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .gt('total_submitted', 0)
    .order('total_approved', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch contributors' }, { status: 500 })
  }

  return NextResponse.json(data)
}
