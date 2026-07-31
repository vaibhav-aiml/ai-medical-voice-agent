import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from '../src/db/schema/index';
import { beforeAll, afterAll } from 'vitest';

export let pgliteClient: any;
export let testDb: ReturnType<typeof drizzle>;

beforeAll(async () => {
  pgliteClient = new PGlite();
  testDb = drizzle(pgliteClient, { schema });

  // Initialize schema DDL in pglite in-memory database
  await pgliteClient.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      clerk_id TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      full_name TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS voice_biometrics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      voice_embedding JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS consultations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      doctor_specialist TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      symptoms TEXT,
      soap_report JSONB,
      triage_score JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS hipaa_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      type TEXT NOT NULL,
      value TEXT NOT NULL,
      access_reason TEXT NOT NULL,
      accessed_by TEXT NOT NULL,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      extra_data JSONB
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT,
      session_id TEXT,
      action TEXT NOT NULL,
      message TEXT,
      metadata JSONB,
      signature TEXT NOT NULL,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
});

afterAll(async () => {
  if (pgliteClient && typeof pgliteClient.close === 'function') {
    await pgliteClient.close();
  }
});
