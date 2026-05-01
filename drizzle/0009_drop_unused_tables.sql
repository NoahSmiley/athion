-- Drop tables no longer used by the app.
--
-- application_messages was superseded by chat_channels/chat_messages
-- (per-application chat). Migration 0003 created it; nothing has read or
-- written to it since 0004_chat introduced the channel model.
--
-- ide_waitlist backed the IDE landing-page waitlist form, which was removed
-- alongside the rest of the IDE marketing surface.
--
-- api_keys + ide_auth_codes backed the IDE app's token exchange (api/auth/ide/*),
-- which has been removed.
DROP TABLE IF EXISTS "application_messages";
--> statement-breakpoint
DROP TABLE IF EXISTS "ide_waitlist";
--> statement-breakpoint
DROP TABLE IF EXISTS "api_keys";
--> statement-breakpoint
DROP TABLE IF EXISTS "ide_auth_codes";
