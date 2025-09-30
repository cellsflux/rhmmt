import React, { useEffect, useState } from 'react'
import { useConveyor } from '../hooks/use-conveyor'

type UpdateInfo = {
  version?: string
  releaseNotes?: string
}

export default function UpdateToast() {
  const { checkForUpdates, downloadUpdate, quitAndInstall } = useConveyor('app')
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [notification, setNotification] = useState<string | null>('Vérification de la mise à jour...')
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUpdate = async () => {
    try {
      setLoading(true)
      setError(null)
      const info = await checkForUpdates()
      if (!info.version) {
        setNotification('✅ Votre application est à jour')
        setUpdateInfo(null)
      } else {
        setUpdateInfo(info)
        setNotification(`🔔 Mise à jour disponible: ${info.version}`)
      }
    } catch (err: any) {
      console.error(err)
      setError('❌ Erreur lors de la vérification')
      setNotification(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUpdate()
  }, [])

  const handleDownload = async () => {
    try {
      setDownloading(true)
      await downloadUpdate()
      setNotification('✅ Téléchargement terminé. Redémarrez pour installer.')
      setDownloading(false)
    } catch (err) {
      console.error(err)
      setError('❌ Erreur lors du téléchargement')
      setDownloading(false)
    }
  }

  const handleInstall = async () => {
    await quitAndInstall()
  }

  return (
    <div className="fixed bottom-5 right-5 z-[9999] w-80 bg-white border border-gray-300 rounded-lg shadow-lg p-4 flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-800">
          {loading ? '🔄 Vérification en cours...' : notification}
          {error && <span className="text-red-500 ml-2">{error}</span>}
        </div>
        {!loading && (
          <button onClick={fetchUpdate} className="text-blue-500 hover:text-blue-700 text-sm font-semibold">
            🔄 Vérifier
          </button>
        )}
      </div>

      {updateInfo && !downloading && (
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={handleDownload}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium"
          >
            Télécharger
          </button>
          <button
            onClick={handleInstall}
            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium"
          >
            Redémarrer & Installer
          </button>
        </div>
      )}

      {downloading && (
        <div className="text-sm text-gray-700 mt-2 flex items-center gap-2">
          📥 Téléchargement en cours...
          <div className="h-1 flex-1 bg-gray-200 rounded overflow-hidden">
            <div className="bg-blue-500 h-1 w-1/2 animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  )
}
