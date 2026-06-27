-- V12: Drop orphan purchase columns recreated by ddl-auto=update
--
-- Background: V7 renamed unit_pricettc → unit_price_ttc and total_amountttc → total_amount_ttc,
-- then dropped the old columns. However, SpringPhysicalNamingStrategy maps the Java field
-- `unitPriceTTC` to `unit_pricettc` (not `unit_price_ttc`), so Hibernate's ddl-auto=update
-- recreated unit_pricettc and total_amountttc as empty columns on next startup.
-- Result: all data lived in unit_price_ttc / total_amount_ttc (written via JDBC by the app)
-- while Hibernate read from the empty unit_pricettc / total_amountttc → always null.
--
-- Fix: Purchase.java now has explicit @Column(name = "unit_price_ttc") / @Column(name = "total_amount_ttc"),
-- so Hibernate will no longer touch the orphan columns. Drop them here to keep the schema clean.

ALTER TABLE purchase DROP COLUMN IF EXISTS unit_pricettc;
ALTER TABLE purchase DROP COLUMN IF EXISTS total_amountttc;
