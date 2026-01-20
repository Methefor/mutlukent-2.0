import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getDashboardStats, getWeeklyTrend, getTopBranches, getRecentReports } from "@/lib/actions/dashboard"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { TopBranches } from "@/components/dashboard/top-branches"
import { RecentReports } from "@/components/dashboard/recent-reports"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const [stats, weeklyTrend, topBranches, recentReports] = await Promise.all([
    getDashboardStats(),
    getWeeklyTrend(),
    getTopBranches(),
    getRecentReports(),
  ])

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Genel Bakış</h2>
      </div>

      <SummaryCards stats={stats} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <SalesChart data={weeklyTrend} />
        <TopBranches data={topBranches} />
      </div>

      <div className="grid gap-4 grid-cols-1">
        <RecentReports reports={recentReports} />
      </div>
    </div>
  )
}
