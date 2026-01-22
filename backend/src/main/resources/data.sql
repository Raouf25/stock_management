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
INSERT INTO product (category, name, unit, unit_price_bought, unit_price_sold, supplier_id, reference)
VALUES
    ('Impressions','VALPRIMER','1.000 KG',8.656,10.300, 1, trunc(random()*10000000000000)),
    ('Impressions','VALPRIMER','4.000 KG',30.311,36.071, 1, trunc(random()*10000000000000)),
    ('Impressions','VALPRIMER','18.000 KG',126.450,150.476, 1, trunc(random()*10000000000000)),
    ('Impressions','VALFIX','1.000 KG',8.209,9.769, 1, trunc(random()*10000000000000)),
    ('Impressions','VALFIX','4.000 KG',27.744,33.015, 3, trunc(random()*10000000000000)),
    ('Impressions','VALFIX','18.000 KG',118.260,140.729, 3, trunc(random()*10000000000000)),
    ('Impressions','FISSATIVO 30G','0.800 LT',15.236,18.131, 3, trunc(random()*10000000000000)),
    ('Impressions','FISSATIVO 30G','4.000 LT',62.384,74.238, 3, trunc(random()*10000000000000)),
    ('Impressions','FISSATIVO 30G','10.000 LT',142.788,169.918, 3, trunc(random()*10000000000000)),
    ('FINITIONS','VALMAT','1.000 KG',3.343,3.978, 3, trunc(random()*10000000000000)),
    ('FINITIONS','VALMAT','5.000 KG',11.031,13.127, 3, trunc(random()*10000000000000)),
    ('FINITIONS','VALMAT','23.000 KG',45.418,54.047, 3, trunc(random()*10000000000000)),
    ('FINITIONS','VALMAT','40.000 KG',69.907,83.190, 3, trunc(random()*10000000000000)),
    ('FINITIONS','VALTEX','1.000 KG',3.730,4.439, 2, trunc(random()*10000000000000)),
    ('FINITIONS','VALTEX','5.000 KG',13.505,16.071, 2, trunc(random()*10000000000000)),
    ('FINITIONS','VALTEX','23.000 KG',55.596,66.159, 2, trunc(random()*10000000000000)),
    ('FINITIONS','VALTEX','40.000 KG',89.121,106.054, 2, trunc(random()*10000000000000)),
    ('FINITIONS','VALBLANC','1.000 KG',4.832,5.750, 2, trunc(random()*10000000000000)),
    ('FINITIONS','VALBLANC','5.000 KG',18.132,21.577, 2, trunc(random()*10000000000000)),
    ('FINITIONS','VALBLANC','23.000 KG',74.768,88.974, 2, trunc(random()*10000000000000)),
    ('FINITIONS','VALBLANC','40.000 KG',124.948,148.688, 2, trunc(random()*10000000000000)),
    ('FINITIONS','VALPRO SATINE','4.000 KG',41.639,49.551, 2, trunc(random()*10000000000000)),
    ('FINITIONS','VALPRO SATINE','18.000 KG',174.084,207.159, 2, trunc(random()*10000000000000)),
    ('FINITIONS','VALPRO MAT','5.000 KG',23.705,28.210, 2, trunc(random()*10000000000000)),
    ('FINITIONS','VALPRO MAT','23.000 KG',98.437,117.140, 2, trunc(random()*10000000000000)),
    ('FINITIONS','VALPRO MAT','40.000 KG',163.934,195.082, 2, trunc(random()*10000000000000)),
    ('FINITIONS','VALTOP','5.000 KG',29.044,34.562, 2, trunc(random()*10000000000000)),
    ('FINITIONS','VALTOP','23.000 KG',121.300,144.347, 2, trunc(random()*10000000000000)),
    ('FINITIONS','VALTOP','40.000 KG',203.065,241.647, 2, trunc(random()*10000000000000)),
    ('FINITIONS','VALIDRO BRILLANT','0.800 KG',16.094,19.152, 2, trunc(random()*10000000000000)),
    ('FINITIONS','VALIDRO BRILLANT','4.000 KG',74.645,88.827, 2, trunc(random()*10000000000000)),
    ('FINITIONS','VALIDRO BRILLANT','15.000 KG',278.604,331.538, 2, trunc(random()*10000000000000)),
    ('FINITIONS','VALIDRO MAT','0.800 KG',14.376,17.107, 2, trunc(random()*10000000000000)),
    ('FINITIONS','VALIDRO MAT','4.000 KG',66.051,78.600, 2, trunc(random()*10000000000000)),
    ('FINITIONS','VALIDRO MAT','15.000 KG',246.376,293.188, 2, trunc(random()*10000000000000)),
    ('FINITIONS','VALIDRO SATINE','0.800 KG',15.998,19.037, 2, trunc(random()*10000000000000)),
    ('FINITIONS','VALIDRO SATINE','4.000 KG',74.161,88.251, 2, trunc(random()*10000000000000)),
    ('FINITIONS','VALIDRO SATINE','15.000 KG',276.789,329.379, 2, trunc(random()*10000000000000)),
    ('FINITIONS','TRASPIRANTE 209','0.800 KG',6.385,7.598, 2, trunc(random()*10000000000000)),
    ('FINITIONS','TRASPIRANTE 209','4.000 KG',21.144,25.161, 2, trunc(random()*10000000000000)),
    ('FINITIONS','TRASPIRANTE 209','15.000 KG',73.312,87.241, 2, trunc(random()*10000000000000)),
    ('FINITIONS','TRASPIRANTE 409','0.800 KG',8.423,10.023, 2, trunc(random()*10000000000000)),
    ('FINITIONS','TRASPIRANTE 409','4.000 KG',31.711,37.736, 2, trunc(random()*10000000000000)),
    ('FINITIONS','TRASPIRANTE 409','15.000 KG',110.608,131.623, 2, trunc(random()*10000000000000)),
    ('FINITIONS','V 55 BASE FONCEE','0.800 KG',11.127,13.241, 2, trunc(random()*10000000000000)),
    ('FINITIONS','V 55 BASE FONCEE','4.000 KG',43.577,51.857, 2, trunc(random()*10000000000000)),
    ('FINITIONS','V 55 BASE FONCEE','15.000 KG',155.983,185.620, 2, trunc(random()*10000000000000)),
    ('FINITIONS','V 55 BASE CLAIRE','0.800 KG',14.440,17.184, 2, trunc(random()*10000000000000)),
    ('FINITIONS','V 55 BASE CLAIRE','4.000 KG',61.223,72.856, 2, trunc(random()*10000000000000)),
    ('FINITIONS','V 55 BASE CLAIRE','15.000 KG',222.452,264.718, 2, trunc(random()*10000000000000)),
    ('FINITIONS','V 55 BASE BLANCHE','0.800 KG',12.253,14.581, 2, trunc(random()*10000000000000)),
    ('FINITIONS','V 55 BASE BLANCHE','4.000 KG',50.593,60.206, 2, trunc(random()*10000000000000)),
    ('FINITIONS','V 55 BASE BLANCHE','15.000 KG',179.104,213.134, 2, trunc(random()*10000000000000)),
    ('FINITIONS','V 88 BASE FONCEE','0.800 KG',12.912,15.365, 2, trunc(random()*10000000000000)),
    ('FINITIONS','V 88 BASE FONCEE','4.000 KG',51.299,61.046, 2, trunc(random()*10000000000000)),
    ('FINITIONS','V 88 BASE FONCEE','15.000 KG',188.029,223.754, 2, trunc(random()*10000000000000)),
    ('FINITIONS','V 88 BASE CLAIRE','0.800 KG',15.442,18.376, 2, trunc(random()*10000000000000)),
    ('FINITIONS','V 88 BASE CLAIRE','4.000 KG',65.459,77.897, 2, trunc(random()*10000000000000)),
    ('FINITIONS','V 88 BASE CLAIRE','15.000 KG',237.647,282.800, 2, trunc(random()*10000000000000)),
    ('FINITIONS','V 88 BASE BLANCHE','0.800 KG',15.695,18.677, 2, trunc(random()*10000000000000)),
    ('FINITIONS','V 88 BASE BLANCHE','4.000 KG',65.762,78.257, 2, trunc(random()*10000000000000)),
    ('FINITIONS','V 88 BASE BLANCHE','15.000 KG',241.955,287.926, 2, trunc(random()*10000000000000)),
    ('ENDUITS','RASAPRIM','5.000 KG',12.584,14.975, 2, trunc(random()*10000000000000)),
    ('ENDUITS','RASAPRIM','25.000 KG',56.701,67.474, 2, trunc(random()*10000000000000)),
    ('ENDUITS','RASAPRIM','40.000 KG',86.750,103.233, 2, trunc(random()*10000000000000)),
    ('ENDUITS','RASABEN','5.000 KG',11.711,13.936, 2, trunc(random()*10000000000000)),
    ('ENDUITS','RASABEN','25.000 KG',51.061,60.762, 2, trunc(random()*10000000000000)),
    ('ENDUITS','RASABEN','40.000 KG',76.885,91.493, 2, trunc(random()*10000000000000)),
    ('ENDUITS','RASAFIN','5.000 KG',11.850,14.102, 2, trunc(random()*10000000000000)),
    ('ENDUITS','RASAFIN','25.000 KG',51.739,61.569, 2, trunc(random()*10000000000000)),
    ('ENDUITS','RASAFIN','40.000 KG',77.957,92.769, 2, trunc(random()*10000000000000)),
    ('ENDUITS','VALENDUIT','1.000 KG',3.734,4.443, 2, trunc(random()*10000000000000)),
    ('ENDUITS','VALENDUIT','5.000 KG',12.908,15.361, 2, trunc(random()*10000000000000)),
    ('ENDUITS','VALENDUIT','20.000 KG',48.540,57.762, 2, trunc(random()*10000000000000)),
    ('ENDUITS','VALENDUIT','40.000 KG',88.821,105.697, 2, trunc(random()*10000000000000)),
    ('ENDUITS','ENDUIT PLATRE INT ROUGE','25.000 KG',35.291,41.996, 2, trunc(random()*10000000000000)),
    ('ENDUITS','ENDUIT PLATRE INT BLEU','25.000 KG',35.291,41.996, 2, trunc(random()*10000000000000)),
    ('ENDUITS','ENDUIT CHAUX EXT / INT GROS','20.000 KG',40.973,48.758, 2, trunc(random()*10000000000000)),
    ('ENDUITS','ENDUIT CHAUX EXT / INT FIN','17.000 KG',35.754,42.547, 2, trunc(random()*10000000000000)),
    ('ENDUITS','ENDUIT CHAUX EXT / INT FIN','20.000 KG',40.973,48.758, 2, trunc(random()*10000000000000)),
    ('COLORANTS','VALTINT BLEU','0.125 LT',2.534,3.016, 2, trunc(random()*10000000000000)),
    ('COLORANTS','VALTINT VERT','0.125 LT',2.797,3.328, 2, trunc(random()*10000000000000)),
    ('COLORANTS','VALTINT JAUNE','0.125 LT',2.797,3.328, 2, trunc(random()*10000000000000)),
    ('COLORANTS','VALTINT ROUGE','0.125 LT',2.797,3.328, 2, trunc(random()*10000000000000)),
    ('COLORANTS','VALTINT NOIR','0.125 LT',2.534,3.016, 2, trunc(random()*10000000000000)),
    ('COLORANTS','VALTINT VIOLET','0.125 LT',2.797,3.328, 2, trunc(random()*10000000000000)),
    ('COLORANTS','VALTINT MAGENTA','0.125 LT',2.797,3.328, 2, trunc(random()*10000000000000)),
    ('COLORANTS','VALTINT ORANGE','0.125 LT',2.797,3.328, 2, trunc(random()*10000000000000)),
    ('COLORANTS','VALTINT CREME','0.125 LT',2.534,3.016, 2, trunc(random()*10000000000000)),
    ('COLORANTS','VALTINT MARRON','0.125 LT',2.534,3.016, 2, trunc(random()*10000000000000)),
    ('ETANCHIETE','VALETANCHE','4.000 KG',30.249,35.996, 2, trunc(random()*10000000000000)),
    ('ETANCHIETE','VALETANCHE','18.000 KG',128.749,153.211, 2, trunc(random()*10000000000000)),
    ('ETANCHIETE','ENDUIT CHAUX ETANCHE','20.000 KG',44.100,52.479, 2, trunc(random()*10000000000000)),
    ('BOIS ET FER','FERROGRAF ARGENTO 229','0.800 LT',86.453,102.879, 2, trunc(random()*10000000000000)),
    ('BOIS ET FER','FERROGRAF ARGENTO 229','4.000 LT',426.439,507.462, 2, trunc(random()*10000000000000)),
    ('BOIS ET FER','PROTERLEGNO 289 ( VERNIS A L EAU INT + EXT )','0.800 LT',30.934,36.811, 2, trunc(random()*10000000000000)),
    ('BOIS ET FER','PROTERLEGNO 289 ( VERNIS A L EAU INT + EXT )','4.000 LT',148.841,177.121, 2, trunc(random()*10000000000000)),
    ('BOIS ET FER','PROTERLEGNO 289 COL 541 EXT','0.800 LT',93.120,110.813, 2, trunc(random()*10000000000000)),
    ('BOIS ET FER','PROTERLEGNO 289 COL 541 EXT','4.000 LT',459.560,546.877, 2, trunc(random()*10000000000000)),
    ('BOIS ET FER','PROTERLEGNO 289 COL540 EXT','0.800 LT',90.737,107.977, 2, trunc(random()*10000000000000)),
    ('BOIS ET FER','PROTERLEGNO 289 COL540 EXT','4.000 LT',450.411,535.989, 2, trunc(random()*10000000000000)),
    ('BOIS ET FER','IDROQUET 319','0.800 LT',93.077,110.761, 2, trunc(random()*10000000000000)),
    ('BOIS ET FER','IDROQUET 319','4.000 LT',453.808,540.032, 2, trunc(random()*10000000000000)),
    ('PEINTURE DE FINITION','IDROLAK 309 ( VERNIS A L EAU INT + EXT )','0.800 LT',51.316,61.066, 2, trunc(random()*10000000000000)),
    ('PEINTURE DE FINITION','IDROLAK 309 ( VERNIS A L EAU INT + EXT )','4.000 LT',250.753,298.396, 2, trunc(random()*10000000000000)),
    ('PEINTURE DE FINITION','IDROMAT 99','0.050 LT',14.080,16.755, 2, trunc(random()*10000000000000)),
    ('PEINTURE DE FINITION','IDROMAT 99','0.250 LT',51.499,61.284, 2, trunc(random()*10000000000000)),
    ('REVETEMENTS EXTERIEURS','ENDUIT CHAUX FACADE','20.000 KG',44.100,52.479, 2, trunc(random()*10000000000000)),
    ('REVETEMENTS EXTERIEURS','CHAUX RACH 25 KG','25.000 KG',26.167,31.139, 2, trunc(random()*10000000000000)),
    ('REVETEMENTS EXTERIEURS','CHAUX ANTIK 25 KG','25.000 KG',15.387,18.310, 2, trunc(random()*10000000000000)),
    ('MORTIERS ET COLLES','CIMENT COLLE V 1000 25 KG','25.000 KG',11.758,13.992, 2, trunc(random()*10000000000000)),
    ('MORTIERS ET COLLES','CIMENT COLLE V 2000 25 KG','25.000 KG',15.430,18.362, 2, trunc(random()*10000000000000)),
    ('MORTIERS ET COLLES','CIMENT COLLE V 3000 25 KG','25.000 KG',20.038,23.846, 2, trunc(random()*10000000000000)),
    ('PRODUITS SPECIAUX','ISOLPAINT','0.800 LT',30.467,36.255, 2, trunc(random()*10000000000000)),
    ('PRODUITS SPECIAUX','ISOLPAINT','4.000 LT',104.130,123.915, 2, trunc(random()*10000000000000)),
    ('PRODUITS SPECIAUX','ISOLPAINT','10.000 LT',243.113,289.304, 2, trunc(random()*10000000000000));


