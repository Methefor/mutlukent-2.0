'use client'

import { Button } from '@/components/ui/button'
<<<<<<< HEAD
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
=======
import { DailyReport } from '@/lib/actions/reports'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

interface ExportButtonProps {
    data: DailyReport[]
}

export function ExportButton({ data }: ExportButtonProps) {
    const handleExport = () => {
        if (data.length === 0) {
            toast.error('Dışa aktarılacak veri yok')
            return
        }

        try {
            // Prepare header row
            const header = [
                'Tarih', 'Şube', 'Oluşturan', 'Nakit Satış', 'Kredi Kartı', 
                'Banka Kartı', 'Toplam Satış', 'Notlar', 'Doğrulanmış'
            ]

            // Prepare data rows
            const rows = data.map((report) => [
                new Date(report.report_date).toLocaleDateString('tr-TR'),
                report.branch_name,
                report.creator_name,
                report.cash_sales,
                report.credit_card_sales,
                report.debit_card_sales,
                report.total_sales,
                report.notes || '',
                report.is_verified ? 'Evet' : 'Hayır'
            ])

            // Calculate totals
            const totals = data.reduce((acc, curr) => ({
                cash: acc.cash + (Number(curr.cash_sales) || 0),
                credit: acc.credit + (Number(curr.credit_card_sales) || 0),
                debit: acc.debit + (Number(curr.debit_card_sales) || 0),
                total: acc.total + (Number(curr.total_sales) || 0)
            }), { cash: 0, credit: 0, debit: 0, total: 0 })

            // Append Totals Row
            rows.push([
                'TOPLAM', '', '', 
                totals.cash, 
                totals.credit, 
                totals.debit, 
                totals.total, 
                '', ''
            ])

            // Create workbook and worksheet
            const workbook = XLSX.utils.book_new()
            // use aoa_to_sheet for array of arrays
            const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows])

            // Apply currency formatting to value columns (D, E, F, G)
            const currencyFormat = '#,##0.00 "₺"'
            const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:I1')
            for (let R = 1; R <= range.e.r; ++R) {
                // Formatting columns 3,4,5,6 (0-indexed)
                [3, 4, 5, 6].forEach(C => {
                    const cellRef = XLSX.utils.encode_cell({ r: R, c: C })
                    if (worksheet[cellRef]) {
                        worksheet[cellRef].z = currencyFormat
                    }
                })
            }

            // Set column widths
            worksheet['!cols'] = [
                { wch: 12 }, // Tarih
                { wch: 20 }, // Şube
                { wch: 20 }, // Oluşturan
                { wch: 15 }, // Nakit
                { wch: 15 }, // Kredi
                { wch: 15 }, // Banka
                { wch: 15 }, // Toplam
                { wch: 30 }, // Notlar
                { wch: 12 }, // Doğrulanmış
            ]

            XLSX.utils.book_append_sheet(workbook, worksheet, 'Z-Raporları')

            // Generate filename
            const filename = `z-raporlari-${new Date().toISOString().split('T')[0]}.xlsx`

            // Download file
            XLSX.writeFile(workbook, filename)

            toast.success('Excel dosyası başarıyla indirildi')
        } catch (error) {
            console.error('Excel export error:', error)
            toast.error('Excel dosyası oluşturulurken hata oluştu')
        }
    }

    return (
        <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Excel'e Aktar
        </Button>
    )
>>>>>>> 0b2b8c47afe27ca45005f53f2b338165629c90e2
}
