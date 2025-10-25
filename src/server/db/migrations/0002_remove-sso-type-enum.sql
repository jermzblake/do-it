ALTER TABLE "users" ALTER COLUMN "sso_type" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "sso_type" SET DEFAULT 'google';--> statement-breakpoint
DROP TYPE "public"."sso_type";