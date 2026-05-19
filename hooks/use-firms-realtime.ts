'use client'

import { useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Firm } from '@/types/firm'

type FirmUpdateCallback = (updatedFirm: Firm) => void

export function useFirmsRealtime(cityId: string | null, onUpdate: FirmUpdateCallback) {
  const handleUpdate = useCallback(onUpdate, [onUpdate])

  useEffect(() => {
    if (!cityId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`firms:city:${cityId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'firms',
          filter: `city_id=eq.${cityId}`,
        },
        (payload) => {
          handleUpdate(payload.new as Firm)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [cityId, handleUpdate])
}
