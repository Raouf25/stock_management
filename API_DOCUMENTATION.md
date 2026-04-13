# API REST de Gestion de Stock

Une API REST complète basée sur Spring Boot pour gérer :
- Les achats fournisseurs
- Les ventes clients
- Les factures avec génération PDF
- Les mouvements de stock (entrée/sortie)
- Le stock initial et final
- La valorisation du stock (CMP - Coût Moyen Pondéré)
- Les alertes de stock

## Architecture

L'API suit une architecture en couches :
- **Controllers** : Gestion des requêtes REST
- **Services** : Logique métier et calculs
- **Repositories** : Accès aux données (JPA)
- **Models** : Entités JPA
- **DTOs** : Objet de transfert de données

## Modèle de Données

### Produit (Article)

```json
{
  "idProduct": 1,
  "designation": "A",
  "name": "Produit A",
  "initialStockQuantity": 100,
  "initialUnitPrice": 10.0,
  "initialStockValue": 1000.0,
  "currentStockQuantity": 150,
  "currentStockValue": 1500.0,
  "cmp": 10.0,
  "supplierId": 1
}
```

**Champs principaux :**
- `idProduct` : Identifiant unique
- `designation` : Désignation simple (ex: A, B, C)
- `initialStockQuantity` : Quantité initiale
- `initialStockValue` : Valeur initiale (quantité × prix unitaire)
- `currentStockQuantity` : Quantité actuelle en stock
- `currentStockValue` : Valeur actuelle du stock
- `cmp` : Coût Moyen Pondéré (calculé)

### Fournisseur

```json
{
  "id": 1,
  "name": "VALDECO",
  "address": "123 Rue de la Paix",
  "phone": "01234567890",
  "email": "contact@valdeco.com"
}
```

### Achat

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
  "comment": "Achat normal"
}
```

**Règles :**
- Un achat génère automatiquement une entrée de stock
- Si l'article n'existe pas → erreur métier explicite
- La quantité et le montant sont en TTC

### Vente

```json
{
  "id": 1,
  "dateSale": "2024-01-16T14:20:00",
  "productId": 1,
  "productDesignation": "A",
  "quantitySold": 30,
  "unitSalePrice": 15.0,
  "totalSaleAmount": 450.0
}
```

**Règles :**
- La quantité vendue ne peut pas dépasser le stock disponible
- Toute vente génère une sortie de stock automatiquement

### Mouvement de Stock

```json
{
  "id": 1,
  "productId": 1,
  "productDesignation": "A",
  "quantity": 50,
  "date": "2024-01-15T10:30:00",
  "type": "ENTREE",
  "source": "ACHAT",
  "reference": "BL-2024-001"
}
```

**Types de mouvements :**
- `ENTREE` : Entrée de stock (achat, retour)
- `SORTIE` : Sortie de stock (vente, ajustement)

**Sources :**
- `ACHAT` : Provenant d'un achat
- `VENTE` : Provenant d'une vente
- `AJUSTEMENT` : Ajustement manuel

## Règles de Calcul Métier

### Stock Final
```
stockFinal = stockInitial + totalAchats - totalVentes
```

### Valeur du Stock Final
```
valeurStockFinal = valeurInitiale + montantAchats - montantVentes
```

### CMP (Coût Moyen Pondéré)
```
CMP = valeurStockFinal / quantiteStockFinal
CMP = 0 si quantiteStockFinal = 0
```

**Tous les montants sont en TTC**

## Endpoints REST

### Factures (Bills)

#### Récupérer toutes les factures
```http
GET /api/bills
```

**Réponse :**
```json
[
  {
    "idBill": 1,
    "total": 206.00,
    "deposit": 0.00,
    "amountDue": 206.00,
    "dateBill": "2025-01-10T10:00:00",
    "paymentStatus": "UNPAID",
    "customer": {
      "customerId": 1,
      "name": "Entreprise Construction ABC"
    },
    "billProducts": [
      {
        "product": {
          "idProduct": 1,
          "name": "VALPRIMER",
          "unit": "1.000 KG"
        },
        "quantity": 20,
        "totalProductPrice": 206.00
      }
    ]
  }
]
```

**Implémentation (BillController) :**
```java
@GetMapping
@Operation(summary = "Obtenir la liste de toutes les bills")
public List<CreatedBillDTO> getAllBills() {
    return billService.findAll().stream()
            .map(billMapper::sourceToDestination)
            .toList();
}
```

#### Générer et télécharger une facture PDF
```http
GET /api/bills/generate/{id}
```

**Description :** Génère une facture PDF conforme à la législation tunisienne avec :
- Mentions légales (Code TVA, Code des Obligations)
- Matricule Fiscale
- TVA à 19%
- Totaux (HT, TTC, Acompte, Net à payer)
- Sections de signature

**Réponse :** Fichier PDF (Content-Type: application/pdf)

#### Créer une nouvelle facture
```http
POST /api/bills
Content-Type: application/json

