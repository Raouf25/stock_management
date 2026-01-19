# Exemples d'Utilisation de l'API REST de Gestion de Stock

## Base URL
```
http://localhost:8080/api
```

## 1. Gestion des Fournisseurs

### Créer un fournisseur
```bash
curl -X POST http://localhost:8080/api/suppliers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "VALDECO",
    "address": "123 Rue de la Paix, Paris",
    "phone": "01 23 45 67 89",
    "email": "contact@valdeco.com",
    "webSite": "www.valdeco.com",
    "tvaCode": "FR12345678901",
    "contactPerson": "Jean Dupont"
  }'
```

### Récupérer tous les fournisseurs
```bash
curl http://localhost:8080/api/suppliers
```

---

## 2. Gestion des Produits

### Créer un produit
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "designation": "A",
    "name": "Produit A",
    "description": "Article de base",
    "category": "Catégorie 1",
    "unit": "piece",
    "initialStockQuantity": 100,
    "initialUnitPrice": 10.0,
    "initialStockValue": 1000.0,
    "supplierId": 1
  }'
```

### Récupérer tous les produits
```bash
curl http://localhost:8080/api/products
```

### Récupérer un produit
```bash
curl http://localhost:8080/api/products/1
```

### Récupérer le stock d'un produit
```bash
curl http://localhost:8080/api/products/1/stock
```

---

## 3. Gestion des Achats

### Créer un achat (Achat simple)
```bash
curl -X POST http://localhost:8080/api/purchases \
  -H "Content-Type: application/json" \
  -d '{
    "datePurchase": "2024-01-15T10:30:00",
    "supplierId": 1,
    "productId": 1,
    "invoiceNumber": "BL-2024-001",
    "quantity": 50,
    "unitPriceTTC": 10.5,
    "comment": "Livraison de 50 unités du produit A"
  }'
```

**Réponse (201 Created) :**
```json
{
  "id": 1,
  "datePurchase": "2024-01-15T10:30:00",
  "supplierId": 1,
  "supplierName": "VALDECO",
  "productId": 1,
  "productDesignation": "A",
  "invoiceNumber": "BL-2024-001",
  "quantity": 50,
  "unitPriceTTC": 10.5,
  "totalAmountTTC": 525.0,
  "comment": "Livraison de 50 unités du produit A"
}
```

**État du stock après achat :**
```
Stock Initial : 100 unités
+ Achat : 50 unités
= Stock Final : 150 unités

Valeur Initial : 1000.0
+ Montant Achat (50 × 10.5) : 525.0
= Valeur Final : 1525.0

CMP = 1525.0 / 150 = 10.17
```

### Créer un second achat avec prix différent
```bash
curl -X POST http://localhost:8080/api/purchases \
  -H "Content-Type: application/json" \
  -d '{
    "datePurchase": "2024-01-20T14:15:00",
    "supplierId": 1,
    "productId": 1,
    "invoiceNumber": "BL-2024-002",
    "quantity": 30,
    "unitPriceTTC": 11.0,
    "comment": "Deuxième livraison"
  }'
```

**État du stock après deuxième achat :**
```
Stock Avant : 150 unités
+ Achat : 30 unités
= Stock Final : 180 unités

Valeur Avant : 1525.0
+ Montant Achat (30 × 11.0) : 330.0
= Valeur Final : 1855.0

CMP = 1855.0 / 180 = 10.31
```

### Récupérer tous les achats
```bash
curl http://localhost:8080/api/purchases
```

### Rechercher les achats entre deux dates
```bash
curl "http://localhost:8080/api/purchases/search?dateFrom=2024-01-01T00:00:00&dateTo=2024-01-31T23:59:59"
```

### Rechercher les achats d'un fournisseur
```bash
curl "http://localhost:8080/api/purchases/search?supplierId=1"
```

### Rechercher les achats d'un fournisseur et d'une période
```bash
curl "http://localhost:8080/api/purchases/search?supplierId=1&dateFrom=2024-01-01T00:00:00&dateTo=2024-01-31T23:59:59"
```

### Récupérer les achats d'un produit
```bash
curl http://localhost:8080/api/purchases/product/1
```

---

## 4. Gestion des Ventes

### Créer une vente
```bash
curl -X POST http://localhost:8080/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "dateSale": "2024-01-25T09:00:00",
    "productId": 1,
    "quantitySold": 40,
    "unitSalePrice": 15.0
  }'
