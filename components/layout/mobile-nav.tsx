'use client'

import { cn } from '@/lib/utils'
import { FileText, Home, PlusCircle, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface MobileNavProps {
    userRole?: string
}

export function MobileNav({ userRole = 'staff' }: MobileNavProps) {
    const pathname = usePathname()

    const navItems = [
        { 
            name: 'Dashboard', 
            href: '/dashboard', 
            icon: Home,
            roles: ['all'],
        },
        { 
            name: 'Yeni Rapor', 
            href: '/dashboard/reports', 
            icon: PlusCircle,
            roles: ['branch_manager', 'admin', 'general_manager', 'coordinator'],
        },
        { 
            name: 'Raporlar', 
            href: '/dashboard/reports/list', 
            icon: FileText,
            roles: ['all'],
        },
        { 
            name: 'Kullanıcılar', 
            href: '/dashboard/users', 
            icon: Users,
            roles: ['admin', 'general_manager'],
        },
    ]

    const visibleItems = navItems.filter(item => 
        item.roles.includes('all') || item.roles.includes(userRole)
    )

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t">
            <div className="flex items-center justify-around h-16">
                {visibleItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center gap-1 px-3 py-2 text-xs",
                            pathname === item.href 
                                ? "text-primary font-semibold" 
                                : "text-muted-foreground"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                    </Link>
                ))}
            </div>
        </nav>
    )
}
