#!/usr/bin/env bash
# 0023 INVENTORY-REMOVAL B â Ø§Ø®ØªØ¨Ø§Ø± SQL ÙÙ CI: Postgres 17 ÙØ¤ÙØªØ ÙØ§ÙØ¯Ø§ØªØ§Ø¨ÙØ² ÙØ¨ÙÙØ© ÙÙ Ø§ÙØµÙØ± Ø¨Ø§ÙÙØ§ÙÙØ© Ø§ÙØµØ±ÙØ­Ø© ÙØ­Ø¯ ÙØ¨Ù 0023
# (backend/db/ci/build_from_scratch.listØ ÙÙÙÙØ§ 0020 Ù0020-S Ù0022Ø Ø³Ø·Ø± 0023 Ø¨ÙØªØ®Ø·ÙÙØ postgres ÙØ´ superuser Ø²Ù Production)Ø ÙØ¨Ø¹Ø¯ÙÙ 0023 ÙÙÙÙØ§.
# Ø¨ÙØºØ·Ù: Ø´ÙÙ Ø§ÙÙØ¹Ø§ÙÙØ© Â· md5 Ø§ÙØ¬Ø³Ù Â· Ø³Ø·ÙØ± Ø§ÙÙÙØ§ÙÙØ© ÙØ§ÙØ£Ø¹Ø¯Ø§Ø¯ Ø¨Ø±ÙÙ Ø§ÙÙÙÙ Â· verify 0022 ÙØ¨Ù (PASS) Â· Ø­Ø±Ø§Ø³ Ø§ÙÙ preflight (ÙÙØ§ÙÙØ© Â· Ø£Ø¹Ø¯Ø§Ø¯ Â·
# Ø£Ø¹Ø¯Ø§Ø¯ ØºÙØ· Â· ÙØªØµÙ ØºÙØ·) ÙØ§ÙØ­Ø§ÙØ© ÙØ§Ø¨ØªØªØºÙÙØ±Ø´ Â· Ø±Ø¬ÙØ¹ Ø§ÙÙØ¹Ø§ÙÙØ© ÙÙÙØ§ ÙÙ Ø­ØµÙ Ø®Ø·Ø£ ÙÙ Ø¢Ø®Ø±ÙØ§ Â· ptest ÙØ¨Ù Ø§ÙØªØ·Ø¨ÙÙ ÙÙØ§Ø¨ÙØ³ÙØ¨Ø´ Ø£Ø«Ø± Â· Ø§ÙØªØ·Ø¨ÙÙ Â·
# verify 0023 Â· Ø«Ø¨Ø§Øª ÙÙ Ø­Ø§Ø¬Ø© Ø¨Ø±ÙÙ Ø§ÙÙØ®Ø²ÙÙ (Ø¨ØµÙØ© + ØµÙÙÙ) Â· Ø±Ø¯ ÙØ¹Ø§ÙÙØ© ÙØ­Ø°Ù Ø§ÙÙÙØªØ¬ ÙØ¨Ù = Ø¨Ø¹Ø¯ Ø¨Ø§ÙØ­Ø±Ù Â· verify 0022 Ø¨Ø¹Ø¯: Ø§ÙÙØ§Ø´Ù Ø¨Ø³
# ÙØ­ÙØµ Ø§ÙÙØ®Ø²ÙÙ (ØªØ§Ø±ÙØ®ÙØ©Ø ÙØ§Ø¨ØªØªØ¹Ø¯ÙÙØ´) Â· Ø±ÙØ¶ Ø§ÙØ¥Ø¹Ø§Ø¯Ø©.
# ÙÙØ±Ø§Ø¬Ø¹Ø© #195: Ø§ÙØªØ²Ø§ÙÙ (C01 ÙØªØ§Ø¨Ø© Ø¨ØªØ®ÙØµ ÙØ¥Ø­ÙØ§ ÙØ³ØªÙÙÙÙ Ø§ÙÙÙÙ = DATA_CHANGED ÙØ§ÙØµÙ Ø¨ÙÙØ¶Ù Â· C02 ÙÙÙ Ø£Ø·ÙÙ ÙÙ lock_timeout = Ø®Ø·Ø£ ÙÙÙÙØ´
# ØªØºÙÙØ±) Â· Ø¯Ø§ÙØ© Ø¨Ø±ÙÙ Ø§ÙÙØ®Ø²ÙÙ Ø¨ØªÙØ§Ø¯Ù zell_inv_* = SHAPE (G05) Â· Ø§ÙÙ 9 verify Ø§ÙÙÙØ¬ÙØ¯Ø© ÙØ¨Ù ÙØ¨Ø¹Ø¯ (E01 Â· E02: PASS ÙÙÙØ³ ÙØªØ¬Ù check_id=ok) Â·
# Ø¹ÙØ¯ Ø§Ø³ØªØ¯Ø¹Ø§Ø¡ Ø§ÙØªØ·Ø¨ÙÙØ§Øª Ø¹ÙÙ Ø§ÙØ¯Ø§ØªØ§Ø¨ÙØ² Ø¨Ø¹Ø¯ 0023 (K01).
# ÙÙÙÙØ¹ ÙØªØ´ØºÙÙ Ø¹ÙÙ Ø£Ù Ø¯Ø§ØªØ§Ø¨ÙØ² ØºÙØ± Ø§ÙØ­Ø§ÙÙØ© Ø§ÙÙØ¤ÙØªØ©.
set -uo pipefail

if [ "${ZELL_CI_DISPOSABLE_DB:-}" != "yes" ]; then echo "refusing: disposable CI database only" >&2; exit 2; fi
case "${PGHOST:-}" in
  localhost|127.0.0.1) ;;
  *) echo "refusing: PGHOST must be localhost" >&2; exit 2 ;;
