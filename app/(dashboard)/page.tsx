import { Suspense } from 'react'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { SalesChart } from '@/components/dashboard/sales-chart'
import { TopBranches } from '@/components/dashboard/top-branches'
import { RecentReports } from '@/components/dashboard/recent-reports'
import { Skeleton } from '@/components/ui/skeleton'
import { getDashboardStats, getWeeklyTrend, getTopBranches, getRecentReports } from '@/lib/actions/dashboard'

async function DashboardContent() {
  const [stats, weeklyTrend, topBranches, recentReports] = await Promise.all([
    getDashboardStats(),
    getWeeklyTrend(),
    getTopBranches(),
    getRecentReports(),
  ])

  return (
    <>
      <Suspense fallback={
        <div className="grid gap-4 md:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      }>
        <SummaryCards stats={stats} />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-80" />}>
          <SalesChart data={weeklyTrend} />
        </Suspense>
        
        <Suspense fallback={<Skeleton className="h-80" />}>
          <TopBranches data={topBranches} />
        </Suspense>
      </div>

      <Suspense fallback={<Skeleton className="h-64" />}>
        <RecentReports reports={recentReports} />
      </Suspense>
    </>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Genel Bakış</h1>
      <DashboardContent />
    </div>
  )
}