-- Insertion d'achats (basés sur les produits existants et leurs fournisseurs)
INSERT INTO purchase (date_purchase, supplier_id, product_id, invoice_number, quantity, unit_pricettc, total_amountttc, comment)
VALUES
    -- Achats Fournisseur 1 (VALPRIMER, VALFIX 1KG) - Janvier à Mars 2025
    ('2025-01-05', 1, 1, 'BL-2025-001', 50, 8.656, 432.80, 'Achat initial VALPRIMER 1KG'),
    ('2025-01-05', 1, 2, 'BL-2025-002', 30, 30.311, 909.33, 'Achat initial VALPRIMER 4KG'),
    ('2025-01-08', 1, 3, 'BL-2025-003', 20, 126.450, 2529.00, 'Achat initial VALPRIMER 18KG'),
    ('2025-01-12', 1, 4, 'BL-2025-004', 40, 8.209, 328.36, 'Approvisionnement VALFIX 1KG'),
    ('2025-02-03', 1, 1, 'BL-2025-045', 60, 8.656, 519.36, 'Réapprovisionnement VALPRIMER 1KG'),
    ('2025-02-10', 1, 2, 'BL-2025-056', 35, 30.311, 1060.89, 'VALPRIMER 4KG février'),
    ('2025-03-02', 1, 3, 'BL-2025-102', 25, 126.450, 3161.25, 'VALPRIMER 18KG mars'),
    ('2025-03-15', 1, 4, 'BL-2025-115', 45, 8.209, 369.41, 'VALFIX 1KG mars'),
    
    -- Achats Fournisseur 3 (VALFIX, FISSATIVO, VALMAT) - Janvier à Avril 2025
    ('2025-01-08', 3, 5, 'BL-2025-015', 25, 27.744, 693.60, 'Approvisionnement VALFIX 4KG'),
    ('2025-01-10', 3, 6, 'BL-2025-016', 15, 118.260, 1773.90, 'Approvisionnement VALFIX 18KG'),
    ('2025-01-12', 3, 7, 'BL-2025-017', 35, 15.236, 533.26, 'Commande FISSATIVO 30G 0.8LT'),
    ('2025-01-15', 3, 8, 'BL-2025-018', 20, 62.384, 1247.68, 'Commande FISSATIVO 30G 4LT'),
    ('2025-01-18', 3, 9, 'BL-2025-019', 18, 142.788, 2570.18, 'Commande FISSATIVO 30G 10LT'),
    ('2025-02-08', 3, 10, 'BL-2025-063', 50, 3.343, 167.15, 'Achat VALMAT 1KG'),
    ('2025-02-12', 3, 11, 'BL-2025-064', 40, 11.031, 441.24, 'Achat VALMAT 5KG'),
    ('2025-02-20', 3, 12, 'BL-2025-075', 30, 45.418, 1362.54, 'Achat VALMAT 23KG'),
    ('2025-03-05', 3, 13, 'BL-2025-105', 25, 69.907, 1747.68, 'Achat VALMAT 40KG'),
    ('2025-03-10', 3, 5, 'BL-2025-110', 35, 27.744, 971.04, 'VALFIX 4KG mars'),
    ('2025-04-03', 3, 7, 'BL-2025-189', 40, 15.236, 609.44, 'FISSATIVO 30G 0.8LT avril'),
    
    -- Achats Fournisseur 2 (FINITIONS, ENDUITS, etc.) - Janvier à Juin 2025
    ('2025-01-10', 2, 14, 'BL-2025-025', 45, 3.730, 167.85, 'Stock VALTEX 1KG'),
    ('2025-01-12', 2, 15, 'BL-2025-026', 30, 13.505, 405.15, 'Stock VALTEX 5KG'),
    ('2025-01-15', 2, 16, 'BL-2025-027', 25, 55.596, 1389.90, 'Stock VALTEX 23KG'),
    ('2025-01-18', 2, 17, 'BL-2025-028', 20, 89.121, 1782.42, 'Stock VALTEX 40KG'),
    ('2025-02-05', 2, 18, 'BL-2025-052', 40, 4.832, 193.28, 'Commande VALBLANC 1KG'),
    ('2025-02-08', 2, 19, 'BL-2025-053', 35, 18.132, 634.62, 'Commande VALBLANC 5KG'),
    ('2025-02-10', 2, 20, 'BL-2025-054', 30, 74.768, 2243.04, 'VALBLANC 23KG'),
    ('2025-02-12', 2, 21, 'BL-2025-055', 25, 124.948, 3123.70, 'VALBLANC 40KG'),
    ('2025-02-15', 2, 22, 'BL-2025-059', 20, 41.639, 832.78, 'VALPRO SATINE 4KG'),
    ('2025-02-18', 2, 23, 'BL-2025-062', 18, 174.084, 3133.51, 'VALPRO SATINE 18KG'),
    ('2025-03-01', 2, 24, 'BL-2025-095', 35, 23.705, 829.68, 'VALPRO MAT 5KG'),
    ('2025-03-05', 2, 25, 'BL-2025-096', 30, 98.437, 2953.11, 'VALPRO MAT 23KG'),
    ('2025-03-08', 2, 26, 'BL-2025-097', 28, 163.934, 4590.15, 'VALPRO MAT 40KG'),
    ('2025-03-12', 2, 27, 'BL-2025-100', 32, 29.044, 929.41, 'VALTOP 5KG'),
    ('2025-03-15', 2, 28, 'BL-2025-101', 25, 121.300, 3032.50, 'VALTOP 23KG'),
    ('2025-03-18', 2, 29, 'BL-2025-103', 22, 203.065, 4467.43, 'VALTOP 40KG'),
    ('2025-04-01', 2, 30, 'BL-2025-150', 28, 16.094, 450.63, 'VALIDRO BRILLANT 0.8KG'),
    ('2025-04-05', 2, 31, 'BL-2025-155', 24, 74.645, 1791.48, 'VALIDRO BRILLANT 4KG'),
    ('2025-04-08', 2, 32, 'BL-2025-160', 20, 278.604, 5572.08, 'VALIDRO BRILLANT 15KG'),
    ('2025-04-10', 2, 33, 'BL-2025-165', 30, 14.376, 431.28, 'VALIDRO MAT 0.8KG'),
    ('2025-04-15', 2, 34, 'BL-2025-170', 26, 66.051, 1717.33, 'VALIDRO MAT 4KG'),
    ('2025-04-20', 2, 35, 'BL-2025-175', 22, 246.376, 5420.27, 'VALIDRO MAT 15KG'),
    ('2025-05-01', 2, 36, 'BL-2025-200', 28, 15.998, 447.94, 'VALIDRO SATINE 0.8KG'),
    ('2025-05-05', 2, 37, 'BL-2025-205', 24, 74.161, 1779.86, 'VALIDRO SATINE 4KG'),
    ('2025-05-08', 2, 38, 'BL-2025-210', 20, 276.789, 5535.78, 'VALIDRO SATINE 15KG'),
    ('2025-05-12', 2, 39, 'BL-2025-215', 35, 6.385, 223.48, 'TRASPIRANTE 209 0.8KG'),
    ('2025-05-15', 2, 40, 'BL-2025-220', 30, 21.144, 634.32, 'TRASPIRANTE 209 4KG'),
    ('2025-05-18', 2, 41, 'BL-2025-225', 25, 73.312, 1832.80, 'TRASPIRANTE 209 15KG'),
    ('2025-05-22', 2, 42, 'BL-2025-230', 32, 8.423, 269.54, 'TRASPIRANTE 409 0.8KG'),
    ('2025-05-25', 2, 43, 'BL-2025-235', 28, 31.711, 887.91, 'TRASPIRANTE 409 4KG'),
    ('2025-05-28', 2, 44, 'BL-2025-240', 24, 110.608, 2654.59, 'TRASPIRANTE 409 15KG'),
    ('2025-06-01', 2, 45, 'BL-2025-250', 30, 11.127, 333.81, 'V 55 BASE FONCEE 0.8KG'),
    ('2025-06-05', 2, 46, 'BL-2025-255', 26, 43.577, 1133.00, 'V 55 BASE FONCEE 4KG'),
    ('2025-06-08', 2, 47, 'BL-2025-260', 22, 155.983, 3431.63, 'V 55 BASE FONCEE 15KG'),
    ('2025-06-12', 2, 48, 'BL-2025-265', 28, 14.440, 404.32, 'V 55 BASE CLAIRE 0.8KG'),
    ('2025-06-15', 2, 49, 'BL-2025-270', 24, 61.223, 1469.35, 'V 55 BASE CLAIRE 4KG'),
    ('2025-06-18', 2, 50, 'BL-2025-275', 20, 222.452, 4449.04, 'V 55 BASE CLAIRE 15KG'),
    
    -- Achats récents (Juillet-Décembre 2025)
    ('2025-07-05', 2, 51, 'BL-2025-305', 30, 12.253, 367.59, 'V 55 BASE BLANCHE 0.8KG'),
    ('2025-08-10', 1, 2, 'BL-2025-405', 40, 30.311, 1212.44, 'VALPRIMER 4KG août'),
    ('2025-09-15', 3, 5, 'BL-2025-505', 35, 27.744, 971.04, 'VALFIX 4KG septembre'),
    ('2025-10-20', 2, 14, 'BL-2025-605', 45, 3.730, 167.85, 'VALTEX 1KG octobre'),
    ('2025-11-12', 2, 18, 'BL-2025-705', 38, 4.832, 183.62, 'VALBLANC 1KG novembre'),
    ('2025-12-05', 2, 27, 'BL-2025-805', 32, 29.044, 929.41, 'VALTOP 5KG décembre'),
    
    -- Achats de Janvier 2026 (récents)
    ('2026-01-08', 1, 1, 'BL-2026-003', 60, 8.656, 519.36, 'Début année 2026 VALPRIMER 1KG'),
    ('2026-01-10', 2, 15, 'BL-2026-012', 45, 13.505, 607.73, 'Début année 2026 VALTEX 5KG'),
    ('2026-01-15', 3, 5, 'BL-2026-023', 35, 27.744, 971.04, 'Début année 2026 VALFIX 4KG'),
    ('2026-01-18', 2, 22, 'BL-2026-034', 28, 41.639, 1165.89, 'Début année 2026 VALPRO SATINE 4KG'),
    ('2026-01-20', 2, 30, 'BL-2026-045', 30, 16.094, 482.82, 'Début année 2026 VALIDRO BRILLANT 0.8KG');


