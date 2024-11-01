#!/bin/bash

# Input CSV file
input_file="Feuille1.csv"
# Output SQL file
output_file="1_products.sql"

# Remove the output file if it exists
if [ -f "$output_file" ]; then
    rm "$output_file"
fi

# Create a new output file
touch "$output_file"

# Temporary file to store unique designations
temp_file=$(mktemp)

# Read the CSV file and process each line
tail -n +2 "$input_file" | while IFS=, read -r date client chantier designation prix_achat prix_vente quantite total_achat total_vente paiement
do
    # Skip the header line
    if [ "$date" != "DATE" ]; then
        # Write the unique designations and prices to the temporary file
        echo "$designation,$prix_achat,$prix_vente" >> "$temp_file"
    fi
done

# Remove duplicate lines
sort -u "$temp_file" > "$temp_file.sorted"

# Write the SQL insert statements to the output file
while IFS=, read -r designation prix_achat prix_vente
do
    echo "INSERT INTO Product (unit, category, reference, current_stock_quantity, name,  unit_price_sold, unit_price_bought) VALUES ('unit', 'category', trunc(random()*10000000000000), 99999, '$designation', $prix_achat, $prix_vente);" >> "$output_file"
done < "$temp_file.sorted"

# Remove the temporary file
rm "$temp_file" "$temp_file.sorted"
