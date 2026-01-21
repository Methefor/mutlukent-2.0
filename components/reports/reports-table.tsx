'use client'

import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { DailyReport, ReportsListResponse } from '@/lib/actions/reports'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { DeleteConfirmDialog } from './delete-confirm-dialog'
import { ReportDetailModal } from './report-detail-modal'
import { ReportEditModal } from './report-edit-modal'

interface ReportsTableProps {
    reportsData: ReportsListResponse
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
    }).format(value)
}

export function ReportsTable({ reportsData }: ReportsTableProps) {
    const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null)
    const [detailModalOpen, setDetailModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [reportToDelete, setReportToDelete] = useState<string | null>(null)

    const { data: reports, count, page, perPage, totalPages } = reportsData

    const handleViewDetail = (report: DailyReport) => {
        setSelectedReport(report)
        setDetailModalOpen(true)
    }

    const handleEdit = (report: DailyReport) => {
        setSelectedReport(report)
        setEditModalOpen(true)
    }

    const handleDeleteClick = (reportId: string) => {
        setReportToDelete(reportId)
        setDeleteDialogOpen(true)
    }

    if (reports.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-muted-foreground">
                    <p className="text-lg font-semibold">Henüz rapor yok</p>
                    <p className="text-sm">Yeni bir rapor ekleyerek başlayın</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tarih</TableHead>
                            <TableHead>Şube</TableHead>
                            <TableHead>Oluşturan</TableHead>
                            <TableHead className="text-right">Nakit</TableHead>
                            <TableHead className="text-right">Kredi Kartı</TableHead>
                            <TableHead className="text-right">Banka Kartı</TableHead>
                            <TableHead className="text-right">Toplam</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reports.map((report) => (
                            <TableRow key={report.id}>
                                <TableCell>
                                    {format(new Date(report.report_date), 'dd MMMM yyyy', { locale: tr })}
                                </TableCell>
                                <TableCell>{report.branch_name}</TableCell>
                                <TableCell>{report.creator_name}</TableCell>
                                <TableCell className="text-right">
                                    {formatCurrency(report.cash_sales)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatCurrency(report.credit_card_sales)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatCurrency(report.debit_card_sales)}
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                    {formatCurrency(report.total_sales)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleViewDetail(report)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(report)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteClick(report.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Info */}
            <div className="flex items-center justify-between px-2">
                <div className="text-sm text-muted-foreground">
                    Toplam {count} rapor (Sayfa {page} / {totalPages})
                </div>
                <div className="flex gap-2">
                    {page > 1 && (
                        <Button variant="outline" size="sm" asChild>
                            <a href={`?page=${page - 1}`}>Önceki</a>
                        </Button>
                    )}
                    {page < totalPages && (
                        <Button variant="outline" size="sm" asChild>
                            <a href={`?page=${page + 1}`}>Sonraki</a>
                        </Button>
                    )}
                </div>
            </div>

            {/* Modals */}
            {selectedReport && (
                <ReportDetailModal
                    report={selectedReport}
                    open={detailModalOpen}
                    onOpenChange={setDetailModalOpen}
                />
            )}

            {reportToDelete && (
                <DeleteConfirmDialog
                    reportId={reportToDelete}
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    onSuccess={() => {
                        setReportToDelete(null)
                        // Refresh page
                        window.location.reload()
                    }}
                />
            )}

            {selectedReport && (
                <ReportEditModal
                    report={selectedReport}
                    open={editModalOpen}
                    onOpenChange={setEditModalOpen}
                    onSuccess={() => {
                        setEditModalOpen(false)
                    }}
                />
            )}
        </>
    )
}
