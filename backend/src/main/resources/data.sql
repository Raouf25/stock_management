-- Insertion des données de test

-- Insertion de fournisseurs
INSERT INTO supplier (name, address, phone, email, web_site, tva_code, rib, iban, contact_person)
VALUES
    ('Fournitures Générales S.A.R.L', 'Avenue des Industries, ZI Sfax', '+216 74 678 123', 'contact@fournitures-generales.com', 'www.fournitures-generales.com', '123456789/A/M/000', '08110010021000316329', 'TN59 0811 0010 0210 0031 6329', 'Ahmed Mansour'),
    ('Technologie & Co S.A.', 'Boulevard Technologique, Ariana', '+216 71 234 567', 'info@technologieco.com', 'www.technologieco.com', '987654321/B/M/000', '08110010021000316330', 'TN59 0811 0010 0210 0031 6330', 'Leila Trabelsi'),
    ('Aldecco S.A.R.L', 'Avenue de l''U.M.A, TUNIS', '+216 71 494 496', 'info@valpaint.tn', 'www.valpaint.tn', '954308X/A/M/000', '08110010021000316328', 'TN59 0811 0010 0210 0031 6328', 'Personne C');

-- Insertion de clients
INSERT INTO Customer (name, address, tva_code, phone, fax, email)
VALUES
    ('Entreprise Construction ABC', '123 Rue des Bâtisseurs, Tunis', '123456789/A/M/000', '+216 71 111 111', '+216 71 111 112', 'contact@constructionabc.com'),
    ('Distrimat Services', '456 Boulevard du Commerce, Sfax', '987654321/B/M/000', '+216 74 222 222', '+216 74 222 223', 'info@distrimat.com'),
    ('Peintures et Revêtements SA', '789 Avenue des Décorateurs, Sousse', '654321987/C/M/000', '+216 73 333 333', '+216 73 333 334', 'ventes@peintures-revetements.com'),
    ('Quincaillerie Générale SARL', '321 Rue de l''Industrie, Monastir', '456789123/D/M/000', '+216 73 444 444', '+216 73 444 445', 'admin@quincaillerie-gen.com'),
    ('Travaux Publics et Aménagement', '654 Avenue Principale, Hammamet', '789123456/E/M/000', '+216 72 555 555', '+216 72 555 556', 'contact@tp-amenagement.com'),
    ('Distribution Matériaux SARL', '987 Rue Secondaire, Bizerte', '321654789/F/M/000', '+216 72 666 666', '+216 72 666 667', 'ventes@distribution-mat.com'),
    ('Devis Travaux Express', '159 Boulevard Artisanal, Kairouan', '159753486/G/M/000', '+216 77 777 777', '+216 77 777 778', 'contact@devistravaux.com'),
    ('Fournitures et Équipement Pro', '753 Rue Professionnelle, Gafsa', '753951486/H/M/000', '+216 76 888 888', '+216 76 888 889', 'info@fourniture-equip.com'),
    ('Bâtiment et Construction Moderne', '456 Avenue Moderne, Tataouine', '456123789/I/M/000', '+216 75 999 999', '+216 75 999 991', 'contact@bat-construction.com'),
    ('Matériaux de Qualité Générale', '852 Rue Qualité, Kebili', '852963147/J/M/000', '+216 75 101 010', '+216 75 101 011', 'ventes@mat-qualite.com'),
    ('Solutions Intégrales Bâtiment', '159 Avenue Intégrale, Médenine', '159357852/K/M/000', '+216 75 202 020', '+216 75 202 021', 'info@solutions-batiment.com'),
    ('Peintres Décorateurs Associés', '753 Boulevard Décor, Djerba', '753159852/L/M/000', '+216 75 303 030', '+216 75 303 031', 'contact@peintres-decor.com'),
    ('Commerce de Matériaux Premium', '357 Rue Premium, Zarzis', '357951753/M/M/000', '+216 75 404 040', '+216 75 404 041', 'ventes@mat-premium.com'),
    ('Entreprise Générale Maghreb', '951 Avenue Maghreb, Tozeur', '951753357/N/M/000', '+216 76 505 050', '+216 76 505 051', 'contact@eg-maghreb.com'),
    ('Solutions Constructives Tunisia', '654 Rue Solutions, Douz', '654789456/O/M/000', '+216 76 606 060', '+216 76 606 061', 'info@sol-constructives.com'),
    ('Distribution Complète du Bâtiment', '123 Boulevard Complet, Skhira', '123789456/P/M/000', '+216 74 707 070', '+216 74 707 071', 'ventes@distrib-complet.com'),
    ('Fournitures Spécialisées Bâtiment', '789 Rue Spécialisée, Sfax', '789456123/Q/M/000', '+216 74 808 080', '+216 74 808 081', 'contact@fourniture-spec.com'),
    ('Revêtements et Accessoires Pro', '456 Avenue Pro, Gabès', '456123789/R/M/000', '+216 75 909 090', '+216 75 909 091', 'info@revetements-pro.com'),
    ('Équipement Travaux & Services', '321 Rue Travaux, Nabeul', '321654789/S/M/000', '+216 72 101 010', '+216 72 101 011', 'contact@equip-travaux.com'),
    ('Matériaux & Solutions Avancées', '987 Boulevard Solutions, Banzart', '987321654/T/M/000', '+216 72 202 020', '+216 72 202 021', 'ventes@mat-solutions.com'),
    ('Fournisseur International Bâtiment', '654 Rue International, Mateur', '654987321/U/M/000', '+216 72 303 030', '+216 72 303 031', 'contact@fourni-intl.com'),
    ('Expert Matériaux Bâtiment', '852 Avenue Expert, Testour', '852147963/V/M/000', '+216 78 404 040', '+216 78 404 041', 'info@expert-matbat.com'),
    ('Distribution Nationale Bâtiment', '159 Rue Nationale, Béja', '159852741/W/M/000', '+216 78 505 050', '+216 78 505 051', 'ventes@distrib-nat.com'),
    ('Spécialiste Finitions & Décor', '753 Boulevard Finitions, Jendouba', '753456789/X/M/000', '+216 78 606 060', '+216 78 606 061', 'contact@specialist-finition.com'),
    ('Grossiste Matériaux Régional', '456 Rue Régional, Kef', '456789321/Y/M/000', '+216 78 707 070', '+216 78 707 071', 'info@grossiste-regional.com'),
    ('Premium Building Solutions', '789 Avenue Premium, Siliana', '789654321/Z/M/000', '+216 77 808 080', '+216 77 808 081', 'contact@premium-building.com'),
    ('Neuf Matériaux & Accessoires', '321 Rue Neuf, Kasserine', '321987654/AA/M/000', '+216 77 909 090', '+216 77 909 091', 'ventes@neuf-mat-acc.com'),
    ('Expert Solutions Durables', '987 Boulevard Durable, Sidi Bouzid', '987654789/AB/M/000', '+216 75 101 010', '+216 75 101 011', 'contact@expert-durable.com'),
    ('Commerce Intégré Matériaux', '654 Rue Intégré, Mahdia', '654321789/AC/M/000', '+216 73 202 020', '+216 73 202 021', 'info@commerce-integre.com'),
    ('Partenaire Fiable Bâtiment', '852 Avenue Fiable, Sfax', '852741963/AD/M/000', '+216 74 303 030', '+216 74 303 031', 'contact@partenaire-fiable.com');



