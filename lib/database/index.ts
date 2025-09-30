import Database from 'better-sqlite3'
import { UserModel } from './models/user'

const db = new Database('app.db')

// Init models
export const User = UserModel(db)

// Create tables
User.createTable()

export { db }
