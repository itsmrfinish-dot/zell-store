-- 0028 - Cleanup dead access-generation objects (erp_* and zell_erp_*)
--
-- This migration removes access control infrastructure that is no longer used
-- or maintained. Removal is safe: no application code or active migrations
-- reference these objects. Recovery path: re-apply 0021p_erp_access.sql and
-- 0021p_zell_erp_access.sql with their definitions from migration history.
--
-- Included:
-- * REVOKE EXECUTE on soft-disabled order functions (soft disable: no deletion)
-- * DROP 33 erp_* and zell_erp_* functions (verified: no overloads, no code refs)
-- * DROP 4 erp_* tables in safe order (FK-safe: alter first, no CASCADE)
-- * DROP zell_order_writer role (verified: no object ownership)

-- Step 1: Soft disable (REVOKE, not DROP) - recoverable if needed later
REVOKE EXECUTE ON FUNCTION zell_order_save_delivery_periods(timestamp with time zone, jsonb) FROM authenticated;
REVOKE EXECUTE ON FUNCTION zell_order_set_gate(boolean, text) FROM authenticated;

-- Step 2: Drop 33 functions (erp_* and zell_erp_*, no overloads)
DROP FUNCTION erp_access_apply_preset(uuid, uuid, uuid, text, integer);
DROP FUNCTION erp_access_audit_page(uuid, bigint, integer);
DROP FUNCTION erp_access_bump(uuid);
DROP FUNCTION erp_access_command_begin(uuid, uuid, text, text);
DROP FUNCTION erp_access_command_finish(uuid, uuid, text, text, jsonb, uuid, text, text[], text[], text);
DROP FUNCTION erp_access_denial(text);
DROP FUNCTION erp_access_grant(uuid, uuid, uuid, text, integer);
DROP FUNCTION erp_access_lock_user(uuid);
DROP FUNCTION erp_access_preset_keys(text);
DROP FUNCTION erp_access_reason(text, boolean);
DROP FUNCTION erp_access_request_hash(jsonb);
DROP FUNCTION erp_access_revoke(uuid, uuid, uuid, text, integer, text);
DROP FUNCTION erp_access_revoke_all(uuid, uuid, uuid, integer, text);
DROP FUNCTION erp_access_shadow_report(uuid, date);
DROP FUNCTION erp_access_snapshot(uuid);
DROP FUNCTION erp_access_target_check(uuid, uuid, text);
DROP FUNCTION erp_access_user_keys(uuid);
DROP FUNCTION erp_has_capability(uuid, text);
DROP FUNCTION erp_require_capability(uuid, text);
DROP FUNCTION zell_erp_access_apply_preset(uuid, uuid, text, integer);
DROP FUNCTION zell_erp_access_audit_page(bigint, integer);
DROP FUNCTION zell_erp_access_grant(uuid, uuid, text, integer);
DROP FUNCTION zell_erp_access_parity();
DROP FUNCTION zell_erp_access_revoke(uuid, uuid, text, integer, text);
DROP FUNCTION zell_erp_access_revoke_all(uuid, uuid, integer, text);
DROP FUNCTION zell_erp_access_shadow_report(date);
DROP FUNCTION zell_erp_access_snapshot();
DROP FUNCTION zell_erp_access_users();
DROP FUNCTION zell_erp_admin_list();
DROP FUNCTION zell_erp_admin_set_active(uuid, boolean, uuid);
DROP FUNCTION zell_erp_owner_guard_lock();
DROP FUNCTION zell_erp_owner_guard_read();
DROP FUNCTION zell_erp_set_user_active(uuid, uuid, boolean, text);

-- Step 3: Drop 4 tables in FK-safe order
-- Note: erp_user_grants has 23 historical rows with preset_key = 'zell.admin_today'
-- (a vestigial ForeignKey reference from 0021-P v1). We drop the FK constraint
-- to allow erp_presets deletion; the column and rows remain for audit history.
ALTER TABLE erp_user_grants DROP CONSTRAINT erp_user_grants_preset_key_fkey;

-- Now drop the 4 tables (order enforced: erp_preset_items before erp_presets
-- due to FK dependency; erp_presets, then erp_commands, then erp_access_audit)
DROP TABLE erp_preset_items;
DROP TABLE erp_presets;
DROP TABLE erp_commands;
DROP TABLE erp_access_audit;

-- Step 4: Revoke permissions and drop role
-- Note: zell_order_writer holds permissions (USAGE ON SCHEMA public,
-- EXECUTE zell_create_order, zell_get_order_receipt, zell_preview_coupon).
-- Revoke permissions explicitly to allow role deletion.
REVOKE EXECUTE ON FUNCTION zell_create_order(jsonb, text, text, text, text, text, text, text, text, text, text, boolean, text, jsonb, text) FROM zell_order_writer;
REVOKE EXECUTE ON FUNCTION zell_get_order_receipt(text, text) FROM zell_order_writer;
REVOKE EXECUTE ON FUNCTION zell_preview_coupon(text) FROM zell_order_writer;
REVOKE USAGE ON SCHEMA public FROM zell_order_writer;
DROP ROLE zell_order_writer;
