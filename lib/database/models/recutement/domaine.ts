import { db } from '../../index'

export interface Domaine {
  id: number
  departementId: string //reference du nom de departement
  name: string
  description: string | null
}

interface DatabaseRow {
  id: number
  departementId: string
  name: string
  description: string | null
}

export const DomaineModel = {
  init: () => {
    db.prepare(
      `
      CREATE TABLE IF NOT EXISTS domaines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        departementId TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT
      )
    `
    ).run()
  },

  deleteTable: () => {
    db.prepare(`DROP TABLE IF EXISTS domaines`).run()
  },

  create: (data: Omit<Domaine, 'id'>): Domaine => {
    const stmt = db.prepare(
      `INSERT INTO domaines (departementId, name, description)
       VALUES (?, ?, ?)`
    )
    const result = stmt.run(data.departementId, data.name, data.description)

    return {
      id: Number(result.lastInsertRowid),
      departementId: data.departementId,
      name: data.name,
      description: data.description,
    }
  },

  getById: (id: number): Domaine | undefined => {
    const row = db.prepare('SELECT * FROM domaines WHERE id = ?').get(id) as DatabaseRow | undefined
    return row
      ? {
          id: row.id,
          departementId: row.departementId,
          name: row.name,
          description: row.description,
        }
      : undefined
  },

  getAll: (): Domaine[] => {
    const rows = db.prepare('SELECT * FROM domaines ORDER BY id').all() as DatabaseRow[]
    return rows.map((row) => ({
      id: row.id,
      departementId: row.departementId,
      name: row.name,
      description: row.description,
    }))
  },

  update: (id: number, data: Partial<Omit<Domaine, 'id'>>): Domaine | undefined => {
    const keys = Object.keys(data).filter((key) => key !== 'id' && data[key as keyof Domaine] !== undefined)
    if (keys.length === 0) return DomaineModel.getById(id)

    const setClause = keys.map((key) => `${key} = ?`).join(', ')
    const values = keys.map((key) => data[key as keyof Domaine])

    db.prepare(`UPDATE domaines SET ${setClause} WHERE id = ?`).run(...values, id)
    return DomaineModel.getById(id)
  },

  delete: (id: number): boolean => {
    const result = db.prepare('DELETE FROM domaines WHERE id = ?').run(id)
    return result.changes > 0
  },

  search: (query: { departementId?: string; name?: string }): Domaine[] => {
    let sql = 'SELECT * FROM domaines WHERE 1=1'
    const params: any[] = []

    if (query.name) {
      sql += ' AND name LIKE ?'
      params.push(`%${query.name}%`)
    }

    if (query.departementId) {
      sql += ' AND departementId = ?'
      params.push(query.departementId)
    }

    sql += ' ORDER BY id'

    const rows = db.prepare(sql).all(...params) as DatabaseRow[]
    return rows.map((row) => ({
      id: row.id,
      departementId: row.departementId,
      name: row.name,
      description: row.description,
    }))
  },
}

DomaineModel.init()
