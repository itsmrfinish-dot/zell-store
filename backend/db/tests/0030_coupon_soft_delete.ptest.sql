-- ptest: Coupon soft delete (migration 0030)
-- Tests for atomic delete/archive behavior with correct schema

[setup]
-- Create a test coupon without orders
INSERT INTO coupons (code, kind, percent_off, is_active)
VALUES ('TEST_NO_ORDERS', 'percent', 10, TRUE);

-- Create a test coupon with orders
INSERT INTO coupons (code, kind, percent_off, is_active)
VALUES ('TEST_WITH_ORDERS', 'percent', 15, TRUE);

SET var.coupon_no_orders_id = (SELECT id FROM coupons WHERE code = 'TEST_NO_ORDERS' LIMIT 1);
SET var.coupon_with_orders_id = (SELECT id FROM coupons WHERE code = 'TEST_WITH_ORDERS' LIMIT 1);

-- Create a test order using the second coupon
INSERT INTO orders (coupon_id, status)
VALUES (:coupon_with_orders_id::BIGINT, 'pending');

[test: delete unused coupon - row removed completely]
-- Call delete function on unused coupon
SELECT zell_delete_coupon(:coupon_no_orders_id::BIGINT) AS result;

-- Verify: row should be gone
SELECT COUNT(*) AS count FROM coupons WHERE id = :coupon_no_orders_id::BIGINT;
-- Expected: result = 'deleted', count = 0

[test: archive coupon with orders - sets revoked_at and is_active=false]
-- Call delete function on coupon with orders
SELECT zell_delete_coupon(:coupon_with_orders_id::BIGINT) AS result;

-- Verify: row exists but revoked_at is set and is_active is false
SELECT revoked_at IS NOT NULL AS archived, is_active FROM coupons WHERE id = :coupon_with_orders_id::BIGINT;
-- Expected: result = 'archived', archived = true, is_active = false

[test: revoked coupon not found in zell_preview_coupon]
-- Try to preview archived coupon
SELECT COUNT(*) AS preview_count FROM zell_preview_coupon('TEST_WITH_ORDERS');
-- Expected: 0 (revoked coupon excluded)

[test: revoked coupon with is_active true still not visible]
-- Try to restore is_active without clearing revoked_at
UPDATE coupons SET is_active = TRUE WHERE id = :coupon_with_orders_id::BIGINT;

-- Verify: still not visible in preview
SELECT COUNT(*) AS preview_count FROM zell_preview_coupon('TEST_WITH_ORDERS');
-- Expected: 0 (revoked_at IS NULL is the gatekeeper)

[test: querying revoked from list excludes it]
-- Query coupons with revoked_at filter (as data/coupons does)
SELECT COUNT(*) AS active_count FROM coupons
WHERE code LIKE 'TEST_%' AND revoked_at IS NULL;
-- Expected: 0 (both test coupons filtered out)

[test: direct database check - revoked row still exists]
-- Verify archived coupon data not physically deleted
SELECT code, revoked_at IS NOT NULL AS archived, is_active
FROM coupons
WHERE code = 'TEST_WITH_ORDERS';
-- Expected: 1 row with archived=true, is_active=false, revoked_at set

[teardown]
-- Cleanup: remove all test orders and coupons
DELETE FROM orders WHERE coupon_id IN (:coupon_no_orders_id::BIGINT, :coupon_with_orders_id::BIGINT);
DELETE FROM coupons WHERE code LIKE 'TEST_%';
