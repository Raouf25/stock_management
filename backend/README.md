# Backend - Stock Management API

API REST Spring Boot 3.3.3 pour la gestion complète du stock avec calcul automatique du CMP.

## 🎯 Fonctionnalités

- ✅ Gestion des produits (10 produits de test)
- ✅ Gestion des fournisseurs (3 fournisseurs de test)
- ✅ Gestion des clients (30 clients de test)
- ✅ Gestion des achats avec mouvement stock automatique (30 achats)
- ✅ Gestion des ventes avec validation stock (80 ventes)
- ✅ Gestion des factures avec génération PDF (80 factures)
- ✅ Template PDF conforme législation tunisienne
- ✅ Historique complet des mouvements (110 mouvements de stock)
- ✅ Calcul Coût Moyen Pondéré (CMP)
- ✅ Alertes de stock faible
- ✅ Schéma de base de données auto-généré par JPA
- ✅ Données de test chargées au démarrage
- ✅ API REST complète (30+ endpoints)
- ✅ Documentation Swagger/OpenAPI
- ✅ Transactions ACID

## 🗄️ Base de Données

### Création Automatique du Schéma

Le schéma est **automatiquement créé par JPA/Hibernate** à partir des entités Java :

- ✅ **Pas de schema.sql** - Tables générées depuis les annotations `@Entity`
- ✅ **data.sql uniquement** - Insère les données de test au démarrage
- ✅ **`spring.jpa.hibernate.ddl-auto=create`** - Recrée le schéma à chaque démarrage

### Données de Test Incluses

Le fichier `data.sql` contient :

| Table | Nombre d'enregistrements | Description |
|-------|--------------------------|-------------|
| `supplier` | 3 | Fournisseurs (Fournitures Générales, Technologie & Co, Aldecco) |
| `customer` | 30 | Clients répartis en Tunisie |
| `product` | 10 | Produits (VALPRIMER, VALFIX, FISSATIVO, VALMAT, VALTEX, VALBLANC, VALPRO MAT) |
| `purchase` | 30 | Achats de Jan 2025 à Jan 2026 |
| `sale` | 80 | Ventes de Jan 2025 à Jan 2026 |
| `bill` | 80 | Factures correspondant aux ventes |
| `bill_product` | 80 | Produits de factures |
| `stock_mouvement` | 110 | 30 ENTREE (achats) + 80 SORTIE (ventes) |

## 🚀 Démarrage

### Prérequis
- Java 21+
- Maven 3.9+
- PostgreSQL 15+
- Docker (optionnel)

### Option 1: Docker Compose (Recommandé)
```bash
cd /workspaces/stock_management
docker-compose up -d --build
```

Au démarrage :
1. PostgreSQL démarre et crée la base `stock_db`
2. Le backend démarre et Hibernate crée automatiquement toutes les tables
3. Le fichier `data.sql` insère les 471 enregistrements de test
4. L'API est prête sur `http://localhost:8080/api`

### Option 2: Local avec Docker DB
```bash
# Lancer PostgreSQL
docker run -d --name postgres \
  -e POSTGRES_DB=stock_db \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15

# Compiler et lancer
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

### Option 3: Local complet
1. Créer la base de données :
```sql
CREATE DATABASE stock_db;
```

2. Configurer `application.properties` avec vos identifiants PostgreSQL

3. Lancer l'application :
```bash
./mvnw spring-boot:run
```

## 📡 Endpoints Principaux

### Produits
- `GET /api/products` - Tous les produits
- `GET /api/products/{id}` - Un produit
- `POST /api/products` - Créer produit

### Achats
- `POST /api/purchases` - Créer achat
- `GET /api/purchases` - Tous les achats
- `GET /api/purchases/{id}` - Un achat
- `GET /api/purchases/search?dateFrom=&dateTo=` - Filtrer

### Ventes
- `POST /api/sales` - Créer vente
- `GET /api/sales` - Toutes les ventes
- `GET /api/sales/{id}` - Une vente
- `GET /api/sales/search?dateFrom=&dateTo=` - Filtrer

### Stock
- `GET /api/stock/summary` - Résumé du stock
- `GET /api/stock/{id}/summary` - Stock par produit
- `GET /api/stock/alerts?threshold=20` - Alertes
- `GET /api/stock/total-value` - Valeur totale
- `POST /api/stock/recalculate-cmp` - Recalculer CMP

### Mouvements
- `GET /api/stock-movements` - Tous mouvements
- `GET /api/stock-movements/search?type=ENTREE&source=ACHAT` - Filtrer

### Fournisseurs/Clients
- `GET /api/suppliers` - Fournisseurs
- `GET /api/customers` - Clients

## 📊 Architecture

```
backend/
├── src/main/java/com/example/stock_management/
│   ├── api/                    # Contrôleurs REST
│   ├── model/                  # Entités JPA
│   ├── dto/                    # DTOs pour API
│   ├── service/                # Logique métier
│   ├── repository/             # Accès données
│   ├── configuration/          # Configuration Spring
│   └── StockManagementApplication.java
│
├── src/main/resources/
│   ├── application.properties   # Config PostgreSQL
│   ├── application-postgresql.properties
│   ├── Products.csv            # Données initiales
│   └── data.sql                # Données d'initialisation
│
└── pom.xml
```

## 🗄️ Base de Données

**PostgreSQL 15**

**Entités** :
- `Product` - Articles en stock
- `Purchase` - Achats fournisseurs (relation `@OneToMany` avec `StockMouvement`)
- `Sale` - Ventes clients (relation `@OneToMany` avec `StockMouvement`)
- `StockMouvement` - Historique mouvements (relation `@ManyToOne` avec `Purchase` et `Sale`)
- `Supplier` - Fournisseurs
- `Customer` - Clients
- `Bill` - Factures
- `BillProduct` - Détails factures

**Relations bidirectionnelles** :
- Un `Purchase` peut avoir plusieurs `StockMouvement` (`@OneToMany`)
- Un `Sale` peut avoir plusieurs `StockMouvement` (`@OneToMany`)
- Un `StockMouvement` appartient à un seul `Purchase` ou `Sale` (`@ManyToOne`)

## 🔧 Configuration

### application.properties

```properties
# Database
spring.datasource.url=jdbc:postgresql://postgres:5432/stock_db
spring.datasource.username=postgres
spring.datasource.password=postgres

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect

