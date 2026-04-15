import { pgTable, text, timestamp, uuid, jsonb, boolean, decimal } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').unique().notNull(),
  email: text('email').notNull(),
  name: text('name'),
  phone: text('phone'),
  dateOfBirth: timestamp('date_of_birth'),
  subscriptionTier: text('subscription_tier').default('free'),
  subscriptionEndsAt: timestamp('subscription_ends_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const consultations = pgTable('consultations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  specialistType: text('specialist_type').notNull(),
  specialistName: text('specialist_name'), // ADDED: stores the display name of the specialist
  status: text('status').default('active'),
  symptoms: text('symptoms'),
  notes: text('notes'),
  startedAt: timestamp('started_at').defaultNow(),
  endedAt: timestamp('ended_at'),
  duration: decimal('duration'),
  audioRecordingUrl: text('audio_recording_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const voiceSessions = pgTable('voice_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  consultationId: uuid('consultation_id').references(() => consultations.id),
  transcript: jsonb('transcript').default([]),
  aiResponses: jsonb('ai_responses').default([]),
  audioUrl: text('audio_url'),
  startedAt: timestamp('started_at').defaultNow(),
  endedAt: timestamp('ended_at'),
});

export const medicalReports = pgTable('medical_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  consultationId: uuid('consultation_id').references(() => consultations.id),
  symptoms: jsonb('symptoms'),
  diagnosis: text('diagnosis'),
  recommendations: jsonb('recommendations'),
  medications: jsonb('medications'),
  followUpNeeded: boolean('follow_up_needed').default(false),
  followUpDate: timestamp('follow_up_date'),
  reportUrl: text('report_url'),
  generatedAt: timestamp('generated_at').defaultNow(),
});

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  stripeSubscriptionId: text('stripe_subscription_id'),
  stripeCustomerId: text('stripe_customer_id'),
  plan: text('plan'),
  status: text('status'),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});