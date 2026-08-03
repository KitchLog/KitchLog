import pool from '../db/connection.js';
import { resetDatabaseToDefault } from '../db/resetDatabase.js';

const resetDatabase = async (req, res) => {
  try {
    await resetDatabaseToDefault(pool);
    res.json({ message: 'Database reset to default state.' });
  } catch (error) {
    console.error('Error resetting database:', error);
    res.status(500).json({ error: 'Error resetting database' });
  }
};

export { resetDatabase };
