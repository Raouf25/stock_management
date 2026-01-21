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
INSERT INTO product (category, name, unit, unit_price_bought, unit_price_sold, initial_stock_quantity, current_stock_quantity, supplier_id, reference)
VALUES
    ('Impressions','VALPRIMER','1.000 KG',8.656,10.300, 150, 150, 2, trunc(random()*10000000000000)),
    ('Impressions','VALPRIMER','4.000 KG',30.311,36.071, 150, 150,  2, trunc(random()*10000000000000)),
    ('Impressions','VALPRIMER','18.000 KG',126.450,150.476, 150, 150,  2, trunc(random()*10000000000000)),
    ('Impressions','VALFIX','1.000 KG',8.209,9.769, 150, 150,  2, trunc(random()*10000000000000)),
    ('Impressions','VALFIX','4.000 KG',27.744,33.015, 150, 150,  2, trunc(random()*10000000000000)),
    ('Impressions','VALFIX','18.000 KG',118.260,140.729, 150, 150,  2, trunc(random()*10000000000000)),
    ('Impressions','FISSATIVO 30G','0.800 LT',15.236,18.131, 150, 150,  2, trunc(random()*10000000000000)),
    ('Impressions','FISSATIVO 30G','4.000 LT',62.384,74.238, 150, 150,  2, trunc(random()*10000000000000)),
    ('Impressions','FISSATIVO 30G','10.000 LT',142.788,169.918, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','VALMAT','1.000 KG',3.343,3.978, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','VALMAT','5.000 KG',11.031,13.127, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','VALMAT','23.000 KG',45.418,54.047, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','VALMAT','40.000 KG',69.907,83.190, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','VALTEX','1.000 KG',3.730,4.439, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','VALTEX','5.000 KG',13.505,16.071, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','VALTEX','23.000 KG',55.596,66.159, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','VALTEX','40.000 KG',89.121,106.054, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','VALBLANC','1.000 KG',4.832,5.750, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','VALBLANC','5.000 KG',18.132,21.577, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','VALBLANC','23.000 KG',74.768,88.974, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','VALBLANC','40.000 KG',124.948,148.688, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','VALPRO SATINE','4.000 KG',41.639,49.551, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','VALPRO SATINE','18.000 KG',174.084,207.159, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','VALPRO MAT','5.000 KG',23.705,28.210, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','VALPRO MAT','23.000 KG',98.437,117.140, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','VALPRO MAT','40.000 KG',163.934,195.082, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','VALTOP','5.000 KG',29.044,34.562, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','VALTOP','23.000 KG',121.300,144.347, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','VALTOP','40.000 KG',203.065,241.647, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','VALIDRO BRILLANT','0.800 KG',16.094,19.152, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','VALIDRO BRILLANT','4.000 KG',74.645,88.827, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','VALIDRO BRILLANT','15.000 KG',278.604,331.538, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','VALIDRO MAT','0.800 KG',14.376,17.107, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','VALIDRO MAT','4.000 KG',66.051,78.600, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','VALIDRO MAT','15.000 KG',246.376,293.188, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','VALIDRO SATINE','0.800 KG',15.998,19.037, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','VALIDRO SATINE','4.000 KG',74.161,88.251, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','VALIDRO SATINE','15.000 KG',276.789,329.379, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','TRASPIRANTE 209','0.800 KG',6.385,7.598, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','TRASPIRANTE 209','4.000 KG',21.144,25.161, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','TRASPIRANTE 209','15.000 KG',73.312,87.241, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','TRASPIRANTE 409','0.800 KG',8.423,10.023, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','TRASPIRANTE 409','4.000 KG',31.711,37.736, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','TRASPIRANTE 409','15.000 KG',110.608,131.623, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','V 55 BASE FONCEE','0.800 KG',11.127,13.241, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','V 55 BASE FONCEE','4.000 KG',43.577,51.857, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','V 55 BASE FONCEE','15.000 KG',155.983,185.620, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','V 55 BASE CLAIRE','0.800 KG',14.440,17.184, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','V 55 BASE CLAIRE','4.000 KG',61.223,72.856, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','V 55 BASE CLAIRE','15.000 KG',222.452,264.718, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','V 55 BASE BLANCHE','0.800 KG',12.253,14.581, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','V 55 BASE BLANCHE','4.000 KG',50.593,60.206, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','V 55 BASE BLANCHE','15.000 KG',179.104,213.134, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','V 88 BASE FONCEE','0.800 KG',12.912,15.365, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','V 88 BASE FONCEE','4.000 KG',51.299,61.046, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','V 88 BASE FONCEE','15.000 KG',188.029,223.754, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','V 88 BASE CLAIRE','0.800 KG',15.442,18.376, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','V 88 BASE CLAIRE','4.000 KG',65.459,77.897, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','V 88 BASE CLAIRE','15.000 KG',237.647,282.800, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','V 88 BASE BLANCHE','0.800 KG',15.695,18.677, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','V 88 BASE BLANCHE','4.000 KG',65.762,78.257, 150, 150,  2, trunc(random()*10000000000000)),
    ('FINITIONS','V 88 BASE BLANCHE','15.000 KG',241.955,287.926, 150, 150,  2, trunc(random()*10000000000000)),
    ('ENDUITS','RASAPRIM','5.000 KG',12.584,14.975, 150, 150,  2, trunc(random()*10000000000000)),
    ('ENDUITS','RASAPRIM','25.000 KG',56.701,67.474, 150, 150,  2, trunc(random()*10000000000000)),
    ('ENDUITS','RASAPRIM','40.000 KG',86.750,103.233, 150, 150,  2, trunc(random()*10000000000000)),
    ('ENDUITS','RASABEN','5.000 KG',11.711,13.936, 150, 150,  2, trunc(random()*10000000000000)),
    ('ENDUITS','RASABEN','25.000 KG',51.061,60.762, 150, 150,  2, trunc(random()*10000000000000)),
    ('ENDUITS','RASABEN','40.000 KG',76.885,91.493, 150, 150,  2, trunc(random()*10000000000000)),
    ('ENDUITS','RASAFIN','5.000 KG',11.850,14.102, 150, 150,  2, trunc(random()*10000000000000)),
    ('ENDUITS','RASAFIN','25.000 KG',51.739,61.569, 150, 150,  2, trunc(random()*10000000000000)),
    ('ENDUITS','RASAFIN','40.000 KG',77.957,92.769, 150, 150,  2, trunc(random()*10000000000000)),
    ('ENDUITS','VALENDUIT','1.000 KG',3.734,4.443, 150, 150,  2, trunc(random()*10000000000000)),
    ('ENDUITS','VALENDUIT','5.000 KG',12.908,15.361, 150, 150,  2, trunc(random()*10000000000000)),
    ('ENDUITS','VALENDUIT','20.000 KG',48.540,57.762, 150, 150,  2, trunc(random()*10000000000000)),
    ('ENDUITS','VALENDUIT','40.000 KG',88.821,105.697, 150, 150,  2, trunc(random()*10000000000000)),
    ('ENDUITS','ENDUIT PLATRE INT ROUGE','25.000 KG',35.291,41.996, 150, 150,  2, trunc(random()*10000000000000)),
    ('ENDUITS','ENDUIT PLATRE INT BLEU','25.000 KG',35.291,41.996, 150, 150,  2, trunc(random()*10000000000000)),
    ('ENDUITS','ENDUIT CHAUX EXT / INT GROS','20.000 KG',40.973,48.758, 150, 150,  2, trunc(random()*10000000000000)),
    ('ENDUITS','ENDUIT CHAUX EXT / INT FIN','17.000 KG',35.754,42.547, 150, 150,  2, trunc(random()*10000000000000)),
    ('ENDUITS','ENDUIT CHAUX EXT / INT FIN','20.000 KG',40.973,48.758, 150, 150,  2, trunc(random()*10000000000000)),
    ('COLORANTS','VALTINT BLEU','0.125 LT',2.534,3.016, 150, 150,  2, trunc(random()*10000000000000)),
    ('COLORANTS','VALTINT VERT','0.125 LT',2.797,3.328, 150, 150,  2, trunc(random()*10000000000000)),
    ('COLORANTS','VALTINT JAUNE','0.125 LT',2.797,3.328, 150, 150,  2, trunc(random()*10000000000000)),
    ('COLORANTS','VALTINT ROUGE','0.125 LT',2.797,3.328, 150, 150,  2, trunc(random()*10000000000000)),
    ('COLORANTS','VALTINT NOIR','0.125 LT',2.534,3.016, 150, 150,  2, trunc(random()*10000000000000)),
    ('COLORANTS','VALTINT VIOLET','0.125 LT',2.797,3.328, 150, 150,  2, trunc(random()*10000000000000)),
    ('COLORANTS','VALTINT MAGENTA','0.125 LT',2.797,3.328, 150, 150,  2, trunc(random()*10000000000000)),
    ('COLORANTS','VALTINT ORANGE','0.125 LT',2.797,3.328, 150, 150,  2, trunc(random()*10000000000000)),
    ('COLORANTS','VALTINT CREME','0.125 LT',2.534,3.016, 150, 150,  2, trunc(random()*10000000000000)),
    ('COLORANTS','VALTINT MARRON','0.125 LT',2.534,3.016, 150, 150,  2, trunc(random()*10000000000000)),
    ('ETANCHIETE','VALETANCHE','4.000 KG',30.249,35.996, 150, 150,  2, trunc(random()*10000000000000)),
    ('ETANCHIETE','VALETANCHE','18.000 KG',128.749,153.211, 150, 150,  2, trunc(random()*10000000000000)),
    ('ETANCHIETE','ENDUIT CHAUX ETANCHE','20.000 KG',44.100,52.479, 150, 150,  2, trunc(random()*10000000000000)),
    ('BOIS ET FER','FERROGRAF ARGENTO 229','0.800 LT',86.453,102.879, 150, 150,  2, trunc(random()*10000000000000)),
    ('BOIS ET FER','FERROGRAF ARGENTO 229','4.000 LT',426.439,507.462, 150, 150,  2, trunc(random()*10000000000000)),
    ('BOIS ET FER','PROTERLEGNO 289 ( VERNIS A L EAU INT + EXT )','0.800 LT',30.934,36.811, 150, 150,  2, trunc(random()*10000000000000)),
    ('BOIS ET FER','PROTERLEGNO 289 ( VERNIS A L EAU INT + EXT )','4.000 LT',148.841,177.121, 150, 150,  2, trunc(random()*10000000000000)),
    ('BOIS ET FER','PROTERLEGNO 289 COL 541 EXT','0.800 LT',93.120,110.813, 150, 150,  2, trunc(random()*10000000000000)),
    ('BOIS ET FER','PROTERLEGNO 289 COL 541 EXT','4.000 LT',459.560,546.877, 150, 150,  2, trunc(random()*10000000000000)),
    ('BOIS ET FER','PROTERLEGNO 289 COL540 EXT','0.800 LT',90.737,107.977, 150, 150,  2, trunc(random()*10000000000000)),
    ('BOIS ET FER','PROTERLEGNO 289 COL540 EXT','4.000 LT',450.411,535.989, 150, 150,  2, trunc(random()*10000000000000)),
    ('BOIS ET FER','IDROQUET 319','0.800 LT',93.077,110.761, 150, 150,  2, trunc(random()*10000000000000)),
    ('BOIS ET FER','IDROQUET 319','4.000 LT',453.808,540.032, 150, 150,  2, trunc(random()*10000000000000)),
    ('PEINTURE DE FINITION','IDROLAK 309 ( VERNIS A L EAU INT + EXT )','0.800 LT',51.316,61.066, 150, 150,  2, trunc(random()*10000000000000)),
    ('PEINTURE DE FINITION','IDROLAK 309 ( VERNIS A L EAU INT + EXT )','4.000 LT',250.753,298.396, 150, 150,  2, trunc(random()*10000000000000)),
    ('PEINTURE DE FINITION','IDROMAT 99','0.050 LT',14.080,16.755, 150, 150,  2, trunc(random()*10000000000000)),
    ('PEINTURE DE FINITION','IDROMAT 99','0.250 LT',51.499,61.284, 150, 150,  2, trunc(random()*10000000000000)),
    ('REVETEMENTS EXTERIEURS','ENDUIT CHAUX FACADE','20.000 KG',44.100,52.479, 150, 150,  2, trunc(random()*10000000000000)),
    ('REVETEMENTS EXTERIEURS','CHAUX RACH 25 KG','25.000 KG',26.167,31.139, 150, 150,  2, trunc(random()*10000000000000)),
    ('REVETEMENTS EXTERIEURS','CHAUX ANTIK 25 KG','25.000 KG',15.387,18.310, 150, 150,  2, trunc(random()*10000000000000)),
    ('MORTIERS ET COLLES','CIMENT COLLE V 1000 25 KG','25.000 KG',11.758,13.992, 150, 150,  2, trunc(random()*10000000000000)),
    ('MORTIERS ET COLLES','CIMENT COLLE V 2000 25 KG','25.000 KG',15.430,18.362, 150, 150,  2, trunc(random()*10000000000000)),
    ('MORTIERS ET COLLES','CIMENT COLLE V 3000 25 KG','25.000 KG',20.038,23.846, 150, 150,  2, trunc(random()*10000000000000)),
    ('PRODUITS SPECIAUX','ISOLPAINT','0.800 LT',30.467,36.255, 150, 150,  2, trunc(random()*10000000000000)),
    ('PRODUITS SPECIAUX','ISOLPAINT','4.000 LT',104.130,123.915, 150, 150,  2, trunc(random()*10000000000000)),
    ('PRODUITS SPECIAUX','ISOLPAINT','10.000 LT',243.113,289.304, 150, 150,  2, trunc(random()*10000000000000));


-- Insertion de bills
INSERT INTO bill (date_bill, customer_id, total, deposit, amount_due)
VALUES
    ('2024-08-24 10:00:00', 1, 200.00, 0.0, 200.00),
    ('2024-08-25 12:00:00', 2, 270.00, 0.0, 270.00);

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
