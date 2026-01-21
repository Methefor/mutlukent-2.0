import { ExportButton } from '@/components/reports/export-button'
import { ReportFilters } from '@/components/reports/report-filters'
import { ReportsTable } from '@/components/reports/reports-table'
import { ReportsTableSkeleton } from '@/components/reports/reports-table-skeleton'
import { Button } from '@/components/ui/button'
import { getReports } from '@/lib/actions/reports'
import { getCurrentUserPermissions } from '@/lib/auth/permissions'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

interface PageProps {
    searchParams: {
        page?: string
        perPage?: string
        dateFrom?: string
        dateTo?: string
        branch?: string
    }
}

export default async function ReportsListPage({ searchParams }: PageProps) {
    // Parse search params
    const page = parseInt(searchParams.page || '1')
    const perPage = parseInt(searchParams.perPage || '20')
    const dateFrom = searchParams.dateFrom
    const dateTo = searchParams.dateTo
    const branchIds = searchParams.branch ? [searchParams.branch] : []

    // Fetch reports
    const reportsData = await getReports({
        page,
        perPage,
        dateFrom,
        dateTo,
        branchIds,
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Z-Raporları</h1>
                    <p className="text-muted-foreground">
                        Tüm günlük satış raporlarını görüntüleyin ve yönetin
                    </p>
                </div>
                <div className="flex gap-2">
                    <ExportButton data={reportsData.data} />
                    <Button asChild>
                        <Link href="/dashboard/reports">
                            <Plus className="mr-2 h-4 w-4" />
                            Yeni Rapor
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <ReportFilters />

            {/* Table */}
            <Suspense fallback={<ReportsTableSkeleton />}>
                <ReportsTable 
                    reportsData={reportsData} 
                    permissions={await getCurrentUserPermissions()}
                />
            </Suspense>
        </div>
    )
}