```

**Réponse (201 Created) :**
```json
{
  "id": 1,
  "dateSale": "2024-01-25T09:00:00",
  "productId": 1,
  "productDesignation": "A",
  "quantitySold": 40,
  "unitSalePrice": 15.0,
  "totalSaleAmount": 600.0
}
```

**État du stock après vente :**
```
Stock Avant : 180 unités
- Vente : 40 unités
= Stock Final : 140 unités

Valeur Avant : 1855.0
- Montant Vente (40 × CMP 10.31) : 412.4
= Valeur Final : 1442.6

CMP = 1442.6 / 140 = 10.31
```

### Tentative de vente avec quantité insuffisante (ERREUR)
```bash
curl -X POST http://localhost:8080/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "dateSale": "2024-01-26T10:00:00",
    "productId": 1,
    "quantitySold": 200,
    "unitSalePrice": 15.0
  }'
```

**Réponse (400 Bad Request) :**
```json
"Erreur lors de la création de la vente : Quantité insuffisante en stock. Stock disponible : 140, Quantité demandée : 200"
```

### Récupérer toutes les ventes
```bash
curl http://localhost:8080/api/sales
```

### Rechercher les ventes entre deux dates
```bash
curl "http://localhost:8080/api/sales/search?dateFrom=2024-01-01T00:00:00&dateTo=2024-01-31T23:59:59"
```

### Récupérer les ventes d'un produit
```bash
curl http://localhost:8080/api/sales/product/1
```

---

## 5. Mouvements de Stock

### Récupérer tous les mouvements
```bash
curl http://localhost:8080/api/stock-movements
```

**Réponse :**
```json
[
  {
    "id": 1,
    "productId": 1,
    "productDesignation": "A",
    "quantity": 50,
    "date": "2024-01-15T10:30:00",
    "type": "ENTREE",
    "source": "ACHAT",
    "reference": "BL-2024-001"
  },
  {
    "id": 2,
    "productId": 1,
    "productDesignation": "A",
    "quantity": 30,
    "date": "2024-01-20T14:15:00",
    "type": "ENTREE",
    "source": "ACHAT",
    "reference": "BL-2024-002"
  },
  {
    "id": 3,
    "productId": 1,
    "productDesignation": "A",
    "quantity": 40,
    "date": "2024-01-25T09:00:00",
    "type": "SORTIE",
    "source": "VENTE",
    "reference": "VENTE-1"
  }
]
```

### Récupérer les mouvements d'un produit
```bash
curl http://localhost:8080/api/stock-movements/product/1
```

### Récupérer les mouvements de type ENTREE
```bash
curl http://localhost:8080/api/stock-movements/type/ENTREE
```

### Récupérer les mouvements de type SORTIE
```bash
curl http://localhost:8080/api/stock-movements/type/SORTIE
```

### Récupérer les mouvements sources ACHAT
```bash
curl http://localhost:8080/api/stock-movements/source/ACHAT
```

### Récupérer les mouvements sources VENTE
```bash
curl http://localhost:8080/api/stock-movements/source/VENTE
```

### Rechercher avec filtres multiples
```bash
curl "http://localhost:8080/api/stock-movements/search?productId=1&type=ENTREE&dateFrom=2024-01-01T00:00:00&dateTo=2024-01-31T23:59:59"
```

---

## 6. Reporting et Synthèse de Stock

### Récupérer le résumé global du stock
```bash
curl http://localhost:8080/api/stock/summary
```

**Réponse :**
```json
{
  "products": [
    {
      "productId": 1,
      "productDesignation": "A",
      "initialQuantity": 100,
      "initialValue": 1000.0,
      "totalPurchasesAmount": 855.0,
      "totalSalesAmount": 600.0,
      "finalQuantity": 140,
      "finalStockValue": 1255.0,
      "cmp": 8.96
    },
    {
      "productId": 2,
      "productDesignation": "B",
      "initialQuantity": 50,
      "initialValue": 500.0,
      "totalPurchasesAmount": 200.0,
      "totalSalesAmount": 150.0,
      "finalQuantity": 60,
      "finalStockValue": 550.0,
      "cmp": 9.17
    }
  ],
  "totals": {
    "initialQuantity": 150,
    "initialValue": 1500.0,
    "totalPurchasesAmount": 1055.0,
    "totalSalesAmount": 750.0,
    "finalQuantity": 200,
    "finalStockValue": 1805.0
  }
}
```

### Récupérer le résumé pour un produit spécifique
```bash
curl http://localhost:8080/api/stock/summary/1
```

**Réponse :**
```json
{
  "productId": 1,
  "productDesignation": "A",
  "initialQuantity": 100,
  "initialValue": 1000.0,
  "totalPurchasesAmount": 855.0,
  "totalSalesAmount": 600.0,
  "finalQuantity": 140,
  "finalStockValue": 1255.0,
  "cmp": 8.96
}
```

### Récupérer les alertes de stock (seuil par défaut 10)
```bash
curl http://localhost:8080/api/stock/alerts
```

**Réponse (produits avec stock <= 10) :**
```json
[
  {
    "productId": 3,
    "productDesignation": "C",
    "currentQuantity": 5,
    "threshold": 10,
    "alertLevel": "CRITICAL"
  },
  {
    "productId": 4,
    "productDesignation": "D",
    "currentQuantity": 8,
    "threshold": 10,
    "alertLevel": "LOW"
  }
]
```

### Récupérer les alertes avec seuil personnalisé
```bash
curl "http://localhost:8080/api/stock/alerts?threshold=20"
```

### Récupérer la valeur totale du stock
```bash
curl http://localhost:8080/api/stock/total-value
```

**Réponse :**
```json
{
  "totalStockValue": 1805.0
}
```

### Recalculer tous les CMP
```bash
curl -X POST http://localhost:8080/api/stock/recalculate-cmp
```

**Réponse :**
```json
{
  "status": "success",
  "message": "Les CMP ont été recalculés avec succès"
}
```

---

## Cas d'Usage Complet : Suivi d'un Produit

### Scénario : Produit "Composant Électronique X"

```bash
# 1. Créer le produit avec stock initial
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "designation": "COMP-X",
    "name": "Composant Électronique X",
    "initialStockQuantity": 200,
    "initialUnitPrice": 25.0,
    "initialStockValue": 5000.0,
    "supplierId": 1
  }'
