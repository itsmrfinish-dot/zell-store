-- backend/db/migrations/0033_inspection_enabled_setting.sql
-- INSPECTION-TOGGLE: add inspection_enabled parameter to zell_save_identity RPC
-- Modifies the existing zell_save_identity function to accept and store p_inspection_enabled parameter
-- Related: apps/admin/lib/validation/settings.ts, apps/admin/lib/mutations/settings.ts
-- Idempotent: recreates the function with the new parameter

CREATE OR REPLACE FUNCTION public.zell_save_identity(
  p_expected_updated_at timestamptz,
  p_store_name text,
  p_offer_text text,
  p_whatsapp_number text,
  p_whatsapp_message text,
  p_inspection_enabled boolean DEFAULT true
) RETURNS timestamptz AS $function$
declare
  v_new_updated_at timestamptz;
begin
  -- Update settings with the new inspection_enabled parameter
  update public.settings
  set value = case
    when key = 'store_name' then p_store_name
    when key = 'offer_text' then p_offer_text
    when key = 'whatsapp_number' then p_whatsapp_number
    when key = 'whatsapp_message' then p_whatsapp_message
    when key = 'inspection_enabled' then p_inspection_enabled::text
    else value
  end,
  updated_at = now()
  where key in ('store_name', 'offer_text', 'whatsapp_number', 'whatsapp_message', 'inspection_enabled')
  returning (select max(updated_at) from public.settings where key in ('store_name', 'offer_text', 'whatsapp_number', 'whatsapp_message', 'inspection_enabled'))
  into v_new_updated_at;

  return v_new_updated_at;
end;
$function$ language plpgsql;

-- Verify the function exists and has the correct signature
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc p
    WHERE p.pronamespace = 'public'::regnamespace
      AND p.proname = 'zell_save_identity'
      AND array_length(p.proargtypes, 1) = 6
  ) THEN
    RAISE EXCEPTION '0033: zell_save_identity function not found with 6 parameters';
  END IF;
END $$;
