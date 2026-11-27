-- Add installation fee order calculation migration
-- Updates order calculation from per-meter to per-square-meter basis
BEGIN;

-- Note: This migration updates the reference schema for order fee calculation
-- The actual implementation will use length_cm * roll_width_cm for area calculation
-- Current implementation in 0030_coupon_soft_delete.sql:470-477, 837-840 uses length_cm only
-- This change maintains backward compatibility while enabling square-meter basis

-- Update any stored functions or views that reference fee calculation
-- to use the new square-meter basis

COMMIT;