# Produit ID: 1 créé

# 2. Premier achat : 100 unités à 26 € TTC
curl -X POST http://localhost:8080/api/purchases \
  -H "Content-Type: application/json" \
  -d '{
    "datePurchase": "2024-02-01T08:00:00",
    "supplierId": 1,
    "productId": 1,
    "invoiceNumber": "INV-001",
    "quantity": 100,
    "unitPriceTTC": 26.0,
    "comment": "Réapprovisionnement standard"
  }'
# Achat ID: 1 créé
# Stock: 200 + 100 = 300 unités
# Valeur: 5000 + 2600 = 7600
# CMP: 7600 / 300 = 25.33

# 3. Vente : 80 unités à 35 € TTC
curl -X POST http://localhost:8080/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "dateSale": "2024-02-05T14:30:00",
    "productId": 1,
    "quantitySold": 80,
    "unitSalePrice": 35.0
  }'
# Vente ID: 1 créée
# Stock: 300 - 80 = 220 unités
# Valeur: 7600 - (80 × 25.33) = 5973.6
# CMP: 5973.6 / 220 = 27.16

# 4. Vérifier le stock du produit
curl http://localhost:8080/api/products/1/stock
# Réponse: 220

# 5. Consulter le résumé du produit
curl http://localhost:8080/api/stock/summary/1
# Réponse: Synthèse complète avec tous les calculs

# 6. Vérifier les mouvements du produit
curl http://localhost:8080/api/stock-movements/product/1
# Réponse: Historique de tous les mouvements

# 7. Alerter si stock faible
curl http://localhost:8080/api/stock/alerts?threshold=50
# Aucune alerte (stock = 220)
```

---

## Notes Importantes

1. **Transactions Atomiques** : Chaque achat ou vente est une transaction unique garantissant la cohérence des données
2. **CMP Automatique** : Le CMP est recalculé automatiquement après chaque achat ou vente
3. **Mouvements Historisés** : Chaque mouvement est enregistré automatiquement
4. **Validation Métier** :
   - Stock insuffisant pour une vente → Erreur 400
   - Produit non trouvé → Erreur 400
   - Fournisseur non trouvé → Erreur 400
5. **Tous les Montants en TTC** : Incluent les taxes
