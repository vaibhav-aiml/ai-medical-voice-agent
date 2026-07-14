CREATE TABLE "fhir_sync_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"consultation_id" uuid,
	"resource_type" text NOT NULL,
	"status" text NOT NULL,
	"sync_type" text NOT NULL,
	"version" integer DEFAULT 1,
	"error" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "fhir_sync_logs" ADD CONSTRAINT "fhir_sync_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fhir_sync_logs" ADD CONSTRAINT "fhir_sync_logs_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_fhir_sync_logs_user_id" ON "fhir_sync_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_fhir_sync_logs_consultation_id" ON "fhir_sync_logs" USING btree ("consultation_id");