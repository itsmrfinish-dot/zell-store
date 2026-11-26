-- Test Migration 0034: Installation fee calculation with unit conversion
-- Tests centimeters → meters → square meters conversion

-- Test 1: Verify function exists and has correct signature
SELECT
  routine_name,
  string_agg(parameter_name, ', ' ORDER BY ordinal_position) as parameters,
  data_type as return_type
FROM information_schema.parameters
WHERE routine_name = 'calculate_install_fee' AND routine_schema = 'public'
GROUP BY routine_name, data_type;

-- Test 2: Verify column exists in public.settings
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'settings' AND table_schema = 'public' AND column_name = 'install_price_per_sqm';

-- Test 3: Verify settings table exists
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'settings';

-- Test 4: Test function with sample data
-- Case: 300cm × 50cm = 3m × 0.5m = 1.5 sqm × 100 EGP/sqm = 150 EGP
SELECT
  product_id,
  length_cm,
  length_m,
  roll_width_cm,
  roll_width_m,
  area_sqm,
  fee_egp,
  CASE
    WHEN area_sqm = 1.5 AND fee_egp = 150 THEN 'PASS: 50cm × 3m = 1.5 sqm = 150 EGP'
    ELSE 'FAIL: Incorrect calculation'
  END as test_result
FROM calculate_install_fee(
  ARRAY[1],
  ARRAY[300],
  ARRAY[50],
  100
);

-- Test 5: Test multiple products
-- Product 1: 200cm × 100cm = 2m × 1m = 2 sqm × 100 = 200 EGP
-- Product 2: 100cm × 150cm = 1m × 1.5m = 1.5 sqm × 100 = 150 EGP
SELECT
  product_id,
  length_m || 'm × ' || roll_width_m || 'm' as dimensions,
  area_sqm || ' sqm' as area,
  fee_egp || ' EGP' as fee
FROM calculate_install_fee(
  ARRAY[1, 2],
  ARRAY[200, 100],
  ARRAY[100, 150],
  100
);

-- Test 6: Test with custom price
-- 150cm × 75cm = 1.5m × 0.75m = 1.125 sqm × 150 EGP/sqm = 168.75 EGP
SELECT
  area_sqm,
  fee_egp,
  CASE
    WHEN area_sqm = 1.125 AND fee_egp = 168.75 THEN 'PASS: Decimal calculation correct'
    ELSE 'FAIL: Decimal calculation error'
  END as test_result
FROM calculate_install_fee(
  ARRAY[1],
  ARRAY[150],
  ARRAY[75],
  150
);