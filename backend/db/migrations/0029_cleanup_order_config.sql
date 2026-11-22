-- 0029 - Cleanup order config log (zell_order_config_log and related functions)
--
-- This migration removes the order configuration audit table and the functions
-- that write to it. The table accumulated historical config changes and was used
-- by the now-removed order-config tracking system (Phase B2 cleanup).
--
-- Included:
-- * DROP 2 functions that wrote to zell_order_config_log
-- * DROP the audit table itself
--
-- Note: zell_order_trg_append_only() helper function is retained — it serves
-- other audit tables and will be removed when those tables are cleaned up.
-- Triggers on zell_order_config_log drop automatically with the table.

DROP FUNCTION zell_order_save_delivery_periods(timestamp with time zone, jsonb);
DROP FUNCTION zell_order_set_gate(boolean, text);
DROP TABLE zell_order_config_log;
