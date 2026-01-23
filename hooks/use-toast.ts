import { toast as sonnerToast } from 'sonner'

export interface ToastProps {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

/**
 * Custom hook to use Sonner toast notifications
 * Provides a consistent API for showing notifications
 */
export function useToast() {
  const toast = (props: ToastProps) => {
    const message = props.description || props.title || ''

    if (props.variant === 'destructive') {
      sonnerToast.error(message, {
        description: props.title,
      })
    } else {
      sonnerToast.success(message, {
        description: props.title !== props.description ? props.title : undefined,
      })
    }
  }

  return { toast }
}