# CSV Loading
spring.sql.init.mode=never
spring.jpa.defer-datasource-initialization=false

# Server
server.port=8080

# Swagger
springdoc.swagger-ui.path=/swagger-ui.html
```

### Clock Configuration (Testability)

**File: `configuration/ClockConfig.java`**

```java
package com.example.stock_management.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

@Configuration
public class ClockConfig {

    /**
     * Provides a real Clock bean for production code.
     * Can be easily mocked in tests for deterministic behavior.
     */
    @Bean
    public Clock clock() {
        return Clock.systemDefaultZone();  // real clock in production
    }
}
```

**Why Clock Abstraction?**

- ✅ **Testability**: Tests can inject a fixed clock for deterministic behavior
- ✅ **Consistency**: All timestamps in the application use the same clock
- ✅ **No Hard Dependencies**: No static `LocalDateTime.now()` calls
- ✅ **Easy Mocking**: In tests, simply provide `Clock.fixed()` instead

**Usage in Services:**

```java
@Service
@RequiredArgsConstructor
public class BillService {
    private final Clock clock;  // Injected from ClockConfig
    
    public Bill save(BillDTO billDto) {
        // Use injected clock instead of LocalDateTime.now()
        bill.setDateBill(LocalDateTime.now(clock));
        // ...
    }
    
