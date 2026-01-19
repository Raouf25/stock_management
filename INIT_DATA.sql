-- Script SQL pour initialiser les données de test pour l'API de Gestion de Stock

-- Désactiver les vérifications de contraintes de clés étrangères temporairement
SET FOREIGN_KEY_CHECKS = 0;

-- Vider les tables existantes
TRUNCATE TABLE sale;
TRUNCATE TABLE purchase;
TRUNCATE TABLE stock_mouvement;
TRUNCATE TABLE product;
TRUNCATE TABLE supplier;
TRUNCATE TABLE customer;
TRUNCATE TABLE bill;

-- Réactiver les vérifications
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- 1. Insertion des Fournisseurs
-- ========================================

INSERT INTO supplier (name, address, phone, email, web_site, tva_code, contact_person) VALUES
('VALDECO', '123 Rue de la Paix, 75000 Paris', '01 23 45 67 89', 'contact@valdeco.com', 'www.valdeco.com', 'FR12345678901', 'Jean Dupont'),
('TECHSOLUTIONS', '456 Avenue des Techniques, 69000 Lyon', '04 11 22 33 44', 'info@techsolutions.fr', 'www.techsolutions.fr', 'FR98765432109', 'Marie Martin'),
('GLOBALTRADING', '789 Boulevard International, 13000 Marseille', '04 91 12 34 56', 'contact@globaltrading.com', 'www.globaltrading.com', 'FR11111111111', 'Pierre Bernard');

-- ========================================
-- 2. Insertion des Produits
-- ========================================

INSERT INTO product (designation, name, description, category, unit, initial_stock_quantity, initial_unit_price, initial_stock_value, current_stock_quantity, current_stock_value, cmp, supplier_id) VALUES
-- Produit A
('A', 'Produit A', 'Article standard A', 'Catégorie 1', 'piece', 100, 10.00, 1000.00, 100, 1000.00, 10.00, 1),

-- Produit B
('B', 'Produit B', 'Article standard B', 'Catégorie 1', 'piece', 50, 15.50, 775.00, 50, 775.00, 15.50, 2),

-- Produit C
('C', 'Composant Électronique C', 'Composant haute valeur', 'Électronique', 'piece', 200, 25.00, 5000.00, 200, 5000.00, 25.00, 1),

-- Produit D
('D', 'Matière Première D', 'Matière première brute', 'Matières Premières', 'kg', 500, 8.75, 4375.00, 500, 4375.00, 8.75, 3),

-- Produit E
('E', 'Service E', 'Service récurrent', 'Services', 'heure', 100, 50.00, 5000.00, 100, 5000.00, 50.00, 2);

-- ========================================
-- 3. Insertion des Clients (pour les ventes)
-- ========================================

INSERT INTO customer (name, email, phone, address) VALUES
('Client 1 SARL', 'client1@example.com', '02 11 22 33 44', '100 Rue de la Vente, 75000 Paris'),
('Client 2 EIRL', 'client2@example.com', '03 22 33 44 55', '200 Avenue Commerciale, 69000 Lyon'),
('Client 3 SAS', 'client3@example.com', '04 33 44 55 66', '300 Boulevard Acheteur, 13000 Marseille');

-- ========================================
-- 4. Insertion des Achats (Purchases)
-- ========================================

INSERT INTO purchase (date_purchase, supplier_id, product_id, invoice_number, quantity, unit_price_ttc, total_amount_ttc, comment) VALUES
-- Achats du Produit A (ID: 1)
('2024-01-10 08:00:00', 1, 1, 'BL-2024-001', 50, 10.50, 525.00, 'Premier achat Produit A'),
('2024-01-20 10:30:00', 1, 1, 'BL-2024-002', 30, 11.00, 330.00, 'Deuxième achat Produit A'),

-- Achats du Produit B (ID: 2)
('2024-01-15 09:15:00', 2, 2, 'INV-2024-100', 40, 16.00, 640.00, 'Achat Produit B'),

-- Achats du Produit C (ID: 3)
('2024-01-05 14:45:00', 1, 3, 'BL-2024-003', 100, 26.00, 2600.00, 'Réapprovisionnement Produit C'),
('2024-01-25 11:00:00', 1, 3, 'BL-2024-004', 50, 27.00, 1350.00, 'Achat Produit C tarif augmenté'),

-- Achats du Produit D (ID: 4)
('2024-01-12 16:20:00', 3, 4, 'CMD-2024-001', 200, 9.00, 1800.00, 'Achat matière première D'),

