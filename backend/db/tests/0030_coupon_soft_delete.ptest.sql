-- ptest: Coupon soft delete (migration 0030)
-- Tests for atomic delete/archive behavior

[setup]
-- Setup test data
INSERT INTO coupons (code, discount, is_active) VALUES
  ('TEST_DELETE_1', 25, TRUE),
  ('TEST_DELETE_2', 30, TRUE),
  ('TEST_DELETE_3', 15, TRUE);

-- Get IDs for testing
SET var.coupon_1_id = (SELECT id FROM coupons WHERE code = 'TEST_DELETE_1' LIMIT 1);
SET var.coupon_2_id = (SELECT id FROM coupons WHERE code = 'TEST_DELETE_2' LIMIT 1);
SET var.coupon_3_id = (SELECT id FROM coupons WHERE code = 'TEST_DELETE_3' LIMIT 1);

[test: delete unused coupon - should delete row completely]
-- Call delete function on unused coupon
SELECT zell_delete_coupon(:coupon_1_id::BIGINT) AS result;
-- Verify: row should be gone
SELECT COUNT(*) AS count FROM coupons WHERE id = :coupon_1_id::BIGINT;
-- Expected: result = 'deleted', count = 0

[test: archive coupon with orders - should set revoked_at]
-- Create an order using coupon_2
INSERT INTO orders (customer_id, total, coupon_id) VALUES (1, 100, :coupon_2_id::BIGINT);
-- Call delete function
SELECT zell_delete_coupon(:coupon_2_id::BIGINT) AS result;
-- Verify: row exists but revoked_at is set
SELECT revoked_at IS NOT NULL AS archived, is_active FROM coupons WHERE id = :coupon_2_id::BIGINT;
-- Expected: result = 'archived', archived = true, is_active = false

[test: revoked coupon rejected in preview]
-- Try to preview revoked coupon
-- Should fail or return rejection
SELECT zell_preview_coupon(:coupon_2_id::BIGINT) AS preview;
-- Expected: NULL or error (revoked_at IS NOT NULL check)

[test: revoked coupon rejected in create_order]
-- Try to create order with revoked coupon
-- Should fail or return error
INSERT INTO orders (customer_id, total, coupon_id) VALUES (2, 150, :coupon_2_id::BIGINT);
-- Expected: ERROR or constraint violation

[test: re-activate revoked coupon fails]
-- Try to toggle is_active on revoked coupon
UPDATE coupons SET is_active = TRUE WHERE id = :coupon_2_id::BIGINT AND revoked_at IS NOT NULL;
-- Expected: Either silently fail or explicit error (depending on implementation)

[test: concurrent delete and order creation]
-- Start transaction on coupon_3
-- In one session: SELECT ... FOR UPDATE coupon_3
-- In other session: INSERT INTO orders with coupon_3
-- First completes: should win atomic operation
-- Expected: Either delete succeeds (count=0) OR archive + order exists

[teardown]
-- Cleanup test data
DELETE FROM orders WHERE coupon_id IN (:coupon_1_id::BIGINT, :coupon_2_id::BIGINT, :coupon_3_id::BIGINT);
DELETE FROM coupons WHERE code LIKE 'TEST_DELETE_%';
