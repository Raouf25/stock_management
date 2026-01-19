# API REST Gestion de Stock - Documentation

## 📋 Vue d'ensemble

Cette API REST gère complètement le cycle de vie des stocks, depuis les achats auprès des fournisseurs jusqu'aux ventes, en passant par l'historisation des mouvements de stock et la valorisation du stock selon la méthode du Coût Moyen Pondéré (CMP).

## 🎯 Fonctionnalités principales

### 1. **Gestion des Produits**
- Création et gestion des articles avec désignation
- Suivi du stock initial et stock final
- Calcul automatique du Coût Moyen Pondéré (CMP)
- Valorisation du stock

### 2. **Gestion des Achats**
- Enregistrement des achats auprès des fournisseurs
- Génération automatique des entrées de stock
- Calcul automatique du CMP lors de chaque achat
- Historisation complète des achats

### 3. **Gestion des Ventes**
- Enregistrement des ventes avec contrôle de stock
- Génération automatique des sorties de stock
- Calcul de la valeur du stock vendu au CMP
- Historisation complète des ventes

### 4. **Mouvements de Stock**
- Historisation complète (ENTREE/SORTIE)
- Source du mouvement (ACHAT/VENTE/AJUSTEMENT)
- Traçabilité complète avec références

### 5. **Reporting & Synthèse**
- Résumé global du stock
- Résumé par produit
- Alertes de stock faible
- Valeur totale du stock
- Recalcul du CMP

## 📊 Règles de Calcul Métier

### Stock Final
```
Stock Final = Stock Initial + Total Achats - Total Ventes
```

### Valeur du Stock Final
```
Valeur Stock Final = Valeur Initiale + Montant Achats TTC - Montant Ventes TTC
```

### Coût Moyen Pondéré (CMP)
```
CMP = Valeur Stock Final / Quantité Stock Final
CMP = 0 si Quantité Stock Final = 0
```

## 📦 Chargement des Données depuis CSV

### Configuration Automatique au Démarrage

L'application charge automatiquement les données depuis les fichiers CSV au démarrage :

1. **CsvDataLoaderService** - Service de chargement automatique
   - S'exécute lors du démarrage de l'application (`@EventListener(ApplicationReadyEvent.class)`)
   - Charge les données uniquement si aucune donnée n'existe (`if (productRepository.count() > 0)`)
   - Crée les fournisseurs par défaut s'ils n'existent pas

2. **Fichiers CSV utilisés**
   - `src/main/resources/Products.csv` - Catalogue des produits avec stock initial
   - Le fichier `Feuille1.csv` contient les données de transactions (ventes)

### Format du Fichier Products.csv

```
category,name,unit,unit_price_ht,unit_price_ttc,initial_stock_quantity,current_stock_quantity,supplier_id
Impressions,VALPRIMER,1.000 KG,8.656,10.300,150,150,2
```

Colonnes :
- `category` - Catégorie du produit
- `name` - Désignation du produit
- `unit` - Unité (kg, L, pièce, etc.)
- `unit_price_ht` - Prix unitaire HT
- `unit_price_ttc` - Prix unitaire TTC
- `initial_stock_quantity` - Quantité initiale en stock
- `current_stock_quantity` - Quantité actuelle
- `supplier_id` - ID du fournisseur

### Configuration Spring Boot

Les propriétés suivantes contrôlent le chargement des données :

```properties
# Désactiver le chargement automatique des fichiers SQL
spring.sql.init.mode=never
spring.jpa.defer-datasource-initialization=false

# Le service CsvDataLoaderService charge automatiquement les données
# au démarrage de l'application si aucune donnée n'existe
```

### Idempotence

Le chargement CSV est **idempotent** - si les données existent déjà dans la base de données, elles ne seront pas rechargées.

```java
if (productRepository.count() > 0) {
    logger.info("Les données existent déjà. Pas de rechargement.");
    return;
}
```

## 🔌 API Endpoints

### Produits
```
GET    /api/products              # Lister tous les produits
POST   /api/products              # Créer un produit
GET    /api/products/{id}         # Détails d'un produit
PUT    /api/products/{id}         # Mettre à jour un produit
GET    /api/products/{id}/stock   # Stock d'un produit
```

