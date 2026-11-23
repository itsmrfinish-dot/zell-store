-- Rollback for migration 0030
-- ⚠️ FORWARD-ONLY MIGRATION — Rollback not supported in production
--
-- This migration adds the revoked_at column, zell_delete_coupon, and revoked
-- rejection inside zell_preview_coupon and zell_create_order (bodies copied
-- from 0019 / 0021ex with the revoked_at condition only).
-- Rollback would erase the archive state and is NOT RECOMMENDED.
--
-- To reverse manually in test environments only:
-- 1. Restore zell_preview_coupon from 0019 and zell_create_order from 0021ex.
-- 2. Drop zell_delete_coupon.
-- 3. Remove the revoked_at column (loses the archive record).

BEGIN;

-- Drop the security-definer function (non-cascading to prevent accidents)
DROP FUNCTION IF EXISTS public.zell_delete_coupon(bigint);

-- Remove revoked_at column (WARNING: erases all soft-delete records)
-- Only execute this if you understand the data loss implications
-- ALTER TABLE public.coupons DROP COLUMN IF EXISTS revoked_at;

COMMIT;
