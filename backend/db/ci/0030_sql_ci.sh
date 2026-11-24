#!/usr/bin/env bash
# COUPON-DELETE (0030) — اختبار SQL في CI: Postgres 17 مؤقت، والداتابيز مبنية من الصفر
# بالقايمة الصريحة كاملة (backend/db/ci/build_from_scratch.list — و0030 آخر سطر فيها)،
# وبعدين فحوص حالة + سيناريوهات (0030_flows.sql) + تزامن بجلستين حقيقيتين مع إثبات التداخل.
# مفيش أي اتصال بـ Supabase. ممنوع يتشغّل على أي داتابيز غير الحاوية المؤقتة.
set -uo pipefail

if [ "$(printenv ZELL_CI_DISPOSABLE_DB)" != "yes" ]; then echo "refusing: disposable CI database only" >&2; exit 2; fi
case "$(printenv PGHOST)" in
  localhost|127.0.0.1) ;;
  *) echo "refusing: PGHOST must be localhost" >&2; exit 2 ;;
esac

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
DBDIR="$ROOT/backend/db"
MIG="$DBDIR/migrations"
CIDIR="$DBDIR/ci"
LIST="$CIDIR/build_from_scratch.list"
FLOWS="$CIDIR/0030_flows.sql"
SUPER="$(printenv CI_SUPERUSER || true)"
[ -n "$SUPER" ] || SUPER=supabase_admin
DB=zell_ci_0030
TMP="$(mktemp -d)"
PASS=0
FAIL=0
SEEN=" "
EXPECTED="S01 B01 F01 0031 K01 K02"

record() {
  SEEN="$SEEN$(printf '%s' "$1" | cut -d' ' -f1) "
  if [ "$2" = "yes" ]; then echo "CASE PASS $1"; PASS=$((PASS + 1)); else echo "CASE FAIL $1 :: $3"; FAIL=$((FAIL + 1)); fi
}
finish() {
  local missing="" id
  for id in $EXPECTED; do
    [ "$(printf '%s' "$SEEN" | tr ' ' '\n' | grep -cx "$id")" = "1" ] || missing="$missing $id"
  done
  if [ -n "$missing" ]; then echo "CASE FAIL R00 incomplete run (mandatory cases missing or repeated):$missing"; FAIL=$((FAIL + 1)); fi
  echo "ZELL_0030_SQL_CI_RESULT pass=$PASS fail=$FAIL"
  rm -rf "$TMP"
  if [ "$FAIL" -eq 0 ]; then exit 0; else exit 1; fi
}
stop() { record "$1" no "$2"; echo "STOPPED: $1"; finish; }
tailof() { tail -n 6 "$1" 2> /dev/null | tr '\n' ' ' | cut -c1-600; }
su_q() { local db=$1; shift; psql -X -q -tA -v ON_ERROR_STOP=1 -U "$SUPER" -d "$db" "$@" < /dev/null; }
su_f() { psql -X -q -v ON_ERROR_STOP=1 -v VERBOSITY=verbose -U "$SUPER" -d "$1" -f "$2" < /dev/null; }
pg_f() { psql -X -q -v ON_ERROR_STOP=1 -v VERBOSITY=verbose -U postgres -d "$1" -f "$2" < /dev/null; }
q() { psql -X -q -tA -v ON_ERROR_STOP=1 -U postgres -d "$DB" -c "$1" < /dev/null 2>&1; }
run_sql() { printf '%s\n' "$1" | psql -X -q -tA -v ON_ERROR_STOP=1 -v VERBOSITY=verbose -U postgres -d "$DB" -f - > "$2" 2>&1; }
has() { grep -q -- "$2" "$1"; }
wait_app() {
  local i c
  for i in $(seq 1 50); do
    c=$(q "select pg_catalog.count(*) from pg_catalog.pg_stat_activity where application_name = '$1' and wait_event_type = 'Lock'")
    [ "$c" = "1" ] && return 0
    sleep 0.1
  done
  return 1
}
overlap() {
  local hp wp
  OV=no
  PGAPPNAME="$1h" run_sql "$2" "$TMP/$1h.out" & hp=$!
  sleep 0.7
  PGAPPNAME="$1w" run_sql "$3" "$TMP/$1w.out" & wp=$!
  wait_app "$1w" && OV=yes
  wait "$wp"
  wait "$hp"
}

