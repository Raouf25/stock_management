-- V6: Add missing indexes on FK columns and frequently filtered columns

-- sale: customer, product, date (individual + composite for date-range-by-product queries)
CREATE INDEX IF NOT EXISTS idx_sale_customer      ON sale(customer_id);
CREATE INDEX IF NOT EXISTS idx_sale_product       ON sale(product_id);
CREATE INDEX IF NOT EXISTS idx_sale_date          ON sale(date_sale);
CREATE INDEX IF NOT EXISTS idx_sale_product_date  ON sale(product_id, date_sale);

-- purchase: supplier, product, date
CREATE INDEX IF NOT EXISTS idx_purchase_supplier       ON purchase(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_product        ON purchase(product_id);
CREATE INDEX IF NOT EXISTS idx_purchase_date           ON purchase(date_purchase);
CREATE INDEX IF NOT EXISTS idx_purchase_supplier_date  ON purchase(supplier_id, date_purchase);

-- bill: customer, payment_status, composite (used by sumUnpaidByCustomerId and similar aggregates)
CREATE INDEX IF NOT EXISTS idx_bill_customer        ON bill(customer_id);
CREATE INDEX IF NOT EXISTS idx_bill_payment_status  ON bill(payment_status);
CREATE INDEX IF NOT EXISTS idx_bill_customer_status ON bill(customer_id, payment_status);

-- bill_product: both FKs (no indexes were created in V1)
CREATE INDEX IF NOT EXISTS idx_bill_product_bill     ON bill_product(id_bill);
CREATE INDEX IF NOT EXISTS idx_bill_product_product  ON bill_product(id_product);

-- product: supplier lookup + category filter
CREATE INDEX IF NOT EXISTS idx_product_supplier  ON product(supplier_id);
CREATE INDEX IF NOT EXISTS idx_product_category  ON product(category);

-- password_reset_tokens: user lookup (deleteByUser does a full scan without this)
-- + expiry index for cleanup jobs
CREATE INDEX IF NOT EXISTS idx_prt_user    ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_prt_expiry  ON password_reset_tokens(expiry_date);

-- customer: status filter (countByStatus) + created_at (countNewCustomersThisMonth)
CREATE INDEX IF NOT EXISTS idx_customer_status      ON customer(status);
CREATE INDEX IF NOT EXISTS idx_customer_created_at  ON customer(created_at);