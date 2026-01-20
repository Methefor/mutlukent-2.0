"use client"

import { DailyReportForm } from "@/components/forms/daily-report-form"
import { useAuth } from "@/lib/auth/context"
import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { getBranches, Branch } from "@/lib/actions/branches"

export default function ReportsPage() {
    const { user, loading } = useAuth()
    const [branches, setBranches] = useState<Branch[]>([])

    // Fetch branches if needed
    useEffect(() => {
        if (user) {
            getBranches().then(data => setBranches(data))
        }
    }, [user])

    useEffect(() => {
        if (!loading && !user) {
            redirect("/login")
        }
    }, [user, loading])

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!user) {
        return null // Redirecting handled in useEffect
    }

    const userRole = user.user_metadata?.role || "user"
    const userBranchId = user.user_metadata?.branch_id
    // Assuming branch name is not in metadata, but if it were we could use it. 
    // For now we might need to find it from branches list if available, or just render fallback.
    const userBranchName = branches.find(b => b.id === userBranchId)?.name || ""

    const pageTitle = userRole === 'branch_manager' && userBranchName
        ? `Z-Raporu Giriş - ${userBranchName}`
        : "Z-Raporu Giriş"

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
