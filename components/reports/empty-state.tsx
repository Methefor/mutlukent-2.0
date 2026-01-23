import React from 'react'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileText className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">Henüz rapor yok</h3>
      <p className="text-sm text-muted-foreground mb-6">
        İlk Z-raporunuzu oluşturarak başlayın
      </p>
      <Button asChild>
        <Link href="/dashboard/reports">Yeni Rapor Oluştur</Link>
      </Button>
    </div>
  )
}