# ---- بناء الداتابيز من القايمة كاملة (0030 آخر سطر) ----
fresh=$(su_q postgres -c "select pg_catalog.count(*) from pg_catalog.pg_roles where rolname in ('postgres','anon','authenticated','service_role')")
[ "$fresh" = "0" ] || stop "B01 fresh disposable cluster" "platform roles already present"
su_q postgres -c "create database $DB" -c "alter database $DB set zell.ci_scratch = 'on'" > "$TMP/createdb.log" 2>&1 || stop "B01 create database" "$(tailof "$TMP/createdb.log")"
su_f "$DB" "$CIDIR/platform_shim.sql" > "$TMP/shim.log" 2>&1 || stop "B01 platform_shim.sql" "$(tailof "$TMP/shim.log")"
su_f "$DB" "$CIDIR/platform_default_privileges.sql" > "$TMP/dp.log" 2>&1 || stop "B01 platform_default_privileges.sql" "$(tailof "$TMP/dp.log")"
n=0
last=""
while IFS='|' read -r kind rel _reason; do
  case "$kind" in ''|'#'*|exclude) continue ;; apply|baseline|fixture|check) ;; *) stop "B01 build list" "unknown kind $kind" ;; esac
  f="$DBDIR/$rel"
  [ -f "$f" ] || stop "B01 build list" "missing $rel"
  n=$((n + 1))
  last="$rel"
  runf="$f"
  if [ "$kind" = "apply" ] && grep -q 'zell\.approved_by' "$f"; then
    runf="$TMP/run_$n.sql"
    sed "0,/^begin;$/s//begin;\nset local zell.approved_by = 'ci-0030-build';/" "$f" > "$runf"
    if grep -q 'zell\.inv_expected' "$f"; then
      sed -i "0,/^begin;$/s//begin;\nset local zell.inv_expected = 'locations=1 suppliers=0 purchase_docs=0 purchase_doc_lines=0 purchase_doc_charges=0 opening_docs=0 opening_lines=0 stock_lots=0 commands=0 audit=0';/" "$runf"
    fi
  fi
  pg_f "$DB" "$runf" > "$TMP/build_$n.log" 2>&1 || stop "B01 build step $n $rel" "$(tailof "$TMP/build_$n.log")"
done < "$LIST"
ok=no; [ "$n" -gt 11 ] && [ "$last" = "migrations/0031_image_cleanup.sql" ] && ok=yes
record "B01 database built from build_from_scratch.list in full ($n steps, last $last = 0031)" "$ok" "steps=$n last=$last"
[ "$ok" = yes ] || finish

