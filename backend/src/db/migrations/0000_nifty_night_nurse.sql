CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"timestamp" timestamp,
	"user_id" text,
	"session_id" text,
	"action" text NOT NULL,
	"message" text,
	"metadata" jsonb,
	"signature" text,
	"received_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "consultations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"specialist_type" text NOT NULL,
	"specialist_name" text,
	"status" text DEFAULT 'active',
	"symptoms" text,
	"notes" text,
	"started_at" timestamp DEFAULT now(),
	"ended_at" timestamp,
	"duration" numeric,
	"audio_recording_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hipaa_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"value" text,
	"access_reason" text,
	"accessed_by" text,
	"timestamp" timestamp,
	"received_at" timestamp DEFAULT now(),
	"extra_data" jsonb
);
--> statement-breakpoint
CREATE TABLE "medical_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultation_id" uuid,
	"symptoms" jsonb,
	"diagnosis" text,
	"recommendations" jsonb,
	"medications" jsonb,
	"follow_up_needed" boolean DEFAULT false,
	"follow_up_date" timestamp,
	"report_url" text,
	"generated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"stripe_subscription_id" text,
	"stripe_customer_id" text,
	"plan" text,
	"status" text,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"phone" text,
	"date_of_birth" timestamp,
	"subscription_tier" text DEFAULT 'free',
	"subscription_ends_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
CREATE TABLE "voice_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultation_id" uuid,
	"transcript" jsonb DEFAULT '[]'::jsonb,
	"ai_responses" jsonb DEFAULT '[]'::jsonb,
	"audio_url" text,
	"emotion" text,
	"emotion_confidence" numeric,
	"emotion_scores" jsonb DEFAULT '{}'::jsonb,
	"started_at" timestamp DEFAULT now(),
	"ended_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_reports" ADD CONSTRAINT "medical_reports_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_sessions" ADD CONSTRAINT "voice_sessions_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_timestamp" ON "audit_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_consultations_user_id" ON "consultations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_consultations_status" ON "consultations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_consultations_started_at" ON "consultations" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "idx_hipaa_logs_type" ON "hipaa_logs" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_hipaa_logs_accessed_by" ON "hipaa_logs" USING btree ("accessed_by");--> statement-breakpoint
CREATE INDEX "idx_hipaa_logs_timestamp" ON "hipaa_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_medical_reports_consultation_id" ON "medical_reports" USING btree ("consultation_id");--> statement-breakpoint
CREATE INDEX "idx_voice_sessions_consultation_id" ON "voice_sessions" USING btree ("consultation_id");