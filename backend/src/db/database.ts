import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Determine SSL configuration
// Supabase (and other cloud providers) require SSL
// If DATABASE_URL includes 'supabase' or 'sslmode=require', we enforce SSL
const isProduction = process.env.NODE_ENV === 'production';
const dbUrl = process.env.DATABASE_URL || '';
const isSupabase = dbUrl.includes('supabase') || dbUrl.includes('sslmode=require');

const sslConfig = (isProduction || isSupabase)
  ? { rejectUnauthorized: false } // Required for Supabase in many environments
  : false;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = async (text: string, params?: any[]): Promise<QueryResult> => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const getClient = async () => {
  return await pool.connect();
};

export default pool;
