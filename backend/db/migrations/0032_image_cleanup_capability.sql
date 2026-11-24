-- backend/db/migrations/0032_image_cleanup_capability.sql
-- IMAGE-CLEANUP: register zell.images.cleanup in the access catalog (erp_capabilities)
-- Owner-only capability; the capabilities function grants the owner the capabilities present in erp_capabilities.
-- Idempotent: ON CONFLICT (key) DO NOTHING, then verify explicitly.

insert into public.erp_capabilities (key, category, description) values
  ('zell.images.cleanup', 'owner', 'تنظيف الصور اليتيمة من التخزين')
on conflict (key) do nothing;

-- Verify explicitly: the key must exist with category 'owner' and the exact description, else raise.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.erp_capabilities
    WHERE key = 'zell.images.cleanup'
      AND category = 'owner'
      AND description = 'تنظيف الصور اليتيمة من التخزين'
  ) THEN
    RAISE EXCEPTION '0032: zell.images.cleanup not registered with category owner and the expected description';
  END IF;
END $$;
