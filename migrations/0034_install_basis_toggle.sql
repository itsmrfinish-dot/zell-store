-- Migration 0034: Add installation basis toggle
-- Purpose: Support calculation basis for installation fees (linear meter or square meter)
-- Author: myzill executor
-- Date: 2026-11-26

BEGIN;

-- Add columns to store settings
ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS install_basis VARCHAR(10) DEFAULT 'linear',
ADD COLUMN IF NOT EXISTS install_price_per_sqm DECIMAL(10, 2) DEFAULT 100;

-- Function to calculate installation fees based on basis
CREATE OR REPLACE FUNCTION calculate_install_fee(
  p_product_ids INTEGER[],
  p_lengths DECIMAL[],
  p_roll_widths DECIMAL[],
  p_basis VARCHAR,
  p_price_per_unit DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
  v_total_fee DECIMAL := 0;
  v_i INTEGER;
BEGIN
  IF LOWER(COALESCE(p_basis, 'linear')) = 'linear' THEN
    FOR v_i IN 1..array_length(p_lengths, 1) LOOP
      v_total_fee := v_total_fee + (p_lengths[v_i] * p_price_per_unit);
    END LOOP;
  ELSIF LOWER(COALESCE(p_basis, 'linear')) = 'square' THEN
    FOR v_i IN 1..array_length(p_lengths, 1) LOOP
      IF p_roll_widths[v_i] IS NOT NULL THEN
        v_total_fee := v_total_fee + ((p_lengths[v_i] * p_roll_widths[v_i]) * p_price_per_unit);
      END IF;
    END LOOP;
  END IF;
  
  RETURN ROUND(v_total_fee, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMIT;