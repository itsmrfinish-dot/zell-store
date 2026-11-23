-- ptest: Coupon soft delete (migration 0030)
-- Tests for atomic delete/archive behavior with correct schema

[setup]
-- Create test coupons with correct schema
INSERT INTO coupons (code, kind, percent_off, is_active)
VALUES 
  ('TEST_NO_ORDERS', 'percent', 10, TRUE),
  ('TEST_WITH_ORDERS', 'percent', 15, TRUE);

SET var.coupon_no_orders_id = (SELECT id FROM coupons WHERE code = 'TEST_NO_ORDERS' LIMIT 1);
SET var.coupon_with_orders_id = (SELECT id FROM coupons WHERE code = 'TEST_WITH_ORDERS' LIMIT 1);

-- Create test customer first
INSERT INTO customers (phone, name) VALUES ('1234567890', 'Test Customer')
ON CONFLICT (phone) DO NOTHING;

SET var.customer_id = (SELECT id FROM customers WHERE phone = '1234567890' LIMIT 1);

-- Create a pending order using coupon_with_orders
INSERT INTO orders (customer_id, total_piastres, coupon_id, status)
VALUES (:customer_id::BIGINT, 10000, :coupon_with_orders_id::BIGINT, 'pending');

[test: delete unused coupon - row removed completely]
-- Call delete function on unused coupon
SELECT zell_delete_coupon(:coupon_no_orders_id::BIGINT) AS result;
-- Verify: row should be gone
SELECT COUNT(*) AS count FROM coupons WHERE id = :coupon_no_orders_id::BIGINT;

[test: archive coupon with orders - sets revoked_at and is_active=false]
-- Call delete function on coupon with orders
SELECT zell_delete_coupon(:coupon_with_orders_id::BIGINT) AS result;
-- Verify: row exists but revoked_at is set and is_active is false
SELECT revoked_at IS NOT NULL AS archived, is_active FROM coupons WHERE id = :coupon_with_orders_id::BIGINT;

[test: revoked coupon not found in zell_preview_coupon]
-- Try to preview archived coupon - should return NULL
SELECT zell_preview_coupon('TEST_WITH_ORDERS') AS preview;

[test: revoked coupon cannot be reactivated]
-- Try to restore is_active without clearing revoked_at
UPDATE coupons SET is_active = TRUE WHERE id = :coupon_with_orders_id::BIGINT;
-- Verify: still not visible in preview (revoked_at IS NULL is the gatekeeper)
SELECT zell_preview_coupon('TEST_WITH_ORDERS') AS preview;

[test: querying revoked from list excludes it]
-- Query coupons with revoked_at filter (as data/coupons does)
SELECT COUNT(*) AS active_count FROM coupons
WHERE code LIKE 'TEST_%' AND revoked_at IS NULL;

[test: revoked row persists in database]
-- Verify archived coupon data not physically deleted
SELECT code, revoked_at IS NOT NULL AS archived, is_active
FROM coupons
WHERE code = 'TEST_WITH_ORDERS';

[test: cancelled order counts toward order total for eligibility]
-- Cancel the order and try to delete - should still archive because order exists (even if cancelled)
UPDATE orders SET status = 'cancelled' WHERE coupon_id = :coupon_with_orders_id::BIGINT;
-- Try to delete again - should fail silently or return 'not_found' (coupon already archived)
SELECT zell_delete_coupon(:coupon_with_orders_id::BIGINT) AS result;

[teardown]
-- Cleanup: remove test orders and coupons
DELETE FROM orders WHERE coupon_id IN (:coupon_no_orders_id::BIGINT, :coupon_with_orders_id::BIGINT);
DELETE FROM coupons WHERE code LIKE 'TEST_%';
DELETE FROM customers WHERE phone = '1234567890';