### Achats
```
POST   /api/purchases             # Créer un achat
GET    /api/purchases             # Lister tous les achats
GET    /api/purchases/{id}        # Détails d'un achat
GET    /api/purchases/search?...  # Filtrer les achats (dateFrom, dateTo, supplierId)
GET    /api/purchases/product/{productId}  # Achats d'un produit
```

### Ventes
```
POST   /api/sales                 # Créer une vente
GET    /api/sales                 # Lister toutes les ventes
GET    /api/sales/{id}            # Détails d'une vente
GET    /api/sales/search?...      # Filtrer les ventes (dateFrom, dateTo)
GET    /api/sales/product/{productId}    # Ventes d'un produit
```

### Mouvements de Stock
```
GET    /api/stock-movements       # Tous les mouvements
GET    /api/stock-movements/{id}  # Détails d'un mouvement
GET    /api/stock-movements/search?...  # Filtrer (productId, type, dateFrom, dateTo)
GET    /api/stock-movements/product/{productId}  # Mouvements d'un produit
GET    /api/stock-movements/type/{type}         # Par type (ENTREE/SORTIE)
GET    /api/stock-movements/source/{source}     # Par source (ACHAT/VENTE/AJUSTEMENT)
```

### Reporting
```
GET    /api/stock/summary                 # Résumé global
GET    /api/stock/{productId}/summary     # Résumé d'un produit
GET    /api/stock/alerts?threshold=10     # Alertes de stock
GET    /api/stock/total-value             # Valeur totale du stock
POST   /api/stock/recalculate-cmp         # Recalculer CMP
```

## 💾 Exemple de Requête : Créer un Achat

```json
POST /api/purchases
Content-Type: application/json

{
  "datePurchase": "2024-01-19T10:30:00",
  "supplierId": 1,
  "productId": 1,
  "invoiceNumber": "BL-2024-001",
  "quantity": 50,
  "unitPriceTTC": 10.30,
  "comment": "Commande standard"
}
```

**Réponse (201 Created):**
```json
{
  "id": 1,
  "datePurchase": "2024-01-19T10:30:00",
  "supplierId": 1,
  "supplierName": "VALDECO",
  "productId": 1,
  "productDesignation": "VALPRIMER",
  "invoiceNumber": "BL-2024-001",
  "quantity": 50,
  "unitPriceTTC": 10.30,
  "totalAmountTTC": 515.00,
  "comment": "Commande standard"
}
```

**Effets secondaires :**
- ✅ Le stock du produit augmente de 50
- ✅ La valeur du stock augmente de 515.00
- ✅ Le CMP est recalculé
- ✅ Un mouvement d'ENTREE est créé automatiquement

## 💾 Exemple de Requête : Créer une Vente

```json
POST /api/sales
Content-Type: application/json

{
  "dateSale": "2024-01-19T14:00:00",
  "productId": 1,
  "quantitySold": 30,
  "unitSalePrice": 12.50
}
```

**Réponse (201 Created):**
```json
{
  "id": 1,
  "dateSale": "2024-01-19T14:00:00",
  "productId": 1,
  "productDesignation": "VALPRIMER",
  "quantitySold": 30,
  "unitSalePrice": 12.50,
  "totalSaleAmount": 375.00
}
```

**Effets secondaires :**
- ✅ Le stock du produit diminue de 30
- ✅ La valeur du stock diminue (au CMP)
- ✅ Un mouvement de SORTIE est créé automatiquement
- ✅ Erreur si le stock est insuffisant

## 📊 Exemple de Réponse : Résumé de Stock

```json
GET /api/stock/summary

[
  {
    "productId": 1,
    "productDesignation": "VALPRIMER",
    "initialQuantity": 150,
    "initialValue": 1545.00,
    "totalPurchasesAmount": 515.00,
    "totalSalesAmount": 375.00,
    "finalQuantity": 140,
    "finalStockValue": 1685.00,
    "cmp": 12.04
  }
]
```

## 🚀 Démarrage de l'Application

### Avec Maven
```bash
cd /workspaces/stock_management
mvn clean install
mvn spring-boot:run
```

### Avec Docker Compose
```bash
docker-compose up -d
```

