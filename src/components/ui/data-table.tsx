"use client"

import * as React from "react"
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  SearchIcon,
} from "lucide-react"

import { cn } from "~/lib/utils"
import { Input } from "~/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination"

// ── Column Definition ──────────────────────────────────────────────────

export interface ColumnDef<T> {
  /** Unique column identifier */
  id: string
  /** Header label */
  header: string
  /** Extract cell value from row data */
  cell: (row: T) => React.ReactNode
  /** Extract sortable value (defaults to cell if returns string/number) */
  sortValue?: (row: T) => string | number
  /** Enable sorting for this column */
  sortable?: boolean
  /** Header alignment */
  headerClassName?: string
  /** Cell alignment */
  cellClassName?: string
}

// ── Props ──────────────────────────────────────────────────────────────

interface DataTableProps<T> {
  /** Column definitions */
  columns: ColumnDef<T>[]
  /** Row data */
  data: T[]
  /** Unique key extractor for each row */
  getRowKey: (row: T) => string | number
  /** Enable search filtering */
  searchable?: boolean
  /** Search placeholder */
  searchPlaceholder?: string
  /** Fields to search in (extracts string value from row) */
  searchFields?: ((row: T) => string)[]
  /** Rows per page (0 = no pagination) */
  pageSize?: number
  /** Empty state message */
  emptyMessage?: string
  /** Row click handler */
  onRowClick?: (row: T) => void
  /** Additional className for the wrapper */
  className?: string
  /** Render custom actions in the toolbar */
  toolbarActions?: React.ReactNode
}

// ── Sort State ─────────────────────────────────────────────────────────

type SortDirection = "asc" | "desc"

interface SortState {
  columnId: string
  direction: SortDirection
}

// ── Component ──────────────────────────────────────────────────────────

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  searchable = false,
  searchPlaceholder = "Rechercher...",
  searchFields,
  pageSize = 0,
  emptyMessage = "Aucun résultat.",
  onRowClick,
  className,
  toolbarActions,
}: DataTableProps<T>) {
  const [search, setSearch] = React.useState("")
  const [sort, setSort] = React.useState<SortState | null>(null)
  const [page, setPage] = React.useState(0)

  // Reset page on search/data change
  React.useEffect(() => {
    setPage(0)
  }, [search, data.length])

  // ── Filter ─────────────────────────────────────────────────────────
  const filtered = React.useMemo(() => {
    if (!search || !searchFields?.length) return data
    const q = search.toLowerCase()
    return data.filter((row) =>
      searchFields.some((fn) => fn(row).toLowerCase().includes(q))
    )
  }, [data, search, searchFields])

  // ── Sort ───────────────────────────────────────────────────────────
  const sorted = React.useMemo(() => {
    if (!sort) return filtered
    const col = columns.find((c) => c.id === sort.columnId)
    if (!col?.sortValue) return filtered

    return [...filtered].sort((a, b) => {
      const aVal = col.sortValue!(a)
      const bVal = col.sortValue!(b)
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sort.direction === "asc" ? cmp : -cmp
    })
  }, [filtered, sort, columns])

  // ── Paginate ───────────────────────────────────────────────────────
  const totalPages = pageSize > 0 ? Math.ceil(sorted.length / pageSize) : 1
  const rows =
    pageSize > 0 ? sorted.slice(page * pageSize, (page + 1) * pageSize) : sorted

  // ── Sort toggle ────────────────────────────────────────────────────
  function toggleSort(columnId: string) {
    setSort((prev) => {
      if (prev?.columnId !== columnId) return { columnId, direction: "asc" }
      if (prev.direction === "asc") return { columnId, direction: "desc" }
      return null
    })
  }

  function SortIcon({ columnId }: { columnId: string }) {
    if (sort?.columnId !== columnId)
      return <ArrowUpDownIcon className="ml-1 inline size-3.5 opacity-40" />
    return sort.direction === "asc" ? (
      <ArrowUpIcon className="ml-1 inline size-3.5" />
    ) : (
      <ArrowDownIcon className="ml-1 inline size-3.5" />
    )
  }

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div data-slot="data-table" className={cn("space-y-4", className)}>
      {/* Toolbar */}
      {(searchable || toolbarActions) && (
        <div className="flex items-center gap-3">
          {searchable && (
            <div className="relative max-w-sm flex-1">
              <SearchIcon className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
          {toolbarActions && (
            <div className="ml-auto flex items-center gap-2">
              {toolbarActions}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              {columns.map((col) => (
                <TableHead
                  key={col.id}
                  className={cn(
                    col.sortable && "cursor-pointer select-none",
                    col.headerClassName
                  )}
                  onClick={col.sortable ? () => toggleSort(col.id) : undefined}
                >
                  {col.header}
                  {col.sortable && <SortIcon columnId={col.id} />}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={getRowKey(row)}
                  className={cn(onRowClick && "cursor-pointer")}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <TableCell key={col.id} className={col.cellClassName}>
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pageSize > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {sorted.length} résultat{sorted.length > 1 ? "s" : ""}
            {search && ` pour "${search}"`}
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className={cn(page === 0 && "pointer-events-none opacity-50")}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                // Show pages around current page
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i
                } else if (page < 3) {
                  pageNum = i
                } else if (page > totalPages - 4) {
                  pageNum = totalPages - 5 + i
                } else {
                  pageNum = page - 2 + i
                }
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      isActive={pageNum === page}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum + 1}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  className={cn(
                    page === totalPages - 1 &&
                      "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