esac

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
DBDIR="$ROOT/backend/db"
MIG="$DBDIR/migrations"
MIG_0033="$MIG/0033_inspection_enabled_setting.sql"
CIDIR="$DBDIR/ci"
LIST="$CIDIR/build_from_scratch.list"
# Apply 0033 migration before testing K01
MIG_0033="$MIG/0033_inspection_enabled_setting.sql"
APPLY="$MIG/0023_inventory_removal.sql"
PTEST="$MIG/0023_inventory_removal_ptest.sql"
VERIFY="$MIG/0023_inventory_removal_verify.sql"
V22="$MIG/0022_product_delete_verify.sql"
SHAPE="$CIDIR/0021p_txn_shape.py"
SUPER="${CI_SUPERUSER:-supabase_admin}"
DB=zell_ci_0023
TMP="$(mktemp -d)"
PASS=0
FAIL=0
SEEN=" "
OWNER_ID='00000000-0000-4000-8000-0000000000b1'
EXPECTED="S01 S02 S03 B01 B02 X01 P01 E01 G01 G02 G03 G04 G05 C01 C02 Z01 T01 T02 A01 A02 A03 A04 A05 E02 K01 R01"
BEFORE_STATE='1|68|10|4aa0deeeb83feb653b9e363c2d418330|1'
AFTER_STATE='0|0|0|84b80a92c3c413433a71d80300bd5418|0'

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
  echo "ZELL_0023_SQL_CI_RESULT pass=$PASS fail=$FAIL"
  rm -rf "$TMP"
  if [ "$FAIL" -eq 0 ]; then exit 0; else exit 1; fi
}
stop() { record "$1" no "$2"; echo "STOPPED: $1"; finish; }
tailof() { tail -n 6 "$1" 2> /dev/null | tr '\n' ' ' | cut -c1-600; }
su_q() { local db=$1; shift; psql -X -q -tA -v ON_ERROR_STOP=1 -U "$SUPER" -d "$db" "$@" < /dev/null; }
su_f() { psql -X -q -v ON_ERROR_STOP=1 -v VERBOSITY=verbose -U "$SUPER" -d "$1" -f "$2" < /dev/null; }
pg_f() { psql -X -q -v ON_ERROR_STOP=1 -v VERBOSITY=verbose -U postgres -d "$1" -f "$2" < /dev/null; }
q() { psql -X -q -tA -v ON_ERROR_STOP=1 -U postgres -d "$DB" -c "$1" < /dev/null 2>&1; }
run_file() { psql -X -q -tA -v ON_ERROR_STOP=1 -v VERBOSITY=verbose -U postgres -d "$DB" -f "$1" < /dev/null > "$2" 2>&1; }
has() { grep -q -- "$2" "$1"; }
body_md5() { awk -v s="-- >>> $2" -v e="-- <<< $2" '$0 == s {f = 1} f {print} $0 == e {f = 0}' "$1" | md5sum | cut -d' ' -f1; }
EMPTY_MD5="$(printf '' | md5sum | cut -d' ' -f1)"
summary_of() { grep '^0|summary|' "$1"; }
fails_of() { grep -E '^[0-9]+\|(test|check)\|[^|]*\|[^|]*\|(fail|f)\|' "$1" | tr '\n' ' ' | cut -c1-1800; }
# Ø³Ø·ÙØ± Ø§ÙØªØ´ØºÙÙ Ø¨Ø¹Ø¯ Ø£ÙÙ begin; (Ø¨Ø±ÙÙ Ø§ÙØ¬Ø³ÙØ ÙØ§ÙÙ md5 ÙØ§Ø¨ÙØªØºÙÙØ±Ø´) â Ø²Ù Production Ø¨Ø§ÙØ¸Ø¨Ø·. Ø£Ù ÙÙÙØ© ÙØ§Ø¶ÙØ© = Ø§ÙØ³Ø·Ø± ÙØ§Ø¨ÙØªØ­Ø·Ø´.
with_lines() {
  local f=$1 appr=$2 exp=$3 pre=${4:-} ins=""
  [ -n "$pre" ] && ins="$ins\n$pre"
  [ -n "$appr" ] && ins="$ins\nset local zell.approved_by = '$appr';"
  [ -n "$exp" ] && ins="$ins\nset local zell.inv_expected = '$exp';"
  sed "0,/^begin;\$/s//begin;$ins/" "$f"
}
run_with() { with_lines "$1" "$2" "$3" "${5:-}" | psql -X -q -tA -v ON_ERROR_STOP=1 -v VERBOSITY=verbose -U postgres -d "$DB" -f - > "$4" 2>&1; }
state() {
  q "select (pg_catalog.to_regrole('zell_inventory_definer') is not null)::int
       || '|' || (select pg_catalog.count(*) from pg_catalog.pg_proc p where p.pronamespace = 'public'::regnamespace and p.proname like 'zell\_inv\_%')
       || '|' || (select pg_catalog.count(*) from pg_catalog.pg_class c where c.relnamespace = 'public'::regnamespace and c.relkind = 'r' and c.relname in ('inventory_locations','suppliers','purchase_docs','purchase_doc_lines','purchase_doc_charges','opening_stock_docs','opening_stock_lines','stock_lots','inventory_commands','inventory_audit_log'))
       || '|' || coalesce((select pg_catalog.md5(p.prosrc) from pg_catalog.pg_proc p where p.oid = pg_catalog.to_regprocedure('public.zell_product_delete(integer, timestamp with time zone)')), '-')
       || '|' || (select pg_catalog.count(*) from pg_catalog.pg_trigger t where t.tgname = 'zinv_products_sale_unit')"
}
data_line() {
  su_q "$DB" -c "select 'locations=' || (select pg_catalog.count(*) from public.inventory_locations)
          || ' suppliers=' || (select pg_catalog.count(*) from public.suppliers)
          || ' purchase_docs=' || (select pg_catalog.count(*) from public.purchase_docs)
          || ' purchase_doc_lines=' || (select pg_catalog.count(*) from public.purchase_doc_lines)
          || ' purchase_doc_charges=' || (select pg_catalog.count(*) from public.purchase_doc_charges)
          || ' opening_docs=' || (select pg_catalog.count(*) from public.opening_stock_docs)
          || ' opening_lines=' || (select pg_catalog.count(*) from public.opening_stock_lines)
          || ' stock_lots=' || (select pg_catalog.count(*) from public.stock_lots)
          || ' commands=' || (select pg_catalog.count(*) from public.inventory_commands)
          || ' audit=' || (select pg_catalog.count(*) from public.inventory_audit_log)"
}
# Ø¨ØµÙØ© ÙØ³ØªÙÙØ© Ø¹Ù Ø§ÙÙ migration ÙÙÙ Ø­Ø§Ø¬Ø© Ø¨Ø±ÙÙ Ø§ÙÙØ®Ø²ÙÙ: Ø§ÙØ¯ÙØ§Ù (ØºÙØ± zell_inv_* ÙØ¯Ø§ÙØªÙÙ Ø§ÙØ­Ø°Ù) Ø¨ØµÙØ§Ø­ÙØ§ØªÙØ§ ÙØ£Ø¬Ø³Ø§ÙÙØ§Ø ÙØ§ÙØ¬Ø¯Ø§ÙÙ Ø¨ØµÙØ§Ø­ÙØ§ØªÙØ§Ø ÙØ§ÙØ£Ø¯ÙØ§Ø±Ø ÙØ§ÙÙÙÙØ¯Ø ÙØ§ÙØµÙÙÙ.
fp_out() {
  q "select pg_catalog.md5(pg_catalog.concat_ws('|',
       (select pg_catalog.string_agg(p.oid::regprocedure::text || '=' || coalesce(p.proacl::text, '-') || '=' || pg_catalog.md5(p.prosrc) || '=' || pg_catalog.pg_get_userbyid(p.proowner), ',' order by 1)
          from pg_catalog.pg_proc p where p.pronamespace = 'public'::regnamespace and p.proname not like 'zell\_inv\_%'
           and p.proname not in ('zell_product_delete', 'zell_product_delete_preview')),
       (select pg_catalog.string_agg(c.relname || '=' || coalesce(c.relacl::text, '-'), ',' order by 1) from pg_catalog.pg_class c
         where c.relnamespace = 'public'::regnamespace and c.relkind in ('r', 'v', 'm', 'S') and c.relname not in ('inventory_locations','suppliers','purchase_docs','purchase_doc_lines','purchase_doc_charges','opening_stock_docs','opening_stock_lines','stock_lots','inventory_commands','inventory_audit_log', 'purchase_doc_no_seq','opening_doc_no_seq','roll_lot_seq','batch_lot_seq')
           and not exists (select 1 from pg_catalog.pg_depend d join pg_catalog.pg_class t on t.oid = d.refobjid
                            where d.classid = 'pg_catalog.pg_class'::regclass and d.objid = c.oid and d.refclassid = 'pg_catalog.pg_class'::regclass
                              and t.relnamespace = 'public'::regnamespace and t.relname in ('inventory_locations','suppliers','purchase_docs','purchase_doc_lines','purchase_doc_charges','opening_stock_docs','opening_stock_lines','stock_lots','inventory_commands','inventory_audit_log'))),
       (select pg_catalog.string_agg(r.rolname, ',' order by 1) from pg_catalog.pg_roles r where r.rolname <> 'zell_inventory_definer'),
       (select pg_catalog.string_agg(c.relname || '.' || co.conname, ',' order by 1) from pg_catalog.pg_constraint co join pg_catalog.pg_class c on c.oid = co.conrelid
         where co.connamespace = 'public'::regnamespace and c.relname not in ('inventory_locations','suppliers','purchase_docs','purchase_doc_lines','purchase_doc_charges','opening_stock_docs','opening_stock_lines','stock_lots','inventory_commands','inventory_audit_log'))))
       || '|' || (select pg_catalog.count(*) from public.products) || ',' || (select pg_catalog.count(*) from public.orders)
       || ',' || (select pg_catalog.count(*) from public.order_items) || ',' || (select pg_catalog.count(*) from public.admin_users)
       || ',' || (select pg_catalog.md5(coalesce(pg_catalog.string_agg(s.key || '=' || s.value::text, ',' order by s.key), '')) from public.settings s)"
}
# ÙØ¯Ø§Ø¡ Ø¨Ø¬ÙØ³Ø© Ø§ÙÙØ§ÙÙ (authenticated + claims) Ø¬ÙÙ ÙØ¹Ø§ÙÙØ© Ø¨ØªØ±Ø¬Ø¹Ø Ø¢Ø®Ø± Ø³Ø·Ø± = Ø§ÙÙØªÙØ¬Ø©.
owner_call() {
  printf '%s\n' "begin;" \
    "select pg_catalog.set_config('request.jwt.claims', '{\"sub\":\"$OWNER_ID\",\"role\":\"authenticated\"}', true);" \
    "set local role authenticated;" "$1;" "rollback;" \
    | psql -X -q -tA -v ON_ERROR_STOP=1 -U postgres -d "$DB" -f - 2>&1 | grep -v '^$' | tail -n 1
}

