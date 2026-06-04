-- Script de suppression uniquement des produits insérés
-- Ce script supprime d'abord les dépendances, puis les produits

-- 1. Supprimer les produits des tables de liaison (bill_product, delivery_note_product)
DELETE FROM bill_product
WHERE id_product IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

DELETE FROM delivery_note_product
WHERE product_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

-- 2. Supprimer les ventes liées à ces produits
DELETE FROM sale
WHERE product_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

-- 3. Supprimer les achats liés à ces produits
DELETE FROM purchase
WHERE product_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

-- 4. Supprimer les produits eux-mêmes
DELETE FROM product
WHERE id_product IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

-- 5. (Optionnel) Remettre la séquence du produit à 1
ALTER SEQUENCE IF EXISTS product_id_seq RESTART WITH 1;

-- 6. Supprimer les bons de livraison sans produits
DELETE FROM delivery_note WHERE id_delivery_note NOT IN (SELECT DISTINCT delivery_note_id FROM delivery_note_product);

-- 7. Supprimer les factures sans produits
DELETE FROM bill WHERE id_bill NOT IN (SELECT DISTINCT id_bill FROM bill_product);
