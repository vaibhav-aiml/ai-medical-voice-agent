CREATE TABLE "medications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"dosage" text NOT NULL,
	"frequency" text NOT NULL,
	"times" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"days_of_week" jsonb,
	"start_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp,
	"quantity" integer,
	"refill_reminder" boolean DEFAULT false,
	"refill_threshold" integer,
	"notes" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reminder_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"reminder_id" text NOT NULL,
	"user_id" text NOT NULL,
	"scheduled_time" timestamp NOT NULL,
	"sent_time" timestamp,
	"acknowledged_time" timestamp,
	"status" text NOT NULL,
	"channel" text NOT NULL,
	"response" text
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"user_id" text PRIMARY KEY NOT NULL,
	"email_enabled" boolean DEFAULT false NOT NULL,
	"email_address" text,
	"sms_enabled" boolean DEFAULT false NOT NULL,
	"phone_number" text,
	"whatsapp_enabled" boolean DEFAULT false NOT NULL,
	"push_enabled" boolean DEFAULT false NOT NULL,
	"reminder_time" text DEFAULT '08:00' NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_medications_user_id" ON "medications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_reminder_logs_user_id" ON "reminder_logs" USING btree ("user_id");