-- Insertion de products (colonnes corrigées pour correspondre aux entités JPA)
-- Réduit à 10 produits pour simplifier les tests
INSERT INTO product (category, name, unit, unit_price_bought, unit_price_sold, supplier_id, reference)
VALUES
    ('Impressions','VALPRIMER','1.000 KG',8.656,10.300, 1, trunc(random()*10000000000000)),
    ('Impressions','VALPRIMER','4.000 KG',30.311,36.071, 1, trunc(random()*10000000000000)),
    ('Impressions','VALPRIMER','18.000 KG',126.450,150.476, 1, trunc(random()*10000000000000)),
    ('Impressions','VALFIX','1.000 KG',8.209,9.769, 1, trunc(random()*10000000000000)),
    ('Impressions','VALFIX','4.000 KG',27.744,33.015, 3, trunc(random()*10000000000000)),
    ('Impressions','FISSATIVO 30G','0.800 LT',15.236,18.131, 3, trunc(random()*10000000000000)),
    ('FINITIONS','VALMAT','1.000 KG',3.343,3.978, 3, trunc(random()*10000000000000)),
    ('FINITIONS','VALTEX','1.000 KG',3.730,4.439, 2, trunc(random()*10000000000000)),
    ('FINITIONS','VALBLANC','1.000 KG',4.832,5.750, 2, trunc(random()*10000000000000)),
    ('FINITIONS','VALPRO MAT','5.000 KG',23.705,28.210, 2, trunc(random()*10000000000000));


-- Insertion d'achats (basés sur les produits existants et leurs fournisseurs)
-- Ajusté pour les 10 produits seulement
INSERT INTO purchase (date_purchase, supplier_id, product_id, invoice_number, quantity, unit_pricettc, total_amountttc, comment)
VALUES
    -- Achats Fournisseur 1 (VALPRIMER 1KG, 4KG, 18KG - VALFIX 1KG) - Produits 1,2,3,4
    ('2025-01-05', 1, 1, 'BL-2025-001', 50, 8.656, 432.80, 'Achat initial VALPRIMER 1KG'),
    ('2025-01-05', 1, 2, 'BL-2025-002', 30, 30.311, 909.33, 'Achat initial VALPRIMER 4KG'),
    ('2025-01-08', 1, 3, 'BL-2025-003', 20, 126.450, 2529.00, 'Achat initial VALPRIMER 18KG'),
    ('2025-01-12', 1, 4, 'BL-2025-004', 40, 8.209, 328.36, 'Approvisionnement VALFIX 1KG'),
    ('2025-02-03', 1, 1, 'BL-2025-045', 60, 8.656, 519.36, 'Réapprovisionnement VALPRIMER 1KG'),
    ('2025-02-10', 1, 2, 'BL-2025-056', 35, 30.311, 1060.89, 'VALPRIMER 4KG février'),
    ('2025-03-02', 1, 3, 'BL-2025-102', 25, 126.450, 3161.25, 'VALPRIMER 18KG mars'),
    ('2025-03-15', 1, 4, 'BL-2025-115', 45, 8.209, 369.41, 'VALFIX 1KG mars'),
    
    -- Achats Fournisseur 3 (VALFIX 4KG, FISSATIVO, VALMAT) - Produits 5,6,7
    ('2025-01-08', 3, 5, 'BL-2025-015', 25, 27.744, 693.60, 'Approvisionnement VALFIX 4KG'),
    ('2025-01-12', 3, 6, 'BL-2025-017', 35, 15.236, 533.26, 'Commande FISSATIVO 30G 0.8LT'),
    ('2025-02-08', 3, 7, 'BL-2025-063', 50, 3.343, 167.15, 'Achat VALMAT 1KG'),
    ('2025-03-10', 3, 5, 'BL-2025-110', 35, 27.744, 971.04, 'VALFIX 4KG mars'),
    ('2025-04-03', 3, 6, 'BL-2025-189', 40, 15.236, 609.44, 'FISSATIVO 30G 0.8LT avril'),
    
    -- Achats Fournisseur 2 (VALTEX, VALBLANC, VALPRO MAT) - Produits 8,9,10
    ('2025-01-10', 2, 8, 'BL-2025-025', 45, 3.730, 167.85, 'Stock VALTEX 1KG'),
    ('2025-02-05', 2, 9, 'BL-2025-052', 40, 4.832, 193.28, 'Commande VALBLANC 1KG'),
    ('2025-03-01', 2, 10, 'BL-2025-095', 35, 23.705, 829.68, 'VALPRO MAT 5KG'),
    ('2025-05-12', 2, 8, 'BL-2025-215', 35, 3.730, 130.55, 'VALTEX 1KG mai'),
    ('2025-06-01', 2, 9, 'BL-2025-250', 30, 4.832, 144.96, 'VALBLANC 1KG juin'),
    
    -- Achats récents (Juillet-Décembre 2025)
    ('2025-08-10', 1, 2, 'BL-2025-405', 40, 30.311, 1212.44, 'VALPRIMER 4KG août'),
    ('2025-09-15', 3, 5, 'BL-2025-505', 35, 27.744, 971.04, 'VALFIX 4KG septembre'),
    ('2025-10-20', 2, 8, 'BL-2025-605', 45, 3.730, 167.85, 'VALTEX 1KG octobre'),
    ('2025-11-12', 2, 9, 'BL-2025-705', 38, 4.832, 183.62, 'VALBLANC 1KG novembre'),
    ('2025-12-05', 2, 10, 'BL-2025-805', 32, 23.705, 758.56, 'VALPRO MAT 5KG décembre'),
    
    -- Achats de Janvier 2026 (récents)
    ('2026-01-08', 1, 1, 'BL-2026-003', 60, 8.656, 519.36, 'Début année 2026 VALPRIMER 1KG'),
    ('2026-01-10', 2, 8, 'BL-2026-012', 45, 3.730, 167.85, 'Début année 2026 VALTEX 1KG'),
    ('2026-01-15', 3, 5, 'BL-2026-023', 35, 27.744, 971.04, 'Début année 2026 VALFIX 4KG'),
    ('2026-01-18', 2, 10, 'BL-2026-034', 28, 23.705, 663.74, 'Début année 2026 VALPRO MAT 5KG'),
    ('2026-01-20', 2, 9, 'BL-2026-045', 30, 4.832, 144.96, 'Début année 2026 VALBLANC 1KG');


