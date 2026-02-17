-- V1: Create all database tables
-- This script creates the complete database schema

-- Create supplier table
CREATE TABLE IF NOT EXISTS supplier (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    address VARCHAR(255),
    phone VARCHAR(255),
    email VARCHAR(255),
    web_site VARCHAR(255),
    tva_code VARCHAR(255),
    rib VARCHAR(255),
    iban VARCHAR(255),
    contact_person VARCHAR(255)
);

-- Create customer table
CREATE TABLE IF NOT EXISTS customer (
    customer_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    address VARCHAR(255),
    phone VARCHAR(255),
    tva_code VARCHAR(255),
    fax VARCHAR(255),
    email VARCHAR(255),
    full_name VARCHAR(255),
    cin VARCHAR(255),
    license_plate VARCHAR(255),
    city VARCHAR(255),
    status VARCHAR(255) CHECK (status IN ('ACTIVE', 'INACTIVE', 'BLOCKED', 'PROSPECT')),
    created_at TIMESTAMP
);

-- Create product table
CREATE TABLE IF NOT EXISTS product (
    id_product BIGSERIAL PRIMARY KEY,
    category VARCHAR(255),
    name VARCHAR(255),
    designation VARCHAR(255),
    description VARCHAR(255),
    unit VARCHAR(255),
    unit_price_bought DOUBLE PRECISION,
    unit_price_sold DOUBLE PRECISION,
    initial_unit_price DOUBLE PRECISION,
    initial_stock_quantity INTEGER,
    current_stock_quantity INTEGER,
    initial_stock_value DOUBLE PRECISION,
    current_stock_value DOUBLE PRECISION,
    cmp DOUBLE PRECISION,
    reference BIGINT,
    image_url VARCHAR(255),
    supplier_id BIGINT,
    FOREIGN KEY (supplier_id) REFERENCES supplier(id)
);

-- Create purchase table
CREATE TABLE IF NOT EXISTS purchase (
    id BIGSERIAL PRIMARY KEY,
    date_purchase DATE,
    supplier_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    invoice_number VARCHAR(255),
    quantity INTEGER,
    unit_pricettc DOUBLE PRECISION,
    total_amountttc DOUBLE PRECISION,
    comment VARCHAR(255),
    FOREIGN KEY (supplier_id) REFERENCES supplier(id),
    FOREIGN KEY (product_id) REFERENCES product(id_product)
);

-- Create sale table
CREATE TABLE IF NOT EXISTS sale (
    id BIGSERIAL PRIMARY KEY,
    date_sale DATE,
    customer_id BIGINT,
    product_id BIGINT NOT NULL,
    invoice_number VARCHAR(255),
    quantity_sold INTEGER,
    unit_sale_price DOUBLE PRECISION,
    total_sale_amount DOUBLE PRECISION,
    comment VARCHAR(255),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
    FOREIGN KEY (product_id) REFERENCES product(id_product)
);

-- Create bill table
CREATE TABLE IF NOT EXISTS bill (
    id_bill BIGSERIAL PRIMARY KEY,
    date_bill TIMESTAMP,
    customer_id BIGINT,
    total NUMERIC(19, 3),
    deposit NUMERIC(19, 3),
    amount_due NUMERIC(19, 3),
    discount NUMERIC(19, 3),
    delivery_address VARCHAR(500),
    payment_terms VARCHAR(100),
    notes TEXT,
    payment_status VARCHAR(255) CHECK (payment_status IN ('PAID', 'UNPAID', 'PARTIALLY_PAID', 'GIFT')),
    apply_tva BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);

-- Create bill_product table
CREATE TABLE IF NOT EXISTS bill_product (
    id BIGSERIAL PRIMARY KEY,
    id_bill BIGINT,
    id_product BIGINT,
    quantity INTEGER,
    total_product_price DOUBLE PRECISION,
    discount_percentage DOUBLE PRECISION,
    FOREIGN KEY (id_bill) REFERENCES bill(id_bill),
    FOREIGN KEY (id_product) REFERENCES product(id_product)
);

-- Create delivery_note table
CREATE TABLE IF NOT EXISTS delivery_note (
    id_delivery_note BIGSERIAL PRIMARY KEY,
    delivery_note_number VARCHAR(50) NOT NULL UNIQUE,
    date_delivery TIMESTAMP NOT NULL,
    customer_id BIGINT NOT NULL,
    total_amount NUMERIC(19, 3),
    discount NUMERIC(19, 3),
    delivery_address VARCHAR(500),
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'DELIVERED', 'CANCELLED', 'INVOICED')),
    bill_id BIGINT,
    invoiced BOOLEAN NOT NULL DEFAULT FALSE,
    apply_tva BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
    FOREIGN KEY (bill_id) REFERENCES bill(id_bill)
);

-- Create indexes for delivery_note
CREATE INDEX IF NOT EXISTS idx_delivery_note_number ON delivery_note(delivery_note_number);
CREATE INDEX IF NOT EXISTS idx_delivery_note_date ON delivery_note(date_delivery);
CREATE INDEX IF NOT EXISTS idx_delivery_note_customer ON delivery_note(customer_id);
CREATE INDEX IF NOT EXISTS idx_delivery_note_status ON delivery_note(status);
CREATE INDEX IF NOT EXISTS idx_delivery_note_invoiced ON delivery_note(invoiced);

-- Create delivery_note_product table
CREATE TABLE IF NOT EXISTS delivery_note_product (
    id_delivery_note_product BIGSERIAL PRIMARY KEY,
    delivery_note_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(19, 3) NOT NULL,
    total_price NUMERIC(19, 3) NOT NULL,
    discount NUMERIC(19, 3),
    FOREIGN KEY (delivery_note_id) REFERENCES delivery_note(id_delivery_note) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(id_product)
);

-- Create indexes for delivery_note_product
CREATE INDEX IF NOT EXISTS idx_delivery_note_product_delivery_note ON delivery_note_product(delivery_note_id);
CREATE INDEX IF NOT EXISTS idx_delivery_note_product_product ON delivery_note_product(product_id);
 
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    enabled BOOLEAN NOT NULL,
    created_at TIMESTAMP,
    last_login TIMESTAMP
);

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
