import { Pool } from 'pg';

const pool = new Pool({
  host: 'dpg-cr1qujbqf0us739hfgrg-a.oregon-postgres.render.com',
  port: 5432,
  database: 'dbusers_8lju',
  user: 'migueluser',
  password: 'q2cPKMoiQAXDVZNvLF4SNxFKFlHTzRHF',
  ssl: {
    rejectUnauthorized: false, // Requerido para conexiones SSL seguras
  },
});

// Test connection
const testConnection = async () => {
    try {
      const result = await pool.query('SELECT NOW()');
      console.log('Database connection test successful:', result.rows);
    } catch (err) {
      console.error('Database connection test failed:', err);
    }
  };
  
  testConnection();
  
export const query = async (text: string, params?: any[]) => {
  const res = await pool.query(text, params);
  return res.rows;
};
