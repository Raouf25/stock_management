-- Initial data migration
-- This script populates the database with test data for development

-- Insert suppliers (representative sample covering different categories)
INSERT INTO supplier (name, address, phone, email, web_site, tva_code, rib, iban, contact_person)
VALUES
    ('Valpaint Tunisie S.A.', 'Avenue de l''U.M.A, Zone Industrielle Charguia II, Tunis', '+216 71 494 496', 'commercial@valpaint.tn', 'www.valpaint.tn', '954308X/A/M/000', '08110010021000316328', 'TN59 0811 0010 0210 0031 6328', 'Karim Ben Salem'),
    ('Société Tunisienne de Quincaillerie (STQ)', 'Rue des Artisans, ZI Ben Arous', '+216 71 385 120', 'commandes@stq-tunisie.com', 'www.stq-tunisie.com', '145789B/A/M/000', '08210010031000428431', 'TN59 0821 0010 0310 0042 8431', 'Nadia Khelifi'),
    ('Matériaux du Nord SARL', 'Boulevard Industriel, Bizerte', '+216 72 520 850', 'contact@materiauxdunord.tn', 'www.materiauxdunord.tn', '678901C/B/M/000', '08310010041000536532', 'TN59 0831 0010 0410 0053 6532', 'Fathi Hamdi'),
    ('Productis Chimie & Bâtiment', 'Route de Sousse Km 4, Zaghouan', '+216 72 675 234', 'ventes@productis.com.tn', 'www.productis.com.tn', '234567D/A/M/000', '08410010051000644633', 'TN59 0841 0010 0510 0064 4633', 'Sonia Agrebi'),
    ('Import & Distribution Maghreb (IDM)', 'Avenue Hédi Chaker, Sfax', '+216 74 298 765', 'info@idm-trading.tn', 'www.idm-trading.tn', '890123E/C/M/000', '08510010061000752734', 'TN59 0851 0010 0610 0075 2734', 'Mohamed Jlassi'),
    ('Peintures & Enduits Sousse', 'Rue Farhat Hached, Zone Industrielle Sousse', '+216 73 245 890', 'service@peintures-sousse.tn', 'www.peintures-sousse.tn', '456789F/B/M/000', '08610010071000860835', 'TN59 0861 0010 0710 0086 0835', 'Amira Rebai');

-- Insert customers (representative sample with different statuses and cities)
INSERT INTO Customer (name, address, tva_code, phone, fax, email, full_name, cin, license_plate, city, status)
VALUES
    ('Entreprise Construction ABC', '123 Rue des Bâtisseurs, Tunis', '123456789/A/M/000', '+216 71 111 111', '+216 71 111 112', 'contact@constructionabc.com', 'Mohamed Ben Ali', '01234567', '1234 تونس 123', 'Tunis', 'ACTIVE'),
    ('Distrimat Services', '456 Boulevard du Commerce, Sfax', '987654321/B/M/000', '+216 74 222 222', '+216 74 222 223', 'info@distrimat.com', 'Ahmed Trabelsi', '02345678', '2345 تونس 234', 'Sfax', 'ACTIVE'),
    ('Peintures et Revêtements SA', '789 Avenue des Décorateurs, Sousse', '654321987/C/M/000', '+216 73 333 333', '+216 73 333 334', 'ventes@peintures-revetements.com', 'Karim Mansouri', '03456789', '3456 تونس 345', 'Sousse', 'ACTIVE'),
    ('Quincaillerie Générale SARL', '321 Rue de l''Industrie, Monastir', '456789123/D/M/000', '+216 73 444 444', '+216 73 444 445', 'admin@quincaillerie-gen.com', 'Youssef Bouazizi', '04567890', '4567 تونس 456', 'Monastir', 'PROSPECT'),
    ('Travaux Publics et Aménagement', '654 Avenue Principale, Hammamet', '789123456/E/M/000', '+216 72 555 555', '+216 72 555 556', 'contact@tp-amenagement.com', 'Slim Chaabane', '05678901', '5678 تونس 567', 'Hammamet', 'ACTIVE'),
    ('Devis Travaux Express', '159 Boulevard Artisanal, Kairouan', '159753486/G/M/000', '+216 77 777 777', '+216 77 777 778', 'contact@devistravaux.com', 'Hichem Jebali', '07890123', '7890 تونس 789', 'Kairouan', 'INACTIVE'),
    ('Commerce de Matériaux Premium', '357 Rue Premium, Zarzis', '357951753/M/M/000', '+216 75 404 040', '+216 75 404 041', 'ventes@mat-premium.com', 'Sami Riahi', '04456789', '4456 تونس 445', 'Zarzis', 'BLOCKED'),
    ('Distribution Complète du Bâtiment', '123 Boulevard Complet, Skhira', '123789456/P/M/000', '+216 74 707 070', '+216 74 707 071', 'ventes@distrib-complet.com', 'Hatem Cherif', '07789012', '7789 تونس 778', 'Skhira', 'PROSPECT');

