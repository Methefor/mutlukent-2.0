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
} from '@/components/ui/alert-dialog'
import { deleteReport } from '@/lib/actions/reports'
import { useState } from 'react'
import { toast } from 'sonner'

interface DeleteConfirmDialogProps {
    reportId: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function DeleteConfirmDialog({
    reportId,
    open,
    onOpenChange,
    onSuccess,
}: DeleteConfirmDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        
        const result = await deleteReport(reportId)
        
        setIsDeleting(false)
        
        if (result.success) {
            toast.success(result.message)
            onOpenChange(false)
            onSuccess?.()
        } else {
            toast.error(result.message)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Raporu Sil</AlertDialogTitle>
                    <AlertDialogDescription>
                        Bu raporu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>İptal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting ? 'Siliniyor...' : 'Sil'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
