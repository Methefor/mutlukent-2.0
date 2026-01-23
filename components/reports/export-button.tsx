'use client'

import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { getReports } from '@/lib/actions/reports'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

interface ExportButtonProps {
  dateFrom?: string
  dateTo?: string
  branchId?: string
}

export function ExportButton({
  dateFrom,
  dateTo,
  branchId,
}: ExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleExport = async () => {
    try {
      setIsLoading(true)

      // Fetch all reports with applied filters (get all pages)
      const response = await getReports({
        page: 1,
        perPage: 1000, // Fetch up to 1000 reports
        dateFrom,
        dateTo,
        branchId,
      })

      if (response.error) {
        toast({
          title: 'Hata',
          description: response.error,
          variant: 'destructive',
        })
        return
      }

      if (response.data.length === 0) {
        toast({
          title: 'Bilgi',
          description: 'Dışa aktarılacak rapor bulunamadı',
          variant: 'default',
        })
        return
      }

      // Dynamic import of xlsx to avoid server-side issues
      const XLSX = await import('xlsx')

      // Prepare data for export
      const exportData = response.data.map((report) => ({
        'Tarih': report.report_date,
        'Şube': report.branch_name,
        'Nakit Satış (₺)': report.cash_sales,
        'Kredi Kartı (₺)': report.credit_card_sales,
        'Toplam (₺)': report.total_sales,
        'Notlar': report.notes || '',
      }))

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Raporlar')

      // Set column widths
      worksheet['!cols'] = [
        { wch: 15 }, // Tarih
        { wch: 20 }, // Şube
        { wch: 18 }, // Nakit Satış
        { wch: 18 }, // Kredi Kartı
        { wch: 15 }, // Toplam
        { wch: 30 }, // Notlar
      ]

      // Generate filename with current date
      const fileName = `z-raporlari-${format(new Date(), 'yyyy-MM-dd')}.xlsx`

      // Write file
      XLSX.writeFile(workbook, fileName)

      toast({
        title: 'Başarılı',
        description: `${response.data.length} rapor dışa aktarıldı`,
        variant: 'default',
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: 'Hata',
        description: 'Dışa aktarma sırasında bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleExport}
      disabled={isLoading}
      className="gap-2"
      variant="outline"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      Excel Olarak Dışa Aktar
    </Button>
  )
}
