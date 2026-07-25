import pool from './connection.js'
import schema from './schema.js'

const seed = async () => {
  try {
    await pool.query(schema)
    console.log('Database schema created successfully.')
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await pool.end()
  }
}

seed()