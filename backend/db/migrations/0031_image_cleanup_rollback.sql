-- backend/db/migrations/0031_image_cleanup_rollback.sql
-- Rollback for IMAGE-CLEANUP: remove storage_orphans columns and index

DROP INDEX IF EXISTS public.idx_storage_orphans_claimed_at;

ALTER TABLE public.storage_orphans
DROP COLUMN IF EXISTS claimed_at,
DROP COLUMN IF EXISTS claimed_by;
