#!/usr/bin/env bash
# 0033 INSPECTION-TOGGLE: SQL CI test for zell_save_identity RPC changes

set -uo pipefail

if [ "$(printenv ZELL_CI_DISPOSABLE_DB)" != "yes" ]; then echo "refusing: disposable CI database only" >&2; exit 2; fi

TMP="$(mktemp -d)"
trap "rm -rf '$TMP'" EXIT

DBDIR="backend/db"
MIG="$DBDIR/migrations"

DB="$(mktemp -u)"
createdb -h "$PGHOST" -U postgres "$DB" > /dev/null 2>&1 || { echo "refusing: could not create test database" >&2; exit 2; }
trap "dropdb -h '$PGHOST' -U postgres --if-exists '$DB' > /dev/null 2>&1" EXIT

# A01: Build from scratch
./backend/db/ci/build_from_scratch.sh "$DB" > "$TMP/a01.log" 2>&1 || { echo "FAIL A01" >&2; cat "$TMP/a01.log" >&2; exit 1; }

# B01: Apply 0033
PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -U postgres -d "$DB" -v ON_ERROR_STOP=1 -f "$MIG/0033_inspection_enabled_setting.sql" > "$TMP/b01.log" 2>&1 || { echo "FAIL B01: apply" >&2; cat "$TMP/b01.log" >&2; exit 1; }

# B02: Check signature (6 params)
SIG=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -U postgres -d "$DB" -tA -c "SELECT array_length(proargtypes,1) FROM pg_proc WHERE proname='zell_save_identity' AND pronamespace='public'::regnamespace" 2>/dev/null)
if [ "$SIG" != "6" ]; then echo "FAIL B02: sig=$SIG" >&2; exit 1; fi

# B03: Call RPC and verify inspection_enabled row created
BEFORE=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -U postgres -d "$DB" -tA -c "SELECT updated_at FROM settings WHERE key='store_name' LIMIT 1" 2>/dev/null)
RES=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -U postgres -d "$DB" -tA -c "SELECT zell_save_identity('$BEFORE'::timestamptz,'test','test','201','test',true)" 2>/dev/null)
if [ "$RES" = "" ]; then echo "FAIL B03: RPC returned null/empty" >&2; exit 1; fi

# B04: Verify inspection_enabled was created by the RPC call
SETTING=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -U postgres -d "$DB" -tA -c "SELECT value FROM settings WHERE key='inspection_enabled'" 2>/dev/null)
if [ "$SETTING" != "true" ]; then echo "FAIL B04: inspection_enabled=$SETTING" >&2; exit 1; fi

# C01: Re-apply (idempotency)
PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -U postgres -d "$DB" -v ON_ERROR_STOP=1 -f "$MIG/0033_inspection_enabled_setting.sql" > "$TMP/c01.log" 2>&1 || { echo "FAIL C01: reapply" >&2; exit 1; }

# C02: Check sig still 6
SIG2=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -U postgres -d "$DB" -tA -c "SELECT array_length(proargtypes,1) FROM pg_proc WHERE proname='zell_save_identity' AND pronamespace='public'::regnamespace" 2>/dev/null)
if [ "$SIG2" != "6" ]; then echo "FAIL C02: sig=$SIG2" >&2; exit 1; fi

# D01: Apply rollback
PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -U postgres -d "$DB" -v ON_ERROR_STOP=1 -f "$MIG/0033_inspection_enabled_setting_rollback.sql" > "$TMP/d01.log" 2>&1 || { echo "FAIL D01: rollback" >&2; exit 1; }

# D02: Check sig is 5
SIG3=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -U postgres -d "$DB" -tA -c "SELECT array_length(proargtypes,1) FROM pg_proc WHERE proname='zell_save_identity' AND pronamespace='public'::regnamespace" 2>/dev/null)
if [ "$SIG3" != "5" ]; then echo "FAIL D02: sig=$SIG3" >&2; exit 1; fi

# D03: Check inspection_enabled removed
CNT=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -U postgres -d "$DB" -tA -c "SELECT COUNT(*) FROM settings WHERE key='inspection_enabled'" 2>/dev/null)
if [ "$CNT" != "0" ]; then echo "FAIL D03: count=$CNT" >&2; exit 1; fi

echo "PASS 0033: apply, idempotency, rollback"
exit 0
