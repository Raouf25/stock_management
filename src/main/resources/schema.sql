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

-- Table Stock_Mouvement
CREATE TABLE IF NOT EXISTS Stock_Mouvement (
                                 id_mouvement SERIAL PRIMARY KEY,
                                 id_product INT REFERENCES Product(id_product),
                                 quantite_changee INT NOT NULL,
                                 date_mouvement TIMESTAMP NOT NULL,
                                 type_mouvement VARCHAR(50) NOT NULL CHECK (type_mouvement IN ('AJOUT', 'RETRAIT', 'RETOUR'))
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

