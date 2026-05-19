'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ColumnFilterProps {
  designationFilter: string
  onDesignationChange: (value: string) => void
  hiringFilter: string
  onHiringChange: (value: string) => void
}

export function ColumnFilter({
  designationFilter,
  onDesignationChange,
  hiringFilter,
  onHiringChange,
}: ColumnFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Select value={designationFilter} onValueChange={onDesignationChange}>
        <SelectTrigger className="h-10 w-36 text-sm">
          <SelectValue placeholder="Designation" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Designations</SelectItem>
          <SelectItem value="FCA">FCA</SelectItem>
          <SelectItem value="ACA">ACA</SelectItem>
        </SelectContent>
      </Select>

      <Select value={hiringFilter} onValueChange={onHiringChange}>
        <SelectTrigger className="h-10 w-36 text-sm">
          <SelectValue placeholder="Hiring Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="Hiring">Hiring</SelectItem>
          <SelectItem value="Not Hiring">Not Hiring</SelectItem>
          <SelectItem value="Not Specified">Not Specified</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
