-- Drop the legacy reason column and add structured fields
ALTER TABLE "access_requests" DROP COLUMN IF EXISTS "reason";--> statement-breakpoint
ALTER TABLE "access_requests" ADD COLUMN "github_url" text;--> statement-breakpoint
ALTER TABLE "access_requests" ADD COLUMN "vouchers" text;--> statement-breakpoint
ALTER TABLE "access_requests" ADD COLUMN "interview_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "access_requests" ADD COLUMN "interview_note" text;--> statement-breakpoint
ALTER TABLE "access_requests" ADD COLUMN "decision_note" text;
