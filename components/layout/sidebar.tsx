'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Settings, Menu, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth/context'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

const menuItems = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['admin', 'user', 'manager'],
    },
    {
        name: 'Z-Raporları',
        href: '/dashboard/reports',
        icon: FileText,
        roles: ['admin', 'manager'],
    },
    {
        name: 'Ayarlar',
        href: '/dashboard/settings',
        icon: Settings,
        roles: ['admin'],
    },
]

export function Sidebar({ className }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const pathname = usePathname()
    const { user } = useAuth()

    // Assuming user role is stored in user_metadata, fallback to 'user'
    const userRole = user?.user_metadata?.role || 'user'

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
                            {menuItems.map((item) => (
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

export function MobileSidebar() {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()
    const { user } = useAuth()
    const userRole = user?.user_metadata?.role || 'user'

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
                            {menuItems.map((item) => (
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