-- Insertion des mouvements de stock pour les achats
INSERT INTO stock_mouvement (product_id, quantity, date, type, source, purchase_id, reference)
VALUES
    -- Mouvements Janvier 2025
    (1, 50, '2025-01-05', 'ENTREE', 'ACHAT', 1, 'BL-2025-001'),
    (2, 30, '2025-01-05', 'ENTREE', 'ACHAT', 2, 'BL-2025-002'),
    (3, 20, '2025-01-08', 'ENTREE', 'ACHAT', 3, 'BL-2025-003'),
    (4, 40, '2025-01-12', 'ENTREE', 'ACHAT', 4, 'BL-2025-004'),
    (5, 25, '2025-01-08', 'ENTREE', 'ACHAT', 9, 'BL-2025-015'),
    (6, 15, '2025-01-10', 'ENTREE', 'ACHAT', 10, 'BL-2025-016'),
    (7, 35, '2025-01-12', 'ENTREE', 'ACHAT', 11, 'BL-2025-017'),
    (8, 20, '2025-01-15', 'ENTREE', 'ACHAT', 12, 'BL-2025-018'),
    (9, 18, '2025-01-18', 'ENTREE', 'ACHAT', 13, 'BL-2025-019'),
    (14, 45, '2025-01-10', 'ENTREE', 'ACHAT', 21, 'BL-2025-025'),
    (15, 30, '2025-01-12', 'ENTREE', 'ACHAT', 22, 'BL-2025-026'),
    (16, 25, '2025-01-15', 'ENTREE', 'ACHAT', 23, 'BL-2025-027'),
    (17, 20, '2025-01-18', 'ENTREE', 'ACHAT', 24, 'BL-2025-028'),
    -- Mouvements Février 2025
    (1, 60, '2025-02-03', 'ENTREE', 'ACHAT', 5, 'BL-2025-045'),
    (10, 50, '2025-02-08', 'ENTREE', 'ACHAT', 14, 'BL-2025-063'),
    (11, 40, '2025-02-12', 'ENTREE', 'ACHAT', 15, 'BL-2025-064'),
    (12, 30, '2025-02-20', 'ENTREE', 'ACHAT', 16, 'BL-2025-075'),
    (18, 40, '2025-02-05', 'ENTREE', 'ACHAT', 25, 'BL-2025-052'),
    (19, 35, '2025-02-08', 'ENTREE', 'ACHAT', 26, 'BL-2025-053'),
    (20, 30, '2025-02-10', 'ENTREE', 'ACHAT', 27, 'BL-2025-054'),
    (21, 25, '2025-02-12', 'ENTREE', 'ACHAT', 28, 'BL-2025-055'),
    (22, 20, '2025-02-15', 'ENTREE', 'ACHAT', 29, 'BL-2025-059'),
    (23, 18, '2025-02-18', 'ENTREE', 'ACHAT', 30, 'BL-2025-062'),
    (2, 35, '2025-02-10', 'ENTREE', 'ACHAT', 6, 'BL-2025-056'),
    -- Mouvements Mars 2025
    (3, 25, '2025-03-02', 'ENTREE', 'ACHAT', 7, 'BL-2025-102'),
    (4, 45, '2025-03-15', 'ENTREE', 'ACHAT', 8, 'BL-2025-115'),
    (5, 35, '2025-03-10', 'ENTREE', 'ACHAT', 18, 'BL-2025-110'),
    (13, 25, '2025-03-05', 'ENTREE', 'ACHAT', 17, 'BL-2025-105'),
    (24, 35, '2025-03-01', 'ENTREE', 'ACHAT', 31, 'BL-2025-095'),
    (25, 30, '2025-03-05', 'ENTREE', 'ACHAT', 32, 'BL-2025-096'),
    (26, 28, '2025-03-08', 'ENTREE', 'ACHAT', 33, 'BL-2025-097'),
    (27, 32, '2025-03-12', 'ENTREE', 'ACHAT', 34, 'BL-2025-100'),
    (28, 25, '2025-03-15', 'ENTREE', 'ACHAT', 35, 'BL-2025-101'),
    (29, 22, '2025-03-18', 'ENTREE', 'ACHAT', 36, 'BL-2025-103'),
    -- Mouvements Avril 2025
    (7, 40, '2025-04-03', 'ENTREE', 'ACHAT', 19, 'BL-2025-189'),
    (30, 28, '2025-04-01', 'ENTREE', 'ACHAT', 37, 'BL-2025-150'),
    (31, 24, '2025-04-05', 'ENTREE', 'ACHAT', 38, 'BL-2025-155'),
    (32, 20, '2025-04-08', 'ENTREE', 'ACHAT', 39, 'BL-2025-160'),
    (33, 30, '2025-04-10', 'ENTREE', 'ACHAT', 40, 'BL-2025-165'),
    (34, 26, '2025-04-15', 'ENTREE', 'ACHAT', 41, 'BL-2025-170'),
    (35, 22, '2025-04-20', 'ENTREE', 'ACHAT', 42, 'BL-2025-175'),
    -- Mouvements Mai 2025
    (36, 28, '2025-05-01', 'ENTREE', 'ACHAT', 43, 'BL-2025-200'),
    (37, 24, '2025-05-05', 'ENTREE', 'ACHAT', 44, 'BL-2025-205'),
    (38, 20, '2025-05-08', 'ENTREE', 'ACHAT', 45, 'BL-2025-210'),
    (39, 35, '2025-05-12', 'ENTREE', 'ACHAT', 46, 'BL-2025-215'),
    (40, 30, '2025-05-15', 'ENTREE', 'ACHAT', 47, 'BL-2025-220'),
    (41, 25, '2025-05-18', 'ENTREE', 'ACHAT', 48, 'BL-2025-225'),
    (42, 32, '2025-05-22', 'ENTREE', 'ACHAT', 49, 'BL-2025-230'),
    (43, 28, '2025-05-25', 'ENTREE', 'ACHAT', 50, 'BL-2025-235'),
    (44, 24, '2025-05-28', 'ENTREE', 'ACHAT', 51, 'BL-2025-240'),
    -- Mouvements Juin 2025
    (45, 30, '2025-06-01', 'ENTREE', 'ACHAT', 52, 'BL-2025-250'),
    (46, 26, '2025-06-05', 'ENTREE', 'ACHAT', 53, 'BL-2025-255'),
    (47, 22, '2025-06-08', 'ENTREE', 'ACHAT', 54, 'BL-2025-260'),
    (48, 28, '2025-06-12', 'ENTREE', 'ACHAT', 55, 'BL-2025-265'),
    (49, 24, '2025-06-15', 'ENTREE', 'ACHAT', 56, 'BL-2025-270'),
    (50, 20, '2025-06-18', 'ENTREE', 'ACHAT', 57, 'BL-2025-275'),
    -- Mouvements Juillet-Décembre 2025
    (51, 30, '2025-07-05', 'ENTREE', 'ACHAT', 58, 'BL-2025-305'),
    (2, 40, '2025-08-10', 'ENTREE', 'ACHAT', 59, 'BL-2025-405'),
    (5, 35, '2025-09-15', 'ENTREE', 'ACHAT', 60, 'BL-2025-505'),
    (14, 45, '2025-10-20', 'ENTREE', 'ACHAT', 61, 'BL-2025-605'),
    (18, 38, '2025-11-12', 'ENTREE', 'ACHAT', 19, 'BL-2025-705'),
    (27, 32, '2025-12-05', 'ENTREE', 'ACHAT', 20, 'BL-2025-805');


