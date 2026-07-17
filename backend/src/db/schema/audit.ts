import { pgTable, text, timestamp, uuid, jsonb, index } from 'drizzle-orm/pg-core';

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  timestamp: timestamp('timestamp'),
  userId: text('user_id'),
  sessionId: text('session_id'),
  action: text('action').notNull(),
  message: text('message'),
  metadata: jsonb('metadata'),
  signature: text('signature'),
  receivedAt: timestamp('received_at').defaultNow(),
}, (table) => [
  index('idx_audit_logs_user_id').on(table.userId),
  index('idx_audit_logs_action').on(table.action),
  index('idx_audit_logs_timestamp').on(table.timestamp),
]);
