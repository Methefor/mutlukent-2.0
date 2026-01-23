'use client'

import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Branch } from '@/lib/actions/branches'
import { User } from '@/lib/actions/users'
import { Users } from 'lucide-react'
import { DeleteUserDialog } from './delete-user-dialog'
import { UserDialog } from './user-dialog'

interface UsersTableProps {
    users: User[]
    branches: Branch[]
}

export function UsersTable({ users, branches }: UsersTableProps) {
    if (users.length === 0) {
        return (
            <EmptyState
                icon={Users}
                title="Kullanıcı Bulunamadı"
                description="Sistemde henüz kayıtlı kullanıcı bulunmuyor."
            />
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Ad Soyad</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Şube</TableHead>
                        <TableHead className="w-[100px]">İşlemler</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.full_name || '-'}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className="capitalize">
                                    {user.role}
                                </Badge>
                            </TableCell>
                            <TableCell>{user.branch_name}</TableCell>
                            <TableCell className="flex items-center gap-2">
                                <UserDialog user={user} branches={branches} />
                                <DeleteUserDialog userId={user.id} userName={user.full_name || user.email} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
