'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { PendingChangeWithDetails } from '@/types/firm'

export function usePendingRealtime(onNewChange?: (change: PendingChangeWithDetails) => void) {
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('admin:pending_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pending_changes' },
        async (payload) => {
          const row = payload.new as {
            id: string
            firm_id: string
            submitted_by: string
            field_changes: PendingChangeWithDetails['field_changes']
            status: string
            submitted_at: string
            reviewer_id: string | null
            reviewer_note: string | null
            reviewed_at: string | null
          }

          const [{ data: firm }, { data: submitter }] = await Promise.all([
            supabase
              .from('firms')
              .select('id, firm_name, to_code, city_name')
              .eq('id', row.firm_id)
              .single(),
            supabase
              .from('profiles')
              .select('id, full_name, email, avatar_url')
              .eq('id', row.submitted_by)
              .single(),
          ])

          type FirmRow = { id: string; firm_name: string; to_code: string; city_name: string }
          type SubmitterRow = { id: string; full_name: string | null; email: string; avatar_url: string | null }

          if (firm && submitter) {
            const f = firm as unknown as FirmRow
            const s = submitter as unknown as SubmitterRow
            const change: PendingChangeWithDetails = {
              id: row.id,
              firm_id: row.firm_id,
              submitted_by: row.submitted_by,
              status: row.status as 'pending' | 'approved' | 'rejected',
              field_changes: row.field_changes,
              reviewer_id: row.reviewer_id,
              reviewer_note: row.reviewer_note,
              submitted_at: row.submitted_at,
              reviewed_at: row.reviewed_at,
              firm: f,
              submitter: s,
            }
            onNewChange?.(change)
            toast.info(`New edit suggestion`, {
              description: `${s.full_name ?? 'A user'} suggested a change for ${f.firm_name}`,
            })
          } else {
            toast.info('New contribution submitted', {
              description: 'Reload the page if it does not appear.',
              action: { label: 'Reload', onClick: () => window.location.reload() },
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [onNewChange])
}
