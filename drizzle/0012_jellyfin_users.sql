CREATE TABLE "jellyfin_users" (
    "athion_user_id" uuid PRIMARY KEY NOT NULL,
    "jellyfin_user_id" text NOT NULL,
    "jellyfin_username" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "jellyfin_users_jellyfin_user_id_unique" UNIQUE("jellyfin_user_id"),
    CONSTRAINT "jellyfin_users_jellyfin_username_unique" UNIQUE("jellyfin_username")
);
--> statement-breakpoint
ALTER TABLE "jellyfin_users" ADD CONSTRAINT "jellyfin_users_athion_user_id_users_id_fk" FOREIGN KEY ("athion_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
