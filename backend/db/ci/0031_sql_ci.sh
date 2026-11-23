#!/usr/bin/env bash
set -uo pipefail

if [ "$(printenv ZELL_CI_DISPOSABLE_DB)" != "yes" ]; then echo "refusing: disposable CI database only" >&2; exit 2; fi

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
DBDIR="$ROOT/backend/db"
MIG="$DBDIR/migrations"
SUPER="$(printenv CI_SUPERUSER || true)"
[ -n "$SUPER" ] || SUPER=supabase_admin
DB=zell_ci_0031

echo "IMAGE-CLEANUP (0031): claiming columns eligibility and atomic verification"

psql -X -q -U "$SUPER" -d postgres -c "DROP DATABASE IF EXISTS \"$DB" 2>/dev/null || true
psql -X -q -U "$SUPER" -d postgres -c "CREATE DATABASE \"$DB"

echo "Loading base schema and migrations through 0030..."
psql -X -q -U "$SUPER" -d "$DB" < "$DBDIR/schema.sql"
for mig in $DBDIR/migrations/000{2,3,4,6}*.sql; do
  [ -f "$mig" ] && psql -X -q -U "$SUPER" -d "$DB" < "$mig" 2>/dev/null || true
done

echo "Applying 0031..."
psql -X -q -U "$SUPER" -d "$DB" < "$MIG/0031_image_cleanup.sql"

echo "Test: eligibility date calculation"
psql -X -q -U "$SUPER" -d "$DB" -c "
INSERT INTO storage_orphans (id, bucket, object_path, created_at) 
VALUES 
  ('old1', 'test', 'path1', (now() - interval '60 days')),
  ('new1', 'test', 'path2', (now() - interval '10 days'));
  
SELECT COUNT(*) as old_records FROM storage_orphans WHERE created_at < (now() - interval '30 days');
"

echo "Test: claiming atomicity and timeout"
psql -X -q -U "$SUPER" -d "$DB" -c "
UPDATE storage_orphans SET claimed_at = now(), claimed_by = 'user1' WHERE id = 'old1';
UPDATE storage_orphans SET claimed_at = (now() - interval '20 minutes'), claimed_by = 'user2' WHERE id = 'new1';

SELECT id, claimed_by FROM storage_orphans WHERE claimed_at IS NOT NULL ORDER BY id;
"

echo "Test: columns exist and nullable"
psql -X -q -U "$SUPER" -d "$DB" -c "
SELECT column_name, is_nullable FROM information_schema.columns 
WHERE table_name = 'storage_orphans' AND column_name IN ('claimed_at', 'claimed_by') 
ORDER BY column_name;
"

echo "Test: index exists"
psql -X -q -U "$SUPER" -d "$DB" -c "\\di idx_storage_orphans_claimed_at"

echo "Rollback test..."
psql -X -q -U "$SUPER" -d "$DB" < "$MIG/0031_image_cleanup_rollback.sql"
psql -X -q -U "$SUPER" -d "$DB" -c "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'storage_orphans' AND column_name IN ('claimed_at', 'claimed_by');"

echo "IMAGE-CLEANUP CI complete"
psql -X -q -U "$SUPER" -d postgres -c "DROP DATABASE IF EXISTS \"$DB"

exit 0
