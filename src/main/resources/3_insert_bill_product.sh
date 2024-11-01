#!/bin/bash

# Input CSV file
input_file="Feuille1.csv"
# Output SQL file
output_file="3_bill_Bill_Product.sql"

# Remove the output file if it exists
if [ -f "$output_file" ]; then
    rm "$output_file"
fi

# Create a new output file
touch "$output_file"

# Temporary file to store intermediate results
temp_file=$(mktemp)

# Read the CSV file and process each line
tail -n +2 "$input_file" | while IFS=, read -r date client chantier designation prix_achat prix_vente quantite total_achat total_vente paiement
do
    # Skip the header line
    if [ "$date" != "DATE" ]; then
        # Replace commas with periods and remove double quotes in prix and total columns
        prix_achat=$(echo $prix_achat | sed 's/,/./g' | tr -d '"')
        prix_vente=$(echo $prix_vente | sed 's/,/./g' | tr -d '"')
        total_achat=$(echo $total_achat | sed 's/,/./g' | tr -d '"')
        total_vente=$(echo $total_vente | sed 's/,/./g' | tr -d '"')

        # Convert date format from dd/mm/yyyy to yyyy-mm-dd
        formatted_date=$(date -j -f "%d/%m/%Y" "$date" "+%Y-%m-%d")

        # Determine payment status PAYER
        paiement=$(echo "$paiement" | tr -d '\n')

        if [[ "${paiement}" == "PAYER" ]]; then
            payment_status="PAID"
        elif [[ "${paiement}" == "N PAYER" ]]; then
            payment_status="UNPAID"
        else
            payment_status="$paiement"
        fi

        # Construct customer name
        if [ -z "$client" ]; then
            client="XXX"
        fi

        if [ -n "$chantier" ]; then
            customer_name="${client} - ${chantier}"
        else
            customer_name="$client"
        fi

        # Write the intermediate results to the temporary file
        echo "$formatted_date,$customer_name,$designation,$prix_achat,$prix_vente,$quantite,$total_achat,$total_vente,$payment_status" >> "$temp_file"
    fi
done

# Process the temporary file to accumulate values
sort "$temp_file" | awk -F, '
{
    key = $1 "_" $2
    bill_totals[key] += $8
    bill_quantities[key] += $6
    bill_payments[key] = $9
    bill_products[key] = bill_products[key] $3 "," $4 "," $5 "," $6 "," $8 "\n"
}
END {
    for (key in bill_totals) {
        split(key, arr, "_")
        formatted_date = arr[1]
        customer_name = arr[2]
        total_vente = bill_totals[key]
        payment_status = bill_payments[key]

        # Write the SQL insert statements to the output file
        print "INSERT INTO Bill (total, date_bill, payment_status, customer_id)" >> "'"$output_file"'"
        print "VALUES" >> "'"$output_file"'"
        print "    (" total_vente ", \x27" formatted_date " 00:00:00\x27, \x27" payment_status "\x27, (SELECT customer_id FROM Customer WHERE name = \x27" customer_name "\x27));" >> "'"$output_file"'"
        print "" >> "'"$output_file"'"

        # Write the product details for each bill
        split(bill_products[key], products, "\n")
        for (i in products) {
            if (products[i] != "") {
                split(products[i], product, ",")
                designation = product[1]
                prix_achat = product[2]
                prix_vente = product[3]
                quantite = product[4]
                total_vente = product[5]

                print "INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)" >> "'"$output_file"'"
                print "VALUES" >> "'"$output_file"'"
                print "    ((SELECT max(id_bill) FROM Bill WHERE date_bill = \x27" formatted_date " 00:00:00\x27" >> "'"$output_file"'"
                print "                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = \x27" customer_name "\x27))," >> "'"$output_file"'"
                print "     (SELECT id_product FROM Product WHERE name = \x27" designation "\x27 AND unit_price_sold = " prix_achat " AND unit_price_bought = " prix_vente " ), " quantite ", " total_vente ");" >> "'"$output_file"'"
                print "" >> "'"$output_file"'"
            }
        }
    }
}
'

# Remove the temporary file
rm "$temp_file"
