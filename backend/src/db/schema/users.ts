import { pgTable, text, timestamp, uuid, jsonb, boolean, decimal } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').unique().notNull(),
  email: text('email').notNull(),
  name: text('name'),
  subscriptionTier: text('subscription_tier').default('free'),
  subscriptionEndsAt: timestamp('subscription_ends_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const consultations = pgTable('consultations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  specialistType: text('specialist_type').notNull(),
  status: text('status').default('active'),
  symptoms: text('symptoms'),
  notes: text('notes'),
  startedAt: timestamp('started_at').defaultNow(),
  endedAt: timestamp('ended_at'),
  duration: decimal('duration'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const medicalReports = pgTable('medical_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  consultationId: uuid('consultation_id').references(() => consultations.id),
  symptoms: jsonb('symptoms'),
  diagnosis: text('diagnosis'),
  recommendations: jsonb('recommendations'),
  medications: jsonb('medications'),
  followUpNeeded: boolean('follow_up_needed').default(false),
  reportUrl: text('report_url'),
  generatedAt: timestamp('generated_at').defaultNow(),
});