'use client'

import { DailyReportForm } from '@/components/forms/daily-report-form'
import type { Branch } from '@/lib/actions/branches'
import { getUserBranches } from '@/lib/actions/branches'
import { useAuth } from '@/lib/auth/context'
import { Loader2 } from 'lucide-react'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ReportsPage() {
    const { user, loading } = useAuth()
    const [branches, setBranches] = useState<Branch[]>([])
    const [loadingBranches, setLoadingBranches] = useState(true)

    useEffect(() => {
        async function fetchBranches() {
            if (user) {
                try {
                    const data = await getUserBranches()
                    setBranches(data)
                } catch (error) {
                    console.error('Failed to fetch branches:', error)
                } finally {
                    setLoadingBranches(false)
                }
            }
        }
        fetchBranches()
    }, [user])

    useEffect(() => {
        if (!loading && !user) {
            redirect('/login')
        }
    }, [user, loading])

    if (loading || loadingBranches) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!user) {
        return null
    }

    const userRole = user.user_metadata?.role || 'user'
    const userBranchId = user.user_metadata?.branch_id
    const userBranchName = branches.find(b => b.id === userBranchId)?.name || ''

    const pageTitle = userRole === 'branch_manager' && userBranchName
        ? `Z-Raporu Giriş - ${userBranchName}`
        : 'Z-Raporu Giriş'

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">{pageTitle}</h2>
            </div>
            <div className="max-w-2xl">
                <DailyReportForm
                    branches={branches}
                    userRole={userRole}
                    userBranchId={userBranchId}
                    userBranchName={userBranchName}
                />
            </div>
        </div>
    )
}