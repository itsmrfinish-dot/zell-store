-- Test cases for Migration 0034: Installation fee calculation
-- Tests unit conversion from centimeters to square meters

-- Test setup: Create temporary test table
CREATE TEMP TABLE test_install_fees (
  product_id INTEGER,
  length_cm DECIMAL,
  roll_width_cm DECIMAL,
  expected_area_sqm DECIMAL,
  price_per_sqm DECIMAL,
  expected_fee DECIMAL
);

-- Insert test cases
INSERT INTO test_install_fees VALUES
-- Test 1: 50cm × 3m = 1.5 sqm
(1, 300, 50, 1.5, 100, 150),
-- Test 2: 1m × 1m = 1 sqm
(2, 100, 100, 1, 100, 100),
-- Test 3: 2m × 1.5m = 3 sqm
(3, 200, 150, 3, 100, 300),
-- Test 4: 3m × 0.5m = 1.5 sqm (same as test 1 but different order)
(4, 300, 50, 1.5, 100, 150),
-- Test 5: Custom price 200 EGP/sqm, 2m × 2m = 4 sqm = 800 EGP
(5, 200, 200, 4, 200, 800),
-- Test 6: Decimal lengths 1.5m × 0.75m = 1.125 sqm × 150 = 168.75 EGP
(6, 150, 75, 1.125, 150, 168.75);

-- Test the function
SELECT 
  t.product_id,
  t.length_cm,
  t.roll_width_cm,
  t.expected_area_sqm,
  t.price_per_sqm,
  t.expected_fee,
  CASE 
    WHEN c.area_sqm = t.expected_area_sqm THEN 'PASS: Area match'
    ELSE 'FAIL: Area mismatch (got ' || c.area_sqm || ', expected ' || t.expected_area_sqm || ')'
  END as area_test,
  CASE 
    WHEN c.fee_egp = t.expected_fee THEN 'PASS: Fee match'
    ELSE 'FAIL: Fee mismatch (got ' || c.fee_egp || ', expected ' || t.expected_fee || ')'
  END as fee_test
FROM test_install_fees t
CROSS JOIN LATERAL calculate_install_fee(
  ARRAY[t.product_id],
  ARRAY[t.length_cm],
  ARRAY[t.roll_width_cm],
  t.price_per_sqm
) c;

-- Verify column in settings table
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'settings' AND column_name = 'install_price_per_sqm';

-- Verify function exists
SELECT 
  routine_name, 
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'calculate_install_fee' AND routine_schema = 'public';