'use client'

import { Button } from '@/components/ui/button'
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
            // Prepare data for Excel
            const excelData = data.map((report) => ({
                'Tarih': new Date(report.report_date).toLocaleDateString('tr-TR'),
                'Şube': report.branch_name,
                'Oluşturan': report.creator_name,
                'Nakit Satış': report.cash_sales,
                'Kredi Kartı': report.credit_card_sales,
                'Banka Kartı': report.debit_card_sales,
                'Toplam Satış': report.total_sales,
                'Notlar': report.notes || '',
                'Doğrulanmış': report.is_verified ? 'Evet' : 'Hayır',
            }))

            // Create workbook
            const worksheet = XLSX.utils.json_to_sheet(excelData)
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Z-Raporları')

            // Set column widths
            worksheet['!cols'] = [
                { wch: 12 }, // Tarih
                { wch: 20 }, // Şube
                { wch: 20 }, // Oluşturan
                { wch: 12 }, // Nakit
                { wch: 12 }, // Kredi Kartı
                { wch: 12 }, // Banka Kartı
                { wch: 12 }, // Toplam
                { wch: 30 }, // Notlar
                { wch: 12 }, // Doğrulanmış
            ]

            // Generate filename with current date
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
}
