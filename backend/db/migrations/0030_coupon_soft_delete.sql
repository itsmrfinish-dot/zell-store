-- Migration 0030: Coupon soft delete with revoked_at column
-- Migration date: 2026-11-23T18:00:00.000Z
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

  -- Count all orders using this coupon (including cancelled)
  -- This matches ON DELETE RESTRICT constraint on orders.coupon_id
  SELECT COUNT(*)
  INTO v_order_count
  FROM orders
  WHERE coupon_id = p_coupon_id;

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
-- Keep original signature and behavior from 0019; add revoked_at check only
CREATE OR REPLACE FUNCTION zell_preview_coupon(p_code text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO public
AS $function$
  SELECT jsonb_build_object(
    'id', c.id,
    'kind', c.kind,
    'percent_off', c.percent_off,
    'amount_off_piastres', c.amount_off_piastres,
    'max_discount_piastres', c.max_discount_piastres,
    'code', c.code,
    'min_subtotal_piastres', c.min_subtotal_piastres,
    'starts_at', c.starts_at,
    'ends_at', c.ends_at,
    'max_uses', c.max_uses,
    'max_uses_per_phone', c.max_uses_per_phone
  )
  FROM coupons c
  WHERE c.code = UPPER(BTRIM(p_code))
    AND c.is_active
    AND (c.starts_at IS NULL OR c.starts_at <= now())
    AND (c.ends_at IS NULL OR now() < c.ends_at)
    AND c.revoked_at IS NULL;
$function$;

COMMIT;
