#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'
#
echo -e "${YELLOW}===========================================\n"
# ==========================================
# 1. LISTER LES PRODUITS
# ==========================================
# 2. OBTENIR DÉTAILS D'UN PRODUIT
# ==========================================
echo -e "${BLUE}2. Obtenir les détails d'un produit (ID: 1)${NC}"
# ==========================================
# 3. OBTENIR LE STOCK D'UN PRODUIT
# ==========================================
echo -e "${BLUE}3. Obtenir le stock d'un produit${NC}"
echo "curl $BASE_URL/products/1/stock"
echo ""

    "quantity": 50,
# 4. CRÉER UN ACHAT
    "comment": "Achat de test"
# ==========================================
# 6. RECHERCHER LES ACHATS PAR DATE
# ==========================================
# ==========================================
# 7. RECHERCHER LES ACHATS PAR FOURNISSEUR
# ==========================================
    "quantitySold": 30,
cat << 'EOF'
curl "$BASE_URL/purchases/search?supplierId=1"
EOF
echo ""

# ==========================================
# 15. MOUVEMENTS D'ENTRÉE
# ==========================================
echo -e "${BLUE}15. Obtenir les mouvements d'entrée (ENTREE)${NC}"
echo "curl $BASE_URL/stock-movements/type/ENTREE"
echo ""
# 9. CRÉER UNE VENTE
# ==========================================
# ==========================================
# 16. MOUVEMENTS DE SORTIE
# ==========================================
echo -e "${BLUE}16. Obtenir les mouvements de sortie (SORTIE)${NC}"
# ==========================================
# 17. MOUVEMENTS PAR SOURCE (ACHAT)
# ==========================================
# 18. MOUVEMENTS PAR SOURCE (VENTE)
# ==========================================
echo -e "${BLUE}18. Obtenir les mouvements issus de ventes${NC}"
echo "curl $BASE_URL/stock-movements/source/VENTE"
echo ""

# ==========================================
# 19. RÉSUMÉ GLOBAL DU STOCK
# ==========================================
echo -e "${BLUE}19. Obtenir le résumé global du stock${NC}"
echo "curl $BASE_URL/stock/summary"
echo ""

# ==========================================
# 20. RÉSUMÉ D'UN PRODUIT
# ==========================================
echo -e "${BLUE}20. Obtenir le résumé d'un produit (ID: 1)${NC}"
echo "curl $BASE_URL/stock/1/summary"
echo ""

# ==========================================
# 21. ALERTES DE STOCK (seuil 10)
# ==========================================
echo -e "${BLUE}21. Obtenir les alertes de stock (seuil: 10)${NC}"
echo "curl '$BASE_URL/stock/alerts?threshold=10'"
echo ""

# ==========================================
# 22. ALERTES DE STOCK (seuil 20)
# ==========================================
echo -e "${BLUE}22. Obtenir les alertes de stock (seuil: 20)${NC}"
echo "curl '$BASE_URL/stock/alerts?threshold=20'"
echo ""

# ==========================================
# 23. VALEUR TOTALE DU STOCK
# ==========================================
echo -e "${BLUE}23. Obtenir la valeur totale du stock${NC}"
echo "curl $BASE_URL/stock/total-value"
echo ""

# ==========================================
# 24. RECALCULER LE CMP
# ==========================================
echo -e "${BLUE}24. Recalculer le CMP pour tous les produits${NC}"
echo "curl -X POST $BASE_URL/stock/recalculate-cmp"
echo ""

# ==========================================
# 25. RECHERCHE AVANCÉE DE MOUVEMENTS
# ==========================================
echo -e "${BLUE}25. Recherche avancée : mouvements d'un produit${NC}"
cat << 'EOF'
curl "$BASE_URL/stock-movements/search?productId=1&type=ENTREE&dateFrom=2024-01-01T00:00:00&dateTo=2024-02-01T00:00:00"
echo "curl $BASE_URL/stock-movements/source/ACHAT"
echo ""
EOF
echo ""
echo ""
echo ""

set -euo pipefail

BASE_URL="${API_BASE_URL:-http://localhost:8080/api}"

cat <<EOF
Stock Management API - curl examples
Base URL: ${BASE_URL}

1) Products
curl "${BASE_URL}/products"
curl "${BASE_URL}/products/1"
curl "${BASE_URL}/products/1/stock"

