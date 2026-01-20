'use server'

import { createClient } from '@/lib/supabase/server'
import { format, subDays, startOfMonth, startOfWeek, isSameDay, isAfter, isBefore, parseISO } from 'date-fns'
import { tr } from 'date-fns/locale'

export type DashboardStats = {
    dailySales: number
    weeklySales: number
    monthlySales: number
    totalReports: number
}

export type SalesTrend = {
    date: string
    amount: number
}

export type BranchSales = {
    branchName: string
    amount: number
}

export type RecentReport = {
    id: string
    branchName: string
    date: string
    total: number
    status: 'completed' | 'pending' // Assuming all we have are completed for now
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const supabase = await createClient()
    const today = new Date()
    const startMonth = startOfMonth(today)
    const startWeek = startOfWeek(today, { locale: tr }) // Monday start

    // Fetch all reports from the earliest relevant date
    const earliestDate = isBefore(startMonth, startWeek) ? startMonth : startWeek
    const earliestDateStr = format(earliestDate, 'yyyy-MM-dd')

    const { data: reports, error } = await supabase
        .from('daily_reports')
        .select('report_date, total_sales')
        .gte('report_date', earliestDateStr)

    if (error) {
        console.error('Error fetching dashboard stats:', error)
        return { dailySales: 0, weeklySales: 0, monthlySales: 0, totalReports: 0 }
    }

    // Calculate stats in memory
    let dailySales = 0
    let weeklySales = 0
    let monthlySales = 0

    const todayStr = format(today, 'yyyy-MM-dd')

    reports.forEach(report => {
        const rDate = parseISO(report.report_date)

        // Daily (Today)
        if (report.report_date === todayStr) {
            dailySales += report.total_sales
        }

        // Weekly (This Week)
        if (report.report_date >= format(startWeek, 'yyyy-MM-dd')) {
            weeklySales += report.total_sales
        }

        // Monthly (This Month)
        if (report.report_date >= format(startMonth, 'yyyy-MM-dd')) {
            monthlySales += report.total_sales
        }
    })

    // Total Reports (Lifetime count)
    const { count: totalReportsCount } = await supabase
        .from('daily_reports')
        .select('*', { count: 'exact', head: true })

    return {
        dailySales,
        weeklySales,
        monthlySales,
        totalReports: totalReportsCount || 0
    }
}

export async function getWeeklyTrend(): Promise<SalesTrend[]> {
    const supabase = await createClient()
    const today = new Date()
    const last7Days = subDays(today, 6) // Include today
    const last7DaysStr = format(last7Days, 'yyyy-MM-dd')

    const { data: reports, error } = await supabase
        .from('daily_reports')
        .select('report_date, total_sales')
        .gte('report_date', last7DaysStr)
        .order('report_date', { ascending: true })

    if (error) {
        console.error('Error fetching weekly trend:', error)
        return []
    }

    // Group by date
    const grouped: Record<string, number> = {}

    // Initialize last 7 days with 0
    for (let i = 0; i < 7; i++) {
        const d = subDays(today, 6 - i)
        grouped[format(d, 'yyyy-MM-dd')] = 0
    }

    reports.forEach(report => {
        if (grouped[report.report_date] !== undefined) {
            grouped[report.report_date] += report.total_sales
        }
    })

    return Object.entries(grouped).map(([date, amount]) => ({
        date: format(parseISO(date), 'dd MMM', { locale: tr }), // Format for chart
        amount
    }))
}

export async function getTopBranches(): Promise<BranchSales[]> {
    const supabase = await createClient()
    const today = new Date()
    const startMonth = startOfMonth(today)
    const startMonthStr = format(startMonth, 'yyyy-MM-dd')

    const { data: reports, error } = await supabase
        .from('daily_reports')
        .select(`
      total_sales,
      branches (
        name
      )
    `)
        .gte('report_date', startMonthStr)

    if (error) {
        console.error('Error fetching top branches:', error)
        return []
    }

    const branchSales: Record<string, number> = {}

    reports.forEach((report: any) => {
        const branchName = report.branches?.name || 'Bilinmeyen Şube'
        branchSales[branchName] = (branchSales[branchName] || 0) + report.total_sales
    })

    return Object.entries(branchSales)
        .map(([branchName, amount]) => ({ branchName, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)
}

export async function getRecentReports(): Promise<RecentReport[]> {
    const supabase = await createClient()

    const { data: reports, error } = await supabase
        .from('daily_reports')
        .select(`
      id,
      report_date,
      total_sales,
      branches (
        name
      )
    `)
        .order('report_date', { ascending: false })
        .limit(5)

    if (error) {
        console.error('Error fetching recent reports:', error)
        return []
    }

    return reports.map((report: any) => ({
        id: report.id,
        branchName: report.branches?.name || 'Bilinmeyen Şube',
        date: format(parseISO(report.report_date), 'dd MMMM yyyy', { locale: tr }),
        total: report.total_sales,
        status: 'completed' // Placeholder as we don't have status yet
    }))
}