### Accéder à l'API
- **API REST** : http://localhost:8080/api
- **Swagger UI** : http://localhost:8080/swagger-ui.html
- **OpenAPI JSON** : http://localhost:8080/v3/api-docs

## 🔒 Transactions ACID

Toutes les opérations critiques (achat, vente) utilisent `@Transactional` pour garantir la cohérence des données :

```java
@Transactional
public Purchase createPurchase(PurchaseDTO purchaseDTO) throws Exception {
    // Validation
    // Création de l'achat
    // Création du mouvement de stock
    // Mise à jour du stock du produit
}
```

## 📝 Logging

Les logs sont stockés dans `logs/stock_management.log` et configurés pour :
- **Console** : INFO et supérieur
- **Fichier** : DEBUG et supérieur
- **Rotation** : 10 fichiers max de 10 MB chacun

## 🐛 Troubleshooting

### Les données ne sont pas chargées au démarrage
1. Vérifiez que `Products.csv` existe dans `src/main/resources/`
2. Assurez-vous que `spring.sql.init.mode=never` dans `application.properties`
3. Vérifiez les logs : `logs/stock_management.log`
4. Vérifiez que la base de données est vide (ou supprimez les données existantes)

### Erreur "Quantité insuffisante en stock"
Cela signifie que la quantité vendue dépasse le stock disponible. Vérifiez :
- Le stock actuel du produit
- Les achats déjà effectués
- Les ventes déjà effectuées

### Le CMP n'est pas correct
Exécutez l'endpoint pour recalculer le CMP :
```
POST /api/stock/recalculate-cmp
```

## 📚 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    REST Controllers                         │
│ ┌──────────────┬──────────────┬──────────────┬──────────────┐
│ │ Product      │ Purchase     │ Sale         │ StockMove.   │
│ │ Supplier     │ Reporting    │              │              │
└─┴──────────────┴──────────────┴──────────────┴──────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│                    Services Layer                           │
│ ┌──────────────┬──────────────┬──────────────┬──────────────┐
│ │ Product      │ Purchase     │ Sale         │ Stock        │
│ │ Supplier     │ StockMove.   │ CsvDataLoad. │              │
└─┴──────────────┴──────────────┴──────────────┴──────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│                    Repositories                             │
│ ┌──────────────┬──────────────┬──────────────┬──────────────┐
│ │ Product      │ Purchase     │ Sale         │ StockMove.   │
│ │ Supplier     │              │              │              │
└─┴──────────────┴──────────────┴──────────────┴──────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│                    Database (MySQL)                         │
│ ┌──────────────┬──────────────┬──────────────┬──────────────┐
│ │ product      │ purchase     │ sale         │ stock_move.  │
│ │ supplier     │              │              │              │
└─┴──────────────┴──────────────┴──────────────┴──────────────┘
```

## 📄 Fichiers Clés

- `CsvDataLoaderService.java` - Chargement automatique des CSV
- `Product.java` - Modèle avec CMP et valorisation
- `Purchase.java` - Modèle des achats
- `Sale.java` - Modèle des ventes
- `StockMouvement.java` - Historique des mouvements
- `PurchaseService.java` - Logique des achats + entrée stock
- `SaleService.java` - Logique des ventes + sortie stock
- `StockService.java` - Calculs et résumés de stock
- `Products.csv` - Données initiales des produits

## ✅ Contrôles de Qualité

- [x] Transactions ACID
- [x] Validation métier stricte
- [x] Historisation complète
- [x] CMP automatique
- [x] Idempotence du chargement CSV
- [x] Erreurs explicites
- [x] Logging complet
- [x] API OpenAPI/Swagger
- [x] CORS activé

## 🔄 Flux Métier Principal

```
Achat (Purchase)
  ├── Création avec fournisseur et produit
  ├── Génération automatique entrée stock
  ├── Augmentation stock du produit
  ├── Augmentation valeur du stock
  └── Recalcul CMP

Vente (Sale)
  ├── Création avec vérification stock
  ├── Génération automatique sortie stock
  ├── Diminution stock du produit
  ├── Diminution valeur du stock (au CMP)
  └── Recalcul CMP

Reporting
  ├── Calcul stock final
  ├── Calcul valeur finale
  ├── Calcul CMP
  └── Alertes de stock faible
```
