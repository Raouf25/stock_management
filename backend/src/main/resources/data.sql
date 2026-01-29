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
INSERT INTO product (category, name, designation, unit, unit_price_bought, unit_price_sold, supplier_id, reference)
VALUES
    ('Impressions','VALPRIMER','Primaire d''accrochage pour surfaces lisses', '1.000 KG',8.656,10.300, 1, trunc(random()*10000000000000)),
    ('Impressions','VALPRIMER','Primaire d''accrochage pour surfaces lisses', '4.000 KG',30.311,36.071, 1, trunc(random()*10000000000000)),
    ('Impressions','VALPRIMER','Primaire d''accrochage pour surfaces lisses', '18.000 KG',126.450,150.476, 1, trunc(random()*10000000000000)),
    ('Impressions','VALFIX','Fixateur de fond pour peintures', '1.000 KG',8.209,9.769, 1, trunc(random()*10000000000000)),
    ('Impressions','VALFIX','Fixateur de fond pour peintures', '4.000 KG',27.744,33.015, 3, trunc(random()*10000000000000)),
    ('Impressions','FISSATIVO 30G','Enduit de rebouchage pour fissures', '0.800 LT',15.236,18.131, 3, trunc(random()*10000000000000)),
    ('FINITIONS','VALMAT','Peinture mate intérieure de qualité', '1.000 KG',3.343,3.978, 3, trunc(random()*10000000000000)),
    ('FINITIONS','VALTEX','Peinture satinée lavable haute résistance', '1.000 KG',3.730,4.439, 2, trunc(random()*10000000000000)),
    ('FINITIONS','VALBLANC','Peinture blanche universelle multi-supports', '1.000 KG',4.832,5.750, 2, trunc(random()*10000000000000)),
    ('FINITIONS','VALPRO MAT','Peinture professionnelle mate premium', '5.000 KG',23.705,28.210, 2, trunc(random()*10000000000000));


-- Insertion d'achats (basés sur les produits existants et leurs fournisseurs)
-- Ajusté pour les 10 produits seulement
INSERT INTO purchase (date_purchase, supplier_id, product_id, invoice_number, quantity, unit_pricettc, total_amountttc, comment)
VALUES
    -- Achats Fournisseur 1 (VALPRIMER 1KG, 4KG, 18KG - VALFIX 1KG) - Produits 1,2,3,4
    ('2025-01-05', 1, 1, 'BL-2025-001', 50, 8.656, 432.80, 'Achat initial VALPRIMER 1KG'),
    ('2025-01-05', 1, 2, 'BL-2025-002', 30, 30.311, 909.33, 'Achat initial VALPRIMER 4KG'),
    ('2025-01-08', 1, 3, 'BL-2025-003', 20, 126.450, 2529.00, 'Achat initial VALPRIMER 18KG'),
    ('2025-01-12', 1, 4, 'BL-2025-004', 40, 8.209, 328.36, 'Approvisionnement VALFIX 1KG'),
    -- Achats Fournisseur 3 (VALFIX 4KG, FISSATIVO, VALMAT) - Produits 5,6,7
    ('2025-01-08', 3, 5, 'BL-2025-015', 25, 27.744, 693.60, 'Approvisionnement VALFIX 4KG'),
    ('2025-01-12', 3, 6, 'BL-2025-017', 35, 15.236, 533.26, 'Commande FISSATIVO 30G 0.8LT'),
    ('2025-02-08', 3, 7, 'BL-2025-063', 50, 3.343, 167.15, 'Achat VALMAT 1KG'),
    
    -- Achats Fournisseur 2 (VALTEX, VALBLANC, VALPRO MAT) - Produits 8,9,10
    ('2025-01-10', 2, 8, 'BL-2025-025', 45, 3.730, 167.85, 'Stock VALTEX 1KG'),
    ('2025-02-05', 2, 9, 'BL-2025-052', 40, 4.832, 193.28, 'Commande VALBLANC 1KG'),
    ('2025-03-01', 2, 10, 'BL-2025-095', 35, 23.705, 829.68, 'VALPRO MAT 5KG');
    

-- Génération automatique des mouvements de stock basés sur les achats
-- Cette requête crée automatiquement un mouvement d'entrée pour chaque achat
INSERT INTO stock_mouvement (product_id, quantity, date, type, source, purchase_id, reference)
SELECT 
    p.product_id,
    p.quantity,
    p.date_purchase,
    'ENTREE',
    'ACHAT',
    p.id,
    p.invoice_number
FROM purchase p;

-- Mise à jour du stock initial basé sur la somme des achats
-- Cette requête calcule automatiquement la somme des quantités achetées pour chaque produit
UPDATE product p
SET initial_stock_quantity = COALESCE(
    (SELECT SUM(pur.quantity) 
     FROM purchase pur 
     WHERE pur.product_id = p.id_product), 
    0
); 
 
-- Mise à jour du stock courant basé sur les ventes
-- stock courant = stock initial - somme des ventes
UPDATE product p
SET current_stock_quantity = COALESCE(p.initial_stock_quantity, 0) - COALESCE(
    (SELECT SUM(s.quantity_sold) 
     FROM sale s 
     WHERE s.product_id = p.id_product), 
    0
);

-- Mise à jour des valeurs de stock et du CMP
UPDATE product p
SET 
    initial_stock_value = COALESCE(p.initial_stock_quantity, 0) * COALESCE(p.unit_price_bought, 0),
    current_stock_value = COALESCE(p.current_stock_quantity, 0) * COALESCE(p.unit_price_bought, 0),
    cmp = CASE 
        WHEN COALESCE(p.current_stock_quantity, 0) > 0 THEN p.unit_price_bought
        ELSE 0
    END;

 