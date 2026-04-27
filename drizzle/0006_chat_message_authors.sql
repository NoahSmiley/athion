ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_author_id_fk";
--> statement-breakpoint
ALTER TABLE "chat_messages" ALTER COLUMN "author_id" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_author_id_fk" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
--> statement-breakpoint
ALTER TABLE "chat_messages" ADD COLUMN "author_name" text;
--> statement-breakpoint
ALTER TABLE "chat_messages" ADD COLUMN "author_member_number" integer;
