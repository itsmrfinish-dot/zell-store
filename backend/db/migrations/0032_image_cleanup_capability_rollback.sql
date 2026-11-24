-- backend/db/migrations/0032_image_cleanup_capability_rollback.sql
-- Rollback for IMAGE-CLEANUP: remove zell.images.cleanup from the access catalog

DELETE FROM public.erp_capabilities WHERE key = 'zell.images.cleanup';
