ALTER TABLE "chat_channels" ADD COLUMN "kind" text NOT NULL DEFAULT 'general';
--> statement-breakpoint
ALTER TABLE "chat_channels" ADD COLUMN "application_id" uuid;
--> statement-breakpoint
ALTER TABLE "chat_channels" ADD COLUMN "closed_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "chat_channels" ADD CONSTRAINT "chat_channels_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "access_requests"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
CREATE INDEX "chat_channels_application_id_idx" ON "chat_channels" ("application_id");
