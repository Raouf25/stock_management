-- Création de la base de données
-- CREATE DATABASE stock_management_db;

-- create schema public;
-- set search_path to public;

-- Connexion à la base de données
-- \c gestion_stock;

-- Création des tables

-- Table Supplier
CREATE TABLE IF NOT EXISTS Supplier (
                             supplier_id SERIAL PRIMARY KEY,
                             name VARCHAR(100) NOT NULL,
                             address VARCHAR(255),
                             phone VARCHAR(20),
                             email VARCHAR(100),
                             web_site VARCHAR(100),
                             tva_code VARCHAR(100),
                             rib VARCHAR(100),
                             iban VARCHAR(100),
                             contact_person VARCHAR(100)
);

-- Table Client
CREATE TABLE IF NOT EXISTS Customer (
                        customer_id SERIAL PRIMARY KEY,
                        name VARCHAR(100) NOT NULL,
                        address VARCHAR(255),
                        tva_code VARCHAR(100),
                        phone VARCHAR(20),
                        fax VARCHAR(20),
                        email VARCHAR(100)
);

-- Table Product
CREATE TABLE IF NOT EXISTS Product (
                         id_product SERIAL PRIMARY KEY,
                         reference BIGINT NOT NULL,
                         name VARCHAR(100) NOT NULL,
                         description TEXT,
                         category VARCHAR(100) NOT NULL,
                         unit VARCHAR(100) NOT NULL,
                         unit_price_sold DECIMAL(10, 2) NOT NULL,
                         unit_price_bought DECIMAL(10, 2) NOT NULL,
                         current_stock_quantity INT NOT NULL,
                         initial_stock_quantity INT DEFAULT 0,
                         supplier_id INT REFERENCES Supplier(supplier_id)
);

-- Table Bill
CREATE TABLE IF NOT EXISTS Bill (
                          id_bill SERIAL PRIMARY KEY,
                          total DECIMAL(10, 2) NOT NULL,
                          deposit DECIMAL(10, 2) NOT NULL DEFAULT  0, -- Acompte
                          amountDue DECIMAL(10, 2) NOT NULL, -- "Net à payer"
                          date_bill TIMESTAMP NOT NULL,
                          payment_status VARCHAR(20) DEFAULT 'UNPAID',
                          customer_id INT REFERENCES Customer(customer_id)
);

-- Table Bill_Product (Table de liaison pour la relation many-to-many)
CREATE TABLE IF NOT EXISTS Bill_Product (
                                  id SERIAL PRIMARY KEY,  -- Nouvelle clé primaire auto-générée
                                  id_bill INT REFERENCES Bill(id_bill),
                                  id_product INT REFERENCES Product(id_product),
                                  quantity INT NOT NULL,
                                  total_product_price DECIMAL(10, 2) NOT NULL
);

-- Table Historique_Bill
CREATE TABLE IF NOT EXISTS Historic_Bill (
                                     id_historic SERIAL PRIMARY KEY,
                                     id_bill INT REFERENCES Bill(id_bill),
                                     operation VARCHAR(50) NOT NULL,
                                     date_operation TIMESTAMP NOT NULL,
                                     details_modification TEXT
);

-- Table Historique_Product
CREATE TABLE IF NOT EXISTS Historic_Product (
                                    id_historic SERIAL PRIMARY KEY,
                                    id_product INT REFERENCES Product(id_product),
                                    operation VARCHAR(50) NOT NULL,
                                    date_operation TIMESTAMP NOT NULL,
                                    details_modification TEXT
);

-- Table Purchase (Achats)
CREATE TABLE IF NOT EXISTS Purchase (
                          id SERIAL PRIMARY KEY,
                          date_purchase DATE NOT NULL,
                          supplier_id INT REFERENCES Supplier(supplier_id),
                          product_id INT REFERENCES Product(id_product),
                          invoice_number VARCHAR(100),
                          quantity INT NOT NULL,
                          unit_pricettc DECIMAL(10, 2) NOT NULL,
                          total_amountttc DECIMAL(10, 2) NOT NULL,
                          comment TEXT
);

-- Table Sale (Ventes)
CREATE TABLE IF NOT EXISTS Sale (
                          id SERIAL PRIMARY KEY,
                          date_sale DATE NOT NULL,
                          customer_id INT REFERENCES Customer(customer_id),
                          product_id INT REFERENCES Product(id_product),
                          invoice_number VARCHAR(100),
                          quantity_sold INT NOT NULL,
                          unit_sale_price DECIMAL(10, 2) NOT NULL,
                          total_sale_amount DECIMAL(10, 2) NOT NULL,
                          comment TEXT
);

-- Table Stock_Mouvement (doit être après Purchase et Sale pour les références)
CREATE TABLE IF NOT EXISTS Stock_Mouvement (
                                 id SERIAL PRIMARY KEY,
                                 product_id INT REFERENCES Product(id_product),
                                 quantity INT NOT NULL,
                                 date DATE NOT NULL,
                                 type VARCHAR(50) NOT NULL CHECK (type IN ('ENTREE', 'SORTIE')),
                                 source VARCHAR(50) NOT NULL CHECK (source IN ('ACHAT', 'VENTE', 'AJUSTEMENT')),
                                 purchase_id INT REFERENCES Purchase(id),
                                 sale_id INT REFERENCES Sale(id),
                                 reference VARCHAR(100)
);
