'use client'
import { Button } from './button'
import { Card } from './card'
import { AlertTriangle, X, CheckCircle, Info, AlertCircle } from 'lucide-react'

interface AlertModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  type?: 'warning' | 'error' | 'success' | 'info'
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  showCancel?: boolean
}

export function AlertModal({
  open,
  onOpenChange,
  title,
  description,
  type = 'warning',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  onConfirm,
  onCancel,
  showCancel = true,
}: AlertModalProps) {
  if (!open) return null

  const handleConfirm = () => {
    onConfirm?.()
    onOpenChange(false)
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-500" />
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'info':
        return <Info className="h-6 w-6 text-blue-500" />
      default:
        return <AlertTriangle className="h-6 w-6 text-amber-500" />
    }
  }

  const getColors = () => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-800 dark:text-red-200',
        }
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-800 dark:text-green-200',
        }
      case 'info':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-800 dark:text-blue-200',
        }
      default:
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          border: 'border-amber-200 dark:border-amber-800',
          text: 'text-amber-800 dark:text-amber-200',
        }
    }
  }

  const colors = getColors()

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 shadow-2xl">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">{getIcon()}</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{title}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">{description}</p>
              <div className="flex gap-3 justify-end">
                {showCancel && (
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 bg-transparent"
                  >
                    {cancelText}
                  </Button>
                )}
                <Button
                  onClick={handleConfirm}
                  className={
                    type === 'error'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : type === 'success'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }
                >
                  {confirmText}
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
