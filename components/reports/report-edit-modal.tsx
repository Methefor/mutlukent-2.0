'use client'

import { DailyReport, updateReport } from '@/lib/actions/reports'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

interface ReportEditModalProps {
  report: DailyReport
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportEditModal({
  report,
  open,
  onOpenChange,
}: ReportEditModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsLoading(true)
      const response = await updateReport(report.id, formData)

      if (response.success) {
        toast({
          title: 'Başarılı',
          description: 'Rapor başarıyla güncellendi',
          variant: 'default',
        })
        onOpenChange(false)
      } else {
        toast({
          title: 'Hata',
          description: response.error || 'Rapor güncellenirken hata oluştu',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Hata',
        description: 'Beklenmeyen bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rapor Düzenle</DialogTitle>
        </DialogHeader>

        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Rapor düzenleme özelliği yakında eklenecek.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Şube: <strong>{report.branch_name}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Tarih: <strong>{report.report_date}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Toplam Satış: <strong>{report.total_sales.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</strong>
          </p>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Kapat</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
