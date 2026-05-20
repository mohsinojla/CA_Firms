import { z } from 'zod'

const fieldChangeSchema = z.object({
  old: z.string().nullable(),
  new: z.string().nullable(),
})

export const submitChangeSchema = z.object({
  firm_id: z.string().uuid('Invalid firm ID'),
  field_changes: z
    .object({
      email: fieldChangeSchema.optional(),
      contact_number: fieldChangeSchema.optional(),
      website: fieldChangeSchema.optional(),
      address: fieldChangeSchema.optional(),
      hiring_status: fieldChangeSchema.optional(),
      clients: fieldChangeSchema.optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      'At least one field must be changed'
    ),
})

export const reviewChangeSchema = z.object({
  action: z.enum(['approve', 'reject']),
  reviewer_note: z.string().max(500).optional(),
})

export type SubmitChangeInput = z.infer<typeof submitChangeSchema>
export type ReviewChangeInput = z.infer<typeof reviewChangeSchema>
