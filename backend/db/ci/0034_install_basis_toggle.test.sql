-- Test Migration 0034: Verify installation fee column exists
-- Note: Unit conversion is tested in TypeScript calculateInstallationFee
-- This file verifies the schema changes only

-- Test 1: Verify column exists in public.settings
SELECT
  column_name,
  data_type,
  column_default,
  CASE
    WHEN column_name = 'install_price_per_sqm' AND data_type = 'numeric' THEN 'PASS'
    ELSE 'FAIL'
  END as result
FROM information_schema.columns
WHERE table_name = 'settings' AND table_schema = 'public' AND column_name = 'install_price_per_sqm';

-- Test 2: Verify default value
SELECT
  column_default,
  CASE
    WHEN column_default = '100' THEN 'PASS: Default is 100'
    ELSE 'FAIL: Default mismatch'
  END as result
FROM information_schema.columns
WHERE table_name = 'settings' AND table_schema = 'public' AND column_name = 'install_price_per_sqm';

-- Test 3: Verify index exists
SELECT
  indexname,
  CASE
    WHEN indexname = 'idx_settings_install_price_per_sqm' THEN 'PASS: Index created'
    ELSE 'FAIL: Index missing'
  END as result
FROM pg_indexes
WHERE tablename = 'settings' AND schemaname = 'public' AND indexname = 'idx_settings_install_price_per_sqm';