-- Insertion des mouvements de stock pour les achats
-- Ajusté pour les 10 produits et 30 achats
INSERT INTO stock_mouvement (product_id, quantity, date, type, source, purchase_id, reference)
VALUES
    -- Mouvements Janvier 2025 (achats 1-8)
    (1, 50, '2025-01-05', 'ENTREE', 'ACHAT', 1, 'BL-2025-001'),
    (2, 30, '2025-01-05', 'ENTREE', 'ACHAT', 2, 'BL-2025-002'),
    (3, 20, '2025-01-08', 'ENTREE', 'ACHAT', 3, 'BL-2025-003'),
    (4, 40, '2025-01-12', 'ENTREE', 'ACHAT', 4, 'BL-2025-004'),
    (5, 25, '2025-01-08', 'ENTREE', 'ACHAT', 9, 'BL-2025-015'),
    (6, 35, '2025-01-12', 'ENTREE', 'ACHAT', 10, 'BL-2025-017'),
    (8, 45, '2025-01-10', 'ENTREE', 'ACHAT', 14, 'BL-2025-025'),
    -- Mouvements Février 2025 (achats 5-7, 11, 15-16)
    (1, 60, '2025-02-03', 'ENTREE', 'ACHAT', 5, 'BL-2025-045'),
    (2, 35, '2025-02-10', 'ENTREE', 'ACHAT', 6, 'BL-2025-056'),
    (7, 50, '2025-02-08', 'ENTREE', 'ACHAT', 11, 'BL-2025-063'),
    (9, 40, '2025-02-05', 'ENTREE', 'ACHAT', 15, 'BL-2025-052'),
    -- Mouvements Mars 2025 (achats 7-8, 12-13, 16)
    (3, 25, '2025-03-02', 'ENTREE', 'ACHAT', 7, 'BL-2025-102'),
    (4, 45, '2025-03-15', 'ENTREE', 'ACHAT', 8, 'BL-2025-115'),
    (5, 35, '2025-03-10', 'ENTREE', 'ACHAT', 12, 'BL-2025-110'),
    (10, 35, '2025-03-01', 'ENTREE', 'ACHAT', 16, 'BL-2025-095'),
    -- Mouvements Avril 2025 (achat 13)
    (6, 40, '2025-04-03', 'ENTREE', 'ACHAT', 13, 'BL-2025-189'),
    -- Mouvements Mai 2025 (achat 17)
    (8, 35, '2025-05-12', 'ENTREE', 'ACHAT', 17, 'BL-2025-215'),
    -- Mouvements Juin 2025 (achat 18)
    (9, 30, '2025-06-01', 'ENTREE', 'ACHAT', 18, 'BL-2025-250'),
    -- Mouvements Juillet-Décembre 2025 (achats 19-23)
    (2, 40, '2025-08-10', 'ENTREE', 'ACHAT', 19, 'BL-2025-405'),
    (5, 35, '2025-09-15', 'ENTREE', 'ACHAT', 20, 'BL-2025-505'),
    (8, 45, '2025-10-20', 'ENTREE', 'ACHAT', 21, 'BL-2025-605'),
    (9, 38, '2025-11-12', 'ENTREE', 'ACHAT', 22, 'BL-2025-705'),
    (10, 32, '2025-12-05', 'ENTREE', 'ACHAT', 23, 'BL-2025-805'),
    -- Mouvements Janvier 2026 (achats 24-28)
    (1, 60, '2026-01-08', 'ENTREE', 'ACHAT', 24, 'BL-2026-003'),
    (8, 45, '2026-01-10', 'ENTREE', 'ACHAT', 25, 'BL-2026-012'),
    (5, 35, '2026-01-15', 'ENTREE', 'ACHAT', 26, 'BL-2026-023'),
    (10, 28, '2026-01-18', 'ENTREE', 'ACHAT', 27, 'BL-2026-034'),
    (9, 30, '2026-01-20', 'ENTREE', 'ACHAT', 28, 'BL-2026-045');


-- Mise à jour du stock initial basé sur la somme des achats
-- Cette requête calcule automatiquement la somme des quantités achetées pour chaque produit
UPDATE product p
SET initial_stock_quantity = COALESCE(
    (SELECT SUM(pur.quantity) 
     FROM purchase pur 
     WHERE pur.product_id = p.id_product), 
    0
);


