import { pgTable, text, timestamp, uuid, index, integer } from 'drizzle-orm/pg-core';
import { users } from './users';
import { consultations } from './consultations';

export const fhirConnections = pgTable('fhir_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).unique().notNull(),
  provider: text('provider').notNull(),
  fhirServerUrl: text('fhir_server_url').notNull(),
  patientId: text('patient_id').notNull(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token'),
  tokenExpiresAt: timestamp('token_expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_fhir_connections_user_id').on(table.userId),
]);

export const fhirSyncLogs = pgTable('fhir_sync_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  consultationId: uuid('consultation_id').references(() => consultations.id),
  resourceType: text('resource_type').notNull(),
  status: text('status').notNull(), // 'success' | 'failed' | 'pending'
  syncType: text('sync_type').notNull(), // 'manual' | 'automatic'
  version: integer('version').default(1),
  error: text('error'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_fhir_sync_logs_user_id').on(table.userId),
  index('idx_fhir_sync_logs_consultation_id').on(table.consultationId),
]);
