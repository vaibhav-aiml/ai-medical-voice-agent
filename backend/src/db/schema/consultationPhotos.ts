import { pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { consultations } from './consultations';

export const consultationPhotos = pgTable('consultation_photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  consultationId: uuid('consultation_id').references(() => consultations.id).notNull(),
  // NOTE: Storing images as base64 text in Postgres for MVP volume.
  // Large-scale deployments should migrate to cloud object storage (e.g. S3 / GCS),
  // as relational databases are not optimized for large binary payloads.
  imageData: text('image_data').notNull(),
  mimeType: text('mime_type').notNull(),
  caption: text('caption'),
  analysisResult: text('analysis_result'),
  consentedAt: timestamp('consented_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('idx_consultation_photos_consultation_id').on(table.consultationId),
]);
