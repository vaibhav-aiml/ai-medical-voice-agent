import { pgTable, text, timestamp, boolean, integer, jsonb, index } from 'drizzle-orm/pg-core';

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
