import { pgTable, text, timestamp, uuid, jsonb, boolean, decimal, index, integer } from 'drizzle-orm/pg-core';

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

export const voiceBiometrics = pgTable('voice_biometrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).unique().notNull(),
  voiceEmbedding: jsonb('voice_embedding').notNull(),
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
}, (table) => [
  index('idx_consultations_user_id').on(table.userId),
  index('idx_consultations_status').on(table.status),
  index('idx_consultations_started_at').on(table.startedAt),
]);

export const voiceSessions = pgTable('voice_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  consultationId: uuid('consultation_id').references(() => consultations.id),
  transcript: jsonb('transcript').default([]),
  aiResponses: jsonb('ai_responses').default([]),
  audioUrl: text('audio_url'),
  emotion: text('emotion'),
  emotionConfidence: decimal('emotion_confidence'),
  emotionScores: jsonb('emotion_scores').default({}),
  startedAt: timestamp('started_at').defaultNow(),
  endedAt: timestamp('ended_at'),
}, (table) => [
  index('idx_voice_sessions_consultation_id').on(table.consultationId),
]);

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
}, (table) => [
  index('idx_medical_reports_consultation_id').on(table.consultationId),
]);

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

export const dbMedications = pgTable('medications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  dosage: text('dosage').notNull(),
  frequency: text('frequency').notNull(),
  times: jsonb('times').default([]).notNull(),
  daysOfWeek: jsonb('days_of_week'),
  startDate: timestamp('start_date').notNull().defaultNow(),
  endDate: timestamp('end_date'),
  quantity: integer('quantity'),
  refillReminder: boolean('refill_reminder').default(false),
  refillThreshold: integer('refill_threshold'),
  notes: text('notes'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_medications_user_id').on(table.userId),
]);

export const dbReminderLogs = pgTable('reminder_logs', {
  id: text('id').primaryKey(),
  reminderId: text('reminder_id').notNull(),
  userId: text('user_id').notNull(),
  scheduledTime: timestamp('scheduled_time').notNull(),
  sentTime: timestamp('sent_time'),
  acknowledgedTime: timestamp('acknowledged_time'),
  status: text('status').notNull(),
  channel: text('channel').notNull(),
  response: text('response'),
}, (table) => [
  index('idx_reminder_logs_user_id').on(table.userId),
]);

export const dbUserPreferences = pgTable('user_preferences', {
  userId: text('user_id').primaryKey(),
  emailEnabled: boolean('email_enabled').default(false).notNull(),
  emailAddress: text('email_address'),
  smsEnabled: boolean('sms_enabled').default(false).notNull(),
  phoneNumber: text('phone_number'),
  whatsappEnabled: boolean('whatsapp_enabled').default(false).notNull(),
  pushEnabled: boolean('push_enabled').default(false).notNull(),
  reminderTime: text('reminder_time').default('08:00').notNull(),
});