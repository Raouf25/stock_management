# Backend - Stock Management API

API REST Spring Boot 3.3.3 pour la gestion complète du stock avec calcul automatique du CMP.

## 🎯 Fonctionnalités

- ✅ Gestion des produits
- ✅ Gestion des achats (avec mouvement stock automatique)
- ✅ Gestion des ventes (avec validation stock)
- ✅ Calcul Coût Moyen Pondéré (CMP)
- ✅ Historique complet des mouvements
- ✅ Alertes de stock faible
- ✅ Chargement CSV au démarrage
- ✅ API REST complète (25+ endpoints)
- ✅ Documentation Swagger/OpenAPI
- ✅ Transactions ACID

## 🚀 Démarrage

### Prérequis
- Java 21+
- Maven 3.9+
- PostgreSQL 15+
- Docker (optionnel)

### Option 1: Docker Compose (Recommandé)
```bash
cd /workspaces/stock_management
docker-compose up -d
```
API disponible sur `http://localhost:8080`

### Option 2: Local avec Docker DB
```bash
# Lancer PostgreSQL
docker run -d --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15

# Compiler et lancer
mvn clean install
mvn spring-boot:run
```

### Option 3: Local complet
Mettre à jour `application.properties` pour votre config locale et :
```bash
mvn spring-boot:run
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
│   └── schema.sql
│
└── pom.xml
```

## 🗄️ Base de Données

**PostgreSQL 15**

**Entités** :
- `Product` - Articles en stock
- `Purchase` - Achats fournisseurs
- `Sale` - Ventes clients
- `StockMouvement` - Historique mouvements
- `Supplier` - Fournisseurs
- `Customer` - Clients
- `Bill` - Factures
- `BillProduct` - Détails factures

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
- `getPurchasesByFilter()` - Recherche avancée
- `getTotalPurchasesAmount()` - Montant total

### SaleService
- `createSale()` - Crée vente + validation stock + mouvement + CMP
- `getSalesByFilter()` - Recherche

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