{
  "customerId": 1,
  "total": 500.00,
  "deposit": 100.00,
  "amountDue": 400.00,
  "dateBill": "2026-01-23T14:00:00",
  "paymentStatus": "PARTIAL",
  "billProducts": [
    {
      "productId": 1,
      "quantity": 10,
      "totalProductPrice": 500.00
    }
  ]
}
```

**Implémentation (BillController) :**
```java
@PostMapping
@Operation(summary = "Créer une nouvelle Bill")
public Optional<CreatedBillDTO> createBill(@RequestBody BillDTO billDTO) {
    return Optional.of(billService.save(billDTO))
            .map(billMapper::sourceToDestination);
}
```

### Produits

#### Récupérer tous les produits
```
GET /api/products
```

#### Créer un produit
```
POST /api/products
Content-Type: application/json

{
  "designation": "A",
  "name": "Produit A",
  "initialStockQuantity": 100,
  "initialUnitPrice": 10.0,
  "initialStockValue": 1000.0,
  "supplierId": 1
}
```

#### Récupérer un produit
```
GET /api/products/{id}
```

#### Mettre à jour un produit
```
PUT /api/products/{id}
Content-Type: application/json
```

#### Récupérer le stock d'un produit
```
GET /api/products/{id}/stock
```

### Achats

#### Créer un achat
```
POST /api/purchases
Content-Type: application/json

{
  "datePurchase": "2024-01-15T10:30:00",
  "supplierId": 1,
  "productId": 1,
  "invoiceNumber": "BL-2024-001",
  "quantity": 50,
  "unitPriceTTC": 10.5,
  "comment": "Achat normal"
}
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
  "comment": "Achat normal"
}
```

**Implémentation (PurchaseController) :**
```java
@PostMapping
@Operation(summary = "Créer un nouvel achat")
public ResponseEntity<?> createPurchase(@RequestBody PurchaseDTO purchaseDTO) {
    try {
        Purchase purchase = purchaseService.createPurchase(purchaseDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(purchaseService.convertToDTO(purchase));
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body("Erreur lors de la création de l'achat : " + e.getMessage());
    }
}
```

#### Récupérer tous les achats
```
GET /api/purchases
```

#### Récupérer un achat par ID
```
GET /api/purchases/{id}
```

#### Rechercher des achats avec filtres
```
GET /api/purchases/search?dateFrom=2024-01-01T00:00:00&dateTo=2024-01-31T23:59:59&supplierId=1
```

**Paramètres optionnels :**
- `dateFrom` : Date de début (ISO 8601)
- `dateTo` : Date de fin (ISO 8601)
- `supplierId` : ID du fournisseur

**Implémentation (PurchaseController) :**
```java
@GetMapping("/search")
@Operation(summary = "Rechercher des achats avec filtres")
public ResponseEntity<List<PurchaseDTO>> searchPurchases(
    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDate dateFrom,
    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDate dateTo,
    @RequestParam(required = false) Long supplierId) {

    List<Purchase> purchases = purchaseService.getPurchasesByFilter(dateFrom, dateTo, supplierId);
    return ResponseEntity.ok(purchaseService.convertToDTO(purchases));
}
```

#### Récupérer les achats d'un produit
```
GET /api/purchases/product/{productId}
```

### Ventes

#### Créer une vente
```
POST /api/sales
Content-Type: application/json

{
  "dateSale": "2024-01-16T14:20:00",
  "productId": 1,
  "quantitySold": 30,
  "unitSalePrice": 15.0
}
```

**Réponse (201 Created) :**
```json
{
  "id": 1,
  "dateSale": "2024-01-16T14:20:00",
  "productId": 1,
  "productDesignation": "A",
  "quantitySold": 30,
  "unitSalePrice": 15.0,
  "totalSaleAmount": 450.0
}
```

**Validation :**
- La quantité vendue ne peut pas dépasser le stock disponible
- Retourne une erreur 400 si le stock est insuffisant

**Implémentation (SaleController) :**
```java
@PostMapping
@Operation(summary = "Créer une nouvelle vente")
public ResponseEntity<?> createSale(@RequestBody SaleDTO saleDTO) {
    try {
        Sale sale = saleService.createSale(saleDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(saleService.convertToDTO(sale));
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body("Erreur lors de la création de la vente : " + e.getMessage());
    }
}
```

#### Récupérer toutes les ventes
```
GET /api/sales
```

#### Récupérer une vente par ID
```
GET /api/sales/{id}
```

#### Rechercher des ventes avec filtres
```
GET /api/sales/search?dateFrom=2024-01-01T00:00:00&dateTo=2024-01-31T23:59:59
```

#### Récupérer les ventes d'un produit
```
GET /api/sales/product/{productId}
```

### Mouvements de Stock

#### Récupérer tous les mouvements
```
GET /api/stock-movements
```

#### Récupérer un mouvement par ID
```
GET /api/stock-movements/{id}
```

#### Rechercher des mouvements avec filtres
```
GET /api/stock-movements/search?productId=1&type=ENTREE&dateFrom=2024-01-01T00:00:00&dateTo=2024-01-31T23:59:59
```

**Paramètres optionnels :**
- `productId` : ID du produit
- `type` : ENTREE ou SORTIE
- `dateFrom` : Date de début
- `dateTo` : Date de fin

#### Récupérer les mouvements d'un produit
```
GET /api/stock-movements/product/{productId}
```

#### Récupérer les mouvements par type
```
GET /api/stock-movements/type/ENTREE
GET /api/stock-movements/type/SORTIE
```

#### Récupérer les mouvements par source
```
GET /api/stock-movements/source/ACHAT
GET /api/stock-movements/source/VENTE
GET /api/stock-movements/source/AJUSTEMENT
```

### Reporting / Synthèse

#### Récupérer le résumé global du stock
```
GET /api/stock/summary
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
      "totalPurchasesAmount": 525.0,
      "totalSalesAmount": 450.0,
      "finalQuantity": 155,
      "finalStockValue": 1075.0,
      "cmp": 6.94
    }
  ],
  "totals": {
    "initialQuantity": 100,
    "initialValue": 1000.0,
    "totalPurchasesAmount": 525.0,
    "totalSalesAmount": 450.0,
    "finalQuantity": 155,
    "finalStockValue": 1075.0
  }
}
```

#### Récupérer le résumé pour un produit
```
GET /api/stock/summary/{productId}
```

#### Récupérer les alertes de stock
```
GET /api/stock/alerts
```

**Réponse :**
```json
[
  {
    "productId": 1,
    "productDesignation": "A",
    "currentQuantity": 5,
    "threshold": 10,
    "alertLevel": "CRITICAL"
  }
]
```

#### Récupérer les alertes avec seuil personnalisé
```
GET /api/stock/alerts?threshold=20
```

#### Récupérer la valeur totale du stock
```
GET /api/stock/total-value
```

**Réponse :**
```json
{
  "totalStockValue": 1075.0
}
```

#### Recalculer tous les CMP
```
POST /api/stock/recalculate-cmp
```

## Codes de Réponse HTTP

- `200 OK` : Succès (GET, PUT)
- `201 Created` : Ressource créée (POST)
- `400 Bad Request` : Validation métier échouée
- `404 Not Found` : Ressource non trouvée
- `500 Internal Server Error` : Erreur serveur

## Validation Métier

1. **Produit obligatoire** : Impossible de créer un achat sans article existant
2. **Fournisseur obligatoire** : Chaque achat doit référencer un fournisseur
3. **Stock suffisant** : La quantité vendue ne peut pas dépasser le stock disponible
4. **Montants en TTC** : Tous les prix et montants sont en TTC

## Transactionalité

- La création d'un achat génère automatiquement une entrée de stock
- La création d'une vente génère automatiquement une sortie de stock
- Les mises à jour de stock et de CMP sont atomiques

## Configuration

Configuration dans `application.properties` :

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/stock_db
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

## Démarrage de l'Application

```bash
# Compiler et lancer les tests
mvn clean test

