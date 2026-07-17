import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

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