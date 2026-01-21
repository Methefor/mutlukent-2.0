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
}
