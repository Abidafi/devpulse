import app from './app.js';
import { pool } from './config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await pool.query('SELECT 1');
    console.log('🐘 PostgreSQL pool initialized successfully.');

    app.listen(PORT, () => {
      console.log(`🚀 DevPulse server is racing hot on port ${PORT}`);
    });
  } catch (error) {
    console.error('🛑 Failed to launch database or server application:', error);
    process.exit(1);
  }
}

startServer();