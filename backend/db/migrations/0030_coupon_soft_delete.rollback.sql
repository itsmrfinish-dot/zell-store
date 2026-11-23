-- Rollback for migration 0030
-- ⚠️ FORWARD-ONLY MIGRATION — Rollback not supported in production
--
-- This migration adds soft-delete capability (revoked_at column).
-- Rollback would permanently erase the revoked_at column and zell_delete_coupon function.
-- Since archived coupons are business-critical state, rollback is NOT RECOMMENDED.
--
-- To reverse manually in test environments only:
-- 1. Remove revoked_at column (loses audit trail of deleted coupons)
-- 2. Drop zell_delete_coupon function
-- 3. Restore zell_preview_coupon to original logic (no revoked_at check)

BEGIN;

-- Drop the security-definer function (non-cascading to prevent accidents)
DROP FUNCTION IF EXISTS zell_delete_coupon(BIGINT);

-- Remove revoked_at column (WARNING: erases all soft-delete records)
-- Only execute this if you understand the data loss implications
-- ALTER TABLE coupons DROP COLUMN IF EXISTS revoked_at;

COMMIT;
