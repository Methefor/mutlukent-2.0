import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { Sidebar } from '@/components/layout/sidebar'

import { getUserRole } from '@/lib/auth/permissions'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    let userRole = 'staff'
    
    if (user) {
        userRole = await getUserRole(user.id) || 'staff'
    }

    return (
        <div className="flex min-h-screen">
            {/* Desktop Sidebar */}
            <Sidebar className="hidden border-r md:block" userRole={userRole} />

            <div className="flex-1 flex flex-col min-h-screen pb-16 md:pb-0">
                <Header userRole={userRole} />
                <main className="flex-1 space-y-4 p-8 pt-6">
                    {children}
                </main>
            </div>
            <MobileNav userRole={userRole} />
        </div>
    )
}
