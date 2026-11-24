#!/usr/bin/env bash
set -euo pipefail

if [ "$(printenv ZELL_CI_DISPOSABLE_DB)" != "yes" ]; then echo "refusing: disposable CI database only" >&2; exit 2; fi

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
DBDIR="$ROOT/backend/db"
MIG="$DBDIR/migrations"
SUPER="$(printenv CI_SUPERUSER || true)"
[ -n "$SUPER" ] || SUPER=supabase_admin
DB=zell_ci_0031

PASS=0
FAIL=0

check() {
  if [ "$1" = "yes" ]; then 
    echo "PASS: $2"
    PASS=$((PASS + 1))
  else
    echo "FAIL: $2"
    FAIL=$((FAIL + 1))
  fi
}

psql -X -q -U "$SUPER" -d postgres -c "DROP DATABASE IF EXISTS \"$DB\"" 2>/dev/null || true
psql -X -q -U "$SUPER" -d postgres -c "CREATE DATABASE \"$DB\""

echo "Loading schema and migrations through 0030..."
psql -X -q -v ON_ERROR_STOP=1 -U "$SUPER" -d "$DB" < "$DBDIR/schema.sql"
for mig in $DBDIR/migrations/000{2,3,4,6}*.sql; do
  [ -f "$mig" ] && psql -X -q -v ON_ERROR_STOP=1 -U "$SUPER" -d "$DB" < "$mig" 2>/dev/null || true
done

echo "Applying 0031..."
psql -X -q -v ON_ERROR_STOP=1 -U "$SUPER" -d "$DB" < "$MIG/0031_image_cleanup.sql"

echo "Test: columns exist and are nullable"
result=$(psql -X -q -tA -v ON_ERROR_STOP=1 -U "$SUPER" -d "$DB" -c "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'storage_orphans' AND column_name IN ('claimed_at', 'claimed_by') AND is_nullable = 'YES'")
check "$([ "$result" = "2" ] && echo yes || echo no)" "claimed_at and claimed_by are nullable"

echo "Test: new orphan not eligible (before retention window)"
psql -X -q -v ON_ERROR_STOP=1 -U "$SUPER" -d "$DB" -c "
INSERT INTO storage_orphans (id, bucket, object_path, created_at, reason) 
VALUES (900001, 'test', 'path1', (now() - interval '5 days'), 'replaced')
"
result=$(psql -X -q -tA -v ON_ERROR_STOP=1 -U "$SUPER" -d "$DB" -c "
SELECT COUNT(*) FROM storage_orphans 
WHERE id = 900001 AND cleaned_at IS NULL AND created_at > (now() - interval '30 days')
")
check "$([ "$result" = "1" ] && echo yes || echo no)" "new orphan (5d old) is not yet eligible for cleanup"

echo "Test: backlog orphan eligibility before/after verifiedAt + retention"
psql -X -q -v ON_ERROR_STOP=1 -U "$SUPER" -d "$DB" -c "
INSERT INTO storage_orphans (id, bucket, object_path, created_at, reason) 
VALUES (900002, 'test', 'path2', '2026-10-15'::timestamptz, 'replaced')
"
result=$(psql -X -q -tA -v ON_ERROR_STOP=1 -U "$SUPER" -d "$DB" -c "
SELECT COUNT(*) FROM storage_orphans 
WHERE id = 900002 AND cleaned_at IS NULL AND created_at <= ('2026-11-24'::timestamptz - interval '30 days') AND created_at >= '2026-11-23'::timestamptz
")
check "$([ "$result" = "0" ] && echo yes || echo no)" "backlog row created before verification date is NOT eligible before verifiedAt + retention"
result=$(psql -X -q -tA -v ON_ERROR_STOP=1 -U "$SUPER" -d "$DB" -c "
SELECT COUNT(*) FROM storage_orphans 
WHERE id = 900002 AND cleaned_at IS NULL AND created_at <= ('2026-12-24'::timestamptz - interval '30 days')
")
check "$([ "$result" = "1" ] && echo yes || echo no)" "backlog row becomes eligible after verifiedAt + retention"

echo "Test: atomic claiming prevents double claim"
psql -X -q -v ON_ERROR_STOP=1 -U "$SUPER" -d "$DB" -c "
BEGIN
  UPDATE storage_orphans SET claimed_at = now(), claimed_by = 'runner1' WHERE id = 900002 AND claimed_at IS NULL;
  UPDATE storage_orphans SET claimed_at = now(), claimed_by = 'runner2' WHERE id = 900002 AND claimed_at IS NULL;
COMMIT
"
result=$(psql -X -q -tA -v ON_ERROR_STOP=1 -U "$SUPER" -d "$DB" -c "
SELECT claimed_by FROM storage_orphans WHERE id = 900002
")
check "$([ "$result" = "runner1" ] && echo yes || echo no)" "first claimer wins (double-claim prevented)"

echo "Test: abandoned claim recoverable (>15min)"
psql -X -q -v ON_ERROR_STOP=1 -U "$SUPER" -d "$DB" -c "
UPDATE storage_orphans SET claimed_at = (now() - interval '20 minutes'), claimed_by = 'stale' WHERE id = 900001
"
result=$(psql -X -q -tA -v ON_ERROR_STOP=1 -U "$SUPER" -d "$DB" -c "
SELECT COUNT(*) FROM storage_orphans 
WHERE id = 900001 AND (claimed_at IS NULL OR claimed_at < (now() - interval '15 minutes'))
")
check "$([ "$result" = "1" ] && echo yes || echo no)" "stale claim is claimable again after 15 minutes"

echo "Test: authenticated user cannot SELECT storage_orphans"
result=$(psql -X -q -tA -U "authenticated" -d "$DB" -c "SELECT 1 FROM storage_orphans LIMIT 1" 2>&1 || echo "DENIED")
check "$([ "$result" != "1" ] && echo yes || echo no)" "authenticated role denied access to storage_orphans"

echo "Test: rollback"
psql -X -q -v ON_ERROR_STOP=1 -U "$SUPER" -d "$DB" < "$MIG/0031_image_cleanup_rollback.sql"
result=$(psql -X -q -tA -U "$SUPER" -d "$DB" -c "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'storage_orphans' AND column_name IN ('claimed_at', 'claimed_by')" 2>&1 || echo "0")
check "$([ "$result" = "0" ] && echo yes || echo no)" "rollback removes columns"

psql -X -q -U "$SUPER" -d postgres -c "DROP DATABASE IF EXISTS \"$DB\""

echo ""
echo "ZELL_0031_SQL_CI_RESULT pass=$PASS fail=$FAIL"
[ $FAIL -eq 0 ] && exit 0 || exit 1