# Lancer l'application
mvn spring-boot:run

# Ou utiliser Maven Wrapper
./mvnw spring-boot:run
```

L'API sera disponible sur : `http://localhost:8080/api`

La documentation Swagger : `http://localhost:8080/swagger-ui.html`

## Exemple d'Utilisation Complet

### 1. Créer un produit
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "designation": "A",
    "name": "Produit A",
    "initialStockQuantity": 100,
    "initialUnitPrice": 10.0,
    "initialStockValue": 1000.0,
    "supplierId": 1
  }'
```

### 2. Créer un achat
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
    "comment": "Achat normal"
  }'
```

### 3. Créer une vente
```bash
curl -X POST http://localhost:8080/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "dateSale": "2024-01-16T14:20:00",
    "productId": 1,
    "quantitySold": 30,
    "unitSalePrice": 15.0
  }'
```

### 4. Consulter le résumé du stock
```bash
curl http://localhost:8080/api/stock/summary
```

### 5. Consulter les alertes
```bash
curl http://localhost:8080/api/stock/alerts
```

## Notes de Développement

- Les dates doivent être au format ISO 8601 : `YYYY-MM-DDTHH:mm:ss`
- Tous les montants sont en TTC (inclus taxes)
- Le CMP est recalculé automatiquement à chaque achat/vente
- Les mouvements de stock sont historisés automatiquement
- L'API utilise les transactions pour garantir la cohérence des données

## Améliorations Futures

- Gestion des remboursements de vente
- Export des rapports en PDF/Excel
- API d'ajustement manuel de stock
- Authentification et autorisation
- Pagination des résultats
- Filtrage avancé des mouvements
- Notifications d'alerte
