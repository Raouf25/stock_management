#!/bin/bash

#
#    The algorithm for constructing the `customer name` based on the CSV file is as follows:
#
#    1. **Read the CSV File**: Read each line of the CSV file, skipping the header.
#    2. **Extract Columns**: Extract the `client` and `chantier` columns from each line.
#    3. **Handle Empty Values**:
#       - If the `client` value is empty or null, set it to "XXX".
#    4. **Construct Customer Name**:
#       - If the `chantier` value is not empty or null, concatenate `client` and `chantier` with a hyphen (`-`) in between.
#       - If the `chantier` value is empty or null, use only the `client` value.
#    5. **Generate SQL Insert Statements**:
#       - Insert the constructed `customer name` into the `Customer` table.
#
#    This algorithm ensures that the `customer name` is correctly constructed and inserted into the database based on the conditions specified.
#



# Input CSV file
input_file="Feuille1.csv"
# Output SQL file
output_file="2_customers.sql"

# Remove the output file if it exists
if [ -f "$output_file" ]; then
    rm "$output_file"
fi

# Create a new output file
touch "$output_file"

# Temporary file to store unique client-chantier combinations
temp_file=$(mktemp)

# Read the CSV file and process each line
tail -n +2 "$input_file" | while IFS=, read -r date client chantier designation prix_achat prix_vente quantite total_achat total_vente paiement
do
    # Skip the header line
    if [ "$date" != "DATE" ]; then
        # Write the unique client-chantier combinations to the temporary file
        echo "$client,$chantier" >> "$temp_file"
    fi
done

# Remove duplicate lines
sort -u "$temp_file" > "$temp_file.sorted"

# Write the SQL insert statements to the output file
while IFS=, read -r client chantier
do
    if [ -z "$client" ]; then
        client="XXX"
    fi

    if [ -n "$chantier" ]; then
        name="${client} - ${chantier}"
        echo "INSERT INTO Customer (name) VALUES ('$name');" >> "$output_file"
    else
        echo "INSERT INTO Customer (name) VALUES ('$client');" >> "$output_file"
    fi
done < "$temp_file.sorted"

# Remove the temporary file
rm "$temp_file" "$temp_file.sorted"
