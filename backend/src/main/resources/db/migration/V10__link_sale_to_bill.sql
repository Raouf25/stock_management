-- V10: Add proper FK from sale to bill
--
-- Previously Sale stored invoiceNumber (string) with no referential integrity.
-- This adds a typed FK so payment status can be queried directly from the DB
-- instead of being computed as a @Transient field in the application.
--
-- The column is nullable: existing rows have no bill_id. Going forward,
-- BillService populates bill_id when a bill line item triggers a sale record.

ALTER TABLE sale
    ADD COLUMN IF NOT EXISTS bill_id BIGINT,
    ADD CONSTRAINT fk_sale_bill
        FOREIGN KEY (bill_id) REFERENCES bill(id_bill)
        ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_sale_bill ON sale(bill_id);
