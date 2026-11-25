-- backend/db/migrations/0033_inspection_enabled_setting_rollback.sql
-- INSPECTION-TOGGLE: rollback for 0033 - restore zell_save_identity to previous 5-parameter version
-- This removes the p_inspection_enabled parameter and the inspection_enabled setting handling

-- Recreate the original 5-parameter version of zell_save_identity
CREATE OR REPLACE FUNCTION public.zell_save_identity(
  p_expected_updated_at timestamptz,
  p_store_name text,
  p_offer_text text,
  p_whatsapp_number text,
  p_whatsapp_message text
) RETURNS timestamptz AS $function$
declare
  v_new_updated_at timestamptz;
  v_current_updated_at timestamptz;
begin
  -- Get current max updated_at to check for version conflicts
  select max(updated_at) into v_current_updated_at
  from public.settings
  where key in ('store_name', 'offer_text', 'whatsapp_number', 'whatsapp_message');

  -- Check for version conflict
  if p_expected_updated_at is not null and v_current_updated_at is not null
     and p_expected_updated_at != v_current_updated_at then
    raise exception 'Store identity version conflict: expected %, got %',
      to_char(p_expected_updated_at, 'YYYY-MM-DD HH24:MI:SS.US'),
      to_char(v_current_updated_at, 'YYYY-MM-DD HH24:MI:SS.US');
  end if;

  -- Update settings (excluding inspection_enabled)
  update public.settings
  set value = case
    when key = 'store_name' then p_store_name
    when key = 'offer_text' then p_offer_text
    when key = 'whatsapp_number' then p_whatsapp_number
    when key = 'whatsapp_message' then p_whatsapp_message
    else value
  end,
  updated_at = now()
  where key in ('store_name', 'offer_text', 'whatsapp_number', 'whatsapp_message');

  -- Get and return the new updated_at timestamp
  select max(updated_at) into v_new_updated_at
  from public.settings
  where key in ('store_name', 'offer_text', 'whatsapp_number', 'whatsapp_message');

  return v_new_updated_at;
end;
$function$ language plpgsql;

-- Verify the function has been downgraded to 5 parameters
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc p
    WHERE p.pronamespace = 'public'::regnamespace
      AND p.proname = 'zell_save_identity'
      AND array_length(p.proargtypes, 1) = 5
  ) THEN
    RAISE EXCEPTION '0033_rollback: zell_save_identity function not found with 5 parameters';
  END IF;
END $$;
