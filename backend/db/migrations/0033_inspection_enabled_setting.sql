-- backend/db/migrations/0033_inspection_enabled_setting.sql
-- INSPECTION-TOGGLE: safely replace zell_save_identity function to include inspection_enabled parameter
-- Steps: (1) drop the old 5-param function, (2) create new 6-param function with FOR UPDATE + null conflict check, (3) add inspection_enabled row
-- Related: apps/admin/lib/validation/settings.ts, apps/admin/lib/mutations/settings.ts
-- Idempotent: safe to re-run; dropping non-existent function is acceptable

-- Step 1: Drop the old 5-parameter version if it exists
DROP FUNCTION IF EXISTS public.zell_save_identity(
  p_expected_updated_at timestamp with time zone,
  p_store_name text,
  p_offer_text text,
  p_whatsapp_number text,
  p_whatsapp_message text
);

-- Step 2: Create the new 6-parameter version with inspection_enabled
CREATE OR REPLACE FUNCTION public.zell_save_identity(
  p_expected_updated_at timestamp with time zone,
  p_store_name text,
  p_offer_text text,
  p_whatsapp_number text,
  p_whatsapp_message text,
  p_inspection_enabled boolean DEFAULT true
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
  -- Acquire FOR UPDATE lock on all keys being updated, then check version
  with locked as (
    select updated_at from public.settings
    where key in ('store_name', 'offer_text', 'whatsapp_number', 'whatsapp_message', 'inspection_enabled')
    for update
  )
  select max(updated_at) into current_version from locked;

  -- Version conflict detection: return null instead of raising exception (matches original saveIdentity contract)
  if current_version is null or pg_catalog.date_trunc('milliseconds', current_version) <> pg_catalog.date_trunc('milliseconds', p_expected_updated_at) then
    return null;
  end if;

  -- Validate inputs (same as original)
  if pg_catalog.btrim(p_store_name) = '' or pg_catalog.char_length(p_store_name) > 120
     or pg_catalog.char_length(p_offer_text) > 240 or pg_catalog.char_length(p_whatsapp_number) > 20
     or pg_catalog.char_length(p_whatsapp_message) > 500 then
    raise exception 'ZELL_INVALID_IDENTITY';
  end if;

  -- Ensure inspection_enabled row exists (insert if missing)
  insert into public.settings (key, value)
  values ('inspection_enabled', p_inspection_enabled::text)
  on conflict (key) do nothing;

  -- Update all settings including inspection_enabled
  update public.settings s set value = v.value, updated_at = new_version
  from (values
    ('store_name'::text, pg_catalog.to_jsonb(pg_catalog.btrim(p_store_name))),
    ('offer_text', pg_catalog.to_jsonb(pg_catalog.btrim(p_offer_text))),
    ('whatsapp_number', pg_catalog.to_jsonb(pg_catalog.btrim(p_whatsapp_number))),
    ('whatsapp_message', pg_catalog.to_jsonb(pg_catalog.btrim(p_whatsapp_message))),
    ('inspection_enabled', pg_catalog.to_jsonb(p_inspection_enabled))
  ) v(key, value)
  where s.key = v.key;

  get diagnostics updated_count = row_count;
  if updated_count <> 5 then
    raise exception 'ZELL_IDENTITY_KEYS_MISSING';
  end if;

  return new_version;
end;
$function$;

-- Restore ownership and privileges (same as original)
alter function public.zell_save_identity(
  p_expected_updated_at timestamp with time zone,
  p_store_name text,
  p_offer_text text,
  p_whatsapp_number text,
  p_whatsapp_message text,
  p_inspection_enabled boolean
) owner to postgres;

revoke all on function public.zell_save_identity(
  p_expected_updated_at timestamp with time zone,
  p_store_name text,
  p_offer_text text,
  p_whatsapp_number text,
  p_whatsapp_message text,
  p_inspection_enabled boolean
) from public, anon, authenticated, service_role;

grant execute on function public.zell_save_identity(
  p_expected_updated_at timestamp with time zone,
  p_store_name text,
  p_offer_text text,
  p_whatsapp_number text,
  p_whatsapp_message text,
  p_inspection_enabled boolean
) to service_role;

-- Verify the function exists and has the correct 6-parameter signature
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
