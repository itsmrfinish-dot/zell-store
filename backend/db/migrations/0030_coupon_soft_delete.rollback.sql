-- Rollback for migration 0030
-- Remove revoked_at column and zell_delete_coupon function

BEGIN;

-- Drop the security-definer function
DROP FUNCTION IF EXISTS zell_delete_coupon(BIGINT) CASCADE;

-- Remove revoked_at column
ALTER TABLE coupons
DROP COLUMN IF EXISTS revoked_at;

COMMIT;
