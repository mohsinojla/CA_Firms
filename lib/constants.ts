export const ADMIN_EMAILS = [
  'asadrazaojla141678@gmail.com',
  'mohsinrazaojla32@gmail.com',
] as const

export type AdminEmail = (typeof ADMIN_EMAILS)[number]

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  return (ADMIN_EMAILS as readonly string[]).includes(email)
}

export const CITIES = [
  { slug: 'islamabad', name: 'Islamabad' },
  { slug: 'lahore', name: 'Lahore' },
] as const

export type CitySlug = (typeof CITIES)[number]['slug']

export const HIRING_STATUSES = ['Hiring', 'Not Hiring', 'Not Specified'] as const
export const MRS_DESIGNATIONS = ['FCA', 'ACA'] as const

export const EDITABLE_FIELDS = [
  'email',
  'contact_number',
  'website',
  'address',
  'hiring_status',
  'clients',
] as const

export type EditableField = (typeof EDITABLE_FIELDS)[number]

export const FIELD_LABELS: Record<EditableField, string> = {
  email: 'Email Address',
  contact_number: 'Contact Number',
  website: 'Website',
  address: 'Address',
  hiring_status: 'Hiring Status',
  clients: 'Clients',
}
