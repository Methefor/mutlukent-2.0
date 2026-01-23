'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, FileText, LayoutDashboard, Menu, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
<<<<<<< HEAD
import { LayoutDashboard, FilePlus, FileText, Settings, Menu, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth/context'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
=======
import { useState } from 'react'
>>>>>>> 0b2b8c47afe27ca45005f53f2b338165629c90e2

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

import { PlusCircle, Users } from 'lucide-react'

// ... imports

const menuItems = [
<<<<<<< HEAD
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'user', 'manager'] },
    { name: 'Yeni Z-Raporu', href: '/dashboard/reports', icon: FilePlus, roles: ['admin', 'manager'] },
    { name: 'Rapor Listesi', href: '/dashboard/reports/list', icon: FileText, roles: ['admin', 'manager'] },
    { name: 'Ayarlar', href: '/dashboard/settings', icon: Settings, roles: ['admin'] },
=======
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['all'],
    },
    {
        name: 'Yeni Rapor',
        href: '/dashboard/reports',
        icon: PlusCircle,
        roles: ['branch_manager', 'admin', 'general_manager', 'coordinator'], // Added coordinator/gm for now if they need to create
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
    {
        name: 'Ayarlar',
        href: '/dashboard/settings',
        icon: Settings,
        roles: ['admin'],
    },
>>>>>>> 0b2b8c47afe27ca45005f53f2b338165629c90e2
]

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    userRole?: string
}

export function Sidebar({ className, userRole = 'staff' }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const pathname = usePathname()

    const visibleItems = menuItems.filter(item => 
        item.roles.includes('all') || item.roles.includes(userRole)
    )

    return (
        <div
            className={cn(
                'relative border-r bg-background transition-all duration-300',
                isCollapsed ? 'w-16' : 'w-64',
                className
            )}
        >
            <div className="flex h-16 items-center border-b px-4">
                {isCollapsed ? (
                    <div className="mx-auto font-bold text-xl">M</div>
                ) : (
                    <div className="font-bold text-xl">Mutlukent</div>
                )}
            </div>

            <ScrollArea className="h-[calc(100vh-4rem)]">
                <div className="space-y-4 py-4">
                    <div className="px-3 py-2">
                        <div className="space-y-1">
                            {visibleItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent",
                                        pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                                        isCollapsed && "justify-center px-2"
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {!isCollapsed && item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </ScrollArea>

            <div className="absolute -right-3 top-20">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 rounded-full shadow-md"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-3 w-3" />
                    ) : (
                        <ChevronLeft className="h-3 w-3" />
                    )}
                </Button>
            </div>
        </div>
    )
}

export function MobileSidebar({ userRole = 'staff' }: SidebarProps) {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()
    
    const visibleItems = menuItems.filter(item => 
        item.roles.includes('all') || item.roles.includes(userRole)
    )

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
                <div className="flex h-16 items-center border-b px-6">
                    <div className="font-bold text-xl">Mutlukent</div>
                </div>
                <ScrollArea className="h-[calc(100vh-4rem)]">
                    <div className="space-y-4 py-4">
                        <div className="px-3 py-2">
                            {visibleItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent",
                                        pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
