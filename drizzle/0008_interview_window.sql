-- Reclassify existing interview channels as application channels.
-- Today's "interview" channels have been the always-on application-messages
-- surface — they were misnamed when we built per-application chat.
UPDATE "chat_channels"
SET kind = 'application'
WHERE kind = 'interview';
--> statement-breakpoint

-- Drop the legacy public general channel (one-off; was a leftover from the v1
-- member chat experiment). Cascade clears its messages.
DELETE FROM "chat_messages" WHERE channel_id IN (SELECT id FROM "chat_channels" WHERE kind = 'general');
--> statement-breakpoint
DELETE FROM "chat_channels" WHERE kind = 'general';
--> statement-breakpoint

-- Interview window: store duration on the access_request so the channel knows
-- when to open and close.
ALTER TABLE "access_requests" ADD COLUMN "interview_duration_minutes" integer NOT NULL DEFAULT 30;
