-- Migration 0030: Coupon soft delete with revoked_at column and enhanced validation
-- Migration date: 2026-11-23T04:02:45.554Z
-- Purpose: Add soft-delete capability for coupons with archive via revoked_at.
-- Note: Forward-only migration. Do not rollback in production.

BEGIN;

-- Add revoked_at column to coupons table
ALTER TABLE coupons
ADD COLUMN revoked_at TIMESTAMPTZ DEFAULT NULL;

-- Create security-definer function for atomic coupon deletion
CREATE OR REPLACE FUNCTION zell_delete_coupon(p_coupon_id BIGINT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_count INTEGER;
  v_result TEXT;
BEGIN
  -- Lock the coupon row for update (atomic operation)
  PERFORM 1 FROM coupons
  WHERE id = p_coupon_id
  FOR UPDATE;

  -- Check if coupon exists
  IF NOT FOUND THEN
    RETURN 'not_found';
  END IF;

  -- Count orders using this coupon (non-cancelled orders)
  SELECT COUNT(*)
  INTO v_order_count
  FROM orders
  WHERE coupon_id = p_coupon_id
    AND status != 'cancelled';

  -- If no orders, delete the entire row
  IF v_order_count = 0 THEN
    DELETE FROM coupons WHERE id = p_coupon_id;
    v_result := 'deleted';
  ELSE
    -- Archive: set revoked_at and is_active to false
    UPDATE coupons
    SET revoked_at = NOW(),
        is_active = FALSE
    WHERE id = p_coupon_id;
    v_result := 'archived';
  END IF;

  RETURN v_result;
END;
$$;

-- Grant EXECUTE permission to service_role only
GRANT EXECUTE ON FUNCTION zell_delete_coupon(BIGINT) TO service_role;

-- Enhance zell_preview_coupon to reject revoked coupons
-- (Redefine with same signature but add revoked_at check)
CREATE OR REPLACE FUNCTION zell_preview_coupon(p_code TEXT)
RETURNS TABLE (
  id BIGINT,
  kind TEXT,
  percent_off NUMERIC,
  amount_off_piastres BIGINT,
  max_discount_piastres BIGINT
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    id,
    kind,
    percent_off,
    amount_off_piastres,
    max_discount_piastres
  FROM coupons
  WHERE code = UPPER(BTRIM(p_code))
    AND is_active = TRUE
    AND revoked_at IS NULL;
$$;

COMMIT;
