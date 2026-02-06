-- Remove PREMIUM from SubscriptionTier enum
-- Downgrade any existing PREMIUM users to FREE
UPDATE "users"
SET "subscription_tier" = 'FREE'
WHERE "subscription_tier" = 'PREMIUM';

-- Recreate enum without PREMIUM
CREATE TYPE "SubscriptionTier_new" AS ENUM ('FREE', 'CREATOR');

ALTER TABLE "users"
  ALTER COLUMN "subscription_tier"
  TYPE "SubscriptionTier_new"
  USING ("subscription_tier"::text::"SubscriptionTier_new");

DROP TYPE "SubscriptionTier";
ALTER TYPE "SubscriptionTier_new" RENAME TO "SubscriptionTier";
