'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function usePendingRealtime() {
  const [newCount, setNewCount] = useState(0)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('admin:pending_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pending_changes',
        },
        () => {
          setNewCount((c) => c + 1)
          toast.info('New contribution submitted', {
            description: 'A user has submitted a change for review.',
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const resetCount = () => setNewCount(0)

  return { newCount, resetCount }
}
