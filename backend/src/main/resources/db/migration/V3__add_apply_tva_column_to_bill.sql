-- Migration V3: Add apply_tva column to bill table
-- This column determines whether VAT (19%) should be applied to the invoice

ALTER TABLE bill ADD COLUMN IF NOT EXISTS apply_tva BOOLEAN NOT NULL DEFAULT FALSE;

-- Comment on column
COMMENT ON COLUMN bill.apply_tva IS 'Indicates whether VAT (19%) should be applied to this invoice. TRUE = apply TVA, FALSE = no TVA';
