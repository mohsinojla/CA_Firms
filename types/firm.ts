import type { Database } from './database'

export type City = Database['public']['Tables']['cities']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Firm = Database['public']['Tables']['firms']['Row']
export type PendingChange = Database['public']['Tables']['pending_changes']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']
export type ContributorStats = Database['public']['Tables']['contributor_stats']['Row']

export type FieldChange = {
  old: string | null
  new: string | null
}

export type FieldChanges = {
  email?: FieldChange
  contact_number?: FieldChange
  website?: FieldChange
  address?: FieldChange
  hiring_status?: FieldChange
  clients?: FieldChange
}

export type PendingChangeWithDetails = PendingChange & {
  firm: Pick<Firm, 'id' | 'firm_name' | 'to_code' | 'city_name'>
  submitter: Pick<Profile, 'id' | 'full_name' | 'email' | 'avatar_url'>
  reviewer?: Pick<Profile, 'id' | 'full_name' | 'email'> | null
  field_changes: FieldChanges
}

export type ContributorWithProfile = ContributorStats & {
  profile: Pick<Profile, 'id' | 'full_name' | 'email' | 'avatar_url'>
}

export type HiringStatus = 'Hiring' | 'Not Hiring' | 'Not Specified'
export type MrsDesignation = 'FCA' | 'ACA'
export type ChangeStatus = 'pending' | 'approved' | 'rejected'
