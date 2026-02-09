-- V2__create_delivery_note_tables.sql
-- Création de la table delivery_note pour gérer les bons de livraison

CREATE TABLE delivery_note (
    id_delivery_note BIGSERIAL PRIMARY KEY,
    delivery_note_number VARCHAR(50) NOT NULL UNIQUE,
    date_delivery TIMESTAMP NOT NULL,
    customer_id BIGINT NOT NULL,
    total_amount DECIMAL(19, 3),
    discount DECIMAL(19, 3),
    delivery_address VARCHAR(500),
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    bill_id BIGINT,
    invoiced BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE RESTRICT,
    FOREIGN KEY (bill_id) REFERENCES bill(id_bill) ON DELETE SET NULL
);

CREATE INDEX idx_delivery_note_number ON delivery_note(delivery_note_number);
CREATE INDEX idx_delivery_note_date ON delivery_note(date_delivery);
CREATE INDEX idx_delivery_note_customer ON delivery_note(customer_id);
CREATE INDEX idx_delivery_note_status ON delivery_note(status);
CREATE INDEX idx_delivery_note_invoiced ON delivery_note(invoiced);

CREATE TABLE delivery_note_product (
    id_delivery_note_product BIGSERIAL PRIMARY KEY,
    delivery_note_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(19, 3) NOT NULL,
    total_price DECIMAL(19, 3) NOT NULL,
    discount DECIMAL(19, 3),
    FOREIGN KEY (delivery_note_id) REFERENCES delivery_note(id_delivery_note) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(id_product) ON DELETE RESTRICT
);

CREATE INDEX idx_delivery_note_product_delivery_note ON delivery_note_product(delivery_note_id);
CREATE INDEX idx_delivery_note_product_product ON delivery_note_product(product_id);
