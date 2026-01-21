'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Separator } from '@/components/ui/separator'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import type { DailyReport, ReportsListResponse } from '@/lib/actions/reports'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Eye, FileText, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { DeleteConfirmDialog } from './delete-confirm-dialog'
import { ReportDetailModal } from './report-detail-modal'
import { ReportEditModal } from './report-edit-modal'

interface ReportsTableProps {
    reportsData: ReportsListResponse
    permissions: string[]
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
    }).format(value)
}

export function ReportsTable({ reportsData, permissions }: ReportsTableProps) {
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
            <EmptyState
                icon={FileText}
                title="Henüz rapor yok"
                description="Bugün için henüz Z-raporu girilmemiş. Hemen bir rapor oluşturabilirsiniz."
                action={{
                    label: "Yeni Rapor Oluştur",
                    href: "/dashboard/reports/new"
                }}
            />
        )
    }

    return (
        <>
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-md border">
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
                                        <Button variant="ghost" size="sm" onClick={() => handleViewDetail(report)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>

                                        {(permissions.includes('edit_report:all') || 
                                          permissions.includes('edit_report:branch') ||
                                          permissions.includes('edit_report:own')) && (
                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(report)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        )}

                                        {permissions.includes('delete_report:all') && (
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(report.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {reports.map((report) => (
                    <Card key={report.id}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">
                                    {report.branch_name}
                                </CardTitle>
                                <Badge variant={report.is_verified ? "default" : "secondary"}>
                                    {report.is_verified ? "Onaylandı" : "Bekliyor"}
                                </Badge>
                            </div>
                            <CardDescription>
                                {format(new Date(report.report_date), "dd MMMM yyyy", { locale: tr })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Nakit:</span>
                                <span className="font-medium">{formatCurrency(report.cash_sales)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Kredi Kartı:</span>
                                <span className="font-medium">{formatCurrency(report.credit_card_sales)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Banka Kartı:</span>
                                <span className="font-medium">{formatCurrency(report.debit_card_sales)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-sm font-semibold">
                                <span>Toplam:</span>
                                <span>{formatCurrency(report.total_sales)}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => handleViewDetail(report)}>
                                <Eye className="h-4 w-4 mr-1" />
                            </Button>
                            
                            {(permissions.includes('edit_report:all') || 
                              permissions.includes('edit_report:branch') ||
                              permissions.includes('edit_report:own')) && (
                                <Button variant="outline" size="sm" onClick={() => handleEdit(report)}>
                                    <Pencil className="h-4 w-4 mr-1" />
                                </Button>
                            )}

                            {permissions.includes('delete_report:all') && (
                                <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(report.id)}>
                                    <Trash2 className="h-4 w-4 mr-1" />
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
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