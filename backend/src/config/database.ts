// Temporary placeholder - we'll set up the real database later
// import { neon } from '@neondatabase/serverless';
// import { drizzle } from 'drizzle-orm/neon';
// import * as schema from '../db/schema/users';

// const sql = neon(process.env.DATABASE_URL!);
// export const db = drizzle(sql, { schema });

// Placeholder export for now
export const db = {
  query: {},
  insert: () => {},
  select: () => {},
} as any;