-- Insertion de ventes (basées sur les 10 produits en stock)
INSERT INTO sale (date_sale, customer_id, product_id, invoice_number, quantity_sold, unit_sale_price, total_sale_amount, comment)
VALUES
    -- Ventes Janvier 2025
    ('2025-01-10', 1, 1, 'FAC-2025-001', 20, 10.300, 206.00, 'Vente VALPRIMER 1KG'),
    ('2025-01-12', 2, 2, 'FAC-2025-002', 15, 36.071, 541.07, 'Vente VALPRIMER 4KG'),
    ('2025-01-15', 3, 8, 'FAC-2025-003', 10, 4.439, 44.39, 'Vente VALTEX 1KG'),
    ('2025-01-18', 4, 9, 'FAC-2025-004', 8, 5.750, 46.00, 'Vente VALBLANC 1KG'),
    ('2025-01-20', 5, 7, 'FAC-2025-005', 15, 3.978, 59.67, 'Vente VALMAT 1KG'),
    ('2025-01-25', 6, 5, 'FAC-2025-006', 12, 33.015, 396.18, 'Vente VALFIX 4KG'),
    
    -- Ventes Février 2025
    ('2025-02-05', 7, 1, 'FAC-2025-010', 25, 10.300, 257.50, 'Vente VALPRIMER 1KG'),
    ('2025-02-08', 8, 10, 'FAC-2025-011', 12, 16.071, 192.85, 'Vente VALPRO MAT 5KG'),
    ('2025-02-10', 9, 9, 'FAC-2025-012', 10, 5.750, 57.50, 'Vente VALBLANC 1KG'),
    ('2025-02-12', 10, 4, 'FAC-2025-013', 18, 9.769, 175.84, 'Vente VALFIX 1KG'),
    ('2025-02-15', 11, 10, 'FAC-2025-014', 8, 28.210, 225.68, 'Vente VALPRO MAT 5KG'),
    ('2025-02-18', 12, 6, 'FAC-2025-015', 15, 18.131, 271.97, 'Vente FISSATIVO 30G 0.8LT'),
    ('2025-02-22', 13, 7, 'FAC-2025-016', 20, 13.127, 262.54, 'Vente VALMAT 1KG'),
    ('2025-02-25', 14, 8, 'FAC-2025-017', 12, 4.439, 53.27, 'Vente VALTEX 1KG'),
    
    -- Ventes Mars 2025
    ('2025-03-02', 15, 10, 'FAC-2025-020', 10, 34.562, 345.62, 'Vente VALPRO MAT 5KG'),
    ('2025-03-05', 16, 9, 'FAC-2025-021', 8, 5.750, 46.00, 'Vente VALBLANC 1KG'),
    ('2025-03-08', 17, 2, 'FAC-2025-022', 18, 36.071, 649.28, 'Vente VALPRIMER 4KG'),
    ('2025-03-10', 18, 4, 'FAC-2025-023', 15, 9.769, 146.54, 'Vente VALFIX 1KG'),
    ('2025-03-15', 19, 8, 'FAC-2025-024', 10, 4.439, 44.39, 'Vente VALTEX 1KG'),
    ('2025-03-18', 20, 10, 'FAC-2025-025', 12, 28.210, 338.52, 'Vente VALPRO MAT 5KG'),
    ('2025-03-20', 21, 5, 'FAC-2025-026', 10, 33.015, 330.15, 'Vente VALFIX 4KG'),
    ('2025-03-25', 22, 1, 'FAC-2025-027', 20, 10.300, 206.00, 'Vente VALPRIMER 1KG'),
    
    -- Ventes Avril 2025
    ('2025-04-02', 23, 3, 'FAC-2025-030', 10, 119.680, 1196.80, 'Vente VALPRIMER 18KG'),
    ('2025-04-05', 24, 6, 'FAC-2025-031', 12, 18.131, 217.57, 'Vente FISSATIVO 30G 0.8LT'),
    ('2025-04-08', 25, 6, 'FAC-2025-032', 8, 18.131, 145.05, 'Vente FISSATIVO 30G 0.8LT'),
    ('2025-04-12', 26, 3, 'FAC-2025-033', 8, 119.680, 957.44, 'Vente VALPRIMER 18KG'),
    ('2025-04-15', 27, 7, 'FAC-2025-034', 15, 13.127, 196.91, 'Vente VALMAT 1KG'),
    ('2025-04-18', 28, 8, 'FAC-2025-035', 15, 4.439, 66.59, 'Vente VALTEX 1KG'),
    ('2025-04-22', 29, 9, 'FAC-2025-036', 10, 5.750, 57.50, 'Vente VALBLANC 1KG'),
    ('2025-04-25', 30, 10, 'FAC-2025-037', 8, 34.562, 276.50, 'Vente VALPRO MAT 5KG'),
    
    -- Ventes Mai 2025
    ('2025-05-05', 1, 1, 'FAC-2025-040', 18, 10.300, 185.40, 'Vente VALPRIMER 1KG'),
    ('2025-05-08', 2, 2, 'FAC-2025-041', 12, 36.071, 432.85, 'Vente VALPRIMER 4KG'),
    ('2025-05-10', 3, 5, 'FAC-2025-042', 10, 33.015, 330.15, 'Vente VALFIX 4KG'),
    ('2025-05-12', 4, 8, 'FAC-2025-043', 12, 4.439, 53.27, 'Vente VALTEX 1KG'),
    ('2025-05-15', 5, 4, 'FAC-2025-044', 10, 9.769, 97.69, 'Vente VALFIX 1KG'),
    ('2025-05-18', 6, 9, 'FAC-2025-045', 8, 5.750, 46.00, 'Vente VALBLANC 1KG'),
    ('2025-05-22', 7, 1, 'FAC-2025-046', 15, 10.300, 154.50, 'Vente VALPRIMER 1KG'),
    ('2025-05-25', 8, 10, 'FAC-2025-047', 10, 16.071, 160.71, 'Vente VALPRO MAT 5KG'),
    
    -- Ventes Juin 2025
    ('2025-06-02', 9, 9, 'FAC-2025-050', 12, 5.750, 69.00, 'Vente VALBLANC 1KG'),
    ('2025-06-05', 10, 6, 'FAC-2025-051', 10, 18.131, 181.31, 'Vente FISSATIVO 30G 0.8LT'),
    ('2025-06-08', 11, 2, 'FAC-2025-052', 15, 36.071, 541.07, 'Vente VALPRIMER 4KG'),
    ('2025-06-12', 12, 3, 'FAC-2025-053', 6, 119.680, 718.08, 'Vente VALPRIMER 18KG'),
    ('2025-06-15', 13, 4, 'FAC-2025-054', 10, 9.769, 97.69, 'Vente VALFIX 1KG'),
    ('2025-06-18', 14, 10, 'FAC-2025-055', 8, 34.562, 276.50, 'Vente VALPRO MAT 5KG'),
    ('2025-06-22', 15, 8, 'FAC-2025-056', 12, 4.439, 53.27, 'Vente VALTEX 1KG'),
    ('2025-06-25', 16, 9, 'FAC-2025-057', 8, 5.750, 46.00, 'Vente VALBLANC 1KG'),
    
    -- Ventes Juillet 2025
    ('2025-07-05', 17, 2, 'FAC-2025-060', 15, 36.071, 541.07, 'Vente VALPRIMER 4KG'),
    ('2025-07-10', 18, 5, 'FAC-2025-061', 10, 33.015, 330.15, 'Vente VALFIX 4KG'),
    ('2025-07-15', 19, 1, 'FAC-2025-062', 20, 10.300, 206.00, 'Vente VALPRIMER 1KG'),
    ('2025-07-20', 20, 10, 'FAC-2025-063', 8, 16.071, 128.57, 'Vente VALPRO MAT 5KG'),
    ('2025-07-25', 21, 10, 'FAC-2025-064', 10, 28.210, 282.10, 'Vente VALPRO MAT 5KG'),
    
    -- Ventes Août 2025
    ('2025-08-05', 22, 8, 'FAC-2025-070', 15, 4.439, 66.59, 'Vente VALTEX 1KG'),
    ('2025-08-10', 23, 9, 'FAC-2025-071', 10, 5.750, 57.50, 'Vente VALBLANC 1KG'),
    ('2025-08-15', 24, 2, 'FAC-2025-072', 12, 36.071, 432.85, 'Vente VALPRIMER 4KG'),
    ('2025-08-20', 25, 10, 'FAC-2025-073', 8, 34.562, 276.50, 'Vente VALPRO MAT 5KG'),
    ('2025-08-25', 26, 4, 'FAC-2025-074', 8, 9.769, 78.15, 'Vente VALFIX 1KG'),
    
    -- Ventes Septembre 2025
    ('2025-09-05', 27, 1, 'FAC-2025-080', 15, 10.300, 154.50, 'Vente VALPRIMER 1KG'),
    ('2025-09-10', 28, 5, 'FAC-2025-081', 8, 33.015, 264.12, 'Vente VALFIX 4KG'),
    ('2025-09-15', 29, 10, 'FAC-2025-082', 10, 16.071, 160.71, 'Vente VALPRO MAT 5KG'),
    ('2025-09-20', 30, 3, 'FAC-2025-083', 5, 119.680, 598.40, 'Vente VALPRIMER 18KG'),
    ('2025-09-25', 1, 6, 'FAC-2025-084', 8, 18.131, 145.05, 'Vente FISSATIVO 30G 0.8LT'),
    
    -- Ventes Octobre 2025
    ('2025-10-05', 2, 8, 'FAC-2025-090', 12, 4.439, 53.27, 'Vente VALTEX 1KG'),
    ('2025-10-10', 3, 9, 'FAC-2025-091', 10, 5.750, 57.50, 'Vente VALBLANC 1KG'),
    ('2025-10-15', 4, 10, 'FAC-2025-092', 8, 28.210, 225.68, 'Vente VALPRO MAT 5KG'),
    ('2025-10-20', 5, 10, 'FAC-2025-093', 10, 34.562, 345.62, 'Vente VALPRO MAT 5KG'),
    ('2025-10-25', 6, 1, 'FAC-2025-094', 12, 10.300, 123.60, 'Vente VALPRIMER 1KG'),
    
    -- Ventes Novembre 2025
    ('2025-11-05', 7, 2, 'FAC-2025-100', 10, 36.071, 360.71, 'Vente VALPRIMER 4KG'),
    ('2025-11-10', 8, 5, 'FAC-2025-101', 8, 33.015, 264.12, 'Vente VALFIX 4KG'),
    ('2025-11-15', 9, 10, 'FAC-2025-102', 8, 16.071, 128.57, 'Vente VALPRO MAT 5KG'),
    ('2025-11-20', 10, 9, 'FAC-2025-103', 8, 5.750, 46.00, 'Vente VALBLANC 1KG'),
    ('2025-11-25', 11, 4, 'FAC-2025-104', 10, 9.769, 97.69, 'Vente VALFIX 1KG'),
    
    -- Ventes Décembre 2025
    ('2025-12-05', 12, 10, 'FAC-2025-110', 8, 34.562, 276.50, 'Vente VALPRO MAT 5KG'),
    ('2025-12-10', 13, 8, 'FAC-2025-111', 10, 4.439, 44.39, 'Vente VALTEX 1KG'),
    ('2025-12-15', 14, 1, 'FAC-2025-112', 15, 10.300, 154.50, 'Vente VALPRIMER 1KG'),
    ('2025-12-20', 15, 10, 'FAC-2025-113', 8, 28.210, 225.68, 'Vente VALPRO MAT 5KG'),
    ('2025-12-25', 16, 9, 'FAC-2025-114', 8, 5.750, 46.00, 'Vente VALBLANC 1KG'),
    
    -- Ventes Janvier 2026
    ('2026-01-05', 17, 1, 'FAC-2026-001', 15, 10.300, 154.50, 'Vente VALPRIMER 1KG janvier 2026'),
    ('2026-01-10', 18, 10, 'FAC-2026-002', 9, 16.071, 144.639, 'Vente VALPRO MAT 5KG janvier 2026 - ligne 1'),
    ('2026-01-10', 18, 8, 'FAC-2026-002', 1, 16.071, 16.071, 'Vente VALTEX 1KG janvier 2026 - ligne 2'),
    ('2026-01-15', 19, 5, 'FAC-2026-003', 10, 33.015, 330.15, 'Vente VALFIX 4KG janvier 2026'),
    ('2026-01-20', 20, 4, 'FAC-2026-004', 8, 9.769, 78.15, 'Vente VALFIX 1KG janvier 2026');


