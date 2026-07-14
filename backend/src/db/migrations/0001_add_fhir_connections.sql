CREATE TABLE "fhir_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"fhir_server_url" text NOT NULL,
	"patient_id" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"token_expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "fhir_connections_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "voice_biometrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"voice_embedding" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "voice_biometrics_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "fhir_connections" ADD CONSTRAINT "fhir_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_biometrics" ADD CONSTRAINT "voice_biometrics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_fhir_connections_user_id" ON "fhir_connections" USING btree ("user_id");