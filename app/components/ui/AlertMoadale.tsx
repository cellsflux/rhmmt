import { AlertTriangle } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { act, JSX } from 'react'

export interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type: 'error' | 'warning' | 'info'
  actions?: {
    label: string
    buttonType: 'default' | 'destructive' | 'succed'
    onClick: () => void
  }[]
}

export function AlertModal({ isOpen, onClose, title, message, type, actions }: AlertModalProps): JSX.Element | null {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
      case 'info':
        return <AlertTriangle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      default:
        return <AlertTriangle className="h-6 w-6 text-gray-600 dark:text-gray-400" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
    }
  }

  return (
    <div className="fixed h-screen inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
      <div className={`rounded-lg p-6 w-full max-w-md border ${getBgColor()}`}>
        <div className="flex items-center space-x-3 mb-4">
          {getIcon()}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end">
          {!actions && (
            <Button
              onClick={onClose}
              className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-800 text-white"
            >
              Fermer
            </Button>
          )}
          {actions &&
            actions?.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                className={`
                  cursor-pointer mx-3 ${
                    action.buttonType === 'destructive'
                      ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white'
                      : action.buttonType === 'succed'
                        ? 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-800 text-white'
                        : 'bg-gray-100 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800 text-black dark:text-white'
                  } `}
              >
                {action.label}
              </Button>
            ))}
        </div>
      </div>
    </div>
  )
}