-- Insertion des mouvements de stock pour les ventes (produits 1-10 seulement)
INSERT INTO stock_mouvement (product_id, quantity, date, type, source, sale_id, reference)
VALUES
    -- Mouvements ventes Janvier 2025
    (1, 20, '2025-01-10', 'SORTIE', 'VENTE', 1, 'FAC-2025-001'),
    (2, 15, '2025-01-12', 'SORTIE', 'VENTE', 2, 'FAC-2025-002'),
    (8, 10, '2025-01-15', 'SORTIE', 'VENTE', 3, 'FAC-2025-003'),
    (9, 8, '2025-01-18', 'SORTIE', 'VENTE', 4, 'FAC-2025-004'),
    (7, 15, '2025-01-20', 'SORTIE', 'VENTE', 5, 'FAC-2025-005'),
    (5, 12, '2025-01-25', 'SORTIE', 'VENTE', 6, 'FAC-2025-006'),
    -- Mouvements ventes Février 2025
    (1, 25, '2025-02-05', 'SORTIE', 'VENTE', 7, 'FAC-2025-010'),
    (10, 12, '2025-02-08', 'SORTIE', 'VENTE', 8, 'FAC-2025-011'),
    (9, 10, '2025-02-10', 'SORTIE', 'VENTE', 9, 'FAC-2025-012'),
    (4, 18, '2025-02-12', 'SORTIE', 'VENTE', 10, 'FAC-2025-013'),
    (10, 8, '2025-02-15', 'SORTIE', 'VENTE', 11, 'FAC-2025-014'),
    (6, 15, '2025-02-18', 'SORTIE', 'VENTE', 12, 'FAC-2025-015'),
    (7, 20, '2025-02-22', 'SORTIE', 'VENTE', 13, 'FAC-2025-016'),
    (8, 12, '2025-02-25', 'SORTIE', 'VENTE', 14, 'FAC-2025-017'),
    -- Mouvements ventes Mars 2025
    (10, 10, '2025-03-02', 'SORTIE', 'VENTE', 15, 'FAC-2025-020'),
    (9, 8, '2025-03-05', 'SORTIE', 'VENTE', 16, 'FAC-2025-021'),
    (2, 18, '2025-03-08', 'SORTIE', 'VENTE', 17, 'FAC-2025-022'),
    (4, 15, '2025-03-10', 'SORTIE', 'VENTE', 18, 'FAC-2025-023'),
    (8, 10, '2025-03-15', 'SORTIE', 'VENTE', 19, 'FAC-2025-024'),
    (10, 12, '2025-03-18', 'SORTIE', 'VENTE', 20, 'FAC-2025-025'),
    (5, 10, '2025-03-20', 'SORTIE', 'VENTE', 21, 'FAC-2025-026'),
    (1, 20, '2025-03-25', 'SORTIE', 'VENTE', 22, 'FAC-2025-027'),
    -- Mouvements ventes Avril 2025
    (3, 10, '2025-04-02', 'SORTIE', 'VENTE', 23, 'FAC-2025-030'),
    (6, 12, '2025-04-05', 'SORTIE', 'VENTE', 24, 'FAC-2025-031'),
    (6, 8, '2025-04-08', 'SORTIE', 'VENTE', 25, 'FAC-2025-032'),
    (3, 8, '2025-04-12', 'SORTIE', 'VENTE', 26, 'FAC-2025-033'),
    (7, 15, '2025-04-15', 'SORTIE', 'VENTE', 27, 'FAC-2025-034'),
    (8, 15, '2025-04-18', 'SORTIE', 'VENTE', 28, 'FAC-2025-035'),
    (9, 10, '2025-04-22', 'SORTIE', 'VENTE', 29, 'FAC-2025-036'),
    (10, 8, '2025-04-25', 'SORTIE', 'VENTE', 30, 'FAC-2025-037'),
    -- Mouvements ventes Mai 2025
    (1, 18, '2025-05-05', 'SORTIE', 'VENTE', 31, 'FAC-2025-040'),
    (2, 12, '2025-05-08', 'SORTIE', 'VENTE', 32, 'FAC-2025-041'),
    (5, 10, '2025-05-10', 'SORTIE', 'VENTE', 33, 'FAC-2025-042'),
    (8, 12, '2025-05-12', 'SORTIE', 'VENTE', 34, 'FAC-2025-043'),
    (4, 10, '2025-05-15', 'SORTIE', 'VENTE', 35, 'FAC-2025-044'),
    (9, 8, '2025-05-18', 'SORTIE', 'VENTE', 36, 'FAC-2025-045'),
    (1, 15, '2025-05-22', 'SORTIE', 'VENTE', 37, 'FAC-2025-046'),
    (10, 10, '2025-05-25', 'SORTIE', 'VENTE', 38, 'FAC-2025-047'),
    -- Mouvements ventes Juin 2025
    (9, 12, '2025-06-02', 'SORTIE', 'VENTE', 39, 'FAC-2025-050'),
    (6, 10, '2025-06-05', 'SORTIE', 'VENTE', 40, 'FAC-2025-051'),
    (2, 15, '2025-06-08', 'SORTIE', 'VENTE', 41, 'FAC-2025-052'),
    (3, 6, '2025-06-12', 'SORTIE', 'VENTE', 42, 'FAC-2025-053'),
    (4, 10, '2025-06-15', 'SORTIE', 'VENTE', 43, 'FAC-2025-054'),
    (10, 8, '2025-06-18', 'SORTIE', 'VENTE', 44, 'FAC-2025-055'),
    (8, 12, '2025-06-22', 'SORTIE', 'VENTE', 45, 'FAC-2025-056'),
    (9, 8, '2025-06-25', 'SORTIE', 'VENTE', 46, 'FAC-2025-057'),
    -- Mouvements ventes Juillet 2025
    (2, 15, '2025-07-05', 'SORTIE', 'VENTE', 47, 'FAC-2025-060'),
    (5, 10, '2025-07-10', 'SORTIE', 'VENTE', 48, 'FAC-2025-061'),
    (1, 20, '2025-07-15', 'SORTIE', 'VENTE', 49, 'FAC-2025-062'),
    (10, 8, '2025-07-20', 'SORTIE', 'VENTE', 50, 'FAC-2025-063'),
    (10, 10, '2025-07-25', 'SORTIE', 'VENTE', 51, 'FAC-2025-064'),
    -- Mouvements ventes Août 2025
    (8, 15, '2025-08-05', 'SORTIE', 'VENTE', 52, 'FAC-2025-070'),
    (9, 10, '2025-08-10', 'SORTIE', 'VENTE', 53, 'FAC-2025-071'),
    (2, 12, '2025-08-15', 'SORTIE', 'VENTE', 54, 'FAC-2025-072'),
    (10, 8, '2025-08-20', 'SORTIE', 'VENTE', 55, 'FAC-2025-073'),
    (4, 8, '2025-08-25', 'SORTIE', 'VENTE', 56, 'FAC-2025-074'),
    -- Mouvements ventes Septembre 2025
    (1, 15, '2025-09-05', 'SORTIE', 'VENTE', 57, 'FAC-2025-080'),
    (5, 8, '2025-09-10', 'SORTIE', 'VENTE', 58, 'FAC-2025-081'),
    (10, 10, '2025-09-15', 'SORTIE', 'VENTE', 59, 'FAC-2025-082'),
    (3, 5, '2025-09-20', 'SORTIE', 'VENTE', 60, 'FAC-2025-083'),
    (6, 8, '2025-09-25', 'SORTIE', 'VENTE', 61, 'FAC-2025-084'),
    -- Mouvements ventes Octobre 2025
    (8, 12, '2025-10-05', 'SORTIE', 'VENTE', 62, 'FAC-2025-090'),
    (9, 10, '2025-10-10', 'SORTIE', 'VENTE', 63, 'FAC-2025-091'),
    (10, 8, '2025-10-15', 'SORTIE', 'VENTE', 64, 'FAC-2025-092'),
    (10, 10, '2025-10-20', 'SORTIE', 'VENTE', 65, 'FAC-2025-093'),
    (1, 12, '2025-10-25', 'SORTIE', 'VENTE', 66, 'FAC-2025-094'),
    -- Mouvements ventes Novembre 2025
    (2, 10, '2025-11-05', 'SORTIE', 'VENTE', 67, 'FAC-2025-100'),
    (5, 8, '2025-11-10', 'SORTIE', 'VENTE', 68, 'FAC-2025-101'),
    (10, 8, '2025-11-15', 'SORTIE', 'VENTE', 69, 'FAC-2025-102'),
    (9, 8, '2025-11-20', 'SORTIE', 'VENTE', 70, 'FAC-2025-103'),
    (4, 10, '2025-11-25', 'SORTIE', 'VENTE', 71, 'FAC-2025-104'),
    -- Mouvements ventes Décembre 2025
    (10, 8, '2025-12-05', 'SORTIE', 'VENTE', 72, 'FAC-2025-110'),
    (8, 10, '2025-12-10', 'SORTIE', 'VENTE', 73, 'FAC-2025-111'),
    (1, 15, '2025-12-15', 'SORTIE', 'VENTE', 74, 'FAC-2025-112'),
    (10, 8, '2025-12-20', 'SORTIE', 'VENTE', 75, 'FAC-2025-113'),
    (9, 8, '2025-12-25', 'SORTIE', 'VENTE', 76, 'FAC-2025-114'),
    -- Mouvements ventes Janvier 2026
    (1, 15, '2026-01-05', 'SORTIE', 'VENTE', 77, 'FAC-2026-001'),
    (10, 9, '2026-01-10', 'SORTIE', 'VENTE', 78, 'FAC-2026-002'),
    (8, 1, '2026-01-10', 'SORTIE', 'VENTE', 78, 'FAC-2026-002'),
    (5, 10, '2026-01-15', 'SORTIE', 'VENTE', 79, 'FAC-2026-003'),
    (4, 8, '2026-01-20', 'SORTIE', 'VENTE', 80, 'FAC-2026-004');


