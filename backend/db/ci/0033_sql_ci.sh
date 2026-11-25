#!/usr/bin/env bash
# 0033 INSPECTION-TOGGLE: SQL CI test for zell_save_identity RPC changes
# Tests: (1) function signature (6 params), (2) inspection_enabled setting, (3) idempotency, (4) rollback

set -uo pipefail

if [ "$(printenv ZELL_CI_DISPOSABLE_DB)" != "yes" ]; then echo "refusing: disposable CI database only" >&2; exit 2; fi
case "$(printenv PGHOST)" in
  localhost|127.0.0.1) ;;
  *) echo "refusing: localhost only" >&2; exit 2 ;;
esac

TMP="$(mktemp -d)"
trap "rm -rf '$TMP'" EXIT

function pg_f() {
  PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -U postgres -d "$1" -v ON_ERROR_STOP=1 "$2"
}

DBDIR="backend/db"
MIG="$DBDIR/migrations"

DB="$(mktemp -u)"
createdb -h "$PGHOST" -U postgres "$DB" > /dev/null 2>&1 || {
  echo "refusing: could not create test database" >&2
  exit 2
}
trap "dropdb -h '$PGHOST' -U postgres --if-exists '$DB' > /dev/null 2>&1" EXIT

# A01: Build from scratch (baseline through 0032)
./backend/db/ci/build_from_scratch.sh "$DB" > "$TMP/a01_build.log" 2>&1 || {
  echo "FAIL A01: build_from_scratch failed" >&2
  cat "$TMP/a01_build.log" >&2
  exit 1
}

# B01: Apply 0033 migration
pg_f "$DB" "$MIG/0033_inspection_enabled_setting.sql" > "$TMP/b01_apply.log" 2>&1 || {
  echo "FAIL B01: 0033 apply failed" >&2
  cat "$TMP/b01_apply.log" >&2
  exit 1
}

# B02: Verify function signature (6 parameters)
SIG=$(pg_f "$DB" "SELECT array_length(proargtypes, 1) FROM pg_proc WHERE proname = 'zell_save_identity' AND pronamespace = 'public'::regnamespace LIMIT 1" 2>/dev/null || echo "0")
if [ "$SIG" != "6" ]; then
  echo "FAIL B02: expected 6-param signature, got $SIG" >&2
  exit 1
fi

# B03: Verify inspection_enabled setting exists and defaults to true
SETTING=$(pg_f "$DB" "SELECT value FROM settings WHERE key = 'inspection_enabled'" 2>/dev/null || echo "")
if [ "$SETTING" != "true" ]; then
  echo "FAIL B03: inspection_enabled should be true, got '$SETTING'" >&2
  exit 1
fi

# B04: Test zell_save_identity with 6 parameters
BEFORE=$(pg_f "$DB" "SELECT updated_at FROM settings WHERE key = 'store_name' LIMIT 1" 2>/dev/null)
RESULT=$(pg_f "$DB" "SELECT zell_save_identity('$BEFORE'::timestamp with time zone, 'test', 'test', '201000000000', 'test', true)" 2>/dev/null || echo "null")
if [ "$RESULT" = "null" ]; then
  echo "FAIL B04: zell_save_identity RPC call failed or returned null" >&2
  exit 1
fi

# C01: Re-apply 0033 (idempotency test)
pg_f "$DB" "$MIG/0033_inspection_enabled_setting.sql" > "$TMP/c01_reapply.log" 2>&1 || {
  echo "FAIL C01: 0033 re-apply failed" >&2
  cat "$TMP/c01_reapply.log" >&2
  exit 1
}

# C02: Verify function still has 6 parameters after re-apply
SIG_AFTER=$(pg_f "$DB" "SELECT array_length(proargtypes, 1) FROM pg_proc WHERE proname = 'zell_save_identity' AND pronamespace = 'public'::regnamespace LIMIT 1" 2>/dev/null || echo "0")
if [ "$SIG_AFTER" != "6" ]; then
  echo "FAIL C02: signature changed after re-apply: got $SIG_AFTER" >&2
  exit 1
fi

# D01: Apply rollback
pg_f "$DB" "$MIG/0033_inspection_enabled_setting_rollback.sql" > "$TMP/d01_rollback.log" 2>&1 || {
  echo "FAIL D01: rollback apply failed" >&2
  cat "$TMP/d01_rollback.log" >&2
  exit 1
}

# D02: Verify function reverted to 5 parameters
SIG_ROLLBACK=$(pg_f "$DB" "SELECT array_length(proargtypes, 1) FROM pg_proc WHERE proname = 'zell_save_identity' AND pronamespace = 'public'::regnamespace LIMIT 1" 2>/dev/null || echo "0")
if [ "$SIG_ROLLBACK" != "5" ]; then
  echo "FAIL D02: expected 5-param after rollback, got $SIG_ROLLBACK" >&2
  exit 1
fi

# D03: Verify inspection_enabled setting removed
SETTING_AFTER=$(pg_f "$DB" "SELECT COUNT(*) FROM settings WHERE key = 'inspection_enabled'" 2>/dev/null || echo "1")
if [ "$SETTING_AFTER" != "0" ]; then
  echo "FAIL D03: inspection_enabled should be removed, count=$SETTING_AFTER" >&2
  exit 1
fi

echo "PASS 0033 inspection_enabled migration: apply, idempotency, rollback"
exit 0
