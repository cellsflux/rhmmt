import { app } from 'electron'
import fs from 'fs'
import { join } from 'path'
import Database from 'better-sqlite3'
import { autoUpdater } from 'electron-updater'
import { BrowserWindow } from 'electron'

let mainWindow: BrowserWindow

export function initAutoUpdater(win: BrowserWindow) {
  mainWindow = win
  setupAutoUpdater()
}

export function backupSQLiteData() {
  try {
    const userDataPath = app.getPath('userData')
    const sqliteFiles = ['app.db']

    sqliteFiles.forEach((file) => {
      const filePath = join(userDataPath, file)
      if (fs.existsSync(filePath)) {
        const backupPath = join(userDataPath, `${file}.backup`)
        fs.copyFileSync(filePath, backupPath)
        console.log(`✅ Sauvegarde de ${file}`)
      }
    })
  } catch (err) {
    console.error('Erreur backup SQLite:', err)
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
        if (!fs.existsSync(filePath)) fs.copyFileSync(backupPath, filePath)
        fs.unlinkSync(backupPath)
        console.log(`♻️ Restauration de ${file}`)
      }
    })
  } catch (err) {
    console.error('Erreur restauration SQLite:', err)
  }
}

// ----------------- Migration -----------------
export function migrateDatabase() {
  const dbPath = join(app.getPath('userData'), 'app.db')
  const db = new Database(dbPath)

  db.exec(`CREATE TABLE IF NOT EXISTS migrations (id INTEGER PRIMARY KEY, name TEXT UNIQUE)`)

  const applied = db
    .prepare('SELECT name FROM migrations')
    .all()
    .map((r) => r.name)

  const migrations = [
    { name: '001_create_users', sql: `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)` },
    { name: '002_add_email', sql: `ALTER TABLE users ADD COLUMN email TEXT` },
  ]

  for (const m of migrations) {
    if (!applied.includes(m.name)) {
      db.exec(m.sql)
      db.prepare('INSERT INTO migrations (name) VALUES (?)').run(m.name)
      console.log(`🚀 Migration appliquée: ${m.name}`)
    }
  }

  db.close()
}

// ----------------- AutoUpdater -----------------
function setupAutoUpdater() {
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = false

  autoUpdater.on('update-available', (info) => {
    console.log(`Update available: ${info.version}`)
  })

  autoUpdater.on('update-downloaded', () => {
    console.log('Update downloaded')
  })

  autoUpdater.on('error', (err) => {
    console.error('Erreur auto-update:', err)
  })
}
