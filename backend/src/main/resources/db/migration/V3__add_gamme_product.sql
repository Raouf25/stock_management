-- Migration Flyway pour ajouter la colonne 'gamme' à la table 'product'
ALTER TABLE "product"
    ADD COLUMN "gamme" varchar(255) CONSTRAINT "product_gamme_check"
        CHECK ("gamme" IN ('Extérieur', 'Poudre', 'Classique', 'Décorative'));