import { z } from 'zod'

export const firmEditSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal(''))
    .nullable(),
  contact_number: z
    .string()
    .max(20, 'Contact number too long')
    .optional()
    .or(z.literal(''))
    .nullable(),
  website: z
    .string()
    .url('Invalid website URL')
    .optional()
    .or(z.literal(''))
    .nullable(),
  address: z
    .string()
    .max(500, 'Address too long')
    .optional()
    .or(z.literal(''))
    .nullable(),
  hiring_status: z
    .enum(['Hiring', 'Not Hiring', 'Not Specified'])
    .optional()
    .nullable(),
  clients: z
    .string()
    .max(60, 'Max 60 characters — use comma-separated names')
    .optional()
    .or(z.literal(''))
    .nullable(),
})

export type FirmEditInput = z.infer<typeof firmEditSchema>
