'use client'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { deleteUser } from '@/lib/actions/users'
import { Loader2, Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

interface DeleteUserDialogProps {
    userId: string
    userName: string
}

export function DeleteUserDialog({ userId, userName }: DeleteUserDialogProps) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    function handleDelete() {
        startTransition(async () => {
            try {
                const result = await deleteUser(userId)
                if (result.success) {
                    toast.success('Kullanıcı başarıyla silindi.')
                    setOpen(false)
                } else {
                    toast.error(result.message || 'Bir hata oluştu.')
                }
            } catch (error) {
                toast.error('Beklenmedik bir hata oluştu.')
            }
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Kullanıcıyı silmek istediğinize emin misiniz?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Bu işlem geri alınamaz. <b>{userName}</b> adlı kullanıcı ve ilişkili veriler silinebilir veya erişimi kapatılabilir.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            handleDelete()
                        }}
                        disabled={isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sil
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
