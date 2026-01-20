#!/bin/bash

# Script pour convertir les données CSV des produits en insert SQL
# Usage: ./1_insert_product.sh < Products.csv > insert_products.sql

echo "-- Insertion des données de produits depuis le fichier CSV"
echo "-- Généré automatiquement du fichier Products.csv"
echo ""

# Lire le fichier CSV et convertir les lignes en insert SQL
while IFS=',' read -r reference name category unit unitPriceSold unitPriceBought currentStock supplierId; do
    # Sauter la première ligne (en-têtes)
    if [[ $reference != "reference" ]]; then
        # Nettoyer les espaces
        reference=$(echo "$reference" | xargs)
        name=$(echo "$name" | xargs)
        category=$(echo "$category" | xargs)
        unit=$(echo "$unit" | xargs)
        unitPriceSold=$(echo "$unitPriceSold" | xargs)
        unitPriceBought=$(echo "$unitPriceBought" | xargs)
        currentStock=$(echo "$currentStock" | xargs)
        supplierId=$(echo "$supplierId" | xargs)

        # Générer l'insert SQL
        echo "INSERT INTO Product (reference, name, category, unit, unit_price_sold, unit_price_bought, current_stock_quantity, supplier_id) VALUES ($reference, '$name', '$category', '$unit', $unitPriceSold, $unitPriceBought, $currentStock, $supplierId);"
    fi
done
