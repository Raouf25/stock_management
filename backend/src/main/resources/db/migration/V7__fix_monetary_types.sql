-- V7: Convert DOUBLE PRECISION monetary columns to NUMERIC(19,3)
--
-- Background: V1 created some columns as DOUBLE PRECISION which accumulates
-- floating-point rounding errors on financial calculations (CMP, totals, bilans).
-- Bill and DeliveryNote already use NUMERIC(19,3) — this aligns the rest.
--
-- Note on purchase column naming:
--   V1 created `unit_pricettc` / `total_amountttc` (camelCase collapsed).
--   Hibernate's SpringPhysicalNamingStrategy expects `unit_price_ttc` / `total_amount_ttc`.
--   If ddl-auto=update ran first, both sets of columns may exist.
--   If the app was run with ddl-auto=none/validate, only the V1 columns exist.
--   The DO block below handles all three states:
--     (a) only V1 columns exist → rename, then convert
--     (b) only Hibernate columns exist → skip rename, just convert
--     (c) both exist → skip rename (Hibernate column is the live one), convert, drop V1 orphan

-- ── purchase – normalise column names ────────────────────────────────────────
DO $$
BEGIN
    -- unit_pricettc → unit_price_ttc
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'purchase' AND column_name = 'unit_pricettc'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'purchase' AND column_name = 'unit_price_ttc'
    ) THEN
        ALTER TABLE purchase RENAME COLUMN unit_pricettc TO unit_price_ttc;
    END IF;

    -- total_amountttc → total_amount_ttc
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'purchase' AND column_name = 'total_amountttc'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'purchase' AND column_name = 'total_amount_ttc'
    ) THEN
        ALTER TABLE purchase RENAME COLUMN total_amountttc TO total_amount_ttc;
    END IF;
END $$;

-- ── sale ──────────────────────────────────────────────────────────────────────
ALTER TABLE sale
    ALTER COLUMN unit_sale_price   TYPE NUMERIC(19,3) USING unit_sale_price::NUMERIC,
    ALTER COLUMN total_sale_amount TYPE NUMERIC(19,3) USING total_sale_amount::NUMERIC;

-- ── purchase – convert to NUMERIC ────────────────────────────────────────────
ALTER TABLE purchase
    ALTER COLUMN unit_price_ttc   TYPE NUMERIC(19,3) USING unit_price_ttc::NUMERIC,
    ALTER COLUMN total_amount_ttc TYPE NUMERIC(19,3) USING total_amount_ttc::NUMERIC;

-- Drop V1 orphan columns if they still exist (case c above)
ALTER TABLE purchase DROP COLUMN IF EXISTS unit_pricettc;
ALTER TABLE purchase DROP COLUMN IF EXISTS total_amountttc;

-- ── product ───────────────────────────────────────────────────────────────────
ALTER TABLE product
    ALTER COLUMN unit_price_sold     TYPE NUMERIC(19,3) USING unit_price_sold::NUMERIC,
    ALTER COLUMN unit_price          TYPE NUMERIC(19,3) USING unit_price::NUMERIC,
    ALTER COLUMN cmp                 TYPE NUMERIC(19,3) USING cmp::NUMERIC,
    ALTER COLUMN initial_unit_price  TYPE NUMERIC(19,3) USING initial_unit_price::NUMERIC,
    ALTER COLUMN initial_stock_value TYPE NUMERIC(19,3) USING initial_stock_value::NUMERIC,
    ALTER COLUMN current_stock_value TYPE NUMERIC(19,3) USING current_stock_value::NUMERIC;

-- Drop V1 orphan column if it still exists
ALTER TABLE product DROP COLUMN IF EXISTS unit_price_bought;

-- ── bill_product ──────────────────────────────────────────────────────────────
ALTER TABLE bill_product
    ALTER COLUMN total_product_price  TYPE NUMERIC(19,3) USING total_product_price::NUMERIC;

ALTER TABLE bill_product
    ALTER COLUMN discount_percentage TYPE NUMERIC(5,2) USING discount_percentage::NUMERIC;