-- Insert products (10 products for testing - distributed across suppliers)
INSERT INTO product (category, name, designation, unit, unit_price_bought, unit_price_sold, supplier_id, reference, image_url)
VALUES
    ('Impressions','VALPRIMER','Primaire d''accrochage pour surfaces lisses', '1.000 KG',8.656,10.300, 1, trunc(random()*10000000000000), 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=100&h=100&fit=crop'),
    ('Impressions','VALPRIMER','Primaire d''accrochage pour surfaces lisses', '4.000 KG',30.311,36.071, 1, trunc(random()*10000000000000), 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=100&h=100&fit=crop'),
    ('Impressions','VALPRIMER','Primaire d''accrochage pour surfaces lisses', '18.000 KG',126.450,150.476, 1, trunc(random()*10000000000000), 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=100&h=100&fit=crop'),
    ('Impressions','VALFIX','Fixateur de fond pour peintures', '1.000 KG',8.209,9.769, 4, trunc(random()*10000000000000), 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=100&h=100&fit=crop'),
    ('Impressions','VALFIX','Fixateur de fond pour peintures', '4.000 KG',27.744,33.015, 4, trunc(random()*10000000000000), 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=100&h=100&fit=crop'),
    ('Impressions','FISSATIVO 30G','Enduit de rebouchage pour fissures', '0.800 LT',15.236,18.131, 6, trunc(random()*10000000000000), 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop'),
    ('finitions','VALMAT','Peinture mate intérieure de qualité', '1.000 KG',3.343,3.978, 6, trunc(random()*10000000000000), 'https://images.unsplash.com/photo-1572297794908-f2ee5a2930d6?w=100&h=100&fit=crop'),
    ('finitions','VALTEX','Peinture satinée lavable haute résistance', '1.000 KG',3.730,4.439, 5, trunc(random()*10000000000000), 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=100&h=100&fit=crop'),
    ('finitions','VALBLANC','Peinture blanche universelle multi-supports', '1.000 KG',4.832,5.750, 5, trunc(random()*10000000000000), 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=100&h=100&fit=crop'),
    ('finitions','VALPRO MAT','Peinture professionnelle mate premium', '5.000 KG',23.705,28.210, 5, trunc(random()*10000000000000), 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=100&h=100&fit=crop');

-- Insert bills (invoices) - Must be inserted before delivery notes to establish relationships
INSERT INTO bill (date_bill, customer_id, total, deposit, amount_due, discount, delivery_address, payment_terms, notes, payment_status, apply_tva)
VALUES
    ('2025-02-25 10:30:00', 1, 910.000, 300.000, 610.000, 5.000, '123 Rue des Bâtisseurs, Tunis', '30 jours', 'Facture groupée: BL-2025-001 et BL-2025-002', 'PARTIALLY_PAID', true),
    ('2025-03-10 14:20:00', 2, 1843.560, 0.000, 1843.560, 0.000, '456 Boulevard du Commerce, Sfax', '60 jours', 'Facture relative au BL-2025-003', 'UNPAID', false),
    ('2025-03-25 09:15:00', 3, 450.000, 450.000, 0.000, 10.000, '789 Avenue des Décorateurs, Sousse', 'Comptant', 'Facture payée', 'PAID', true);

-- Insert bill products (Many-to-One: plusieurs produits par facture)
INSERT INTO bill_product (id_bill, id_product, quantity, total_product_price, discount_percentage)
VALUES
    -- Facture 1 (Client 1): 5 produits de 2 BL différents (BL-2025-001 + BL-2025-002)
    (1, 1, 20, 206.000, 0.0),
    (1, 4, 15, 146.535, 5.0),
    (1, 8, 30, 133.170, 0.0),
    (1, 1, 15, 154.500, 0.0),
    (1, 7, 35, 139.230, 0.0),
    -- Facture 2 (Client 2): 2 produits
    (2, 2, 15, 541.065, 0.0),
    (2, 5, 40, 1320.600, 0.0),
    -- Facture 3 (Client 3): 2 produits
    (3, 7, 50, 198.900, 10.0),
    (3, 9, 40, 230.000, 5.0);

-- Insert delivery notes (Many-to-One: plusieurs BL par client, Many-to-One: plusieurs BL peuvent être facturés ensemble)
-- Tous les statuts représentés: INVOICED, DELIVERED, PENDING, CANCELLED
INSERT INTO delivery_note (delivery_note_number, date_delivery, customer_id, total_amount, discount, delivery_address, notes, status, bill_id, invoiced, apply_tva, created_at, updated_at)
VALUES
    -- Plusieurs BL facturés ensemble (Many-to-One: BL-2025-001 + BL-2025-002 → bill_id=1) - Status: INVOICED
    ('BL-2025-001', '2025-02-10 08:30:00', 1, 625.000, 5.000, '123 Rue des Bâtisseurs, Tunis', 'Livraison matinée', 'INVOICED', 1, true, true, '2025-02-10 08:30:00', '2025-02-25 10:30:00'),
    ('BL-2025-002', '2025-02-20 10:00:00', 1, 285.000, 0.000, '123 Rue des Bâtisseurs, Tunis', 'Deuxième livraison', 'INVOICED', 1, true, true, '2025-02-20 10:00:00', '2025-02-25 10:30:00'),
    -- BL facturé seul (One-to-One) - Status: INVOICED
    ('BL-2025-003', '2025-03-05 11:00:00', 2, 1843.560, 0.000, '456 Boulevard du Commerce, Sfax', 'Livraison urgente', 'INVOICED', 2, true, false, '2025-03-05 11:00:00', '2025-03-10 14:20:00'),
    ('BL-2025-005', '2025-03-20 15:45:00', 3, 450.000, 10.000, '789 Avenue des Décorateurs, Sousse', 'Livraison après-midi', 'INVOICED', 3, true, true, '2025-03-20 15:45:00', '2025-03-25 09:15:00'),
    -- BL non encore facturés avec différents statuts
    ('BL-2025-004', '2025-03-15 09:30:00', 4, 450.000, 5.000, '321 Rue de l''Industrie, Monastir', 'En attente de validation', 'PENDING', NULL, false, false, '2025-03-15 09:30:00', '2025-03-15 09:30:00'),
    ('BL-2025-006', '2025-03-28 14:00:00', 5, 820.000, 0.000, '654 Avenue Principale, Hammamet', 'Livraison effectuée, à facturer', 'DELIVERED', NULL, false, true, '2025-03-28 14:00:00', '2025-03-28 14:00:00'),
    ('BL-2025-007', '2025-04-05 10:15:00', 6, 245.000, 0.000, '159 Boulevard Artisanal, Kairouan', 'Commande annulée par le client', 'CANCELLED', NULL, false, false, '2025-04-05 10:15:00', '2025-04-05 11:30:00');

-- Insert delivery note products (Many-to-One: plusieurs produits par BL)
INSERT INTO delivery_note_product (delivery_note_id, product_id, quantity, unit_price, total_price, discount)
VALUES
    -- BL-2025-001 (facturé avec BL-2025-002 -> bill_id=1): 3 produits
    (1, 1, 20, 10.300, 206.000, 0.000),
    (1, 4, 15, 9.769, 146.535, 0.000),
    (1, 8, 30, 4.439, 133.170, 0.000),
    -- BL-2025-002 (facturé avec BL-2025-001 -> bill_id=1): 2 produits
    (2, 1, 15, 10.300, 154.500, 0.000),
    (2, 7, 35, 3.978, 139.230, 0.000),
    -- BL-2025-003 (facturé seul -> bill_id=2): 2 produits
    (3, 2, 15, 36.071, 541.065, 0.000),
    (3, 5, 40, 33.015, 1320.600, 0.000),
    -- BL-2025-005 (facturé seul -> bill_id=3): 2 produits
    (4, 7, 50, 3.978, 198.900, 0.000),
    (4, 9, 40, 5.750, 230.000, 0.000),
    -- BL-2025-004 (PENDING): 3 produits
    (5, 4, 20, 9.769, 195.380, 0.000),
    (5, 8, 25, 4.439, 110.975, 0.000),
    (5, 9, 30, 5.750, 172.500, 0.000),
    -- BL-2025-006 (DELIVERED): 2 produits
    (6, 2, 10, 36.071, 360.710, 0.000),
    (6, 5, 15, 33.015, 495.225, 0.000),
    -- BL-2025-007 (CANCELLED): 2 produits
    (7, 7, 30, 3.978, 119.340, 0.000),
    (7, 9, 25, 5.750, 143.750, 0.000);

-- Insert sales (generated from bills)
INSERT INTO sale (date_sale, customer_id, product_id, invoice_number, quantity_sold, unit_sale_price, total_sale_amount, comment)
VALUES
    -- Ventes de la Facture 1 (Client 1 - BL-2025-001 + BL-2025-002)
    ('2025-02-25', 1, 1, 'FACT-2025-001', 20, 10.300, 206.000, 'Vente VALPRIMER 1KG - BL-2025-001'),
    ('2025-02-25', 1, 4, 'FACT-2025-001', 15, 9.769, 146.535, 'Vente VALFIX 1KG - BL-2025-001'),
    ('2025-02-25', 1, 8, 'FACT-2025-001', 30, 4.439, 133.170, 'Vente VALTEX - BL-2025-001'),
    ('2025-02-25', 1, 1, 'FACT-2025-001', 15, 10.300, 154.500, 'Vente VALPRIMER 1KG - BL-2025-002'),
    ('2025-02-25', 1, 7, 'FACT-2025-001', 35, 3.978, 139.230, 'Vente VALMAT - BL-2025-002'),
    -- Ventes de la Facture 2 (Client 2 - BL-2025-003)
    ('2025-03-10', 2, 2, 'FACT-2025-002', 15, 36.071, 541.065, 'Vente VALPRIMER 4KG - BL-2025-003'),
    ('2025-03-10', 2, 5, 'FACT-2025-002', 40, 33.015, 1320.600, 'Vente VALFIX 4KG - BL-2025-003'),
    -- Ventes de la Facture 3 (Client 3 - BL-2025-005)
    ('2025-03-25', 3, 7, 'FACT-2025-003', 50, 3.978, 198.900, 'Vente VALMAT - BL-2025-005'),
    ('2025-03-25', 3, 9, 'FACT-2025-003', 40, 5.750, 230.000, 'Vente VALBLANC - BL-2025-005');

-- Insert purchases (distributed across different suppliers)
INSERT INTO purchase (date_purchase, supplier_id, product_id, invoice_number, quantity, unit_pricettc, total_amountttc, comment)
VALUES
    -- Purchases from Supplier 1 - Valpaint Tunisie (Products 1,2,3)
    ('2025-01-05', 1, 1, 'VP-2025-001', 100, 8.656, 865.60, 'Achat initial VALPRIMER 1KG'),
    ('2025-01-05', 1, 2, 'VP-2025-002', 50, 30.311, 1515.55, 'Achat initial VALPRIMER 4KG'),
    ('2025-01-08', 1, 3, 'VP-2025-003', 40, 126.450, 5058.00, 'Achat initial VALPRIMER 18KG'),
    -- Purchases from Supplier 4 - Productis Chimie (Products 4,5)
    ('2025-01-12', 4, 4, 'PC-2025-0087', 80, 8.209, 656.72, 'Approvisionnement VALFIX 1KG'),
    ('2025-01-08', 4, 5, 'PC-2025-0065', 100, 27.744, 2774.40, 'Approvisionnement VALFIX 4KG'),
    -- Purchases from Supplier 6 - Peintures & Enduits Sousse (Products 6,7)
    ('2025-01-12', 6, 6, 'PES-2025-142', 70, 15.236, 1066.52, 'Commande FISSATIVO 30G 0.8LT'),
    ('2025-01-15', 6, 7, 'PES-2025-156', 100, 3.343, 334.30, 'Achat initial VALMAT 1KG'),
    ('2025-02-08', 6, 7, 'PES-2025-298', 80, 3.343, 267.44, 'Réapprovisionnement VALMAT 1KG'),
    -- Purchases from Supplier 5 - IDM Trading (Products 8,9,10)
    ('2025-01-10', 5, 8, 'IDM-2025-1543', 100, 3.730, 373.00, 'Stock VALTEX 1KG - Import'),
    ('2025-02-05', 5, 9, 'IDM-2025-1789', 120, 4.832, 579.84, 'Commande VALBLANC 1KG'),
    ('2025-03-01', 5, 10, 'IDM-2025-2012', 70, 23.705, 1659.35, 'VALPRO MAT 5KG - Import');
