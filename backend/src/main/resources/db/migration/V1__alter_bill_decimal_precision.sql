-- Migration pour changer les types de colonnes de DOUBLE à DECIMAL(19,3) dans la table Bill
-- Cette migration assure une précision de 3 chiffres après la virgule pour les montants

-- Modifier la colonne 'total' pour utiliser DECIMAL(19,3)
ALTER TABLE bill ALTER COLUMN total TYPE DECIMAL(19,3);

-- Modifier la colonne 'deposit' pour utiliser DECIMAL(19,3)
ALTER TABLE bill ALTER COLUMN deposit TYPE DECIMAL(19,3);

-- Modifier la colonne 'amount_due' pour utiliser DECIMAL(19,3)
ALTER TABLE bill ALTER COLUMN amount_due TYPE DECIMAL(19,3);

-- Modifier la colonne 'discount' pour utiliser DECIMAL(19,3)
ALTER TABLE bill ALTER COLUMN discount TYPE DECIMAL(19,3);

-- Vérifier les changements
-- SELECT column_name, data_type, numeric_precision, numeric_scale 
-- FROM information_schema.columns 
-- WHERE table_name = 'bill' 
-- AND column_name IN ('total', 'deposit', 'amount_due', 'discount');
