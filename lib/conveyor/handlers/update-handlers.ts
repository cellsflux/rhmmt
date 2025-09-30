import { handle } from '@/lib/main/shared'
import { autoUpdater } from 'electron-updater'
import { backupSQLiteData, restoreSQLiteData, verifyBackup } from '../utils/updater' // Chemin corrigé
import type { App } from 'electron'
import { dialog, BrowserWindow } from 'electron'

let mainWindow: BrowserWindow | null = null

export const registerUpdateHandlers = (app: App, win: BrowserWindow) => {
  mainWindow = win
  setupAutoUpdaterListeners()

  // Vérifier les mises à jour
  handle('check-for-updates', async () => {
    try {
      if (!autoUpdater.isUpdaterActive()) {
        return {
          success: false,
          error: 'Auto updater is not active',
        }
      }

      const updateCheckResult = await autoUpdater.checkForUpdates()
      return {
        success: true,
        version: updateCheckResult?.updateInfo?.version ?? null,
        releaseDate: updateCheckResult?.updateInfo?.releaseDate ?? null,
        releaseNotes: updateCheckResult?.updateInfo?.releaseNotes ?? null,
      }
    } catch (err: any) {
      console.error('Error checking for updates:', err)
      return {
        success: false,
        error: err.message ?? 'Unknown error during update check',
      }
    }
  })

  // Télécharger la mise à jour
  handle('download-update', async () => {
    try {
      // Sauvegarder les données avant le téléchargement
      console.log('📋 Creating backup before update download...')
      const backupResult = backupSQLiteData()

      if (!backupResult.success) {
        throw new Error(`Backup failed: ${backupResult.error}`)
      }

      // Vérifier que la sauvegarde est valide
      const backupVerified = verifyBackup()
      if (!backupVerified.success) {
        throw new Error(`Backup verification failed: ${backupVerified.error}`)
      }

      console.log('⬇️ Starting update download...')
      await autoUpdater.downloadUpdate()

      return {
        success: true,
        status: 'download-started',
        backupCreated: true,
      }
    } catch (err: any) {
      console.error('Error downloading update:', err)

      // Tentative de restauration en cas d'échec
      try {
        const restoreResult = restoreSQLiteData()
        if (!restoreResult.success) {
          console.error('Restore failed after download error:', restoreResult.error)
        }
      } catch (restoreError) {
        console.error('Error during restore after download failure:', restoreError)
      }

      return {
        success: false,
        error: err.message ?? 'Download failed',
        backupRestored: true,
      }
    }
  })

  // Quitter et installer
  handle('quit-and-install', async () => {
    try {
      // Dernière sauvegarde avant installation
      console.log('🔄 Final backup before installation...')
      const backupResult = backupSQLiteData()

      if (!backupResult.success) {
        console.warn('Final backup failed:', backupResult.error)
      }

      // Envoyer un message à l'interface utilisateur
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('update-status', {
          status: 'installing',
          message: 'Installation de la mise à jour...',
        })
      }

      // Petite pause pour permettre l'envoi du message
      await new Promise((resolve) => setTimeout(resolve, 100))

      autoUpdater.quitAndInstall(true, true)

      return {
        success: true,
        status: 'installation-started',
        message: 'Application will restart to complete update',
      }
    } catch (err: any) {
      console.error('Error during quit and install:', err)
      return {
        success: false,
        error: err.message ?? 'Installation failed',
      }
    }
  })

  // Restaurer la base de données
  handle('restore-sqlite', () => {
    try {
      console.log('🔄 Restoring SQLite database...')
      const result = restoreSQLiteData()

      if (result.success) {
        // Demander à l'utilisateur s'il veut redémarrer
        if (mainWindow && !mainWindow.isDestroyed()) {
          const response = dialog.showMessageBoxSync(mainWindow, {
            type: 'question',
            title: 'Restauration terminée',
            message: "La base de données a été restaurée avec succès. Voulez-vous redémarrer l'application ?",
            buttons: ['Redémarrer', 'Plus tard'],
            defaultId: 0,
            cancelId: 1,
          })

          if (response === 0) {
            app.relaunch()
            app.exit()
          }
        }
      }

      return result
    } catch (err: any) {
      console.error('Error restoring SQLite:', err)
      return {
        success: false,
        error: err.message ?? 'Restore failed',
      }
    }
  })

  // Vérifier l'état de la sauvegarde
  handle('verify-backup', () => {
    try {
      return verifyBackup()
    } catch (err: any) {
      return {
        success: false,
        error: err.message ?? 'Backup verification failed',
      }
    }
  })

  // Créer une sauvegarde manuelle
  handle('create-backup', () => {
    try {
      console.log('📋 Creating manual backup...')
      return backupSQLiteData()
    } catch (err: any) {
      return {
        success: false,
        error: err.message ?? 'Manual backup failed',
      }
    }
  })

  // Obtenir la version de l'app
  handle('get-app-version', () => {
    try {
      const version = app.getVersion()
      return {
        success: true,
        version,
        name: app.getName(),
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message ?? 'Could not get version',
      }
    }
  })

  // Obtenir l'état de la mise à jour
  handle('get-update-status', () => {
    try {
      return {
        success: true,
        isUpdaterActive: autoUpdater.isUpdaterActive(),
        autoDownload: autoUpdater.autoDownload,
        autoInstallOnAppQuit: autoUpdater.autoInstallOnAppQuit,
        currentVersion: app.getVersion(),
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message ?? 'Could not get update status',
      }
    }
  })
}

// Configuration des écouteurs d'événements de l'auto-updater
function setupAutoUpdaterListeners() {
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = false

  autoUpdater.on('checking-for-update', () => {
    console.log('🔄 Checking for updates...')
    sendUpdateStatus('checking', 'Vérification des mises à jour...')
  })

  autoUpdater.on('update-available', (info) => {
    console.log(`✅ Update available: ${info.version}`)
    sendUpdateStatus('available', {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
    })
  })

  autoUpdater.on('update-not-available', () => {
    console.log('ℹ️ No updates available')
    sendUpdateStatus('not-available', 'Aucune mise à jour disponible')
  })

  autoUpdater.on('download-progress', (progress) => {
    console.log(`📥 Download progress: ${Math.round(progress.percent)}%`)
    sendUpdateStatus('download-progress', {
      percent: Math.round(progress.percent),
      bytesPerSecond: progress.bytesPerSecond,
      transferred: progress.transferred,
      total: progress.total,
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    console.log('🎉 Update downloaded, ready to install')
    sendUpdateStatus('downloaded', {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
    })
  })

  autoUpdater.on('error', (error) => {
    console.error('❌ Update error:', error)
    sendUpdateStatus('error', {
      message: error.message,
      stack: error.stack,
    })
  })
}

// Fonction utilitaire pour envoyer l'état de la mise à jour
function sendUpdateStatus(status: string, data?: any) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-status', {
      status,
      timestamp: new Date().toISOString(),
      ...data,
    })
  }
}