    public Map<String, Object> getInvoiceKPIs() {
        // Get current date from injected clock
        LocalDate now = LocalDate.now(clock);
        // ... filter by month/year ...
    }
}
```

## 💼 Règles Métier

### Calcul du Stock Final
```
Stock Final = Stock Initial + Total Achats - Total Ventes
```

### Calcul du CMP
```
CMP = Valeur Stock Final / Quantité Stock Final
CMP = 0 si Quantité = 0
```

### Montants
Tous les montants en **TTC (inclusif de taxes)**

## 📚 Services Clés

### PurchaseService
- `createPurchase()` - Crée achat + mouvement + update stock + CMP

**Implémentation :**
```java
public Purchase createPurchase(PurchaseDTO purchaseDTO) {
    Product product = productRepository.findById(purchaseDTO.getProductId())
        .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
    
    Purchase purchase = new Purchase();
    purchase.setDatePurchase(purchaseDTO.getDatePurchase());
    purchase.setSupplier(supplierRepository.findById(purchaseDTO.getSupplierId())
        .orElseThrow(() -> new RuntimeException("Fournisseur non trouvé")));
    purchase.setProduct(product);
    purchase.setInvoiceNumber(purchaseDTO.getInvoiceNumber());
    purchase.setQuantity(purchaseDTO.getQuantity());
    purchase.setUnitPriceTTC(purchaseDTO.getUnitPriceTTC());
    purchase.setComment(purchaseDTO.getComment());
    
    return purchaseRepository.save(purchase);
}
```

- `getPurchasesByFilter()` - Recherche avancée
- `getTotalPurchasesAmount()` - Montant total

### SaleService
- `createSale()` - Crée vente + validation stock + mouvement + CMP

**Implémentation :**
```java
public Sale createSale(SaleDTO saleDTO) {
    Product product = productRepository.findById(saleDTO.getProductId())
        .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
    
    // Business rule validation
    if (product.getCurrentStockQuantity() < saleDTO.getQuantitySold()) {
        throw new RuntimeException(
            "Quantité insuffisante en stock. Stock disponible : " + 
            product.getCurrentStockQuantity() + 
            ", Quantité demandée : " + saleDTO.getQuantitySold()
        );
    }
    
    Sale sale = new Sale();
    sale.setDateSale(saleDTO.getDateSale());
    sale.setProduct(product);
    sale.setQuantitySold(saleDTO.getQuantitySold());
    sale.setUnitSalePrice(saleDTO.getUnitSalePrice());
    
    return saleRepository.save(sale);
}
```

- `getSalesByFilter()` - Recherche

### BillService
- `save()` - Crée facture avec détails

**Implémentation (with Clock injection) :**
```java
@Transactional
public Bill save(BillDTO billDto) {
    Customer customer = customerRepository.findById(billDto.getIdClient())
        .orElseThrow(() -> new RuntimeException("Client not found"));

    Bill bill = new Bill();
    bill.setCustomer(customer);
    
    // Use injected Clock for testability
    bill.setDateBill(LocalDateTime.now(clock));
    
    // Process products and calculate totals...
    
    return billRepository.save(bill);
}
```

- `createInvoice()` - Crée facture complète avec TVA, adresse, conditions
- `getInvoiceKPIs()` - KPIs des factures

### StockService
- `getGlobalStockSummary()` - Résumé tous produits
- `getProductStockSummary()` - Résumé 1 produit
- `getStockAlerts()` - Produits en alerte
- `getTotalStockValue()` - Valeur totale

### CsvDataLoaderService
- `loadDataFromCsv()` - Auto-triggered au démarrage
- Charge `Products.csv` si pas de données
- Idempotent (ne reload pas si données existent)

## 🧪 Tests

```bash
# Compiler tests
mvn test-compile

# Lancer tests
mvn test

# Coverage
mvn jacoco:report
```

## 📦 Build

```bash
# Build JAR
mvn clean package

# Taille
ls -lh target/*.jar
```

## 🚨 Troubleshooting

### Port 8080 utilisé
```bash
mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8081
```

### Connexion DB échouée
```bash
# Vérifier PostgreSQL running
docker ps | grep postgres

# Vérifier credentials dans application.properties
```

### Pas de données au démarrage
```bash
# Vérifier CsvDataLoaderService logs
tail -f logs/stock_management.log | grep CSV

# Vérifier DB
docker exec stock_management_postgres psql -U postgres -d stock_db -c "SELECT COUNT(*) FROM products;"
```

## 📊 Exemple de Requête

### Créer un achat
```bash
curl -X POST http://localhost:8080/api/purchases \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": 1,
    "productId": 1,
    "quantity": 100,
    "unitPriceTTC": 50.00,
    "invoiceNumber": "INV001",
    "datePurchase": "2024-01-19T10:00:00"
  }'
```

### Créer une vente
```bash
curl -X POST http://localhost:8080/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantitySold": 10,
    "unitSalePrice": 75.00,
    "dateSale": "2024-01-19T12:00:00"
  }'
```

### Consulter résumé stock
```bash
curl http://localhost:8080/api/stock/summary | jq '.[0]'
```

## 🔐 CORS

Configuration pour Angular frontend (port 4200) :

```java
// CorsConfig.java
cors.allowedOrigins=http://localhost:4200
```

## 📝 Logs

```properties
logging.level.com.example.stock_management=DEBUG
logging.level.org.springframework.web=INFO
logging.file.name=logs/stock_management.log
```

## 🎓 Documentation

- [Swagger UI](http://localhost:8080/swagger-ui.html) - API interactive
- [API Docs](http://localhost:8080/v3/api-docs) - OpenAPI JSON
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Guide complet

## 🔄 DevOps

### Docker Build
```bash
docker build -t stock-management-backend:1.0 .
docker run -p 8080:8080 stock-management-backend:1.0
```

### Docker Compose
```bash
docker-compose up -d
```

## 📈 Performance

- Requêtes JPA optimisées
- Indices DB sur clés étrangères
- Pagination incluse
- Caching possible (à implémenter)

## 🤝 Contributing

1. Fork
2. Create feature branch
3. Commit changes
4. Push branch
5. Create PR

## 📄 License

MIT

---

**Version** : 1.0.0  
**Framework** : Spring Boot 3.3.3  
**Java** : 21+  
**BD** : PostgreSQL 15+
