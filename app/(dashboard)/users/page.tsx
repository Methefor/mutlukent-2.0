import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton'
import { UsersTable } from '@/components/users/users-table'
import { getUsers } from '@/lib/actions/users'
import { getUserRole } from '@/lib/auth/permissions'
import { createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

export const metadata: Metadata = {
    title: 'Kullanıcılar',
    description: 'Sistemdeki kullanıcıları yönetin.',
}

import { UserDialog } from '@/components/users/user-dialog'
import { getUserBranches } from '@/lib/actions/branches'

export default async function UsersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        redirect('/login')
    }

    const userRole = await getUserRole(user.id)
    
    // Only Admin and General Manager can see users
    if (!['admin', 'general_manager'].includes(userRole || '')) {
        redirect('/dashboard')
    }

    const users = await getUsers()
    const branches = await getUserBranches()

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Kullanıcılar</h2>
                    <p className="text-muted-foreground">
                        Sistemdeki kayıtlı kullanıcıları ve rollerini yönetin.
                    </p>
                </div>
                <UserDialog branches={branches} />
            </div>

            <Suspense fallback={<DashboardSkeleton />}>
                <UsersTable users={users} branches={branches} />
            </Suspense>
        </div>
    )
}
