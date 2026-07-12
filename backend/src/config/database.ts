import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema/index';
import logger from '../utils/logger';

let db: ReturnType<typeof drizzle>;

try {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    logger.error('DATABASE_URL is not set. Database operations will fail.');
    // Create a stub that throws on use rather than crashing the import
    db = new Proxy({} as any, {
      get: () => {
        throw new Error('Database not configured — DATABASE_URL is missing');
      },
    });
  } else {
    const sql = neon(databaseUrl);
    db = drizzle(sql, { schema });
    logger.info('Database connection initialized (Neon serverless)');
  }
} catch (error: any) {
  logger.error('Failed to initialize database connection', { error: error.message });
  db = new Proxy({} as any, {
    get: () => {
      throw new Error('Database connection failed during initialization');
    },
  });
}

export { db };