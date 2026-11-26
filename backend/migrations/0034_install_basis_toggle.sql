-- Migration 0034: Add installation fee pricing (square meter basis)
-- Purpose: Add price per square meter configuration for installation fees
-- Schema: public.settings (not store_settings)
-- Input units: centimeters
-- Output units: square meters and EGP

BEGIN;

-- Add column to public.settings
ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS install_price_per_sqm DECIMAL(10, 2) DEFAULT 100;

-- Function to calculate installation fees with proper unit conversion
-- Input: lengths and widths in CENTIMETERS (store data format)
-- Output: table with converted meters and calculated area in square meters
CREATE OR REPLACE FUNCTION calculate_install_fee(
  p_product_ids INTEGER[],
  p_lengths_cm DECIMAL[],
  p_roll_widths_cm DECIMAL[],
  p_price_per_sqm DECIMAL
)
RETURNS TABLE (
  product_id INTEGER,
  length_cm DECIMAL,
  length_m NUMERIC,
  roll_width_cm DECIMAL,
  roll_width_m NUMERIC,
  area_sqm NUMERIC,
  fee_egp NUMERIC
) AS $$
DECLARE
  v_i INTEGER;
  v_length_m DECIMAL;
  v_width_m DECIMAL;
  v_area_sqm DECIMAL;
BEGIN
  FOR v_i IN 1..array_length(p_lengths_cm, 1) LOOP
    -- Validate inputs
    IF p_lengths_cm[v_i] IS NULL OR p_lengths_cm[v_i] <= 0 THEN
      RAISE EXCEPTION 'Invalid length for product %: %', p_product_ids[v_i], p_lengths_cm[v_i];
    END IF;

    IF p_roll_widths_cm[v_i] IS NULL OR p_roll_widths_cm[v_i] <= 0 THEN
      RAISE EXCEPTION 'Invalid roll width for product %: %', p_product_ids[v_i], p_roll_widths_cm[v_i];
    END IF;

    -- CONVERT FROM CENTIMETERS TO METERS
    v_length_m := p_lengths_cm[v_i] / 100.0;
    v_width_m := p_roll_widths_cm[v_i] / 100.0;

    -- CALCULATE AREA IN SQUARE METERS
    v_area_sqm := v_length_m * v_width_m;

    -- RETURN RESULT ROW
    RETURN QUERY SELECT
      p_product_ids[v_i],
      p_lengths_cm[v_i],
      ROUND(v_length_m::NUMERIC, 2),
      p_roll_widths_cm[v_i],
      ROUND(v_width_m::NUMERIC, 2),
      ROUND(v_area_sqm::NUMERIC, 4),
      ROUND((v_area_sqm * p_price_per_sqm)::NUMERIC, 2);
  END LOOP;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_settings_install_price_per_sqm
ON public.settings(install_price_per_sqm);

COMMIT;