# ---- ÙØ³Ø§Ø¹Ø¯Ø§Øª ÙØ±Ø§Ø¬Ø¹Ø© #195 ----
# B3: Ø§ÙÙ 9 verify Ø§ÙÙÙØ¬ÙØ¯Ø©. Ø§ÙÙØ³Ù:Ø§ÙÙÙÙ:Ø¹ÙÙØ¯ Ø§ÙÙ verdict ÙÙ ØµÙ Ø§ÙÙÙØ®Øµ (0021-P: Ø§ÙØ¹ÙÙØ¯ 11 ÙØ§ÙÙØ­Øµ pass/failØ Ø§ÙØ¨Ø§ÙÙ Ø§ÙØ¹ÙÙØ¯ 7 Ù t/f).
VLIST="A1:0021a_a1_order_cycle_verify.sql:7 D:0021d_preferred_delivery_verify.sql:7 P1:0021a_p1_payments_verify.sql:7 P2:0021a_p2_checkout_fee_verify.sql:7 D2:0021d2_delivery_settings_verify.sql:7 TR:0021tr_track_order_verify.sql:7 TR2:0021tr2_track_order_v2_verify.sql:7 EX:0021ex_express_shipping_verify.sql:7 0021-P:0021p_access_verify.sql:11"
US="$(printf '\037')"
# Ø¨ÙØ´ØºÙÙÙÙ Ø¨Ù postgres Ø²Ù Production (ÙØ§ØµÙ Ø§ÙØ£Ø¹ÙØ¯Ø© \037 ÙØ£Ù Ø§ÙØ£Ø³ÙØ§Ø¡ ÙØ§ÙØªÙØ§ØµÙÙ ÙÙÙÙ ÙØ¨ÙÙ ÙÙÙØ§ |). ÙÙÙ ÙØ§Ø­Ø¯ Ø³Ø·Ø±: Ø§ÙÙØ³Ù Â· rc Â· verdict Â· Ø¹Ø¯Ø¯
# Ø§ÙÙØ­ÙØµØ ÙÙØªØ¬Ù check_id=ok (Ø§ÙØ¹ÙÙØ¯ 3 = Ø§ÙØ¹ÙÙØ¯ 5) Ø¨Ø§ÙØªØ±ØªÙØ¨ ÙÙ $TMP/vec_<Ø§ÙÙØ±Ø­ÙØ©>_<Ø§ÙÙØ³Ù>.
verifies() {
  local phase=$1 item tag f col out rc verdict
  : > "$TMP/ver_$phase.txt"
  for item in $VLIST; do
    tag=${item%%:*}; f=$(printf '%s' "$item" | cut -d: -f2); col=${item##*:}; out="$TMP/ver_${phase}_$tag.out"
    psql -X -q -tA -F "$US" -v ON_ERROR_STOP=1 -v VERBOSITY=verbose -U postgres -d "$DB" -f "$MIG/$f" < /dev/null > "$out" 2>&1; rc=$?
    verdict=$(awk -F "$US" -v c="$col" '$1 == "0" && $2 == "summary" {print $c}' "$out")
    awk -F "$US" '$1 ~ /^[0-9]+$/ && $1 != "0" && $2 == "check" {print $3 "=" $5}' "$out" > "$TMP/vec_${phase}_$tag"
    printf '%s rc=%s verdict=%s checks=%s\n' "$tag" "$rc" "${verdict:--}" "$(grep -c . "$TMP/vec_${phase}_$tag")" >> "$TMP/ver_$phase.txt"
  done
}
verifies_pass() { [ "$(grep -c . "$TMP/ver_$1.txt")" = "9" ] && ! grep -qvE ' rc=0 verdict=PASS checks=[1-9][0-9]*$' "$TMP/ver_$1.txt"; }
verifies_detail() {
  local t
  tr '\n' ' ' < "$TMP/ver_$1.txt"
  for t in $(grep -vE ' rc=0 verdict=PASS checks=[1-9][0-9]*$' "$TMP/ver_$1.txt" | cut -d' ' -f1); do
    printf '[%s fail: %s %s] ' "$t" "$(awk -F "$US" '$2 == "check" && ($5 == "f" || $5 == "fail") {print $3}' "$TMP/ver_${1}_$t.out" | tr '\n' ',')" "$(tailof "$TMP/ver_${1}_$t.out" | tr "$US" '|')"
  done
}
# B1: Ø¬ÙØ³Ø© ÙØªØ§Ø¨Ø© ØªØ§ÙÙØ© ÙÙ Ø§ÙØ®ÙÙÙØ© (superuser Ø¨Ù replica Ø²Ù X01): Ø¨ØªØ¶ÙÙ ÙÙØ±Ø¯ ($1)Ø ØªØ³ØªÙÙ ($2 Ø«Ø§ÙÙØ©)Ø ÙØ¨Ø¹Ø¯ÙÙ $3 (commit Ø£Ù rollback).
holder() {
  printf '%s\n' "set session_replication_role = replica;" "begin;" \
    "insert into public.suppliers (name, name_key, created_by, updated_by) values ('$1', '$(printf '%s' "$1" | tr 'A-Z' 'a-z')', '$OWNER_ID', '$OWNER_ID');" \
    "select pg_catalog.pg_sleep($2);" "$3;" \
    | PGAPPNAME=ci0023_holder psql -X -q -tA -v ON_ERROR_STOP=1 -U "$SUPER" -d "$DB" -f - > "$4" 2>&1
}
# ÙØ­Ø¯ ÙØ§ Ø§ÙØ¬ÙØ³Ø© Ø§ÙØªØ§ÙÙØ© ØªÙØ³Ù ÙÙÙ Ø§ÙÙØªØ§Ø¨Ø© Ø¨ØªØ§Ø¹ÙØ§ Ø¹ÙÙ suppliers (Ø£ÙØµÙ 10 Ø«ÙØ§ÙÙ).
wait_holder() {
  local i=0
  while [ "$i" -lt 50 ]; do
    [ "$(su_q "$DB" -c "select pg_catalog.count(*) from pg_catalog.pg_locks l join pg_catalog.pg_stat_activity a on a.pid = l.pid
                         where a.application_name = 'ci0023_holder' and l.relation = 'public.suppliers'::regclass and l.mode = 'RowExclusiveLock' and l.granted")" = "1" ] && return 0
    sleep 0.2; i=$((i + 1))
  done
  return 1
}
now_ms() { python3 -c 'import time; print(time.monotonic_ns() // 1000000)'; }
# C02-CLOCK (docs/contracts/INVENTORY-REMOVAL.md Â§ÙÙ ÙÂ§Ø­-Ù£): now_ms ÙÙÙ Ø¨Ø§ÙØ³Ø§Ø¹Ø© Ø§ÙÙ monotonicØ ÙÙÙ Ø§ÙÙÙ Ø¨ØªØªÙØ§Ø±Ù Ø¨Ø§ÙØ­Ø¯ÙØ¯ ÙÙ C01/C02. wall_ms/mono_ms ÙØ³Ø·ÙØ± Ø§ÙØªÙÙÙØª ÙÙÙØªØ§Ø¨Ø¹Ø© Ø¨Ø³.
wall_ms() { date +%s%3N; }
mono_ms() { python3 -c 'import time; print(time.monotonic_ns() // 1000000)' 2> /dev/null; }
isnum() { case "$1" in ''|*[!0-9-]*) return 1 ;; esac; return 0; }
yn() { if "$@"; then echo yes; else echo no; fi; }
not_has() { ! grep -q -- "$2" "$1"; }
# Îµ: Ø£ÙØ¨Ø± (Îwall â Îmono) ÙÙ 5 Ø¹ÙÙØ§Øª Ø¨ÙÙØ³ Ø§ÙØªØ±ØªÙØ¨ wall0 â mono0 â mono1 â wall1 ÙÙ ØºÙØ± Ø­Ø§Ø¬Ø© ÙÙ Ø§ÙÙØµ (ØªÙÙÙØ© Ø£Ø®Ø° Ø§ÙØ¹ÙÙØ§Øª).
clock_eps() {
  local i a b c d diff max=""
  for i in 1 2 3 4 5; do
    a=$(wall_ms); b=$(mono_ms); c=$(mono_ms); d=$(wall_ms)
    if isnum "$a" && isnum "$b" && isnum "$c" && isnum "$d"; then
      diff=$(( (d - a) - (c - b) ))
      if [ -z "$max" ] || [ "$diff" -gt "$max" ]; then max=$diff; fi
    fi
  done
  echo "${max:-n/a}"
}
# Ø­Ø§ÙØ© Ø³Ø§Ø¹Ø© Ø§ÙØ¬ÙØ§Ø² â ÙØ¹ÙÙÙØ© ÙØ³Ø§Ø¹Ø¯Ø© Ø¨Ø³Ø ÙØ£Ù Ø£ÙØ± ÙØ´ ÙÙØ¬ÙØ¯ Ø£Ù Ø¨ÙÙØ´Ù ÙØ§Ø¨ÙÙÙÙØ¹Ø´ Ø­Ø§Ø¬Ø©.
clock_state() {
  echo "CLOCK_STATE $1 clocksource=$(cat /sys/devices/system/clocksource/clocksource0/current_clocksource 2> /dev/null || echo n/a)"
  if command -v timedatectl > /dev/null 2>&1; then echo "CLOCK_STATE $1 timedatectl $(timedatectl show -p NTPSynchronized -p TimeUSec 2> /dev/null | tr '\n' ' ')"; else echo "CLOCK_STATE $1 timedatectl n/a"; fi
  if command -v chronyc > /dev/null 2>&1; then echo "CLOCK_STATE $1 chronyc $(chronyc tracking 2> /dev/null | tr '\n' ' ' | cut -c1-600)"; else echo "CLOCK_STATE $1 chronyc n/a"; fi
}

