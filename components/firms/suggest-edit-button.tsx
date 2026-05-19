'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { SuggestEditDialog } from '@/components/contributions/suggest-edit-dialog'
import type { Firm } from '@/types/firm'

interface SuggestEditButtonProps {
  firm: Firm
  size?: 'sm' | 'default'
}

export function SuggestEditButton({ firm, size = 'sm' }: SuggestEditButtonProps) {
  const [open, setOpen] = useState(false)
  const { isSignedIn } = useAuth()

  const handleClick = () => {
    if (!isSignedIn) {
      // Clerk's SignInButton handles the redirect, but we can also push to sign-in
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`
      return
    }
    setOpen(true)
  }

  return (
    <>
      <Button variant="outline" size={size} onClick={handleClick} className="gap-1.5">
        <Pencil className="h-3.5 w-3.5" />
        Contribute Data
      </Button>

      {isSignedIn && (
        <SuggestEditDialog firm={firm} open={open} onClose={() => setOpen(false)} />
      )}
    </>
  )
}
