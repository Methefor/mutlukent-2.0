'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Branch } from '@/lib/actions/branches'
import { getUserBranches } from '@/lib/actions/branches'
import { DailyReport, updateReport } from '@/lib/actions/reports'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface ReportEditModalProps {
    report: DailyReport
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function ReportEditModal({ report, open, onOpenChange, onSuccess }: ReportEditModalProps) {
    const [branches, setBranches] = useState<Branch[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        async function fetchBranches() {
    const data = await getUserBranches()
            setBranches(data)
        }
        fetchBranches()
    }, [])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)
        
        try {
            const result = await updateReport(report.id, { message: null }, formData)
            
            if (result.message === 'success') {
                toast.success('Rapor başarıyla güncellendi!')
                onOpenChange(false)
                onSuccess?.()
                // Refresh page
                window.location.reload()
            } else {
                toast.error(result.message || 'Rapor güncellenirken hata oluştu')
            }
        } catch (error) {
            console.error('Update error:', error)
            toast.error('Bir hata oluştu')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Format date for input (YYYY-MM-DD)
    const formattedDate = report.report_date ? format(new Date(report.report_date), 'yyyy-MM-dd') : ''

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Raporu Düzenle</DialogTitle>
                    <DialogDescription>
                        Rapor bilgilerini güncelleyin
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Şube Seçimi */}
                    <div className="space-y-2">
                        <Label htmlFor="branch_id">Şube *</Label>
                        <Select name="branch_id" defaultValue={report.branch_id} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Şube seçin" />
                            </SelectTrigger>
                            <SelectContent>
                                {branches.map((branch) => (
                                    <SelectItem key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Rapor Tarihi */}
                    <div className="space-y-2">
                        <Label htmlFor="report_date">Rapor Tarihi *</Label>
                        <Input
                            id="report_date"
                            name="report_date"
                            type="date"
                            defaultValue={formattedDate}
                            required
                        />
                    </div>

                    {/* Satış Bilgileri */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cash_sales">Nakit Satış *</Label>
                            <Input
                                id="cash_sales"
                                name="cash_sales"
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={report.cash_sales}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="credit_card_sales">Kredi Kartı *</Label>
                            <Input
                                id="credit_card_sales"
                                name="credit_card_sales"
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={report.credit_card_sales}
                                required
                            />
                        </div>
                    </div>

                    {/* Notlar */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notlar</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            placeholder="Günün özeti, karşılaşılan sorunlar vb."
                            defaultValue={report.notes || ''}
                            rows={4}
                        />
                    </div>

                    {/* Butonlar */}
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            İptal
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Kaydediliyor...' : 'Güncelle'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
