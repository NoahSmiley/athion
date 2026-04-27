ALTER TABLE "access_requests" ADD COLUMN "last_applicant_message_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "access_requests" ADD COLUMN "last_admin_seen_at" timestamp with time zone;
