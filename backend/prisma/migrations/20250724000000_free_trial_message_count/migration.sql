-- AlterTable: Add message_count to free_trials for tracking multiple free messages per coach
ALTER TABLE "free_trials" ADD COLUMN IF NOT EXISTS "message_count" INTEGER NOT NULL DEFAULT 1;
