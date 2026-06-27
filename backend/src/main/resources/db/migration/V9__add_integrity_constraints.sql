-- V9: Add business-rule constraints and missing unique index on product reference
--
-- These constraints act as a database-level safety net — they reject invalid data
-- even if application-level validation is bypassed.

-- ── Prevent negative stock ────────────────────────────────────────────────────
-- Fix any existing negative values first (could exist from direct DB manipulation)
UPDATE product SET current_stock_quantity = 0 WHERE current_stock_quantity < 0;

ALTER TABLE product
    ADD CONSTRAINT chk_stock_quantity_non_negative
    CHECK (current_stock_quantity >= 0);

-- ── Enforce positive transaction quantities ───────────────────────────────────
ALTER TABLE sale
    ADD CONSTRAINT chk_sale_quantity_positive
    CHECK (quantity_sold > 0);

ALTER TABLE purchase
    ADD CONSTRAINT chk_purchase_quantity_positive
    CHECK (quantity > 0);

ALTER TABLE bill_product
    ADD CONSTRAINT chk_bill_product_quantity_positive
    CHECK (quantity > 0);

ALTER TABLE delivery_note_product
    ADD CONSTRAINT chk_dnp_quantity_positive
    CHECK (quantity > 0);

-- ── Enforce discount range (0 – 100 %) ───────────────────────────────────────
ALTER TABLE bill_product
    ADD CONSTRAINT chk_bill_product_discount_range
    CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

ALTER TABLE delivery_note_product
    ADD CONSTRAINT chk_dnp_discount_range
    CHECK (discount >= 0 AND discount <= 100);

-- ── Unique product reference ──────────────────────────────────────────────────
-- NULL values are excluded from UNIQUE constraints in PostgreSQL, so products
-- without a reference are unaffected.
-- If duplicate references exist this will fail intentionally — deduplicate first.
ALTER TABLE product
    ADD CONSTRAINT uq_product_reference UNIQUE (reference);
