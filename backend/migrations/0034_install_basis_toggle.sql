-- Add the installation fee basis setting and an explicit fee quote RPC.
BEGIN;

INSERT INTO public.settings (key, value)
VALUES ('installation_fee_basis', '"sqm"'::jsonb)
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.zell_calculate_installation_fee(
  p_length_cm integer,
  p_roll_width_cm integer,
  p_rate_piastres integer,
  p_fee_basis text
)
RETURNS TABLE (
  length_m numeric,
  roll_width_m numeric,
  area_sqm numeric,
  fee_basis text,
  rate_piastres integer,
  fee_piastres bigint,
  fee_unit text
)
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
DECLARE
  v_length_m numeric;
  v_roll_width_m numeric;
  v_area_sqm numeric;
  v_fee_basis text;
  v_fee_piastres bigint;
BEGIN
  IF p_length_cm IS NULL OR p_length_cm <= 0
     OR p_roll_width_cm IS NULL OR p_roll_width_cm <= 0
     OR p_rate_piastres IS NULL OR p_rate_piastres < 0 THEN
    RAISE EXCEPTION 'ZELL_INSTALLATION_FEE_INPUT_INVALID';
  END IF;

  SELECT COALESCE(p_fee_basis, s.value #>> '{}', 'sqm')
    INTO v_fee_basis
    FROM (VALUES (true)) AS seed(present)
    LEFT JOIN public.settings AS s ON s.key = 'installation_fee_basis';

  IF v_fee_basis NOT IN ('sqm', 'linear') THEN
    RAISE EXCEPTION 'ZELL_INSTALLATION_FEE_BASIS_INVALID';
  END IF;

  -- Convert each centimeter dimension before multiplying to obtain square meters.
  v_length_m := p_length_cm::numeric / 100;
  v_roll_width_m := p_roll_width_cm::numeric / 100;
  v_area_sqm := v_length_m * v_roll_width_m;
  v_fee_piastres := pg_catalog.round(
    CASE WHEN v_fee_basis = 'sqm'
      THEN v_area_sqm * p_rate_piastres::numeric
      ELSE v_length_m * p_rate_piastres::numeric
    END
  )::bigint;

  RETURN QUERY SELECT
    v_length_m,
    v_roll_width_m,
    v_area_sqm,
    v_fee_basis,
    p_rate_piastres,
    v_fee_piastres,
    'piastres'::text;
END;
$function$;

ALTER FUNCTION public.zell_calculate_installation_fee(integer, integer, integer, text) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.zell_calculate_installation_fee(integer, integer, integer, text)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.zell_calculate_installation_fee(integer, integer, integer, text)
  TO service_role;

COMMIT;