-- Mise à jour du stock initial basé sur la somme des achats
-- Cette requête calcule automatiquement la somme des quantités achetées pour chaque produit
UPDATE product p
SET initial_stock_quantity = COALESCE(
    (SELECT SUM(pur.quantity) 
     FROM purchase pur 
     WHERE pur.product_id = p.id_product), 
    0
);


-- Insertion de ventes (basées sur les produits en stock)
INSERT INTO sale (date_sale, customer_id, product_id, invoice_number, quantity_sold, unit_sale_price, total_sale_amount, comment)
VALUES
    -- Ventes Janvier 2025
    ('2025-01-10', 1, 1, 'FAC-2025-001', 20, 10.300, 206.00, 'Vente VALPRIMER 1KG'),
    ('2025-01-12', 2, 2, 'FAC-2025-002', 15, 36.071, 541.07, 'Vente VALPRIMER 4KG'),
    ('2025-01-15', 3, 14, 'FAC-2025-003', 25, 4.439, 110.98, 'Vente VALTEX 1KG'),
    ('2025-01-18', 4, 18, 'FAC-2025-004', 20, 5.750, 115.00, 'Vente VALBLANC 1KG'),
    ('2025-01-20', 5, 10, 'FAC-2025-005', 30, 3.978, 119.34, 'Vente VALMAT 1KG'),
    ('2025-01-25', 6, 5, 'FAC-2025-006', 12, 33.015, 396.18, 'Vente VALFIX 4KG'),
    
    -- Ventes Février 2025
    ('2025-02-05', 7, 1, 'FAC-2025-010', 25, 10.300, 257.50, 'Vente VALPRIMER 1KG'),
    ('2025-02-08', 8, 15, 'FAC-2025-011', 18, 16.071, 289.28, 'Vente VALTEX 5KG'),
    ('2025-02-10', 9, 19, 'FAC-2025-012', 22, 21.577, 474.69, 'Vente VALBLANC 5KG'),
    ('2025-02-12', 10, 22, 'FAC-2025-013', 10, 49.551, 495.51, 'Vente VALPRO SATINE 4KG'),
    ('2025-02-15', 11, 24, 'FAC-2025-014', 18, 28.210, 507.78, 'Vente VALPRO MAT 5KG'),
    ('2025-02-18', 12, 7, 'FAC-2025-015', 20, 18.131, 362.62, 'Vente FISSATIVO 30G 0.8LT'),
    ('2025-02-22', 13, 11, 'FAC-2025-016', 25, 13.127, 328.18, 'Vente VALMAT 5KG'),
    ('2025-02-25', 14, 14, 'FAC-2025-017', 20, 4.439, 88.78, 'Vente VALTEX 1KG'),
    
    -- Ventes Mars 2025
    ('2025-03-02', 15, 27, 'FAC-2025-020', 15, 34.562, 518.43, 'Vente VALTOP 5KG'),
    ('2025-03-05', 16, 18, 'FAC-2025-021', 10, 5.750, 57.50, 'Vente VALBLANC 1KG'),
    ('2025-03-08', 17, 2, 'FAC-2025-022', 20, 36.071, 721.42, 'Vente VALPRIMER 4KG'),
    ('2025-03-10', 18, 4, 'FAC-2025-023', 30, 9.769, 293.07, 'Vente VALFIX 1KG'),
    ('2025-03-15', 19, 15, 'FAC-2025-024', 12, 16.071, 192.85, 'Vente VALTEX 5KG'),
    ('2025-03-18', 20, 24, 'FAC-2025-025', 10, 28.210, 282.10, 'Vente VALPRO MAT 5KG'),
    ('2025-03-20', 21, 5, 'FAC-2025-026', 15, 33.015, 495.23, 'Vente VALFIX 4KG'),
    ('2025-03-25', 22, 1, 'FAC-2025-027', 35, 10.300, 360.50, 'Vente VALPRIMER 1KG'),
    
    -- Ventes Avril 2025
    ('2025-04-02', 23, 30, 'FAC-2025-030', 15, 19.152, 287.28, 'Vente VALIDRO BRILLANT 0.8KG'),
    ('2025-04-05', 24, 33, 'FAC-2025-031', 18, 17.107, 307.93, 'Vente VALIDRO MAT 0.8KG'),
    ('2025-04-08', 25, 7, 'FAC-2025-032', 10, 18.131, 181.31, 'Vente FISSATIVO 30G 0.8LT'),
    ('2025-04-12', 26, 31, 'FAC-2025-033', 12, 88.827, 1065.92, 'Vente VALIDRO BRILLANT 4KG'),
    ('2025-04-15', 27, 34, 'FAC-2025-034', 14, 78.600, 1100.40, 'Vente VALIDRO MAT 4KG'),
    ('2025-04-18', 28, 14, 'FAC-2025-035', 22, 4.439, 97.66, 'Vente VALTEX 1KG'),
    ('2025-04-22', 29, 18, 'FAC-2025-036', 8, 5.750, 46.00, 'Vente VALBLANC 1KG'),
    ('2025-04-25', 30, 27, 'FAC-2025-037', 10, 34.562, 345.62, 'Vente VALTOP 5KG'),
    
    -- Ventes Mai 2025
    ('2025-05-05', 1, 36, 'FAC-2025-040', 16, 19.037, 304.59, 'Vente VALIDRO SATINE 0.8KG'),
    ('2025-05-08', 2, 39, 'FAC-2025-041', 20, 7.598, 151.96, 'Vente TRASPIRANTE 209 0.8KG'),
    ('2025-05-10', 3, 42, 'FAC-2025-042', 18, 10.023, 180.41, 'Vente TRASPIRANTE 409 0.8KG'),
    ('2025-05-12', 4, 40, 'FAC-2025-043', 15, 25.161, 377.42, 'Vente TRASPIRANTE 209 4KG'),
    ('2025-05-15', 5, 37, 'FAC-2025-044', 12, 88.251, 1059.01, 'Vente VALIDRO SATINE 4KG'),
    ('2025-05-18', 6, 43, 'FAC-2025-045', 14, 37.736, 528.30, 'Vente TRASPIRANTE 409 4KG'),
    ('2025-05-22', 7, 1, 'FAC-2025-046', 20, 10.300, 206.00, 'Vente VALPRIMER 1KG'),
    ('2025-05-25', 8, 15, 'FAC-2025-047', 10, 16.071, 160.71, 'Vente VALTEX 5KG'),
    
    -- Ventes Juin 2025
    ('2025-06-02', 9, 45, 'FAC-2025-050', 18, 13.241, 238.34, 'Vente V 55 BASE FONCEE 0.8KG'),
    ('2025-06-05', 10, 48, 'FAC-2025-051', 16, 17.184, 274.94, 'Vente V 55 BASE CLAIRE 0.8KG'),
    ('2025-06-08', 11, 46, 'FAC-2025-052', 14, 51.857, 725.00, 'Vente V 55 BASE FONCEE 4KG'),
    ('2025-06-12', 12, 49, 'FAC-2025-053', 12, 72.856, 874.27, 'Vente V 55 BASE CLAIRE 4KG'),
    ('2025-06-15', 13, 22, 'FAC-2025-054', 8, 49.551, 396.41, 'Vente VALPRO SATINE 4KG'),
    ('2025-06-18', 14, 27, 'FAC-2025-055', 12, 34.562, 414.74, 'Vente VALTOP 5KG'),
    ('2025-06-22', 15, 14, 'FAC-2025-056', 18, 4.439, 79.90, 'Vente VALTEX 1KG'),
    ('2025-06-25', 16, 18, 'FAC-2025-057', 10, 5.750, 57.50, 'Vente VALBLANC 1KG'),
    
    -- Ventes Juillet 2025
    ('2025-07-05', 17, 2, 'FAC-2025-060', 18, 36.071, 649.28, 'Vente VALPRIMER 4KG'),
    ('2025-07-10', 18, 5, 'FAC-2025-061', 15, 33.015, 495.23, 'Vente VALFIX 4KG'),
    ('2025-07-15', 19, 1, 'FAC-2025-062', 25, 10.300, 257.50, 'Vente VALPRIMER 1KG'),
    ('2025-07-20', 20, 15, 'FAC-2025-063', 10, 16.071, 160.71, 'Vente VALTEX 5KG'),
    ('2025-07-25', 21, 24, 'FAC-2025-064', 12, 28.210, 338.52, 'Vente VALPRO MAT 5KG'),
    
    -- Ventes Août 2025
    ('2025-08-05', 22, 14, 'FAC-2025-070', 20, 4.439, 88.78, 'Vente VALTEX 1KG'),
    ('2025-08-10', 23, 18, 'FAC-2025-071', 12, 5.750, 69.00, 'Vente VALBLANC 1KG'),
    ('2025-08-15', 24, 2, 'FAC-2025-072', 15, 36.071, 541.07, 'Vente VALPRIMER 4KG'),
    ('2025-08-20', 25, 27, 'FAC-2025-073', 8, 34.562, 276.50, 'Vente VALTOP 5KG'),
    ('2025-08-25', 26, 22, 'FAC-2025-074', 6, 49.551, 297.31, 'Vente VALPRO SATINE 4KG'),
    
    -- Ventes Septembre 2025
    ('2025-09-05', 27, 1, 'FAC-2025-080', 22, 10.300, 226.60, 'Vente VALPRIMER 1KG'),
    ('2025-09-10', 28, 5, 'FAC-2025-081', 10, 33.015, 330.15, 'Vente VALFIX 4KG'),
    ('2025-09-15', 29, 15, 'FAC-2025-082', 8, 16.071, 128.57, 'Vente VALTEX 5KG'),
    ('2025-09-20', 30, 30, 'FAC-2025-083', 12, 19.152, 229.82, 'Vente VALIDRO BRILLANT 0.8KG'),
    ('2025-09-25', 1, 33, 'FAC-2025-084', 10, 17.107, 171.07, 'Vente VALIDRO MAT 0.8KG'),
    
    -- Ventes Octobre 2025
    ('2025-10-05', 2, 14, 'FAC-2025-090', 18, 4.439, 79.90, 'Vente VALTEX 1KG'),
    ('2025-10-10', 3, 18, 'FAC-2025-091', 15, 5.750, 86.25, 'Vente VALBLANC 1KG'),
    ('2025-10-15', 4, 24, 'FAC-2025-092', 10, 28.210, 282.10, 'Vente VALPRO MAT 5KG'),
    ('2025-10-20', 5, 27, 'FAC-2025-093', 8, 34.562, 276.50, 'Vente VALTOP 5KG'),
    ('2025-10-25', 6, 1, 'FAC-2025-094', 15, 10.300, 154.50, 'Vente VALPRIMER 1KG'),
    
    -- Ventes Novembre 2025
    ('2025-11-05', 7, 2, 'FAC-2025-100', 12, 36.071, 432.85, 'Vente VALPRIMER 4KG'),
    ('2025-11-10', 8, 5, 'FAC-2025-101', 8, 33.015, 264.12, 'Vente VALFIX 4KG'),
    ('2025-11-15', 9, 15, 'FAC-2025-102', 10, 16.071, 160.71, 'Vente VALTEX 5KG'),
    ('2025-11-20', 10, 18, 'FAC-2025-103', 10, 5.750, 57.50, 'Vente VALBLANC 1KG'),
    ('2025-11-25', 11, 22, 'FAC-2025-104', 5, 49.551, 247.76, 'Vente VALPRO SATINE 4KG'),
    
    -- Ventes Décembre 2025
    ('2025-12-05', 12, 27, 'FAC-2025-110', 10, 34.562, 345.62, 'Vente VALTOP 5KG'),
    ('2025-12-10', 13, 14, 'FAC-2025-111', 15, 4.439, 66.59, 'Vente VALTEX 1KG'),
    ('2025-12-15', 14, 1, 'FAC-2025-112', 18, 10.300, 185.40, 'Vente VALPRIMER 1KG'),
    ('2025-12-20', 15, 24, 'FAC-2025-113', 8, 28.210, 225.68, 'Vente VALPRO MAT 5KG'),
    ('2025-12-25', 16, 18, 'FAC-2025-114', 8, 5.750, 46.00, 'Vente VALBLANC 1KG'),
    
    -- Ventes Janvier 2026
    ('2026-01-05', 17, 1, 'FAC-2026-001', 20, 10.300, 206.00, 'Vente VALPRIMER 1KG janvier 2026'),
    ('2026-01-10', 18, 15, 'FAC-2026-002', 15, 16.071, 241.07, 'Vente VALTEX 5KG janvier 2026'),
    ('2026-01-15', 19, 5, 'FAC-2026-003', 12, 33.015, 396.18, 'Vente VALFIX 4KG janvier 2026'),
    ('2026-01-20', 20, 22, 'FAC-2026-004', 8, 49.551, 396.41, 'Vente VALPRO SATINE 4KG janvier 2026');