# ---- S01: حالة ما بعد البناء ----
st=$(q "select (exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'coupons' and column_name = 'revoked_at'))::text
       || '|' || (pg_catalog.to_regprocedure('public.zell_delete_coupon(bigint)') is not null)::text
       || '|' || (select p.prosrc like '%revoked_at%' from pg_catalog.pg_proc p where p.oid = pg_catalog.to_regprocedure('public.zell_preview_coupon(text)'))::text
       || '|' || pg_catalog.has_function_privilege('service_role', 'public.zell_delete_coupon(bigint)', 'EXECUTE')::text
       || '|' || (select p.prosrc like '%v_cp_revoked%' from pg_catalog.pg_proc p where p.oid = pg_catalog.to_regprocedure('public.zell_create_order(jsonb,text,text,text,text,text,text,text,text,text,text,boolean,text,jsonb,text)'))::text
       || '|' || (select p.prosrc like '%INSTALLER-SHIPPING%' from pg_catalog.pg_proc p where p.oid = pg_catalog.to_regprocedure('public.zell_create_order(jsonb,text,text,text,text,text,text,text,text,text,text,boolean,text,jsonb,text)'))::text
       || '|' || pg_catalog.has_function_privilege('anon', 'public.zell_delete_coupon(bigint)', 'EXECUTE')::text")
ok=no; [ "$st" = "true|true|true|true|true|true|false" ] && ok=yes
record "S01 state after build: revoked_at column, delete fn, revoked checks in preview + create_order bodies, EXECUTE service_role only" "$ok" "$st"

# ---- F01: السيناريوهات ----
rc=0
psql -X -q -tA -v ON_ERROR_STOP=1 -v VERBOSITY=verbose -U postgres -d "$DB" -f "$FLOWS" < /dev/null > "$TMP/f1.out" 2>&1 || rc=$?
summ=$(grep '^0|summary|' "$TMP/f1.out" | cut -d'|' -f3-)
ok=no; [ "$rc" = "0" ] && [ "$summ" = "PASS|pass=11 fail=0" ] && ok=yes
record "F01 flows (0030_flows.sql) -> PASS 11/0" "$ok" "rc=$rc summary=[$summ] $(grep '|fail|' "$TMP/f1.out" | tr '\n' ' ' | cut -c1-600)"

# ---- بيانات التزامن (committed) ----
PID=$(q "select id from public.products where is_active order by id limit 1")
if [ -z "$PID" ]; then
  PID=$(q "insert into public.products (name_ar, price_per_meter_piastres, is_active) values ('ci-0030-prod', 15000, true) returning id")
fi
q "insert into public.coupons (code, kind, percent_off, is_active) values ('K1RACE30', 'percent', 10, true), ('K2RACE30', 'percent', 10, true)" > /dev/null
q "update public.settings set value = 'true'::jsonb where key = 'coupons_enabled'" > /dev/null
K1ID=$(q "select id from public.coupons where code = 'K1RACE30'")
K2ID=$(q "select id from public.coupons where code = 'K2RACE30'")
ord_txt() {
  printf '%s\n' "set statement_timeout = '20s';" "begin;" \
    "select public.zell_create_order(pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object('productId', $PID, 'lengthCm', 300)), 'عميل تجربة', '01000000309', 'القاهرة', 'شارع التجربة رقم ١', null, '$1', pg_catalog.md5('$1') || pg_catalog.md5('$1-x'), pg_catalog.repeat('a', 64), pg_catalog.repeat('b', 64), null, false, '$2');" \
    "select pg_catalog.pg_sleep($3);" "commit;"
}
del_txt() {
  printf '%s\n' "set statement_timeout = '20s';" "begin;" \
    "select public.zell_delete_coupon($1);" \
    "select pg_catalog.pg_sleep($2);" "commit;"
}

# K01: الطلب الأول (ماسك قفل الكوبون FOR UPDATE) ↔ الحذف بيستنى، وبعد الـ commit بيعدّ الطلب -> archived.
overlap k1 "$(ord_txt ci30-k1-order-key-0001 K1RACE30 3)" "$(del_txt "$K1ID" 0)"
fin=$(q "select pg_catalog.count(*) from public.orders where coupon_id = $K1ID")
ok=no; [ "$OV" = yes ] && has "$TMP/k1w.out" 'archived' && [ "$fin" = "1" ] && ok=yes
record "K01 order holds the coupon, delete waits (overlap seen) then counts the order -> archived; order kept" "$ok" "ov=$OV orders=$fin h=$(tailof "$TMP/k1h.out") w=$(tailof "$TMP/k1w.out")"

# K02: الحذف الأول (كوبون فاضي) ↔ الطلب بيستنى قفل الصف، وبعد الـ commit الكوبون اختفى -> 45070.
overlap k2 "$(del_txt "$K2ID" 3)" "$(ord_txt ci30-k2-order-key-0002 K2RACE30 0)"
ok=no; [ "$OV" = yes ] && has "$TMP/k2h.out" 'deleted' && has "$TMP/k2w.out" '45070' && ok=yes
record "K02 delete holds the coupon row, order waits (overlap seen) then coupon gone -> 45070" "$ok" "ov=$OV h=$(tailof "$TMP/k2h.out") w=$(tailof "$TMP/k2w.out")"

finish
