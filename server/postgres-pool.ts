import { Pool } from 'pg';

// Connection pool for high concurrency (handles 100+ concurrent requests)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/sales_channel',
  max: 20, // Maximum 20 connections in pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Wait 2 seconds for connection
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 Closing PostgreSQL pool...');
  await pool.end();
  console.log('✅ PostgreSQL pool closed');
});

process.on('SIGINT', async () => {
  console.log('🔄 Closing PostgreSQL pool...');
  await pool.end();
  console.log('✅ PostgreSQL pool closed');
  process.exit(0);
});

// Helper function with automatic error handling and query logging
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text: text.substring(0, 100), duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', { text: text.substring(0, 100), error });
    throw error;
  }
}

// For transactions - get a client from the pool
export async function getClient() {
  return await pool.connect();
}

export { pool };
