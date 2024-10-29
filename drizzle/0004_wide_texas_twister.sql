ALTER TABLE "user" RENAME COLUMN "email" TO "telegram_username";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "telegram_username" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN IF EXISTS "email_verified";