# ---- 1) ÙØ­ÙØµ Ø«Ø§Ø¨ØªØ© ----
if python3 "$SHAPE" --selftest > "$TMP/shape_self.out" 2>&1 && python3 "$SHAPE" "$PTEST" "$VERIFY" > "$TMP/shape.out" 2>&1; then ok=yes; else ok=no; fi
record "S01 transaction shape: ptest / verify = begin ... one SELECT ... rollback (checker self-test first)" "$ok" "$(tailof "$TMP/shape.out") $(tailof "$TMP/shape_self.out")"
m_apply=$(body_md5 "$APPLY" "0023 BODY"); m_ptest=$(body_md5 "$PTEST" "0023 BODY")
ok=no; [ "$m_apply" = "$m_ptest" ] && [ "$m_apply" != "$EMPTY_MD5" ] && ok=yes
record "S02 ptest body = apply body (md5 $m_apply)" "$ok" "apply=$m_apply ptest=$m_ptest"
ok=no
if [ "$(grep -cx 'begin;' "$APPLY")" = "1" ] && [ "$(grep -cx 'commit;' "$APPLY")" = "1" ] && [ "$(grep -v '^[[:space:]]*$' "$APPLY" | tail -n 1)" = "commit;" ] \
   && ! grep -v '^[[:space:]]*--' "$APPLY" | grep -qE 'zell\.(approved_by|inv_expected) ='; then ok=yes; fi
record "S03 apply: one begin + one commit (last), no approval or expected-data line inside the file" "$ok" ""

