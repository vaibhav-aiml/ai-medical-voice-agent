import { pgTable, text, timestamp, uuid, jsonb, index } from 'drizzle-orm/pg-core';

export const hipaaLogs = pgTable('hipaa_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type').notNull(),
  value: text('value'),
  accessReason: text('access_reason'),
  accessedBy: text('accessed_by'),
  timestamp: timestamp('timestamp'),
  receivedAt: timestamp('received_at').defaultNow(),
  extraData: jsonb('extra_data'),
}, (table) => [
  index('idx_hipaa_logs_type').on(table.type),
  index('idx_hipaa_logs_accessed_by').on(table.accessedBy),
  index('idx_hipaa_logs_timestamp').on(table.timestamp),
]);
