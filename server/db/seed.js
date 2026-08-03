import pool from './connection.js'
import { resetDatabaseToDefault } from './resetDatabase.js'

const seed = async () => {
  try {
    await resetDatabaseToDefault(pool)
    console.log('Database reset to default state successfully.')
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await pool.end()
  }
}

seed()
