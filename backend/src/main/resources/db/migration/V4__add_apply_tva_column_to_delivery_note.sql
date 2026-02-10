-- Migration V4: Add apply_tva column to delivery_note table
-- This column determines whether VAT (19%) should be applied to the delivery note

ALTER TABLE delivery_note ADD COLUMN IF NOT EXISTS apply_tva BOOLEAN NOT NULL DEFAULT FALSE;

-- Comment on column
COMMENT ON COLUMN delivery_note.apply_tva IS 'Indicates whether VAT (19%) should be applied to this delivery note. TRUE = apply TVA, FALSE = no TVA';