-- Insertion des mouvements de stock pour les ventes
INSERT INTO stock_mouvement (product_id, quantity, date, type, source, sale_id, reference)
VALUES
    -- Mouvements ventes Janvier 2025
    (1, 20, '2025-01-10', 'SORTIE', 'VENTE', 1, 'FAC-2025-001'),
    (2, 15, '2025-01-12', 'SORTIE', 'VENTE', 2, 'FAC-2025-002'),
    (14, 25, '2025-01-15', 'SORTIE', 'VENTE', 3, 'FAC-2025-003'),
    (18, 20, '2025-01-18', 'SORTIE', 'VENTE', 4, 'FAC-2025-004'),
    (10, 30, '2025-01-20', 'SORTIE', 'VENTE', 5, 'FAC-2025-005'),
    (5, 12, '2025-01-25', 'SORTIE', 'VENTE', 6, 'FAC-2025-006'),
    -- Mouvements ventes Février 2025
    (1, 25, '2025-02-05', 'SORTIE', 'VENTE', 7, 'FAC-2025-010'),
    (15, 18, '2025-02-08', 'SORTIE', 'VENTE', 8, 'FAC-2025-011'),
    (19, 22, '2025-02-10', 'SORTIE', 'VENTE', 9, 'FAC-2025-012'),
    (22, 10, '2025-02-12', 'SORTIE', 'VENTE', 10, 'FAC-2025-013'),
    (24, 18, '2025-02-15', 'SORTIE', 'VENTE', 11, 'FAC-2025-014'),
    (7, 20, '2025-02-18', 'SORTIE', 'VENTE', 12, 'FAC-2025-015'),
    (11, 25, '2025-02-22', 'SORTIE', 'VENTE', 13, 'FAC-2025-016'),
    (14, 20, '2025-02-25', 'SORTIE', 'VENTE', 14, 'FAC-2025-017'),
    -- Mouvements ventes Mars 2025
    (27, 15, '2025-03-02', 'SORTIE', 'VENTE', 15, 'FAC-2025-020'),
    (18, 10, '2025-03-05', 'SORTIE', 'VENTE', 16, 'FAC-2025-021'),
    (2, 20, '2025-03-08', 'SORTIE', 'VENTE', 17, 'FAC-2025-022'),
    (4, 30, '2025-03-10', 'SORTIE', 'VENTE', 18, 'FAC-2025-023'),
    (15, 12, '2025-03-15', 'SORTIE', 'VENTE', 19, 'FAC-2025-024'),
    (24, 10, '2025-03-18', 'SORTIE', 'VENTE', 20, 'FAC-2025-025'),
    (5, 15, '2025-03-20', 'SORTIE', 'VENTE', 21, 'FAC-2025-026'),
    (1, 35, '2025-03-25', 'SORTIE', 'VENTE', 22, 'FAC-2025-027'),
    -- Mouvements ventes Avril 2025
    (30, 15, '2025-04-02', 'SORTIE', 'VENTE', 23, 'FAC-2025-030'),
    (33, 18, '2025-04-05', 'SORTIE', 'VENTE', 24, 'FAC-2025-031'),
    (7, 10, '2025-04-08', 'SORTIE', 'VENTE', 25, 'FAC-2025-032'),
    (31, 12, '2025-04-12', 'SORTIE', 'VENTE', 26, 'FAC-2025-033'),
    (34, 14, '2025-04-15', 'SORTIE', 'VENTE', 27, 'FAC-2025-034'),
    (14, 22, '2025-04-18', 'SORTIE', 'VENTE', 28, 'FAC-2025-035'),
    (18, 8, '2025-04-22', 'SORTIE', 'VENTE', 29, 'FAC-2025-036'),
    (27, 10, '2025-04-25', 'SORTIE', 'VENTE', 30, 'FAC-2025-037'),
    -- Mouvements ventes Mai 2025
    (36, 16, '2025-05-05', 'SORTIE', 'VENTE', 31, 'FAC-2025-040'),
    (39, 20, '2025-05-08', 'SORTIE', 'VENTE', 32, 'FAC-2025-041'),
    (42, 18, '2025-05-10', 'SORTIE', 'VENTE', 33, 'FAC-2025-042'),
    (40, 15, '2025-05-12', 'SORTIE', 'VENTE', 34, 'FAC-2025-043'),
    (37, 12, '2025-05-15', 'SORTIE', 'VENTE', 35, 'FAC-2025-044'),
    (43, 14, '2025-05-18', 'SORTIE', 'VENTE', 36, 'FAC-2025-045'),
    (1, 20, '2025-05-22', 'SORTIE', 'VENTE', 37, 'FAC-2025-046'),
    (15, 10, '2025-05-25', 'SORTIE', 'VENTE', 38, 'FAC-2025-047'),
    -- Mouvements ventes Juin 2025
    (45, 18, '2025-06-02', 'SORTIE', 'VENTE', 39, 'FAC-2025-050'),
    (48, 16, '2025-06-05', 'SORTIE', 'VENTE', 40, 'FAC-2025-051'),
    (46, 14, '2025-06-08', 'SORTIE', 'VENTE', 41, 'FAC-2025-052'),
    (49, 12, '2025-06-12', 'SORTIE', 'VENTE', 42, 'FAC-2025-053'),
    (22, 8, '2025-06-15', 'SORTIE', 'VENTE', 43, 'FAC-2025-054'),
    (27, 12, '2025-06-18', 'SORTIE', 'VENTE', 44, 'FAC-2025-055'),
    (14, 18, '2025-06-22', 'SORTIE', 'VENTE', 45, 'FAC-2025-056'),
    (18, 10, '2025-06-25', 'SORTIE', 'VENTE', 46, 'FAC-2025-057'),
    -- Mouvements ventes Juillet 2025
    (2, 18, '2025-07-05', 'SORTIE', 'VENTE', 47, 'FAC-2025-060'),
    (5, 15, '2025-07-10', 'SORTIE', 'VENTE', 48, 'FAC-2025-061'),
    (1, 25, '2025-07-15', 'SORTIE', 'VENTE', 49, 'FAC-2025-062'),
    (15, 10, '2025-07-20', 'SORTIE', 'VENTE', 50, 'FAC-2025-063'),
    (24, 12, '2025-07-25', 'SORTIE', 'VENTE', 51, 'FAC-2025-064'),
    -- Mouvements ventes Août 2025
    (14, 20, '2025-08-05', 'SORTIE', 'VENTE', 52, 'FAC-2025-070'),
    (18, 12, '2025-08-10', 'SORTIE', 'VENTE', 53, 'FAC-2025-071'),
    (2, 15, '2025-08-15', 'SORTIE', 'VENTE', 54, 'FAC-2025-072'),
    (27, 8, '2025-08-20', 'SORTIE', 'VENTE', 55, 'FAC-2025-073'),
    (22, 6, '2025-08-25', 'SORTIE', 'VENTE', 56, 'FAC-2025-074'),
    -- Mouvements ventes Septembre 2025
    (1, 22, '2025-09-05', 'SORTIE', 'VENTE', 57, 'FAC-2025-080'),
    (5, 10, '2025-09-10', 'SORTIE', 'VENTE', 58, 'FAC-2025-081'),
    (15, 8, '2025-09-15', 'SORTIE', 'VENTE', 59, 'FAC-2025-082'),
    (30, 12, '2025-09-20', 'SORTIE', 'VENTE', 60, 'FAC-2025-083'),
    (33, 10, '2025-09-25', 'SORTIE', 'VENTE', 61, 'FAC-2025-084'),
    -- Mouvements ventes Octobre 2025
    (14, 18, '2025-10-05', 'SORTIE', 'VENTE', 62, 'FAC-2025-090'),
    (18, 15, '2025-10-10', 'SORTIE', 'VENTE', 63, 'FAC-2025-091'),
    (24, 10, '2025-10-15', 'SORTIE', 'VENTE', 64, 'FAC-2025-092'),
    (27, 8, '2025-10-20', 'SORTIE', 'VENTE', 65, 'FAC-2025-093'),
    (1, 15, '2025-10-25', 'SORTIE', 'VENTE', 66, 'FAC-2025-094'),
    -- Mouvements ventes Novembre 2025
    (2, 12, '2025-11-05', 'SORTIE', 'VENTE', 67, 'FAC-2025-100'),
    (5, 8, '2025-11-10', 'SORTIE', 'VENTE', 68, 'FAC-2025-101'),
    (15, 10, '2025-11-15', 'SORTIE', 'VENTE', 69, 'FAC-2025-102'),
    (18, 10, '2025-11-20', 'SORTIE', 'VENTE', 70, 'FAC-2025-103'),
    (22, 5, '2025-11-25', 'SORTIE', 'VENTE', 71, 'FAC-2025-104'),
    -- Mouvements ventes Décembre 2025
    (27, 10, '2025-12-05', 'SORTIE', 'VENTE', 72, 'FAC-2025-110'),
    (14, 15, '2025-12-10', 'SORTIE', 'VENTE', 73, 'FAC-2025-111'),
    (1, 18, '2025-12-15', 'SORTIE', 'VENTE', 74, 'FAC-2025-112'),
    (24, 8, '2025-12-20', 'SORTIE', 'VENTE', 75, 'FAC-2025-113'),
    (18, 8, '2025-12-25', 'SORTIE', 'VENTE', 76, 'FAC-2025-114'),
    -- Mouvements ventes Janvier 2026
    (1, 20, '2026-01-05', 'SORTIE', 'VENTE', 77, 'FAC-2026-001'),
    (15, 15, '2026-01-10', 'SORTIE', 'VENTE', 78, 'FAC-2026-002'),
    (5, 12, '2026-01-15', 'SORTIE', 'VENTE', 79, 'FAC-2026-003'),
    (22, 8, '2026-01-20', 'SORTIE', 'VENTE', 80, 'FAC-2026-004');


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

