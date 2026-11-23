-- 0030 COUPON-DELETE — سيناريوهات flows (CI): بتتشغّل بعد تطبيق 0030 على قاعدة مبنية
-- من build_from_scratch.list (backend/db/ci/0030_sql_ci.sh). معاملة واحدة بتترجع.
-- النتيجة: صف summary أول (0|summary|PASS|pass=10 fail=0) بصيغة 0026.

begin;
set local idle_in_transaction_session_timeout = '30s';

create temporary table zt_results (n serial, id text, outcome text, detail text) on commit drop;

-- تفعيل مفتاح الكوبونات جوه المعاملة (القاعدة المبنية من الصفر بتتزرع مقفولة من 0019).
update public.settings set value = 'true'::jsonb where key = 'coupons_enabled';
do $zchk$
declare
  v_pid bigint;
  v_free bigint;
  v_used bigint;
  v_can bigint;
  v_live bigint;
  v_state text;
  v_res text;
  v_json jsonb;
  v_ord jsonb;
  v_ord_id bigint;
  v_cnt integer;
  v_act boolean;
  v_rev timestamptz;
begin
  -- منتج للطلبات: أصغر منتج مفعّل، ولو مفيش يتعمل واحد.
  select id into v_pid from public.products where is_active order by id limit 1;
  if v_pid is null then
    insert into public.products (name_ar, price_per_meter_piastres, is_active)
    values ('ci-0030-prod', 15000, true) returning id into v_pid;
  end if;

  insert into public.coupons (code, kind, percent_off, is_active) values
    ('DELFREE30', 'percent', 10, true),
    ('DELUSED30', 'percent', 10, true),
    ('DELCAN30', 'percent', 10, true),
    ('DELLIVE30', 'percent', 10, true);
  select id into v_free from public.coupons where code = 'DELFREE30';
  select id into v_used from public.coupons where code = 'DELUSED30';
  select id into v_can from public.coupons where code = 'DELCAN30';
  select id into v_live from public.coupons where code = 'DELLIVE30';

  -- T06: طلب تحكم بكوبون حي — بينجح وبيسجل خصم (وبيخلي DELUSED30 مستخدم).
  begin
    v_ord := public.zell_create_order(
      pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object('productId', v_pid, 'lengthCm', 300)),
      'عميل تجربة', '01000000301', 'القاهرة', 'شارع التجربة رقم ١', null,
      'ci30-t06-' || pg_catalog.gen_random_uuid()::text,
      pg_catalog.md5(pg_catalog.gen_random_uuid()::text) || pg_catalog.md5(pg_catalog.gen_random_uuid()::text),
      pg_catalog.repeat('a', 64), pg_catalog.repeat('b', 64), null, false, 'DELUSED30');
    v_state := 'ok';
  exception when others then
    v_state := 'E' || sqlstate;
  end;
  insert into pg_temp.zt_results (id, outcome, detail) values ('T06',
    case when v_state = 'ok' and (v_ord ->> 'discount_piastres')::integer > 0
              and v_ord ->> 'coupon_code' = 'DELUSED30' then 'pass' else 'fail' end,
    'control order with live coupon -> ' || v_state || ' disc=' || coalesce(v_ord ->> 'discount_piastres', '-'));

  -- T02: حذف كوبون مستخدم -> archived + revoked_at + is_active=false.
  v_res := public.zell_delete_coupon(v_used);
  select pg_catalog.count(*), pg_catalog.bool_and(is_active), pg_catalog.max(revoked_at)
    into v_cnt, v_act, v_rev from public.coupons where id = v_used;
  insert into pg_temp.zt_results (id, outcome, detail) values ('T02',
    case when v_res = 'archived' and v_cnt = 1 and v_act = false and v_rev is not null then 'pass' else 'fail' end,
    'delete used -> ' || v_res || ' rows=' || v_cnt || ' active=' || v_act || ' revoked=' || (v_rev is not null));

  -- T10: حذف المؤرشف تاني -> archived تاني (idempotent)، والصف لسه موجود.
  v_res := public.zell_delete_coupon(v_used);
  select pg_catalog.count(*) into v_cnt from public.coupons where id = v_used;
  insert into pg_temp.zt_results (id, outcome, detail) values ('T10',
    case when v_res = 'archived' and v_cnt = 1 then 'pass' else 'fail' end,
    're-delete archived -> ' || v_res || ' rows=' || v_cnt);

  -- T03: معاينة المؤرشف -> رفض 45070.
  begin
    v_json := public.zell_preview_coupon('DELUSED30');
    v_state := 'no-error';
  exception when others then
    v_state := sqlstate;
  end;
  insert into pg_temp.zt_results (id, outcome, detail) values ('T03',
    case when v_state = '45070' then 'pass' else 'fail' end,
    'preview archived -> ' || v_state);

  -- T05: إنشاء طلب بالمؤرشف -> رفض 45070.
  begin
    v_ord := public.zell_create_order(
      pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object('productId', v_pid, 'lengthCm', 300)),
      'عميل تجربة', '01000000305', 'القاهرة', 'شارع التجربة رقم ١', null,
      'ci30-t05-' || pg_catalog.gen_random_uuid()::text,
      pg_catalog.md5(pg_catalog.gen_random_uuid()::text) || pg_catalog.md5(pg_catalog.gen_random_uuid()::text),
      pg_catalog.repeat('a', 64), pg_catalog.repeat('b', 64), null, false, 'DELUSED30');
    v_state := 'no-error';
  exception when others then
    v_state := sqlstate;
  end;
  insert into pg_temp.zt_results (id, outcome, detail) values ('T05',
    case when v_state = '45070' then 'pass' else 'fail' end,
    'create order with archived -> ' || v_state);

  -- T08: محاولة إعادة تفعيل على مستوى SQL (is_active=true) — المعاينة لسه بترفض 45070.
  update public.coupons set is_active = true where id = v_used;
  begin
    v_json := public.zell_preview_coupon('DELUSED30');
    v_state := 'no-error';
  exception when others then
    v_state := sqlstate;
  end;
  insert into pg_temp.zt_results (id, outcome, detail) values ('T08',
    case when v_state = '45070' then 'pass' else 'fail' end,
    'reactivated-at-SQL archived preview -> ' || v_state);

  -- T07: كوبون مرجعه الوحيد طلب ملغي -> archived مش deleted.
  begin
    v_ord := public.zell_create_order(
      pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object('productId', v_pid, 'lengthCm', 300)),
      'عميل تجربة', '01000000307', 'القاهرة', 'شارع التجربة رقم ١', null,
      'ci30-t07-' || pg_catalog.gen_random_uuid()::text,
      pg_catalog.md5(pg_catalog.gen_random_uuid()::text) || pg_catalog.md5(pg_catalog.gen_random_uuid()::text),
      pg_catalog.repeat('a', 64), pg_catalog.repeat('b', 64), null, false, 'DELCAN30');
    v_state := 'ok';
  exception when others then
    v_state := 'E' || sqlstate;
  end;
  if v_state = 'ok' then
    select id into v_ord_id from public.orders where order_number = v_ord ->> 'order_number';
    update public.orders set status = 'cancelled' where id = v_ord_id;
    v_res := public.zell_delete_coupon(v_can);
  else
    v_res := 'setup-failed:' || v_state;
  end if;
  insert into pg_temp.zt_results (id, outcome, detail) values ('T07',
    case when v_res = 'archived' then 'pass' else 'fail' end,
    'cancelled-only reference delete -> ' || v_res);

  -- T01: حذف كوبون بلا طلبات -> deleted + الصف اختفى.
  v_res := public.zell_delete_coupon(v_free);
  select pg_catalog.count(*) into v_cnt from public.coupons where id = v_free;
  insert into pg_temp.zt_results (id, outcome, detail) values ('T01',
    case when v_res = 'deleted' and v_cnt = 0 then 'pass' else 'fail' end,
    'delete unused -> ' || v_res || ' rows=' || v_cnt);

  -- T09: حذف رقم مش موجود -> not_found.
  v_res := public.zell_delete_coupon(999999999);
  insert into pg_temp.zt_results (id, outcome, detail) values ('T09',
    case when v_res = 'not_found' then 'pass' else 'fail' end,
    'delete missing -> ' || v_res);

  -- T04: معاينة كوبون حي — نفس عقد 0019 بالحرف: ok=true و7 مفاتيح بس.
  begin
    v_json := public.zell_preview_coupon('DELLIVE30');
    v_state := 'ok';
  exception when others then
    v_state := sqlstate;
  end;
  insert into pg_temp.zt_results (id, outcome, detail) values ('T04',
    case when v_state = 'ok' and (v_json ->> 'ok') = 'true'
              and (select pg_catalog.string_agg(k, ',' order by k) from pg_catalog.jsonb_object_keys(v_json) as k)
                  = 'amount_off_piastres,code,kind,max_discount_piastres,min_subtotal_piastres,ok,percent_off'
         then 'pass' else 'fail' end,
    'preview live parity -> ' || v_state || ' keys=' ||
      coalesce((select pg_catalog.string_agg(k, ',' order by k) from pg_catalog.jsonb_object_keys(v_json) as k), '-'));
end
$zchk$;

select s.n, s.id, s.outcome, s.detail
  from (select 0 as n, 'summary'::text as id,
               case when pg_catalog.count(*) filter (where r.outcome = 'fail') = 0 and pg_catalog.count(*) = 10 then 'PASS' else 'FAIL' end as outcome,
               'pass=' || pg_catalog.count(*) filter (where r.outcome = 'pass') || ' fail=' || pg_catalog.count(*) filter (where r.outcome = 'fail') as detail
          from pg_temp.zt_results r
        union all
        select r.n, r.id, r.outcome, r.detail from pg_temp.zt_results r) s
 order by s.n;
rollback;