# ---- 2) Ø¨ÙØ§Ø¡ Ø§ÙØ¯Ø§ØªØ§Ø¨ÙØ² ÙÙ Ø§ÙÙØ§ÙÙØ© Ø§ÙØµØ±ÙØ­Ø© ÙÙÙØ§ (Ø²Ù build_from_scratch.sh) ----
fresh=$(su_q postgres -c "select pg_catalog.count(*) from pg_catalog.pg_roles where rolname in ('postgres','anon','authenticated','service_role')")
[ "$fresh" = "0" ] || stop "B01 fresh disposable cluster" "platform roles already present"
su_q postgres -c "create database $DB" -c "alter database $DB set zell.ci_scratch = 'on'" > "$TMP/createdb.log" 2>&1 || stop "B01 create database" "$(tailof "$TMP/createdb.log")"
su_f "$DB" "$CIDIR/platform_shim.sql" > "$TMP/shim.log" 2>&1 || stop "B01 platform_shim.sql" "$(tailof "$TMP/shim.log")"
su_f "$DB" "$CIDIR/platform_default_privileges.sql" > "$TMP/dp.log" 2>&1 || stop "B01 platform_default_privileges.sql" "$(tailof "$TMP/dp.log")"
n=0
while IFS='|' read -r kind rel _reason; do
  case "$kind" in ''|'#'*|exclude) continue ;; apply|baseline|fixture|check) ;; *) stop "B01 build list" "unknown kind $kind" ;; esac
  # 0023 ÙÙØ³ÙØ§ ÙÙ Ø§ÙÙØ§ÙÙØ© ÙÙ Ø§ÙÙØ±Ø­ÙØ© C (Ø¢Ø®Ø± Ø³Ø·Ø±): ÙÙØ§ Ø§ÙØ¨ÙØ§Ø¡ ÙØ­Ø¯ ÙØ¨ÙÙØ§Ø ÙØ§ÙÙÙÙ Ø¨ÙØªØ·Ø¨ÙÙ ÙÙØªØ®ØªØ¨Ø± ØªØ­Øª.
  [ "$rel" = "migrations/0023_inventory_removal.sql" ] && { SKIPPED_0023=yes; break; }
  f="$DBDIR/$rel"
  [ -f "$f" ] || stop "B01 build list" "missing $rel"
  n=$((n + 1))
  runf="$f"
  if [ "$kind" = "apply" ] && grep -q 'zell\.approved_by' "$f"; then
    runf="$TMP/run_$n.sql"
    sed "0,/^begin;\$/s//begin;\nset local zell.approved_by = 'ci-0023-build';/" "$f" > "$runf"
  fi
  pg_f "$DB" "$runf" > "$TMP/build_$n.log" 2>&1 || stop "B01 build step $n $rel" "$(tailof "$TMP/build_$n.log")"
done < "$LIST"
shape=$(su_q "$DB" -c "select rolsuper::text || ',' || rolbypassrls::text from pg_catalog.pg_roles where rolname = 'postgres'")
st=$(state)
ok=no; [ "$n" -gt 10 ] && [ "$shape" = "false,true" ] && [ "$st" = "$BEFORE_STATE" ] && [ "${SKIPPED_0023:-no}" = "yes" ] && ok=yes
record "B01 database built from build_from_scratch.list up to before 0023 ($n steps, 0023 line skipped), postgres not superuser, inventory + 0022 present ($BEFORE_STATE)" "$ok" "steps=$n postgres=$shape state=$st skipped_0023=${SKIPPED_0023:-no}"
[ "$ok" = yes ] || finish
run_file "$V22" "$TMP/v22_before.out"
ok=no; [ "$(summary_of "$TMP/v22_before.out" | cut -d'|' -f7)" = "PASS" ] && ok=yes
record "B02 verify 0022 before 0023 = PASS" "$ok" "$(summary_of "$TMP/v22_before.out") $(fails_of "$TMP/v22_before.out")"

# ---- 3) Ø¨ÙØ§ÙØ§Øª CI ----
q "insert into auth.users (id, email) values ('$OWNER_ID', 'ci-owner-0023@example.invalid')" > "$TMP/x1.log"
q "insert into public.admin_users (user_id, role, is_active) values ('$OWNER_ID', 'owner', true)" >> "$TMP/x1.log"
P_PLAIN=$(q "insert into public.products (name_ar, price_per_meter_piastres, is_active) values ('ci-0023-plain', 1000, false) returning id")
P_HOME=$(q "insert into public.products (name_ar, price_per_meter_piastres, is_active) values ('ci-0023-home', 1000, false) returning id")
q "insert into public.settings (key, value) values ('home_products', '{\"mode\": \"selected\", \"ids\": [$P_HOME], \"allLabel\": \"\"}')
   on conflict (key) do update set value = excluded.value" >> "$TMP/x1.log"
su_q "$DB" -c "set session_replication_role = replica" \
  -c "insert into public.suppliers (name, name_key, created_by, updated_by) values ('CI supplier 0023', 'ci supplier 0023', '$OWNER_ID', '$OWNER_ID')" >> "$TMP/x1.log" 2>&1