-- Insertion des products commandés (liaison Bill-Product)
-- INSERT INTO bill_product (id_bill, id_product, quantity, total_product_price)
-- VALUES (1, 1, 2, 100.00);

-- INSERT INTO bill_product (id_bill, id_product, quantity, total_product_price)
-- VALUES 
--     (2, 2, 5, 180.35),
--     (2, 3, 4, 601.92),
--     (2, 4, 3, 29.31),
--     (2, 5, 2, 66.04);

-- Insertion des mouvements de stock lors des bills
-- INSERT INTO Stock_Mouvement (id_product, quantite_changee, date_mouvement, type_mouvement)
-- VALUES
--     (1, -2, '2024-08-24 10:00:00', 'RETRAIT'),
--     (2, -3, '2024-08-25 12:00:00', 'RETRAIT');

-- Insertion des mouvements de stock lors des retours
-- INSERT INTO Stock_Mouvement (id_product, quantite_changee, date_mouvement, type_mouvement)
-- VALUES
--     (1, 1, '2024-08-26 14:00:00', 'RETOUR');

-- Insertion dans l'historique des bills
-- INSERT INTO Historic_Bill (id_bill, operation, date_operation, details_modification)
-- VALUES
--     (1, 'CREATION', '2024-08-24 10:00:00', 'Création de la Bill 1'),
--     (1, 'MODIFICATION', '2024-08-26 14:00:00', 'Retour d un product pour la Bill 1');

-- Insertion dans l'historique des products
-- INSERT INTO Historic_Product (id_product, operation, date_operation, details_modification)
-- VALUES
-- (1, 'CREATION', '2024-08-24 09:00:00', 'Ajout du product A'),
--      (1, 'MODIFICATION', '2024-08-26 14:00:00', 'Mise à jour du stock après retour');
