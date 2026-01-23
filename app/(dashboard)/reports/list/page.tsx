<<<<<<< HEAD
import { getReports } from '@/lib/actions/reports'
import { ReportsTable } from '@/components/reports/reports-table'
import { ReportFilters } from '@/components/reports/report-filters'
import { ExportButton } from '@/components/reports/export-button'
import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ReportsListPageProps {
  searchParams: Promise<{
    page?: string
    dateFrom?: string
    dateTo?: string
    branchId?: string
  }>
}

export const metadata = {
  title: 'Z-Raporları Listesi | Mutlukent',
  description: 'Tüm satış raporlarını görüntüle, filtrele ve yönet',
}

async function ReportsListContent({ searchParams }: ReportsListPageProps) {
  const params = await searchParams
  console.log('Reports list params:', params)
  const page = parseInt(params.page || '1')
  const dateFrom = params.dateFrom || undefined
  const dateTo = params.dateTo || undefined
  const branchId = params.branchId || undefined

  const response = await getReports({
    page,
    perPage: 20,
    dateFrom,
    dateTo,
    branchId,
  })

  console.log('Reports data:', response)

  if (response.error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        Raporlar yüklenirken hata oluştu: {response.error}
      </div>
    )
  }

  const totalPages = Math.ceil(response.count / 20)

  return (
    <div className="space-y-6">
      {/* Header with export */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Z-Raporları</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Toplam {response.count} rapor
          </p>
        </div>
        <ExportButton
          dateFrom={dateFrom}
          dateTo={dateTo}
          branchId={branchId}
        />
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportFilters
            defaultDateFrom={dateFrom}
            defaultDateTo={dateTo}
            defaultBranchId={branchId}
          />
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Raporlar</CardTitle>
        </CardHeader>
        <CardContent>
          {response.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/50 px-6 py-12 text-center">
              <svg
                className="mb-4 h-12 w-12 text-muted-foreground/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-muted-foreground">Henüz rapor bulunmuyor</p>
              <p className="mt-1 text-sm text-muted-foreground/75">
                Filtreleri değiştirerek tekrar deneyin veya yeni rapor oluşturun
              </p>
            </div>
          ) : (
            <>
              <ReportsTable
                data={response.data}
                page={page}
                totalPages={totalPages}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ReportsListPage(props: ReportsListPageProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-10 animate-pulse rounded-lg bg-muted" />
          <div className="h-32 animate-pulse rounded-lg bg-muted" />
          <div className="h-96 animate-pulse rounded-lg bg-muted" />
        </div>
      }
    >
      <ReportsListContent {...props} />
    </Suspense>
  )
=======
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
>>>>>>> 0b2b8c47afe27ca45005f53f2b338165629c90e2
}
