ALTER TABLE "user" ADD COLUMN "chat_id" varchar(255);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "email" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "email_verified" timestamp with time zone DEFAULT CURRENT_TIMESTAMP;