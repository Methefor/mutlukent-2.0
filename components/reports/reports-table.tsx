 'use client'

import { DailyReport } from '@/lib/actions/reports'
import { format, parseISO } from 'date-fns'
import { tr } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { ReportDetailModal } from './report-detail-modal'
import { ReportEditModal } from './report-edit-modal'
import { DeleteConfirmDialog } from './delete-confirm-dialog'
import { EmptyState } from './empty-state'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface ReportsTableProps {
  data: DailyReport[]
  page: number
  totalPages: number
}

export function ReportsTable({ data, page, totalPages }: ReportsTableProps) {
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null)
  const [editingReport, setEditingReport] = useState<DailyReport | null>(null)
  const [deletingReportId, setDeletingReportId] = useState<string | null>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMMM yyyy', { locale: tr })
    } catch {
      return dateString
    }
  }

  if (!data || data.length === 0) {
    return <EmptyState />
  }

  return (
    <>
      <div className="overflow-x-auto">
        {/* Desktop table */}
        <Table className="hidden md:table">
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>Şube</TableHead>
              <TableHead className="text-right">Nakit Satış</TableHead>
              <TableHead className="text-right">Kredi Kartı</TableHead>
              <TableHead className="text-right">Toplam</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((report) => (
              <TableRow key={report.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {formatDate(report.report_date)}
                </TableCell>
                <TableCell>{report.branch_name}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(report.cash_sales)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(report.credit_card_sales)}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(report.total_sales)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => setSelectedReport(report)}
                        className="cursor-pointer"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Detayları Gör
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setEditingReport(report)}
                        className="cursor-pointer"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Düzenle
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeletingReportId(report.id)}
                        className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden space-y-4 p-4">
        {data.map(report => (
          <Card key={report.id}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">{report.branch_name}</span>
                  <span className="text-sm text-muted-foreground">{formatDate(report.report_date)}</span>
                </div>
                <div className="text-2xl font-bold">{formatCurrency(report.total_sales)}</div>
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setSelectedReport(report)} className="cursor-pointer">
                        <Eye className="mr-2 h-4 w-4" />
                        Detayları Gör
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingReport(report)} className="cursor-pointer">
                        <Pencil className="mr-2 h-4 w-4" />
                        Düzenle
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeletingReportId(report.id)} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination>
            <PaginationContent>
              {page > 1 && (
                <PaginationItem>
                  <PaginationPrevious href={`?page=${page - 1}`} />
                </PaginationItem>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    href={`?page=${p}`}
                    isActive={p === page}
                    size="icon"
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {page < totalPages && (
                <PaginationItem>
                  <PaginationNext href={`?page=${page + 1}`} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Modals */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          open={!!selectedReport}
          onOpenChange={() => setSelectedReport(null)}
        />
      )}

      {editingReport && (
        <ReportEditModal
          report={editingReport}
          open={!!editingReport}
          onOpenChange={() => setEditingReport(null)}
        />
      )}

      {deletingReportId && (
        <DeleteConfirmDialog
          reportId={deletingReportId}
          open={!!deletingReportId}
          onOpenChange={() => setDeletingReportId(null)}
        />
      )}
    </>
  )
}
