import { app } from 'electron'
import fs from 'fs'
import { join, dirname } from 'path'

export function backupSQLiteData() {
  try {
    const userDataPath = app.getPath('userData')
    const sqliteFiles = ['app.db']
    const backupDir = join(userDataPath, 'backups')

    // Créer le dossier de sauvegarde s'il n'existe pas
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    // Créer une sauvegarde avec timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const timestampedBackupDir = join(backupDir, timestamp)

    if (!fs.existsSync(timestampedBackupDir)) {
      fs.mkdirSync(timestampedBackupDir, { recursive: true })
    }

    sqliteFiles.forEach((file) => {
      const filePath = join(userDataPath, file)
      if (fs.existsSync(filePath)) {
        // Sauvegarde principale (pour restauration immédiate)
        const mainBackupPath = join(userDataPath, `${file}.backup`)
        fs.copyFileSync(filePath, mainBackupPath)

        // Sauvegarde archivée avec timestamp
        const timestampedBackupPath = join(timestampedBackupDir, file)
        fs.copyFileSync(filePath, timestampedBackupPath)

        console.log(`✅ Sauvegarde de ${file}`)
      }
    })

    // Nettoyer les anciennes sauvegardes (garder les 5 plus récentes)
    cleanOldBackups(backupDir)
  } catch (err) {
    console.error('Erreur backup SQLite:', err)
    throw err
  }
}

export function restoreSQLiteData() {
  try {
    const userDataPath = app.getPath('userData')
    const sqliteFiles = ['app.db']

    sqliteFiles.forEach((file) => {
      const backupPath = join(userDataPath, `${file}.backup`)
      const filePath = join(userDataPath, file)

      if (fs.existsSync(backupPath)) {
        // Sauvegarder l'état actuel avant restauration
        if (fs.existsSync(filePath)) {
          const emergencyBackup = join(userDataPath, `${file}.emergency`)
          fs.copyFileSync(filePath, emergencyBackup)
        }

        // Restaurer depuis la sauvegarde
        fs.copyFileSync(backupPath, filePath)
        console.log(`♻️ Restauration de ${file}`)
      }
    })
  } catch (err) {
    console.error('Erreur restauration SQLite:', err)
    throw err
  }
}

function cleanOldBackups(backupDir: string) {
  try {
    const backups = fs
      .readdirSync(backupDir)
      .filter((item) => {
        const itemPath = join(backupDir, item)
        return fs.statSync(itemPath).isDirectory()
      })
      .sort()
      .reverse()

    // Garder seulement les 5 sauvegardes les plus récentes
    if (backups.length > 5) {
      backups.slice(5).forEach((oldBackup) => {
        const oldBackupPath = join(backupDir, oldBackup)
        fs.rmSync(oldBackupPath, { recursive: true, force: true })
        console.log(`🗑️ Nettoyage ancienne sauvegarde: ${oldBackup}`)
      })
    }
  } catch (err) {
    console.error('Erreur nettoyage sauvegardes:', err)
  }
}
