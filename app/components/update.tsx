import React, { useEffect, useState } from 'react'
import { useConveyor } from '../hooks/use-conveyor'

type UpdateInfo = {
  version?: string
  releaseNotes?: string
  releaseDate?: string
}

type UpdateStatus = {
  status: 'checking' | 'available' | 'downloading' | 'downloaded' | 'error'
  progress?: number
  message?: string
}

export default function UpdateToast() {
  const { checkForUpdates, downloadUpdate, quitAndInstall, getAppVersion } = useConveyor('app')
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [currentVersion, setCurrentVersion] = useState<string>('')
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({ status: 'checking' })
  const [isVisible, setIsVisible] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  // Récupérer la version actuelle de l'app
  useEffect(() => {
    const fetchCurrentVersion = async () => {
      try {
        const versionInfo = await getAppVersion()
        setCurrentVersion(versionInfo.version)
      } catch (err) {
        console.error('Error fetching current version:', err)
      }
    }
    fetchCurrentVersion()
  }, [getAppVersion])

  // Vérifier les mises à jour
  const fetchUpdate = async () => {
    try {
      setUpdateStatus({ status: 'checking', message: 'Vérification des mises à jour...' })
      const info = await checkForUpdates()

      if (info.success && info.version) {
        setUpdateInfo({
          version: info.version,
          releaseNotes: info.releaseNotes || undefined,
          releaseDate: info.releaseDate || undefined,
        })
        setUpdateStatus({
          status: 'available',
          message: `Version ${info.version} disponible`,
        })
      } else {
        setUpdateInfo(null)
        setUpdateStatus({
          status: 'available',
          message: '✅ Votre application est à jour',
        })
      }
    } catch (err: any) {
      console.error('Update check error:', err)
      setUpdateStatus({
        status: 'error',
        message: 'Erreur lors de la vérification',
      })
    }
  }

  useEffect(() => {
    fetchUpdate()
  }, [])

  // Écouter les événements de progression (à connecter avec les events IPC)
  useEffect(() => {
    // TODO: Connecter avec les events IPC pour la progression en temps réel
    // window.electron?.onUpdateProgress((progress) => {
    //   setUpdateStatus({
    //     status: 'downloading',
    //     progress: progress.percent,
    //     message: `Téléchargement... ${Math.round(progress.percent)}%`
    //   })
    // })
  }, [])

  const handleDownload = async () => {
    try {
      setUpdateStatus({
        status: 'downloading',
        progress: 0,
        message: 'Préparation du téléchargement...',
      })
      await downloadUpdate()
      setUpdateStatus({
        status: 'downloaded',
        message: '✅ Téléchargement terminé',
      })
    } catch (err) {
      console.error('Download error:', err)
      setUpdateStatus({
        status: 'error',
        message: 'Erreur lors du téléchargement',
      })
    }
  }

  const handleInstall = async () => {
    await quitAndInstall()
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Mises à jour</h3>
            {currentVersion && (
              <p className="text-xs text-gray-500 dark:text-gray-400">Version actuelle: {currentVersion}</p>
            )}
          </div>
        </div>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Status Message */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {updateStatus.status === 'checking' && (
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            )}
            {updateStatus.status === 'available' && updateInfo && <div className="w-3 h-3 bg-green-500 rounded-full" />}
            {updateStatus.status === 'error' && <div className="w-3 h-3 bg-red-500 rounded-full" />}
            <span className="text-sm font-medium text-gray-900 dark:text-white">{updateStatus.message}</span>
          </div>

          {updateStatus.status !== 'checking' && (
            <button
              onClick={fetchUpdate}
              className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Actualiser
            </button>
          )}
        </div>

        {/* Update Info */}
        {updateInfo && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                Version {updateInfo.version}
              </span>
              {updateInfo.releaseDate && (
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  {new Date(updateInfo.releaseDate).toLocaleDateString()}
                </span>
              )}
            </div>

            {updateInfo.releaseNotes && (
              <>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline mb-2"
                >
                  {showDetails ? 'Masquer' : 'Voir'} les notes de version
                </button>
                {showDetails && (
                  <div className="text-xs text-blue-800 dark:text-blue-200 bg-white dark:bg-blue-800/30 rounded p-2 max-h-32 overflow-y-auto">
                    {updateInfo.releaseNotes}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Progress Bar */}
        {updateStatus.status === 'downloading' && updateStatus.progress !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Téléchargement en cours...</span>
              <span>{Math.round(updateStatus.progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${updateStatus.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-2">
          {updateStatus.status === 'available' && updateInfo && (
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Télécharger
            </button>
          )}

          {updateStatus.status === 'downloaded' && (
            <button
              onClick={handleInstall}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Redémarrer et installer
            </button>
          )}

          {updateStatus.status === 'error' && (
            <button
              onClick={fetchUpdate}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
            >
              Réessayer
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