EXP=$(data_line)
chk=$(q "select (select pg_catalog.count(*) from public.admin_users where user_id = '$OWNER_ID' and role = 'owner' and is_active)
         || '|' || (select pg_catalog.count(*) from public.products where name_ar like 'ci-0023-%')")
ok=no; [ "$chk" = "1|2" ] && printf '%s' "$EXP" | grep -q ' suppliers=1 ' && ok=yes
record "X01 CI data: owner ...b1, products $P_PLAIN (plain) and $P_HOME (in home), one supplier; expected data line = [$EXP]" "$ok" "$chk $(tailof "$TMP/x1.log")"

# ---- 4) Ø±Ø¯ ÙØ¹Ø§ÙÙØ© ÙØ­Ø°Ù Ø§ÙÙÙØªØ¬ ÙØ¨Ù Ø§ÙØªØ·Ø¨ÙÙ (Ø§ÙØ­Ø°Ù Ø¬ÙÙ ÙØ¹Ø§ÙÙØ© Ø¨ØªØ±Ø¬Ø¹) ----
upd_plain=$(q "select updated_at::text from public.products where id = $P_PLAIN")
upd_home=$(q "select updated_at::text from public.products where id = $P_HOME")
PV1=$(owner_call "select public.zell_product_delete_preview($P_PLAIN)::text")
PV2=$(owner_call "select public.zell_product_delete_preview($P_HOME)::text")
DL1=$(owner_call "select public.zell_product_delete($P_PLAIN, '$upd_plain'::timestamptz)::text")
DL2=$(owner_call "select public.zell_product_delete($P_HOME, '$upd_home'::timestamptz)::text")
ok=no
printf '%s' "$PV1" | grep -q '"has_stock": false' && printf '%s' "$PV2" | grep -q '"in_home": true' \
  && printf '%s' "$DL1" | grep -q '"deleted": true' && printf '%s' "$DL2" | grep -q '"removed_from_home": true' && ok=yes
record "P01 owner preview + delete (rolled back) before 0023: has_stock false, in_home, deleted, removed_from_home" "$ok" "pv1=$PV1 pv2=$PV2 dl1=$DL1 dl2=$DL2"
FP0=$(fp_out)

# ---- 4Ø¨) Ø§ÙÙ 9 verify Ø§ÙÙÙØ¬ÙØ¯Ø© ÙØ¨Ù 0023 (ÙØ±Ø§Ø¬Ø¹Ø© #195 B3) ----
verifies before
ok=no; verifies_pass before && ok=yes
record "E01 the 9 existing verifies before 0023 (A1 Â· D Â· P1 Â· P2 Â· D2 Â· TR Â· TR2 Â· EX Â· 0021-P strict) = PASS" "$ok" "$(verifies_detail before)"

# ---- 5) Ø­Ø±Ø§Ø³ Ø§ÙÙ preflight (ÙÙÙÙ ÙØ¨Ù Ø§ÙØªØ·Ø¨ÙÙØ ÙØ§ÙØ­Ø§ÙØ© ÙØ§Ø¨ØªØªØºÙÙØ±Ø´) ----
run_with "$APPLY" "" "$EXP" "$TMP/g1.out"
ok=no; has "$TMP/g1.out" 'ZELL_0023_APPROVAL_MISSING' && [ "$(state)" = "$BEFORE_STATE" ] && ok=yes
record "G01 apply without the approval line -> ZELL_0023_APPROVAL_MISSING, nothing changed" "$ok" "$(tailof "$TMP/g1.out")"
run_with "$APPLY" "ci-0023" "" "$TMP/g2.out"
ok=no; has "$TMP/g2.out" 'ZELL_0023_DATA_CHANGED' && [ "$(state)" = "$BEFORE_STATE" ] && ok=yes
record "G02 apply without the expected-data line -> ZELL_0023_DATA_CHANGED, nothing changed" "$ok" "$(tailof "$TMP/g2.out")"
run_with "$APPLY" "ci-0023" "$EXP x" "$TMP/g3.out"
ok=no; has "$TMP/g3.out" 'ZELL_0023_DATA_CHANGED' && [ "$(state)" = "$BEFORE_STATE" ] && ok=yes
record "G03 apply with a different expected-data line -> ZELL_0023_DATA_CHANGED, nothing changed" "$ok" "$(tailof "$TMP/g3.out")"
run_with "$APPLY" "ci-0023" "$EXP" "$TMP/g4.out" "set local role service_role;"
ok=no; has "$TMP/g4.out" 'ZELL_0023_WRONG_CALLER' && [ "$(state)" = "$BEFORE_STATE" ] && ok=yes
record "G04 apply by another role -> ZELL_0023_WRONG_CALLER, nothing changed" "$ok" "$(tailof "$TMP/g4.out")"

# ---- 5Ø¨) ÙØ¯Ø§Ø¡ zell_inv_* ÙÙ Ø¯Ø§ÙØ© Ø¨Ø±ÙÙ Ø§ÙÙØ®Ø²ÙÙ (ÙØ±Ø§Ø¬Ø¹Ø© #195 B2) ----
su_q "$DB" -c "create function public.ci_0023_calls_inv() returns boolean language plpgsql as \$g5\$ begin return public.zell_inv_product_stock_ref_exists(1); end \$g5\$" > "$TMP/g5c.log" 2>&1
run_with "$APPLY" "ci-0023" "$EXP" "$TMP/g5.out"
st=$(state)
su_q "$DB" -c "drop function public.ci_0023_calls_inv()" >> "$TMP/g5c.log" 2>&1
ok=no; has "$TMP/g5.out" 'ZELL_0023_SHAPE' && [ "$st" = "$BEFORE_STATE" ] && [ "$(fp_out)" = "$FP0" ] && ok=yes
record "G05 a plpgsql function outside inventory calls zell_inv_* (no dependency recorded) -> ZELL_0023_SHAPE, nothing changed; then dropped" "$ok" "state=$st $(tailof "$TMP/g5c.log") $(tailof "$TMP/g5.out")"

# ---- 5Ø¬) Ø§ÙØªØ²Ø§ÙÙ (ÙØ±Ø§Ø¬Ø¹Ø© #195 B1): ÙÙÙ Ø§ÙØ¬Ø¯Ø§ÙÙ Ø§ÙØ¹Ø´Ø±Ø© ÙØ¨Ù Ø£ÙÙ ÙØ±Ø§ÙØ© Ø¨ÙØ§ÙØ§Øª ----
# C02-CLOCK Â§Ø¬: ÙØ¹Ø§ÙØ±Ø© Îµ ÙØ¨Ù C01 + Ø­Ø§ÙØ© Ø³Ø§Ø¹Ø© Ø§ÙØ¬ÙØ§Ø² (ÙØ¹ÙÙÙØ§Øª Ø¨Ø³)
EPS_PRE=$(clock_eps); clock_state before-C01
C1_WD=""; C1_MD=""; C1_T=""; C2_WD=""; C2_MD=""; C2_T=""
holder "CI supplier 0023 C01" 3 commit "$TMP/c1h.out" &
hp=$!
if wait_holder; then
  w0=$(wall_ms); m0=$(mono_ms)
  t0=$(now_ms); run_with "$APPLY" "ci-0023" "$EXP" "$TMP/c1.out"; t1=$(now_ms)
  m1=$(mono_ms); w1=$(wall_ms)
  C1_T=$((t1 - t0))
  if isnum "$w0" && isnum "$m0" && isnum "$m1" && isnum "$w1"; then C1_WD=$((w1 - w0)); C1_MD=$((m1 - m0)); fi
  wait "$hp"; hrc=$?
  st=$(state); fp=$(fp_out)
  kept=$(su_q "$DB" -c "select pg_catalog.count(*) from public.suppliers where name_key = 'ci supplier 0023 c01'")
  su_q "$DB" -c "set session_replication_role = replica" -c "delete from public.suppliers where name_key = 'ci supplier 0023 c01'" > "$TMP/c1c.log" 2>&1
  ok=no
  has "$TMP/c1.out" 'ZELL_0023_DATA_CHANGED' && has "$TMP/c1.out" ' suppliers=2 ' && [ "$hrc" -eq 0 ] && [ "$kept" = "1" ] && [ $((t1 - t0)) -ge 1500 ] \
    && [ "$st" = "$BEFORE_STATE" ] && [ "$fp" = "$FP0" ] && [ "$(data_line)" = "$EXP" ] && ok=yes
  record "C01 a supplier insert in flight commits while apply waits on the preflight lock ($((t1 - t0)) ms) -> ZELL_0023_DATA_CHANGED (suppliers=2); the supplier is kept, nothing changed" "$ok" "holder_rc=$hrc kept=$kept state=$st $(tailof "$TMP/c1.out") $(tailof "$TMP/c1h.out") $(tailof "$TMP/c1c.log")"
  echo "C01_CHECKS data_changed=$(yn has "$TMP/c1.out" 'ZELL_0023_DATA_CHANGED') suppliers2=$(yn has "$TMP/c1.out" ' suppliers=2 ') holder_rc0=$(yn [ "$hrc" -eq 0 ]) kept=$(yn [ "$kept" = "1" ]) state_before=$(yn [ "$st" = "$BEFORE_STATE" ]) fp_before=$(yn [ "$fp" = "$FP0" ]) data_expected=$(yn [ "$(data_line)" = "$EXP" ])"
else
  wait "$hp"; record "C01 a supplier insert in flight" no "the second session never took its lock: $(tailof "$TMP/c1h.out")"
fi
holder "CI supplier 0023 C02" 8 rollback "$TMP/c2h.out" &
hp=$!
if wait_holder; then
  w0=$(wall_ms); m0=$(mono_ms)
  t0=$(now_ms); run_with "$APPLY" "ci-0023" "$EXP" "$TMP/c2.out"; t1=$(now_ms)
  m1=$(mono_ms); w1=$(wall_ms)
  C2_T=$((t1 - t0))
  if isnum "$w0" && isnum "$m0" && isnum "$m1" && isnum "$w1"; then C2_WD=$((w1 - w0)); C2_MD=$((m1 - m0)); fi
  st=$(state); fp=$(fp_out)
  wait "$hp"; hrc=$?
  ok=no
  has "$TMP/c2.out" '55P03' && has "$TMP/c2.out" 'lock timeout' && has "$TMP/c2.out" 'lock table public.inventory_locations' && ! grep -q 'ZELL_0023_' "$TMP/c2.out" \
    && [ $((t1 - t0)) -ge 4500 ] && [ "$hrc" -eq 0 ] && [ "$st" = "$BEFORE_STATE" ] && [ "$fp" = "$FP0" ] && [ "$(data_line)" = "$EXP" ] && ok=yes
  record "C02 a writer holds suppliers longer than lock_timeout -> apply stops on the preflight lock after $((t1 - t0)) ms (55P03), nothing changed, the writer's row rolled back" "$ok" "holder_rc=$hrc state=$st $(tailof "$TMP/c2.out") $(tailof "$TMP/c2h.out")"
  echo "C02_CHECKS 55P03=$(yn has "$TMP/c2.out" '55P03') lock_timeout=$(yn has "$TMP/c2.out" 'lock timeout') lock_table=$(yn has "$TMP/c2.out" 'lock table public.inventory_locations') no_zell=$(yn not_has "$TMP/c2.out" 'ZELL_0023_') holder_rc0=$(yn [ "$hrc" -eq 0 ]) state_before=$(yn [ "$st" = "$BEFORE_STATE" ]) fp_before=$(yn [ "$fp" = "$FP0" ]) data_expected=$(yn [ "$(data_line)" = "$EXP" ])"
else
  wait "$hp"; record "C02 a writer holds suppliers longer than lock_timeout" no "the second session never took its lock: $(tailof "$TMP/c2h.out")"
fi
# C02-CLOCK Â§Ø¬: ÙØ¹Ø§ÙØ±Ø© Îµ Ø¨Ø¹Ø¯ C02 + Ø­Ø§ÙØ© Ø³Ø§Ø¹Ø© Ø§ÙØ¬ÙØ§Ø² + Ø³Ø·ÙØ± Ø§ÙØªÙÙÙØª (ÙØ¹ÙÙÙØ§Øª Ø¨Ø³Ø ÙØ§Ø¨ØªØºÙÙØ±Ø´ Ø£Ù ÙØªÙØ¬Ø©)
EPS_POST=$(clock_eps); clock_state after-C02
EPS="n/a"
if isnum "$EPS_PRE" && isnum "$EPS_POST"; then EPS=$EPS_PRE; [ "$EPS_POST" -gt "$EPS" ] && EPS=$EPS_POST; elif isnum "$EPS_PRE"; then EPS=$EPS_PRE; elif isnum "$EPS_POST"; then EPS=$EPS_POST; fi
echo "CLOCK_EPS pre=$EPS_PRE post=$EPS_POST eps=$EPS"
timing_line() {
  if isnum "$2" && isnum "$3"; then echo "$1 wall=$2 mono=$3 diff=$(($2 - $3)) eps=$EPS t=$4"; else echo "$1 n/a wall=$2 mono=$3 eps=$EPS t=$4"; fi
}
timing_line C01_TIMING "$C1_WD" "$C1_MD" "$C1_T"
timing_line C02_TIMING "$C2_WD" "$C2_MD" "$C2_T"

# ---- 6) Ø§ÙÙØ¹Ø§ÙÙØ© Ø¨ØªØ±Ø¬Ø¹ ÙÙÙØ§: ÙÙØ³ Ø§ÙÙÙÙ Ø¨Ø®Ø·Ø£ ÙÙØµÙØ¯ Ø¨Ø¹Ø¯ Ø¢Ø®Ø± Ø®Ø·ÙØ© ÙÙØ¨Ù commit ----
sed "s/^commit;\$/do \$z23\$ begin raise exception 'ZELL_CI_ABORT_AFTER_BODY'; end \$z23\$;\ncommit;/" "$APPLY" > "$TMP/abort.sql"
run_with "$TMP/abort.sql" "ci-0023" "$EXP" "$TMP/z1.out"
ok=no; has "$TMP/z1.out" 'ZELL_CI_ABORT_AFTER_BODY' && ! grep -q 'ZELL_0023_' "$TMP/z1.out" && [ "$(state)" = "$BEFORE_STATE" ] && [ "$(fp_out)" = "$FP0" ] && ok=yes
record "Z01 body runs to the end, then a forced error rolls everything back (state + outside fingerprint = before)" "$ok" "state=$(state) $(tailof "$TMP/z1.out")"

# ---- 7) ptest ÙØ¨Ù Ø§ÙØªØ·Ø¨ÙÙ ----
run_with "$PTEST" "" "$EXP" "$TMP/ptest.out"
ok=no; [ "$(summary_of "$TMP/ptest.out" | cut -d'|' -f7)" = "PASS" ] && ok=yes
record "T01 ptest -> PASS (5 pass, 0 fail)" "$ok" "$(summary_of "$TMP/ptest.out") $(fails_of "$TMP/ptest.out") $(tailof "$TMP/ptest.out")"
ok=no; [ "$(state)" = "$BEFORE_STATE" ] && [ "$(fp_out)" = "$FP0" ] && ok=yes
record "T02 ptest leaves nothing (state + outside fingerprint = before)" "$ok" "state=$(state)"

# ---- 8) Ø§ÙØªØ·Ø¨ÙÙ ----
run_with "$APPLY" "ci-0023" "$EXP" "$TMP/apply.out"
ok=no; ! grep -q 'ERROR' "$TMP/apply.out" && [ "$(state)" = "$AFTER_STATE" ] && ok=yes
record "A01 apply -> commit; inventory gone and product delete replaced ($AFTER_STATE)" "$ok" "state=$(state) $(tailof "$TMP/apply.out")"
run_file "$VERIFY" "$TMP/v23.out"
ok=no; [ "$(summary_of "$TMP/v23.out" | cut -d'|' -f7)" = "PASS" ] && ok=yes
record "A02 verify 0023 -> PASS (4 checks)" "$ok" "$(summary_of "$TMP/v23.out") $(fails_of "$TMP/v23.out")"
ok=no; [ "$(fp_out)" = "$FP0" ] && ok=yes
record "A03 everything outside inventory unchanged (independent fingerprint: functions Â· tables Â· roles Â· constraints Â· rows)" "$ok" "before=$FP0 after=$(fp_out)"
PA1=$(owner_call "select public.zell_product_delete_preview($P_PLAIN)::text")
PA2=$(owner_call "select public.zell_product_delete_preview($P_HOME)::text")
DA1=$(owner_call "select public.zell_product_delete($P_PLAIN, '$upd_plain'::timestamptz)::text")
DA2=$(owner_call "select public.zell_product_delete($P_HOME, '$upd_home'::timestamptz)::text")
ok=no; [ "$PA1" = "$PV1" ] && [ "$PA2" = "$PV2" ] && [ "$DA1" = "$DL1" ] && [ "$DA2" = "$DL2" ] && ok=yes
record "A04 product delete preview + delete responses after 0023 = before, byte for byte (has_stock false, same keys)" "$ok" "pv1=$PA1 pv2=$PA2 dl1=$DA1 dl2=$DA2"
run_file "$V22" "$TMP/v22_after.out"
# verify 0022 ØªØ§Ø±ÙØ®Ù ÙÙØ§Ø¨ÙØªØ¹Ø¯ÙÙØ´ (ÙØ±Ø§Ø± Ø§ÙÙØ±Ø§Ø¬Ø¹Ø©): Ø¨Ø¹Ø¯ 0023 Ø¨ÙÙÙ Ø¹ÙØ¯ Ø£ÙÙ Ø¥Ø´Ø§Ø±Ø© ÙÙØ¯ÙØ± Ø§ÙÙÙ Ø§ØªØ´Ø§ÙØ ÙÙÙ ØºÙØ± Ø£Ù ØµÙ ÙÙØ®Øµ.
# Ø®ØµØ§Ø¦Øµ Ø¯Ø§ÙØªÙÙ Ø§ÙØ­Ø°Ù Ø¨Ø¹Ø¯ 0023 Ø¨ÙØºØ·ÙÙØ§ V02 ÙÙ verify 0023 (Ø§ÙÙØ§ÙÙ Â· security definer Â· config Â· EXECUTE Â· Ø§ÙØ¨ØµÙØ©).
ok=no; has "$TMP/v22_after.out" 'role "zell_inventory_definer" does not exist' && [ -z "$(summary_of "$TMP/v22_after.out")" ] && ok=yes
record "A05 verify 0022 after 0023 stops on the removed role zell_inventory_definer (historical file, not edited); delete functions covered by 0023 V02" "$ok" "$(tailof "$TMP/v22_after.out")"

# ---- 8Ø¨) Ø¨Ø¹Ø¯ 0023: Ø§ÙÙ 9 verify Ø§ÙÙÙØ¬ÙØ¯Ø© (ÙÙØ³ Ø§ÙÙØªØ¬Ù) ÙØ¹ÙØ¯ Ø§Ø³ØªØ¯Ø¹Ø§Ø¡ Ø§ÙØªØ·Ø¨ÙÙØ§Øª (ÙØ±Ø§Ø¬Ø¹Ø© #195 B3) ----
verifies after
diffs=""
for item in $VLIST; do tag=${item%%:*}; cmp -s "$TMP/vec_before_$tag" "$TMP/vec_after_$tag" || diffs="$diffs $tag"; done
ok=no; verifies_pass after && [ -z "$diffs" ] && ok=yes
record "E02 the same 9 verifies after 0023 = PASS, and every check_id=ok vector = before" "$ok" "vectors changed:${diffs:- none} $(verifies_detail after)"

# Apply 0033 INSPECTION-TOGGLE before K01 baseline contract check
if su_f "$DB" "$MIG/0033_inspection_enabled_setting.sql" > "$TMP/j01_apply.log" 2>&1; then
  record "J01 apply 0033 inspection_enabled_setting" yes ""
else
  record "J01 apply 0033 inspection_enabled_setting" no "$(tailof "$TMP/j01_apply.log")"
fi
# ÙÙØ³ Ø­Ø§Ø±Ø³ BASELINE K02 (call_contract.mjs) Ø¹ÙÙ Ø§ÙØ¯Ø§ØªØ§Ø¨ÙØ² Ø¨Ø¹Ø¯ 0023: ÙÙ Ø¯Ø§ÙØ© Ø¨ØªÙØ§Ø¯ÙÙØ§ Ø§ÙØªØ·Ø¨ÙÙØ§Øª ÙÙØ¬ÙØ¯Ø© Ø¨Ø£Ø³ÙØ§Ø¡ ÙØ¹Ø§ÙÙØ§ØªÙØ§ ÙØµÙØ§Ø­ÙØ§ØªÙØ§.
# --later skip: Ø§ÙØ¯Ø§ØªØ§Ø¨ÙØ² ÙÙØ§ ÙØ¨ÙÙØ© ÙØ­Ø¯ ÙØ¨Ù 0023Ø ÙØ¯ÙØ§Ù Ø§ÙÙ migrations Ø§ÙÙÙ Ø¨Ø¹Ø¯ÙØ§ ÙÙ Ø§ÙÙØ§ÙÙØ© (0024) ÙØ´ ÙÙØ¬ÙØ¯Ø© (call_contract_policy.json later).
if node "$CIDIR/call_contract.mjs" --root "$ROOT" --policy "$CIDIR/call_contract_policy.json" --sql "$TMP/cc.sql" --later skip > "$TMP/cc_static.log" 2>&1; then
  psql -X -q -tA -v ON_ERROR_STOP=1 -v VERBOSITY=verbose -U "$SUPER" -d "$DB" -f "$TMP/cc.sql" < /dev/null > "$TMP/cc_db.log" 2>&1; rc=$?
  fails=$(grep -c '^CALL FAIL ' "$TMP/cc_db.log" || true)
  passes=$(grep -c '^CALL PASS ' "$TMP/cc_db.log" || true)
  checks=$(grep -oE '"checks":[0-9]+' "$TMP/cc_static.log" | head -n 1 | cut -d: -f2)
  ok=no
  [ "$rc" -eq 0 ] && [ "$fails" = "0" ] && [ -n "$checks" ] && [ "$passes" = "$checks" ] && ! grep -qE '^(PENDING|STALE_PENDING) ' "$TMP/cc_static.log" && ok=yes
  record "K01 call contract of the apps on the database after 0023: $passes of ${checks:-?} checks, no CALL FAIL" "$ok" "rc=$rc fails=$fails $(grep '^CALL FAIL ' "$TMP/cc_db.log" | head -n 5 | tr '\n' ' ') $(tailof "$TMP/cc_db.log")"
else
  record "K01 call contract of the apps on the database after 0023 (static part failed)" no "$(tailof "$TMP/cc_static.log")"
fi

# ---- 9) Ø§ÙØ¥Ø¹Ø§Ø¯Ø© ----
run_with "$APPLY" "ci-0023" "$EXP" "$TMP/r1.out"
ok=no; has "$TMP/r1.out" 'ZELL_0023_ALREADY_APPLIED' && [ "$(state)" = "$AFTER_STATE" ] && ok=yes
record "R01 apply twice -> ZELL_0023_ALREADY_APPLIED, nothing changed" "$ok" "$(tailof "$TMP/r1.out")"

finish
