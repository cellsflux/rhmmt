import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import fs from 'fs'

export function migrateDatabase() {
  const dbPath = join(app.getPath('userData'), 'app.db')

  // S'assurer que la base de données existe
  if (!fs.existsSync(dbPath)) {
    console.log('📋 Création de la base de données...')
    // Créer un fichier de base de données vide
    fs.closeSync(fs.openSync(dbPath, 'w'))
  }

  const db = new Database(dbPath)

  try {
    db.exec(
      `CREATE TABLE IF NOT EXISTS migrations (id INTEGER PRIMARY KEY, name TEXT UNIQUE, applied_at DATETIME DEFAULT CURRENT_TIMESTAMP)`
    )

    const applied = db
      .prepare('SELECT name FROM migrations')
      .all()
      .map((r: any) => r.name)

    const migrations = [
      {
        name: '001_create_agents',
        sql: `
          CREATE TABLE IF NOT EXISTS agents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            matricule TEXT,
            nom TEXT NOT NULL,
            postnom TEXT NOT NULL,
            prenom TEXT NOT NULL,
            genre TEXT NOT NULL,
            email TEXT,
            telephone TEXT NOT NULL,
            devise TEXT,
            habillement TEXT,
            banque TEXT,
            brithday TEXT,
            brithplace TEXT,
            adresse TEXT,
            pere TEXT,
            mere TEXT,
            personneUrgence TEXT,
            etatcivil TEXT NOT NULL,
            nationalite TEXT NOT NULL,
            carteIdentite TEXT,
            nomduconjoint TEXT,
            nombre_enfants INTEGER,
            enfants TEXT,
            typeContrat TEXT,
            dateDebutContrat TEXT,
            dateFinContrat TEXT,
            poste_ocuper TEXT,
            periode_essai TEXT NOT NULL,
            saleaire TEXT,
            departement TEXT NOT NULL,
            nuvieau_etudes TEXT NOT NULL,
            anne_experience INTEGER NOT NULL,
            cncss TEXT,
            nif TEXT,
            image TEXT,
            signature TEXT,
            cardIdentiteImage TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `,
      },
      {
        name: '002_create_departements',
        sql: `
          CREATE TABLE IF NOT EXISTS departements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            descriptions TEXT,
            prefixMatricule TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `,
      },
      {
        name: '003_create_domaines',
        sql: `
          CREATE TABLE IF NOT EXISTS domaines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            departementId INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (departementId) REFERENCES departements(id)
          )
        `,
      },
      {
        name: '004_add_agent_timestamps',
        sql: `ALTER TABLE agents ADD COLUMN created_at DATETIME`,
        check: (db: Database) => {
          try {
            const row = db.prepare("PRAGMA table_info('agents')").all()
            return !row.find((c: any) => c.name === 'created_at')
          } catch (error) {
            return true
          }
        },
      },
    ]

    // Exécuter dans une transaction
    const transaction = db.transaction((migrationsToRun: any[]) => {
      for (const m of migrationsToRun) {
        const shouldRun = m.check ? m.check(db) : !applied.includes(m.name)
        if (shouldRun) {
          console.log(`🚀 Application de la migration: ${m.name}`)
          db.exec(m.sql)
          db.prepare('INSERT INTO migrations (name) VALUES (?)').run(m.name)
        }
      }
    })

    transaction(migrations)

    console.log('✅ Migrations terminées avec succès')
  } catch (error) {
    console.error('❌ Erreur lors des migrations:', error)
    throw error
  } finally {
    db.close()
  }
}
