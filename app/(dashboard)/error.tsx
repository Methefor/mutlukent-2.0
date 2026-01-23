'use client'

import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-[50vh] flex-col items-center justify-center">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-2xl font-semibold mb-2">Bir hata oluştu</h2>
      <p className="text-muted-foreground mb-6 max-w-md text-center">
        {error.message || 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.'}
      </p>
      <Button onClick={reset}>Tekrar Dene</Button>
    </div>
  )
}
