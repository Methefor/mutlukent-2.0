'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { DailyReport } from '@/lib/actions/reports'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface ReportDetailModalProps {
    report: DailyReport
    open: boolean
    onOpenChange: (open: boolean) => void
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
    }).format(value)
}

export function ReportDetailModal({ report, open, onOpenChange }: ReportDetailModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Rapor Detayı</DialogTitle>
                    <DialogDescription>
                        {format(new Date(report.report_date), 'dd MMMM yyyy', { locale: tr })} tarihli rapor
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6">
                    {/* Temel Bilgiler */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Şube</p>
                            <p className="text-lg font-semibold">{report.branch_name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Oluşturan</p>
                            <p className="text-lg font-semibold">{report.creator_name}</p>
                        </div>
                    </div>

                    {/* Satış Bilgileri */}
                    <div className="space-y-3 rounded-lg border p-4">
                        <h3 className="font-semibold">Satış Bilgileri</h3>
                        <div className="grid gap-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Nakit Satış:</span>
                                <span className="font-semibold">{formatCurrency(report.cash_sales)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Kredi Kartı:</span>
                                <span className="font-semibold">{formatCurrency(report.credit_card_sales)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Banka Kartı:</span>
                                <span className="font-semibold">{formatCurrency(report.debit_card_sales)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                                <span className="font-semibold">Toplam Satış:</span>
                                <span className="text-lg font-bold text-primary">
                                    {formatCurrency(report.total_sales)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Notlar */}
                    {report.notes && (
                        <div className="space-y-2">
                            <h3 className="font-semibold">Notlar</h3>
                            <p className="rounded-lg border bg-muted/50 p-3 text-sm">
                                {report.notes}
                            </p>
                        </div>
                    )}

                    {/* Doğrulama Bilgisi */}
                    {report.is_verified && (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm">
                            <p className="font-semibold text-green-900">✓ Doğrulanmış Rapor</p>
                            {report.verified_at && (
                                <p className="text-green-700">
                                    {format(new Date(report.verified_at), "dd MMMM yyyy 'saat' HH:mm", { locale: tr })}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Oluşturma Tarihi */}
                    <div className="text-xs text-muted-foreground">
                        Oluşturulma: {format(new Date(report.created_at), "dd MMMM yyyy 'saat' HH:mm", { locale: tr })}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
