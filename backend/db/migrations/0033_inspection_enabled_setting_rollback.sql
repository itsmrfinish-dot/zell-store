-- backend/db/migrations/0033_inspection_enabled_setting_rollback.sql
-- INSPECTION-TOGGLE: rollback for 0033 - restore zell_save_identity to 5-parameter version
-- Steps: (1) drop the 6-param overload, (2) recreate the 5-param original, (3) delete inspection_enabled row

-- Step 1: Drop the 6-parameter version if it exists
DROP FUNCTION IF EXISTS public.zell_save_identity(
  p_expected_updated_at timestamp with time zone,
  p_store_name text,
  p_offer_text text,
  p_whatsapp_number text,
  p_whatsapp_message text,
  p_inspection_enabled boolean
);

-- Step 2: Recreate the original 5-parameter version
CREATE OR REPLACE FUNCTION public.zell_save_identity(
  p_expected_updated_at timestamp with time zone,
  p_store_name text,
  p_offer_text text,
  p_whatsapp_number text,
  p_whatsapp_message text
)
 RETURNS timestamp with time zone
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  current_version timestamptz;
  new_version timestamptz := now();
  updated_count integer;
begin
  with locked as (
    select updated_at from public.settings
    where key in ('store_name', 'offer_text', 'whatsapp_number', 'whatsapp_message')
    for update
  )
  select max(updated_at) into current_version from locked;

  if current_version is null or pg_catalog.date_trunc('milliseconds', current_version) <> pg_catalog.date_trunc('milliseconds', p_expected_updated_at) then
    return null;
  end if;

  if pg_catalog.btrim(p_store_name) = '' or pg_catalog.char_length(p_store_name) > 120
     or pg_catalog.char_length(p_offer_text) > 240 or pg_catalog.char_length(p_whatsapp_number) > 20
     or pg_catalog.char_length(p_whatsapp_message) > 500 then
    raise exception 'ZELL_INVALID_IDENTITY';
  end if;

  update public.settings s set value = v.value, updated_at = new_version
  from (values
    ('store_name'::text, pg_catalog.to_jsonb(pg_catalog.btrim(p_store_name))),
    ('offer_text', pg_catalog.to_jsonb(pg_catalog.btrim(p_offer_text))),
    ('whatsapp_number', pg_catalog.to_jsonb(pg_catalog.btrim(p_whatsapp_number))),
    ('whatsapp_message', pg_catalog.to_jsonb(pg_catalog.btrim(p_whatsapp_message)))
  ) v(key, value)
  where s.key = v.key;

  get diagnostics updated_count = row_count;
  if updated_count <> 4 then
    raise exception 'ZELL_IDENTITY_KEYS_MISSING';
  end if;

  return new_version;
end;
$function$;

-- Restore ownership and privileges
alter function public.zell_save_identity(
  p_expected_updated_at timestamp with time zone,
  p_store_name text,
  p_offer_text text,
  p_whatsapp_number text,
  p_whatsapp_message text
) owner to postgres;

revoke all on function public.zell_save_identity(
  p_expected_updated_at timestamp with time zone,
  p_store_name text,
  p_offer_text text,
  p_whatsapp_number text,
  p_whatsapp_message text
) from public, anon, authenticated, service_role;

grant execute on function public.zell_save_identity(
  p_expected_updated_at timestamp with time zone,
  p_store_name text,
  p_offer_text text,
  p_whatsapp_number text,
  p_whatsapp_message text
) to service_role;

-- Step 3: Remove inspection_enabled setting row
DELETE FROM public.settings WHERE key = 'inspection_enabled';

-- Verify the function has been restored to 5 parameters
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
