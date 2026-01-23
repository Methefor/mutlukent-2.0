'use client'

<<<<<<< HEAD
import { deleteReport } from '@/lib/actions/reports'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

interface DeleteConfirmDialogProps {
  reportId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteConfirmDialog({
  reportId,
  open,
  onOpenChange,
}: DeleteConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    try {
      setIsLoading(true)
      const response = await deleteReport(reportId)

      if (response.success) {
        toast({
          title: 'Başarılı',
          description: 'Rapor başarıyla silindi',
          variant: 'default',
        })
        onOpenChange(false)
      } else {
        toast({
          title: 'Hata',
          description: response.error || 'Rapor silinirken hata oluştu',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Hata',
        description: 'Beklenmeyen bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Raporu Sil</AlertDialogTitle>
          <AlertDialogDescription>
            Bu işlem geri alınamaz. Rapor kalıcı olarak silinecektir.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end gap-3">
          <AlertDialogCancel disabled={isLoading}>
            İptal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Siliniyor...' : 'Sil'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
=======
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
>>>>>>> 0b2b8c47afe27ca45005f53f2b338165629c90e2
}
