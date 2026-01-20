-- Insertion de produits supplémentaires pour les tests
-- Ce script fournit des produits supplémentaires pour le système de gestion de stock

INSERT INTO Product (reference, name, category, unit, unit_price_sold, unit_price_bought, current_stock_quantity, initial_stock_quantity, supplier_id)
VALUES
    (1001, 'VALPRIMER 1L', 'Impressions', '1.000 KG', 10.30, 8.656, 50, 50, 2),
    (1002, 'VALPRIMER 4L', 'Impressions', '4.000 KG', 36.07, 30.311, 50, 50, 2),
    (1003, 'VALPRIMER 18L', 'Impressions', '18.000 KG', 150.48, 126.45, 50, 50, 2),
    (1004, 'VALFIX 1L', 'Impressions', '1.000 KG', 9.77, 8.209, 50, 50, 2),
    (1005, 'VALFIX 4L', 'Impressions', '4.000 KG', 33.02, 27.744, 50, 50, 2),
    (1006, 'VALMAT 1L', 'Finitions', '1.000 KG', 3.98, 3.343, 100, 100, 2),
    (1007, 'VALMAT 5L', 'Finitions', '5.000 KG', 13.13, 11.031, 100, 100, 2),
    (1008, 'VALTEX 1L', 'Finitions', '1.000 KG', 4.44, 3.730, 80, 80, 2),
    (1009, 'VALBLANC 1L', 'Finitions', '1.000 KG', 5.75, 4.832, 80, 80, 2),
    (1010, 'RASAPRIM 5L', 'Enduits', '5.000 KG', 14.98, 12.584, 60, 60, 2);
