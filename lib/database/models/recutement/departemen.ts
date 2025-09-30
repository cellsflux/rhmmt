import { db } from '../../index'

export interface Departement {
  id?: number
  nom: string
  descriptions?: string
  prefixMatricule?: string
}

// Création de la table si elle n'existe pas
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS departements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    descriptions TEXT,
    prefixMatricule TEXT
  )
`
).run()

export const DepartementModel = {
  // Création d'un nouveau département
  create: (data: Departement): Departement => {
    const stmt = db.prepare(
      `INSERT INTO departements (nom, descriptions, prefixMatricule)
       VALUES (?, ?, ?)`
    )
    const result = stmt.run(data.nom, data.descriptions ?? null, data.prefixMatricule ?? null)
    return { ...data, id: Number(result.lastInsertRowid) }
  },

  // Récupération par ID
  getById: (id: number): Departement | undefined => {
    const row = db.prepare('SELECT * FROM departements WHERE id = ?').get(id)
    return row ?? undefined
  },

  // Récupération de tous les départements
  getAll: (): Departement[] => {
    return db.prepare('SELECT * FROM departements').all()
  },

  // Mise à jour d'un département
  update: (id: number, data: Partial<Departement>): Departement | undefined => {
    const keys = Object.keys(data)
    if (keys.length === 0) return DepartementModel.getById(id)

    const fields = keys.map((key) => `${key} = @${key}`).join(', ')
    db.prepare(`UPDATE departements SET ${fields} WHERE id = @id`).run({
      id,
      ...data,
    })
    return DepartementModel.getById(id)
  },

  // Suppression d'un département
  delete: (id: number): boolean => {
    const result = db.prepare('DELETE FROM departements WHERE id = ?').run(id)
    return result.changes > 0
  },

  // Recherche de départements par nom ou prefix
  search: (query: Partial<Pick<Departement, 'nom' | 'prefixMatricule'>>): Departement[] => {
    let sql = 'SELECT * FROM departements WHERE 1=1'
    const params: Record<string, unknown> = {}

    if (query.nom) {
      sql += ' AND nom LIKE @nom'
      params.nom = `%${query.nom}%`
    }

    if (query.prefixMatricule) {
      sql += ' AND prefixMatricule LIKE @prefixMatricule'
      params.prefixMatricule = `%${query.prefixMatricule}%`
    }

    return db.prepare(sql).all(params)
  },
}
