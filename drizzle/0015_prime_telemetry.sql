CREATE TABLE "prime_telemetry" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"device_id" text,
	"member_name" text,
	"app_version" text,
	"kind" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
