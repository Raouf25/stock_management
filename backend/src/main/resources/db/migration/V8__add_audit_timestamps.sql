-- V8: Add created_at / updated_at audit columns to entities that lack them
--
-- Existing rows receive NOW() as a baseline; going forward the application sets
-- these values via @PrePersist / @PreUpdate lifecycle callbacks.

-- ── bill ─────────────────────────────────────────────────────────────────────
ALTER TABLE bill
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

UPDATE bill SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL;

ALTER TABLE bill
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN updated_at SET NOT NULL;

-- ── product ───────────────────────────────────────────────────────────────────
ALTER TABLE product
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

UPDATE product SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL;

ALTER TABLE product
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN updated_at SET NOT NULL;

-- ── sale ─────────────────────────────────────────────────────────────────────
ALTER TABLE sale
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;

UPDATE sale SET created_at = NOW() WHERE created_at IS NULL;

ALTER TABLE sale
    ALTER COLUMN created_at SET NOT NULL;

-- ── purchase ──────────────────────────────────────────────────────────────────
ALTER TABLE purchase
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;

UPDATE purchase SET created_at = NOW() WHERE created_at IS NULL;

ALTER TABLE purchase
    ALTER COLUMN created_at SET NOT NULL;

-- ── supplier ──────────────────────────────────────────────────────────────────
ALTER TABLE supplier
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

UPDATE supplier SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL;

ALTER TABLE supplier
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN updated_at SET NOT NULL;

-- ── customer (already has created_at — add updated_at only) ───────────────────
ALTER TABLE customer
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

UPDATE customer SET updated_at = NOW() WHERE updated_at IS NULL;

-- ── users (already has created_at — add updated_at only) ──────────────────────
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

UPDATE users SET updated_at = NOW() WHERE updated_at IS NULL;