-- Mise à jour du stock courant basé sur les ventes
-- stock courant = stock initial - somme des ventes
UPDATE product p
SET current_stock_quantity = COALESCE(p.initial_stock_quantity, 0) - COALESCE(
    (SELECT SUM(s.quantity_sold) 
     FROM sale s 
     WHERE s.product_id = p.id_product), 
    0
);


-- Insertion de bills
-- INSERT INTO bill (date_bill, customer_id, total, deposit, amount_due)
-- VALUES
--     ('2024-08-24 10:00:00', 1, 200.00, 0.0, 200.00),
--     ('2024-08-25 12:00:00', 2, 270.00, 0.0, 270.00);

-- Insertion des factures (Bills) basées sur les ventes
-- Batch 1: Janvier-Février 2025
INSERT INTO Bill (total, deposit, amount_due, date_bill, payment_status, customer_id)
VALUES
    (206.00, 0.00, 206.00, '2025-01-10 10:00:00', 'UNPAID', 1),
    (541.07, 0.00, 541.07, '2025-01-12 11:00:00', 'UNPAID', 2),
    (44.39, 0.00, 44.39, '2025-01-15 14:00:00', 'PAID', 3),
    (46.00, 0.00, 46.00, '2025-01-18 09:00:00', 'PAID', 4),
    (59.67, 0.00, 59.67, '2025-01-20 15:00:00', 'UNPAID', 5),
    (396.18, 100.00, 296.18, '2025-01-25 10:30:00', 'PARTIALLY_PAID', 6),
    (257.50, 0.00, 257.50, '2025-02-05 11:00:00', 'UNPAID', 7),
    (192.85, 0.00, 192.85, '2025-02-08 13:00:00', 'PAID', 8),
    (57.50, 0.00, 57.50, '2025-02-10 10:00:00', 'PAID', 9),
    (175.84, 0.00, 175.84, '2025-02-12 14:00:00', 'UNPAID', 10),
    (225.68, 50.00, 175.68, '2025-02-15 09:30:00', 'PARTIALLY_PAID', 11),
    (271.97, 0.00, 271.97, '2025-02-18 11:00:00', 'UNPAID', 12),
    (262.54, 0.00, 262.54, '2025-02-22 15:00:00', 'PAID', 13),
    (53.27, 0.00, 53.27, '2025-02-25 10:00:00', 'PAID', 14);

-- Batch 2: Mars 2025
INSERT INTO Bill (total, deposit, amount_due, date_bill, payment_status, customer_id)
VALUES
    (345.62, 0.00, 345.62, '2025-03-02 11:00:00', 'UNPAID', 15),
    (46.00, 0.00, 46.00, '2025-03-05 14:00:00', 'PAID', 16),
    (649.28, 200.00, 449.28, '2025-03-08 10:00:00', 'PARTIALLY_PAID', 17),
    (146.54, 0.00, 146.54, '2025-03-10 13:00:00', 'UNPAID', 18),
    (44.39, 0.00, 44.39, '2025-03-15 09:00:00', 'PAID', 19),
    (338.52, 0.00, 338.52, '2025-03-18 11:30:00', 'UNPAID', 20),
    (330.15, 100.00, 230.15, '2025-03-20 15:00:00', 'PARTIALLY_PAID', 21),
    (206.00, 0.00, 206.00, '2025-03-25 10:00:00', 'PAID', 22);

-- Batch 3: Avril 2025
INSERT INTO Bill (total, deposit, amount_due, date_bill, payment_status, customer_id)
VALUES
    (1196.80, 0.00, 1196.80, '2025-04-02 11:00:00', 'UNPAID', 23),
    (217.57, 0.00, 217.57, '2025-04-05 14:00:00', 'PAID', 24),
    (145.05, 0.00, 145.05, '2025-04-08 10:00:00', 'PAID', 25),
    (957.44, 300.00, 657.44, '2025-04-12 13:00:00', 'PARTIALLY_PAID', 26),
    (196.91, 0.00, 196.91, '2025-04-15 09:00:00', 'UNPAID', 27),
    (66.59, 0.00, 66.59, '2025-04-18 11:00:00', 'PAID', 28),
    (57.50, 0.00, 57.50, '2025-04-22 15:00:00', 'PAID', 29),
    (276.50, 0.00, 276.50, '2025-04-25 10:00:00', 'UNPAID', 30);

