-- backend/db/migrations/0031_image_cleanup.sql
-- IMAGE-CLEANUP: storage_orphans columns for claiming rows
-- Added columns: claimed_at (timestamptz null) and claimed_by (text null)

ALTER TABLE public.storage_orphans
ADD COLUMN claimed_at timestamptz NULL,
ADD COLUMN claimed_by text NULL;

-- Create index on claimed_at for filtering unclaimed rows efficiently
CREATE INDEX idx_storage_orphans_claimed_at
ON public.storage_orphans(claimed_at)
WHERE claimed_at IS NULL;