2) Purchases
curl "${BASE_URL}/purchases"
curl "${BASE_URL}/purchases/product/1"
curl "${BASE_URL}/purchases/search?dateFrom=2024-01-01T00:00:00&dateTo=2024-02-01T00:00:00"

curl -X POST "${BASE_URL}/purchases" \
  -H "Content-Type: application/json" \
  -d '{
    "datePurchase": "2024-01-19T10:30:00",
    "supplierId": 1,
    "productId": 1,
    "invoiceNumber": "BL-2024-001",
    "quantity": 1,
    "unitPriceTTC": 10.30,
    "comment": "purchase example"
  }'
EOF
echo ""

# ==========================================
# 5. LISTER TOUS LES ACHATS
# ==========================================
echo -e "${BLUE}5. Lister tous les achats${NC}"
echo "curl $BASE_URL/purchases"
echo ""

3) Sales
curl "${BASE_URL}/sales"
curl "${BASE_URL}/sales/product/1"
curl "${BASE_URL}/sales/search?dateFrom=2024-01-01T00:00:00&dateTo=2024-02-01T00:00:00"

curl -X POST "${BASE_URL}/sales" \
  -H "Content-Type: application/json" \
  -d '{
    "dateSale": "2024-01-19T14:00:00",
    "productId": 1,
    "quantitySold": 1,
    "unitSalePrice": 12.50
  }'
EOF
echo ""

# ==========================================
# 10. LISTER TOUTES LES VENTES
# ==========================================
echo -e "${BLUE}10. Lister toutes les ventes${NC}"
echo "curl $BASE_URL/sales"
echo ""

# ==========================================
# 11. RECHERCHER LES VENTES PAR DATE
# ==========================================
echo -e "${BLUE}11. Rechercher les ventes entre deux dates${NC}"
cat << 'EOF'
curl "$BASE_URL/sales/search?dateFrom=2024-01-01T00:00:00&dateTo=2024-02-01T00:00:00"
EOF
echo ""

# ==========================================
# 12. OBTENIR LES VENTES D'UN PRODUIT
# ==========================================
echo -e "${BLUE}12. Obtenir les ventes d'un produit (ID: 1)${NC}"
echo "curl $BASE_URL/sales/product/1"
echo ""

# ==========================================
# 13. LISTER TOUS LES MOUVEMENTS
# ==========================================
echo -e "${BLUE}13. Lister tous les mouvements de stock${NC}"
echo "curl $BASE_URL/stock-movements"
echo ""

# ==========================================
# 14. MOUVEMENTS PAR PRODUIT
# ==========================================
echo -e "${BLUE}14. Obtenir les mouvements d'un produit (ID: 1)${NC}"
echo "curl $BASE_URL/stock-movements/product/1"
echo ""

4) Stock movements
curl "${BASE_URL}/stock-movements"
curl "${BASE_URL}/stock-movements/product/1"
curl "${BASE_URL}/stock-movements/type/ENTREE"
curl "${BASE_URL}/stock-movements/type/SORTIE"
curl "${BASE_URL}/stock-movements/source/ACHAT"
curl "${BASE_URL}/stock-movements/source/VENTE"

5) Reporting
curl "${BASE_URL}/stock/summary"
curl "${BASE_URL}/stock/summary/1"
curl "${BASE_URL}/stock/alerts?threshold=10"
curl "${BASE_URL}/stock/total-value"
curl -X POST "${BASE_URL}/stock/recalculate-cmp"

6) Useful formatting
curl "${BASE_URL}/products" | jq '.'

Tip:
Set a custom API URL for remote environments:
API_BASE_URL="http://server:8080/api" ./scripts/CURL_EXAMPLES.sh
EOF
echo ""

# ==========================================
# CONSEILS D'UTILISATION
# ==========================================
echo -e "${YELLOW}===========================================\n"
echo "CONSEILS D'UTILISATION :\n"
echo "==========================================="
echo -e "${NC}"
echo "1. Remplacer les IDs (1, 2, etc.) par vos propres IDs"
echo "2. Utiliser | jq '.' pour formater les réponses JSON"
echo "3. Exemple :"
echo "   curl $BASE_URL/products | jq '.'"
echo ""
echo "4. Pour exporter le résultat :"
echo "   curl $BASE_URL/products > products.json"
echo ""
echo "5. Pour les erreurs, vérifier les logs :"
echo "   docker-compose logs stock_app"
echo ""
echo -e "${GREEN}✓ Tous les exemples sont prêts à utiliser !${NC}"