-- Batch 4: Mai 2025
INSERT INTO Bill (total, deposit, amount_due, date_bill, payment_status, customer_id)
VALUES
    (185.40, 0.00, 185.40, '2025-05-05 11:00:00', 'UNPAID', 1),
    (432.85, 100.00, 332.85, '2025-05-08 14:00:00', 'PARTIALLY_PAID', 2),
    (330.15, 0.00, 330.15, '2025-05-10 10:00:00', 'PAID', 3),
    (53.27, 0.00, 53.27, '2025-05-12 13:00:00', 'PAID', 4),
    (97.69, 0.00, 97.69, '2025-05-15 09:00:00', 'UNPAID', 5),
    (46.00, 0.00, 46.00, '2025-05-18 11:00:00', 'PAID', 6),
    (154.50, 0.00, 154.50, '2025-05-22 15:00:00', 'UNPAID', 7),
    (160.71, 0.00, 160.71, '2025-05-25 10:00:00', 'PAID', 8);

-- Batch 5: Juin 2025
INSERT INTO Bill (total, deposit, amount_due, date_bill, payment_status, customer_id)
VALUES
    (69.00, 0.00, 69.00, '2025-06-02 11:00:00', 'PAID', 9),
    (181.31, 0.00, 181.31, '2025-06-05 14:00:00', 'UNPAID', 10),
    (541.07, 150.00, 391.07, '2025-06-08 10:00:00', 'PARTIALLY_PAID', 11),
    (718.08, 0.00, 718.08, '2025-06-12 13:00:00', 'UNPAID', 12),
    (97.69, 0.00, 97.69, '2025-06-15 09:00:00', 'PAID', 13),
    (276.50, 0.00, 276.50, '2025-06-18 11:00:00', 'UNPAID', 14),
    (53.27, 0.00, 53.27, '2025-06-22 15:00:00', 'PAID', 15),
    (46.00, 0.00, 46.00, '2025-06-25 10:00:00', 'PAID', 16);

-- Batch 6: Juillet 2025
INSERT INTO Bill (total, deposit, amount_due, date_bill, payment_status, customer_id)
VALUES
    (541.07, 0.00, 541.07, '2025-07-05 11:00:00', 'UNPAID', 17),
    (330.15, 100.00, 230.15, '2025-07-10 14:00:00', 'PARTIALLY_PAID', 18),
    (206.00, 0.00, 206.00, '2025-07-15 10:00:00', 'PAID', 19),
    (128.57, 0.00, 128.57, '2025-07-20 13:00:00', 'PAID', 20),
    (282.10, 0.00, 282.10, '2025-07-25 09:00:00', 'UNPAID', 21);

-- Batch 7: Août 2025
INSERT INTO Bill (total, deposit, amount_due, date_bill, payment_status, customer_id)
VALUES
    (66.59, 0.00, 66.59, '2025-08-05 11:00:00', 'PAID', 22),
    (57.50, 0.00, 57.50, '2025-08-10 14:00:00', 'PAID', 23),
    (432.85, 0.00, 432.85, '2025-08-15 10:00:00', 'UNPAID', 24),
    (276.50, 80.00, 196.50, '2025-08-20 13:00:00', 'PARTIALLY_PAID', 25),
    (78.15, 0.00, 78.15, '2025-08-25 09:00:00', 'PAID', 26);

-- Batch 8: Septembre 2025
INSERT INTO Bill (total, deposit, amount_due, date_bill, payment_status, customer_id)
VALUES
    (154.50, 0.00, 154.50, '2025-09-05 11:00:00', 'UNPAID', 27),
    (264.12, 0.00, 264.12, '2025-09-10 14:00:00', 'PAID', 28),
    (160.71, 0.00, 160.71, '2025-09-15 10:00:00', 'PAID', 29),
    (598.40, 200.00, 398.40, '2025-09-20 13:00:00', 'PARTIALLY_PAID', 30),
    (145.05, 0.00, 145.05, '2025-09-25 09:00:00', 'PAID', 1);

-- Batch 9: Octobre 2025
INSERT INTO Bill (total, deposit, amount_due, date_bill, payment_status, customer_id)
VALUES
    (53.27, 0.00, 53.27, '2025-10-05 11:00:00', 'PAID', 2),
    (57.50, 0.00, 57.50, '2025-10-10 14:00:00', 'PAID', 3),
    (225.68, 0.00, 225.68, '2025-10-15 10:00:00', 'UNPAID', 4),
    (345.62, 100.00, 245.62, '2025-10-20 13:00:00', 'PARTIALLY_PAID', 5),
    (123.60, 0.00, 123.60, '2025-10-25 09:00:00', 'PAID', 6);

-- Batch 10: Novembre 2025
INSERT INTO Bill (total, deposit, amount_due, date_bill, payment_status, customer_id)
VALUES
    (360.71, 0.00, 360.71, '2025-11-05 11:00:00', 'UNPAID', 7),
    (264.12, 0.00, 264.12, '2025-11-10 14:00:00', 'PAID', 8),
    (128.57, 0.00, 128.57, '2025-11-15 10:00:00', 'PAID', 9),
    (46.00, 0.00, 46.00, '2025-11-20 13:00:00', 'PAID', 10),
    (97.69, 0.00, 97.69, '2025-11-25 09:00:00', 'UNPAID', 11);

-- Batch 11: Décembre 2025
INSERT INTO Bill (total, deposit, amount_due, date_bill, payment_status, customer_id)
VALUES
    (276.50, 0.00, 276.50, '2025-12-05 11:00:00', 'UNPAID', 12),
    (44.39, 0.00, 44.39, '2025-12-10 14:00:00', 'PAID', 13),
    (154.50, 0.00, 154.50, '2025-12-15 10:00:00', 'PAID', 14),
    (225.68, 50.00, 175.68, '2025-12-20 13:00:00', 'PARTIALLY_PAID', 15),
    (46.00, 0.00, 46.00, '2025-12-25 09:00:00', 'PAID', 16);

-- Batch 12: Janvier 2026
INSERT INTO Bill (total, deposit, amount_due, date_bill, payment_status, customer_id)
VALUES
    (154.50, 0.00, 154.50, '2026-01-05 11:00:00', 'UNPAID', 17),
    -- remise de 30 (appliquée au niveau ligne produit -> ici la 2e ligne devient 0),
    -- la facture 78 passe donc de 160.71 à 144.639 (seulement la 1ère ligne conservée)
    (144.639, 0.00, 144.639, '2026-01-10 14:00:00', 'PAID', 18),
    (330.15, 100.00, 230.15, '2026-01-15 10:00:00', 'PARTIALLY_PAID', 19),
    (78.15, 0.00, 78.15, '2026-01-20 13:00:00', 'PAID', 20);

