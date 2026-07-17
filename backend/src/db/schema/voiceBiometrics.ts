import { pgTable, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

export const voiceBiometrics = pgTable('voice_biometrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).unique().notNull(),
  voiceEmbedding: jsonb('voice_embedding').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
