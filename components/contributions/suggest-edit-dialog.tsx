'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChangeDiffView } from './change-diff-view'
import { firmEditSchema, type FirmEditInput } from '@/lib/validations/firm'
import { FIELD_LABELS, type EditableField } from '@/lib/constants'
import type { Firm } from '@/types/firm'

interface SuggestEditDialogProps {
  firm: Firm
  open: boolean
  onClose: () => void
}

export function SuggestEditDialog({ firm, open, onClose }: SuggestEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDiff, setShowDiff] = useState(false)

  const defaultValues: FirmEditInput = {
    email: firm.email ?? '',
    contact_number: firm.contact_number ?? '',
    website: firm.website ?? '',
    address: firm.address ?? '',
    hiring_status: (firm.hiring_status as 'Hiring' | 'Not Hiring' | 'Not Specified') ?? 'Not Specified',
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FirmEditInput>({
    resolver: zodResolver(firmEditSchema),
    defaultValues,
  })

  const currentValues = watch()

  const diffs: { field: EditableField; oldValue: string | null; newValue: string | null }[] = (
    Object.keys(FIELD_LABELS) as EditableField[]
  ).map((field) => ({
    field,
    oldValue: (defaultValues[field] as string | null | undefined) ?? null,
    newValue: (currentValues[field] as string | null | undefined) ?? null,
  }))

  const hasChanges = diffs.some((d) => d.oldValue !== d.newValue)

  const onSubmit = async (data: FirmEditInput) => {
    if (!hasChanges) {
      toast.error('No changes detected.')
      return
    }

    setIsSubmitting(true)

    const fieldChanges: Record<string, { old: string | null; new: string | null }> = {}

    for (const diff of diffs) {
      if (diff.oldValue !== diff.newValue) {
        fieldChanges[diff.field] = {
          old: diff.oldValue,
          new: diff.newValue || null,
        }
      }
    }

    try {
      const res = await fetch('/api/changes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firm_id: firm.id, field_changes: fieldChanges }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to submit change')
      }

      toast.success('Suggestion submitted!', {
        description: 'Your edit will be reviewed by our moderators.',
      })
      reset()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    setShowDiff(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Suggest an Edit</DialogTitle>
          <DialogDescription>
            Editing <strong>{firm.firm_name}</strong> ({firm.to_code}). Changes go to admin review before publishing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">{FIELD_LABELS.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="firm@example.com"
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact_number">{FIELD_LABELS.contact_number}</Label>
              <Input
                id="contact_number"
                placeholder="+92 51 XXXXXXX"
                {...register('contact_number')}
              />
              {errors.contact_number && (
                <p className="text-xs text-destructive">{errors.contact_number.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="website">{FIELD_LABELS.website}</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://firmname.com"
                {...register('website')}
              />
              {errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">{FIELD_LABELS.address}</Label>
              <Textarea
                id="address"
                placeholder="Full office address..."
                className="resize-none"
                rows={2}
                {...register('address')}
              />
              {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>{FIELD_LABELS.hiring_status}</Label>
              <Select
                value={currentValues.hiring_status ?? 'Not Specified'}
                onValueChange={(val) =>
                  setValue('hiring_status', val as 'Hiring' | 'Not Hiring' | 'Not Specified')
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hiring">Hiring</SelectItem>
                  <SelectItem value="Not Hiring">Not Hiring</SelectItem>
                  <SelectItem value="Not Specified">Not Specified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Diff preview */}
          <div>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors"
              onClick={() => setShowDiff(!showDiff)}
            >
              {showDiff ? 'Hide' : 'Preview'} changes
            </button>
            {showDiff && (
              <div className="mt-2">
                <ChangeDiffView diffs={diffs} compact />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !hasChanges} variant="navy">
              {isSubmitting ? 'Submitting…' : 'Submit Suggestion'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