-- Insertion des products de facture (Bill_Product) correspondant aux ventes
INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    -- Ventes Janvier 2025
    (1, 1, 20, 206.00),     -- FAC-2025-001: VALPRIMER 1KG
    (2, 2, 15, 541.07),     -- FAC-2025-002: VALPRIMER 4KG
    (3, 8, 10, 44.39),      -- FAC-2025-003: VALTEX 1KG
    (4, 9, 8, 46.00),       -- FAC-2025-004: VALBLANC 1KG
    (5, 7, 15, 59.67),      -- FAC-2025-005: VALMAT 1KG
    (6, 5, 12, 396.18),     -- FAC-2025-006: VALFIX 4KG
    
    -- Ventes Février 2025
    (7, 1, 25, 257.50),     -- FAC-2025-010: VALPRIMER 1KG
    (8, 10, 12, 192.85),    -- FAC-2025-011: VALPRO MAT 5KG
    (9, 9, 10, 57.50),      -- FAC-2025-012: VALBLANC 1KG
    (10, 4, 18, 175.84),    -- FAC-2025-013: VALFIX 1KG
    (11, 10, 8, 225.68),    -- FAC-2025-014: VALPRO MAT 5KG
    (12, 6, 15, 271.97),    -- FAC-2025-015: FISSATIVO 0.8LT
    (13, 7, 20, 262.54),    -- FAC-2025-016: VALMAT 1KG
    (14, 8, 12, 53.27),     -- FAC-2025-017: VALTEX 1KG
    
    -- Ventes Mars 2025
    (15, 10, 10, 345.62),   -- FAC-2025-020: VALPRO MAT 5KG
    (16, 9, 8, 46.00),      -- FAC-2025-021: VALBLANC 1KG
    (17, 2, 18, 649.28),    -- FAC-2025-022: VALPRIMER 4KG
    (18, 4, 15, 146.54),    -- FAC-2025-023: VALFIX 1KG
    (19, 8, 10, 44.39),     -- FAC-2025-024: VALTEX 1KG
    (20, 10, 12, 338.52),   -- FAC-2025-025: VALPRO MAT 5KG
    (21, 5, 10, 330.15),    -- FAC-2025-026: VALFIX 4KG
    (22, 1, 20, 206.00),    -- FAC-2025-027: VALPRIMER 1KG
    
    -- Ventes Avril 2025
    (23, 3, 10, 1196.80),   -- FAC-2025-030: VALPRIMER 18KG
    (24, 6, 12, 217.57),    -- FAC-2025-031: FISSATIVO 0.8LT
    (25, 6, 8, 145.05),     -- FAC-2025-032: FISSATIVO 0.8LT
    (26, 3, 8, 957.44),     -- FAC-2025-033: VALPRIMER 18KG
    (27, 7, 15, 196.91),    -- FAC-2025-034: VALMAT 1KG
    (28, 8, 15, 66.59),     -- FAC-2025-035: VALTEX 1KG
    (29, 9, 10, 57.50),     -- FAC-2025-036: VALBLANC 1KG
    (30, 10, 8, 276.50),    -- FAC-2025-037: VALPRO MAT 5KG
    
    -- Ventes Mai 2025
    (31, 1, 18, 185.40),    -- FAC-2025-040: VALPRIMER 1KG
    (32, 2, 12, 432.85),    -- FAC-2025-041: VALPRIMER 4KG
    (33, 5, 10, 330.15),    -- FAC-2025-042: VALFIX 4KG
    (34, 8, 12, 53.27),     -- FAC-2025-043: VALTEX 1KG
    (35, 4, 10, 97.69),     -- FAC-2025-044: VALFIX 1KG
    (36, 9, 8, 46.00),      -- FAC-2025-045: VALBLANC 1KG
    (37, 1, 15, 154.50),    -- FAC-2025-046: VALPRIMER 1KG
    (38, 10, 10, 160.71),   -- FAC-2025-047: VALPRO MAT 5KG
    
    -- Ventes Juin 2025
    (39, 9, 12, 69.00),     -- FAC-2025-050: VALBLANC 1KG
    (40, 6, 10, 181.31),    -- FAC-2025-051: FISSATIVO 0.8LT
    (41, 2, 15, 541.07),    -- FAC-2025-052: VALPRIMER 4KG
    (42, 3, 6, 718.08),     -- FAC-2025-053: VALPRIMER 18KG
    (43, 4, 10, 97.69),     -- FAC-2025-054: VALFIX 1KG
    (44, 10, 8, 276.50),    -- FAC-2025-055: VALPRO MAT 5KG
    (45, 8, 12, 53.27),     -- FAC-2025-056: VALTEX 1KG
    (46, 9, 8, 46.00),      -- FAC-2025-057: VALBLANC 1KG
    
    -- Ventes Juillet 2025
    (47, 2, 15, 541.07),    -- FAC-2025-060: VALPRIMER 4KG
    (48, 5, 10, 330.15),    -- FAC-2025-061: VALFIX 4KG
    (49, 1, 20, 206.00),    -- FAC-2025-062: VALPRIMER 1KG
    (50, 10, 8, 128.57),    -- FAC-2025-063: VALPRO MAT 5KG
    (51, 10, 10, 282.10),   -- FAC-2025-064: VALPRO MAT 5KG
    
    -- Ventes Août 2025
    (52, 8, 15, 66.59),     -- FAC-2025-070: VALTEX 1KG
    (53, 9, 10, 57.50),     -- FAC-2025-071: VALBLANC 1KG
    (54, 2, 12, 432.85),    -- FAC-2025-072: VALPRIMER 4KG
    (55, 10, 8, 276.50),    -- FAC-2025-073: VALPRO MAT 5KG
    (56, 4, 8, 78.15),      -- FAC-2025-074: VALFIX 1KG
    
    -- Ventes Septembre 2025
    (57, 1, 15, 154.50),    -- FAC-2025-080: VALPRIMER 1KG
    (58, 5, 8, 264.12),     -- FAC-2025-081: VALFIX 4KG
    (59, 10, 10, 160.71),   -- FAC-2025-082: VALPRO MAT 5KG
    (60, 3, 5, 598.40),     -- FAC-2025-083: VALPRIMER 18KG
    (61, 6, 8, 145.05),     -- FAC-2025-084: FISSATIVO 0.8LT
    
    -- Ventes Octobre 2025
    (62, 8, 12, 53.27),     -- FAC-2025-090: VALTEX 1KG
    (63, 9, 10, 57.50),     -- FAC-2025-091: VALBLANC 1KG
    (64, 10, 8, 225.68),    -- FAC-2025-092: VALPRO MAT 5KG
    (65, 10, 10, 345.62),   -- FAC-2025-093: VALPRO MAT 5KG
    (66, 1, 12, 123.60),    -- FAC-2025-094: VALPRIMER 1KG
    
    -- Ventes Novembre 2025
    (67, 2, 10, 360.71),    -- FAC-2025-100: VALPRIMER 4KG
    (68, 5, 8, 264.12),     -- FAC-2025-101: VALFIX 4KG
    (69, 10, 8, 128.57),    -- FAC-2025-102: VALPRO MAT 5KG
    (70, 9, 8, 46.00),      -- FAC-2025-103: VALBLANC 1KG
    (71, 4, 10, 97.69),     -- FAC-2025-104: VALFIX 1KG
    
    -- Ventes Décembre 2025
    (72, 10, 8, 276.50),    -- FAC-2025-110: VALPRO MAT 5KG
    (73, 8, 10, 44.39),     -- FAC-2025-111: VALTEX 1KG
    (74, 1, 15, 154.50),    -- FAC-2025-112: VALPRIMER 1KG
    (75, 10, 8, 225.68),    -- FAC-2025-113: VALPRO MAT 5KG
    (76, 9, 8, 46.00),      -- FAC-2025-114: VALBLANC 1KG
    
    -- Ventes Janvier 2026
    (77, 1, 15, 154.50),    -- FAC-2026-001: VALPRIMER 1KG
    (78, 10, 9, 144.639),   -- FAC-2026-002: VALPRO MAT 5KG (partie)
    (78, 8, 1, 0.000),      -- FAC-2026-002: VALTEX 1KG (partie) remise appliquée (ligne à 0)
    (79, 5, 10, 330.15),    -- FAC-2026-003: VALFIX 4KG
    (80, 4, 8, 78.15);      -- FAC-2026-004: VALFIX 1KG
