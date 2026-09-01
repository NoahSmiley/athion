CREATE TABLE "prime_devices" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"device_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_renewed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "prime_devices" ADD CONSTRAINT "prime_devices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