-- Achats du Produit E (ID: 5)
('2024-01-08 13:30:00', 2, 5, 'SVC-2024-001', 50, 52.00, 2600.00, 'Service E - Janvier');

-- ========================================
-- 5. Insertion des Ventes (Sales)
-- ========================================

INSERT INTO sale (date_sale, product_id, quantity_sold, unit_sale_price, total_sale_amount) VALUES
-- Ventes du Produit A (ID: 1)
('2024-01-22 09:30:00', 1, 40, 15.00, 600.00),

-- Ventes du Produit B (ID: 2)
('2024-01-23 11:00:00', 2, 25, 20.00, 500.00),

-- Ventes du Produit C (ID: 3)
('2024-01-26 14:15:00', 3, 80, 35.00, 2800.00),
('2024-01-28 10:45:00', 3, 30, 36.00, 1080.00),

-- Ventes du Produit D (ID: 4)
('2024-01-24 08:00:00', 4, 150, 12.00, 1800.00),

-- Ventes du Produit E (ID: 5)
('2024-01-29 15:30:00', 5, 20, 60.00, 1200.00);

-- ========================================
-- 6. Insertion des Mouvements de Stock
-- ========================================

INSERT INTO stock_mouvement (product_id, quantity, date, type, source, purchase_id, sale_id, reference) VALUES
-- Mouvements Produit A (ID: 1)
(1, 50, '2024-01-10 08:00:00', 'ENTREE', 'ACHAT', 1, NULL, 'BL-2024-001'),
(1, 30, '2024-01-20 10:30:00', 'ENTREE', 'ACHAT', 2, NULL, 'BL-2024-002'),
(1, 40, '2024-01-22 09:30:00', 'SORTIE', 'VENTE', NULL, 1, 'VENTE-1'),

-- Mouvements Produit B (ID: 2)
(2, 40, '2024-01-15 09:15:00', 'ENTREE', 'ACHAT', 3, NULL, 'INV-2024-100'),
(2, 25, '2024-01-23 11:00:00', 'SORTIE', 'VENTE', NULL, 2, 'VENTE-2'),

-- Mouvements Produit C (ID: 3)
(3, 100, '2024-01-05 14:45:00', 'ENTREE', 'ACHAT', 4, NULL, 'BL-2024-003'),
(3, 50, '2024-01-25 11:00:00', 'ENTREE', 'ACHAT', 5, NULL, 'BL-2024-004'),
(3, 80, '2024-01-26 14:15:00', 'SORTIE', 'VENTE', NULL, 3, 'VENTE-3'),
(3, 30, '2024-01-28 10:45:00', 'SORTIE', 'VENTE', NULL, 4, 'VENTE-4'),

-- Mouvements Produit D (ID: 4)
(4, 200, '2024-01-12 16:20:00', 'ENTREE', 'ACHAT', 6, NULL, 'CMD-2024-001'),
(4, 150, '2024-01-24 08:00:00', 'SORTIE', 'VENTE', NULL, 5, 'VENTE-5'),

-- Mouvements Produit E (ID: 5)
(5, 50, '2024-01-08 13:30:00', 'ENTREE', 'ACHAT', 7, NULL, 'SVC-2024-001'),
(5, 20, '2024-01-29 15:30:00', 'SORTIE', 'VENTE', NULL, 6, 'VENTE-6');

-- ========================================
-- Vérification des données insérées
-- ========================================

SELECT 'Vérification - Fournisseurs' as verification;
SELECT COUNT(*) as supplier_count FROM supplier;

SELECT 'Vérification - Produits' as verification;
SELECT COUNT(*) as product_count FROM product;

SELECT 'Vérification - Achats' as verification;
SELECT COUNT(*) as purchase_count FROM purchase;

SELECT 'Vérification - Ventes' as verification;
SELECT COUNT(*) as sale_count FROM sale;

SELECT 'Vérification - Mouvements de stock' as verification;
SELECT COUNT(*) as movement_count FROM stock_mouvement;

-- ========================================
-- Affichage des états de stock finaux
-- ========================================

SELECT 'État du Stock Final' as report;
SELECT 
    p.designation,
    p.name,
    p.initial_stock_quantity as 'Stock Initial',
    p.current_stock_quantity as 'Stock Actuel',
    p.initial_stock_value as 'Valeur Initiale',
    p.current_stock_value as 'Valeur Actuelle',
    ROUND(p.cmp, 2) as 'CMP'
FROM product p
ORDER BY p.id;
