import { handle } from '@/lib/main/shared'
import { autoUpdater } from 'electron-updater'
import { backupSQLiteData, restoreSQLiteData } from '../utils/updater'
import pakage from '@/package.json'

export const registerUpdateHandlers = () => {
  handle('check-for-updates', async () => {
    const update = await autoUpdater.checkForUpdates()
    return {
      version: update!.updateInfo?.version,
      releaseNotes: update!.updateInfo?.releaseNotes?.toString(),
    }
  })

  handle('download-update', async () => {
    backupSQLiteData()
    await autoUpdater.downloadUpdate()
    return { status: 'started' }
  })

  handle('quit-and-install', () => {
    autoUpdater.quitAndInstall()
    return { status: 'ok' }
  })

  handle('restore-sqlite', () => {
    restoreSQLiteData()
    return { status: 'restored' }
  })

  handle('get-app-version', () => {
    return { version: pakage.version }
  })
}
