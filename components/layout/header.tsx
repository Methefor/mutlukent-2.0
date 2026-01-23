'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut } from '@/lib/auth/actions'
import { useAuth } from '@/lib/auth/context'
import { LogOut } from 'lucide-react'
import { MobileSidebar } from './sidebar'

interface HeaderProps {
    userRole?: string
}

export function Header({ userRole = 'staff' }: HeaderProps) {
    const { user } = useAuth()

    const fullName = user?.user_metadata?.full_name || 'Kullanıcı'
    const userInitial = fullName?.[0]?.toUpperCase() || 'K'
    // Display role can still come from metadata or we can map the database role to a display name
    // For now, let's just display the passed role capitalized
    const displayRole = userRole === 'general_manager' ? 'Genel Müdür' : 
                        userRole === 'branch_manager' ? 'Şube Müdürü' : 
                        userRole === 'warehouse_manager' ? 'Depo Sorumlusu' : 
                        userRole.replace('_', ' ')

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
                <MobileSidebar userRole={userRole} />

                <div className="flex flex-1 items-center justify-end space-x-4">
                    <nav className="flex items-center space-x-2">
                        <Badge variant="outline" className="hidden sm:flex capitalize">
                            {userRole}
                        </Badge>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                    <Avatar>
                                        <AvatarImage src={user?.user_metadata?.avatar_url} alt={fullName} />
                                        <AvatarFallback>{userInitial}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{fullName}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => signOut()}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </nav>
                </div>
            </div>
        </header>
    )
}
