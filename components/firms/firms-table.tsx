'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type SortingState,
  type ColumnDef,
  flexRender,
} from '@tanstack/react-table'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SearchBar } from './search-bar'
import { ColumnFilter } from './column-filter'
import { FirmCard } from './firm-card'
import { FirmDetailDialog } from './firm-detail-dialog'
import { EmptyState } from '@/components/common/empty-state'
import { SuggestEditButton } from './suggest-edit-button'
import { useFirmsRealtime } from '@/hooks/use-firms-realtime'
import { useDebounce } from '@/hooks/use-debounce'
import { formatDate, cn } from '@/lib/utils'
import type { Firm } from '@/types/firm'

interface FirmsTableProps {
  initialFirms: Firm[]
  cityId: string
}

function getHiringBadgeVariant(status: string) {
  if (status === 'Hiring') return 'hiring' as const
  if (status === 'Not Hiring') return 'notHiring' as const
  return 'notSpecified' as const
}

function SortIcon({ isSorted }: { isSorted: false | 'asc' | 'desc' }) {
  if (isSorted === 'asc') return <ChevronUp className="h-3.5 w-3.5 text-foreground" />
  if (isSorted === 'desc') return <ChevronDown className="h-3.5 w-3.5 text-foreground" />
  return <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
}

export function FirmsTable({ initialFirms, cityId }: FirmsTableProps) {
  const [firms, setFirms] = useState<Firm[]>(initialFirms)
  const [rawSearch, setRawSearch] = useState('')
  const [designationFilter, setDesignationFilter] = useState('all')
  const [hiringFilter, setHiringFilter] = useState('all')
  const [sorting, setSorting] = useState<SortingState>([])
  const [selectedFirm, setSelectedFirm] = useState<Firm | null>(null)
  const [updatedFirmId, setUpdatedFirmId] = useState<string | null>(null)

  const search = useDebounce(rawSearch, 300)

  // Realtime updates
  const handleFirmUpdate = useCallback((updatedFirm: Firm) => {
    setFirms((prev) => prev.map((f) => (f.id === updatedFirm.id ? updatedFirm : f)))
    setUpdatedFirmId(updatedFirm.id)
    setTimeout(() => setUpdatedFirmId(null), 2000)
  }, [])
  useFirmsRealtime(cityId, handleFirmUpdate)

  const filteredData = useMemo(() => {
    let data = firms
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(
        (f) =>
          f.firm_name.toLowerCase().includes(q) ||
          f.to_code.toLowerCase().includes(q) ||
          (f.address?.toLowerCase().includes(q) ?? false) ||
          (f.mrs_name?.toLowerCase().includes(q) ?? false) ||
          (f.mrs_number?.toLowerCase().includes(q) ?? false)
      )
    }
    if (designationFilter !== 'all') {
      data = data.filter((f) => f.mrs_designation === designationFilter)
    }
    if (hiringFilter !== 'all') {
      data = data.filter((f) => f.hiring_status === hiringFilter)
    }
    return data
  }, [firms, search, designationFilter, hiringFilter])

  const columns = useMemo<ColumnDef<Firm>[]>(
    () => [
      {
        accessorKey: 'firm_name',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-left hover:text-foreground transition-colors"
            onClick={() => column.toggleSorting()}
          >
            Firm Name
            <SortIcon isSorted={column.getIsSorted()} />
          </button>
        ),
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-sm leading-tight">{row.original.firm_name}</p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{row.original.address ?? '—'}</p>
          </div>
        ),
      },
      {
        accessorKey: 'to_code',
        header: 'TO Code',
        cell: ({ getValue }) => (
          <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{getValue() as string}</span>
        ),
      },
      {
        id: 'mrs',
        header: 'MRS',
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium leading-tight">{row.original.mrs_name ?? '—'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {row.original.mrs_designation && (
                <Badge
                  variant={row.original.mrs_designation === 'FCA' ? 'fca' : 'aca'}
                  className="text-[10px] px-1.5 py-0"
                >
                  {row.original.mrs_designation}
                </Badge>
              )}
              {row.original.mrs_number && (
                <span className="text-xs text-muted-foreground">#{row.original.mrs_number}</span>
              )}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'approved_wef',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-foreground transition-colors"
            onClick={() => column.toggleSorting()}
          >
            Approved
            <SortIcon isSorted={column.getIsSorted()} />
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="text-sm whitespace-nowrap">{formatDate(getValue() as string)}</span>
        ),
      },
      {
        accessorKey: 'hiring_status',
        header: 'Hiring',
        cell: ({ getValue }) => {
          const status = getValue() as string
          return <Badge variant={getHiringBadgeVariant(status)}>{status}</Badge>
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end">
            <SuggestEditButton firm={row.original} size="sm" />
          </div>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  })

  const { pageIndex, pageSize } = table.getState().pagination
  const totalFiltered = filteredData.length

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={rawSearch} onChange={setRawSearch} />
        <ColumnFilter
          designationFilter={designationFilter}
          onDesignationChange={setDesignationFilter}
          hiringFilter={hiringFilter}
          onHiringChange={setHiringFilter}
        />
      </div>

      <p className="text-sm text-muted-foreground">
        {totalFiltered === firms.length
          ? `Showing ${firms.length} firms`
          : `${totalFiltered} of ${firms.length} firms`}
      </p>

      {/* Desktop table */}
      <div className="hidden md:block rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/40 border-b">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>
                    <EmptyState />
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <motion.tr
                    key={row.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      backgroundColor:
                        updatedFirmId === row.original.id
                          ? 'hsl(var(--accent))'
                          : 'transparent',
                    }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                      'border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer group'
                    )}
                    onClick={() => setSelectedFirm(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {filteredData.length === 0 ? (
          <EmptyState />
        ) : (
          table.getRowModel().rows.map((row) => (
            <FirmCard
              key={row.original.id}
              firm={row.original}
              onClick={() => setSelectedFirm(row.original)}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalFiltered > pageSize && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {pageIndex * pageSize + 1}–{Math.min((pageIndex + 1) * pageSize, totalFiltered)} of {totalFiltered}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Firm detail dialog */}
      <FirmDetailDialog
        firm={selectedFirm}
        open={!!selectedFirm}
        onClose={() => setSelectedFirm(null)}
      />
    </div>
  )
}
