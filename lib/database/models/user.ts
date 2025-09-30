import Database from 'better-sqlite3'

export interface User {
  id?: number
  name: string
  email: string
}

export const UserModel = (db: Database.Database) => {
  const createTable = () => {
    db.prepare(
      `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE
      )
    `
    ).run()
  }

  const insert = (user: Omit<User, 'id'>): User => {
    const info = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run(user.name, user.email)
    return { id: Number(info.lastInsertRowid), ...user }
  }

  const all = (): User[] => {
    const rows = db.prepare('SELECT * FROM users').all()
    return rows as User[]
  }

  const getById = (id: number): User | null => {
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
    return row ? (row as User) : null
  }

  return { createTable, insert, all, getById }
}
