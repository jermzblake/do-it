ALTER TABLE "tasks" ADD COLUMN "status" varchar(20) DEFAULT 'todo' NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "started_at" timestamp;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN "is_done";--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN "is_blocked";--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "blocked_check1" CHECK ("tasks"."status" != 'blocked' OR "tasks"."blocked_reason" IS NOT NULL);