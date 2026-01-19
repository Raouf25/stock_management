#!/bin/bash

# Script de test de l'API Stock Management
# Utilise curl pour tester les endpoints

BASE_URL="http://localhost:8080/api"

echo "=========================================="
echo "Stock Management API - Script de Tests"
echo "=========================================="
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  
  echo -e "${BLUE}► Test: $name${NC}"
  
  if [ -z "$data" ]; then
    curl -s -X "$method" "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" | jq '.'
  else
    curl -s -X "$method" "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data" | jq '.'
  fi
  
  echo -e "${GREEN}✓ Test terminé${NC}"
  echo ""
}

# ==========================================
# 1. TESTS PRODUITS
# ==========================================
echo -e "${YELLOW}=== TESTS PRODUITS ===${NC}"
echo ""

test_endpoint "Lister tous les produits" "GET" "/products"

# Récupérer le premier produit
FIRST_PRODUCT=$(curl -s -X GET "$BASE_URL/products" | jq '.[0]')
PRODUCT_ID=$(echo $FIRST_PRODUCT | jq '.idProduct')

if [ ! -z "$PRODUCT_ID" ] && [ "$PRODUCT_ID" != "null" ]; then
  test_endpoint "Détails du produit $PRODUCT_ID" "GET" "/products/$PRODUCT_ID"
  test_endpoint "Stock du produit $PRODUCT_ID" "GET" "/products/$PRODUCT_ID/stock"
else
  echo -e "${YELLOW}⚠ Aucun produit trouvé, création d'un produit de test${NC}"
  NEW_PRODUCT='{
    "designation": "PRODUIT_TEST",
    "name": "Produit Test",
    "category": "Test",
    "unit": "KG",
    "unitPriceBought": 10.0,
    "unitPriceSold": 12.5,
    "initialStockQuantity": 100,
    "currentStockQuantity": 100,
    "initialStockValue": 1250.0,
    "currentStockValue": 1250.0,
    "cmp": 12.5
  }'
  test_endpoint "Créer un produit" "POST" "/products" "$NEW_PRODUCT"
fi

echo ""

# ==========================================
# 2. TESTS ACHATS
# ==========================================
echo -e "${YELLOW}=== TESTS ACHATS ===${NC}"
echo ""

# Récupérer le fournisseur
FIRST_SUPPLIER=$(curl -s -X GET "$BASE_URL/suppliers" | jq '.[0]')
SUPPLIER_ID=$(echo $FIRST_SUPPLIER | jq '.id // .supplierId')

if [ -z "$SUPPLIER_ID" ] || [ "$SUPPLIER_ID" == "null" ]; then
  SUPPLIER_ID=1
fi

# Créer un achat
if [ ! -z "$PRODUCT_ID" ] && [ "$PRODUCT_ID" != "null" ]; then
  NEW_PURCHASE='{
    "datePurchase": "2024-01-19T10:30:00",
    "supplierId": '$SUPPLIER_ID',
    "productId": '$PRODUCT_ID',
    "invoiceNumber": "BL-TEST-001",
    "quantity": 50,
    "unitPriceTTC": 10.30,
    "comment": "Achat de test"
  }'
  
  test_endpoint "Créer un achat" "POST" "/purchases" "$NEW_PURCHASE"
  test_endpoint "Lister tous les achats" "GET" "/purchases"
  test_endpoint "Achats du produit $PRODUCT_ID" "GET" "/purchases/product/$PRODUCT_ID"
  test_endpoint "Rechercher les achats (derniers 30 jours)" "GET" "/purchases/search?dateFrom=2024-01-01T00:00:00&dateTo=2024-02-01T00:00:00"
fi

echo ""

# ==========================================
# 3. TESTS VENTES
# ==========================================
echo -e "${YELLOW}=== TESTS VENTES ===${NC}"
echo ""

if [ ! -z "$PRODUCT_ID" ] && [ "$PRODUCT_ID" != "null" ]; then
  NEW_SALE='{
    "dateSale": "2024-01-19T14:00:00",
    "productId": '$PRODUCT_ID',
    "quantitySold": 30,
    "unitSalePrice": 12.50
  }'
  
  test_endpoint "Créer une vente" "POST" "/sales" "$NEW_SALE"
  test_endpoint "Lister toutes les ventes" "GET" "/sales"
  test_endpoint "Ventes du produit $PRODUCT_ID" "GET" "/sales/product/$PRODUCT_ID"
  test_endpoint "Rechercher les ventes (derniers 30 jours)" "GET" "/sales/search?dateFrom=2024-01-01T00:00:00&dateTo=2024-02-01T00:00:00"
fi

echo ""

# ==========================================
# 4. TESTS MOUVEMENTS DE STOCK
# ==========================================
echo -e "${YELLOW}=== TESTS MOUVEMENTS DE STOCK ===${NC}"
echo ""

test_endpoint "Lister tous les mouvements" "GET" "/stock-movements"

if [ ! -z "$PRODUCT_ID" ] && [ "$PRODUCT_ID" != "null" ]; then
  test_endpoint "Mouvements du produit $PRODUCT_ID" "GET" "/stock-movements/product/$PRODUCT_ID"
  test_endpoint "Mouvements d'entrée (ENTREE)" "GET" "/stock-movements/type/ENTREE"
  test_endpoint "Mouvements de sortie (SORTIE)" "GET" "/stock-movements/type/SORTIE"
  test_endpoint "Mouvements issus d'achats (ACHAT)" "GET" "/stock-movements/source/ACHAT"
  test_endpoint "Mouvements issus de ventes (VENTE)" "GET" "/stock-movements/source/VENTE"
fi

echo ""

# ==========================================
# 5. TESTS REPORTING
# ==========================================
echo -e "${YELLOW}=== TESTS REPORTING ===${NC}"
echo ""

test_endpoint "Résumé global du stock" "GET" "/stock/summary"

if [ ! -z "$PRODUCT_ID" ] && [ "$PRODUCT_ID" != "null" ]; then
  test_endpoint "Résumé du produit $PRODUCT_ID" "GET" "/stock/$PRODUCT_ID/summary"
fi

test_endpoint "Alertes de stock (seuil: 10)" "GET" "/stock/alerts?threshold=10"
test_endpoint "Valeur totale du stock" "GET" "/stock/total-value"

echo ""

# ==========================================
# 6. TEST RECALCUL CMP
# ==========================================
echo -e "${YELLOW}=== TEST RECALCUL CMP ===${NC}"
echo ""

test_endpoint "Recalculer le CMP pour tous les produits" "POST" "/stock/recalculate-cmp"

echo ""

# ==========================================
# 7. TESTS FOURNISSEURS
# ==========================================
echo -e "${YELLOW}=== TESTS FOURNISSEURS ===${NC}"
echo ""

test_endpoint "Lister tous les fournisseurs" "GET" "/suppliers"

echo ""

# ==========================================
# RÉSUMÉ
# ==========================================
echo -e "${GREEN}=========================================="
echo "Tests terminés avec succès !"
echo "==========================================${NC}"
echo ""
echo "API disponible sur : $BASE_URL"
echo "Swagger UI : http://localhost:8080/swagger-ui.html"
echo ""
