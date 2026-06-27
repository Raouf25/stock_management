# 📦 Stock Management System - Multi-Module

Système complet de gestion de stock avec architecture multi-module : **Backend API Spring Boot** + **Frontend Angular**.

## 🎯 Caractéristiques Principales

Système professionnel et transactionnel pour la gestion complète du stock.

### 🎯 Fonctionnalités Principales

✅ **Gestion des achats** - Création, lecture, recherche par date/fournisseur  
✅ **Gestion des ventes** - Création, validation du stock disponible  
✅ **Gestion des factures** - Liste, filtrage, téléchargement PDF conforme loi tunisienne  ✅ **🆕 Remises par article** - Pourcentage de remise individualisé sur chaque ligne  ✅ **Génération PDF** - Factures professionnelles avec mentions légales  
✅ **Historique de stock** - Traçabilité complète des mouvements  
✅ **Calcul du CMP** - Coût Moyen Pondéré automatique et récalculé  
✅ **Reporting avancé** - Résumé de stock, valeur totale, alertes  
✅ **Validation métier stricte** - Cohérence garantie des données  
✅ **Transactions atomiques** - Intégrité des mouvements de stock  

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│           REST Controllers Layer               │
│  (Purchase, Sale, StockMovement, Reporting)  │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│           Service Layer                        │
│  (Business Logic & Calculations)              │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│           Repository Layer (JPA)              │
│  (Database Access & Queries)                 │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│           Database (PostgreSQL)               │
│  (Persisted Data)                            │
└──────────────────────────────────────────────────┘
```

---

## 📦 Dépendances Principales

```xml
<!-- Spring Boot Starters -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <version>3.3.3</version>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
    <version>3.3.3</version>
</dependency>

<!-- Database -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
</dependency>

<!-- Lombok (Annotations @Data, @Autowired) -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>

<!-- Swagger/OpenAPI -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
</dependency>
```

---

## 🗄️ Modèle de Données

### Diagramme Entité-Relation

Le modèle s'organise en trois niveaux. Les flèches indiquent la direction « parent → enfant » (1 → N).

```
RÉFÉRENTIELS
┌──────────┐          ┌───────────────────────┐          ┌──────────┐
│ supplier │          │        product        │          │ customer │
└────┬─────┘          └──┬────────┬─────┬─────┘          └──┬────┬──┘
     │                   │        │     │                    │    │
     │ 1:N               │ 1:N    │ 1:N │ 1:N           1:N │    │ 1:N
     │                   │        │     │                    │    │
DOCUMENTS COMMERCIAUX    │        │     │                    │    │
     │                   │        │     │                    │    │
┌────▼──────┐       ┌────▼──┐     │  ┌──▼──────────┐   ┌────▼──┐ │
│ purchase  │       │ sale  │     │  │delivery_note│   │ bill  │ │
└───────────┘       └───────┘     │  └──────┬──────┘   └───┬───┘ │
                (opt) sale.bill_id│          │              │     │
                points vers bill ─┘─────────┼─────────────►│     │
                                            │ 1:N          │ 1:N │
LIGNES DE DÉTAIL                            │              │     │
                                  ┌─────────▼─────────┐ ┌──▼────────────┐
                                  │delivery_note_      │ │ bill_product  │
                                  │product             │ │               │
                                  └────────────────────┘ └───────────────┘
                                  (réf. product via FK)   (réf. product via FK)
```

> `sale.bill_id` est **nullable** : une vente directe peut pointer vers une facture existante,
> mais n'y est pas obligée. Voir [DATABASE_GUIDE.md](DATABASE_GUIDE.md) pour le détail complet.

### Tables Principales

#### `supplier`
- Fournisseurs (nom, adresse, RIB, IBAN, contact)
- Relation 1:N avec `product` et `purchase`
- Audit : `created_at`, `updated_at`

#### `customer`
- Clients (nom, CIN, plaque d'immatriculation tunisienne, statut)
- Statuts : `ACTIVE`, `INACTIVE`, `BLOCKED`, `PROSPECT`
- Audit : `created_at`, `updated_at`

#### `product`
- Produits en stock avec valorisation CMP
- Champs stock : `initial_stock_quantity`, `current_stock_quantity`, `current_stock_value`
- Champ calculé : `cmp` (Coût Moyen Pondéré = `current_stock_value / current_stock_quantity`)
- Tous les prix en `NUMERIC(19,3)` — jamais de `DOUBLE PRECISION`
- Audit : `created_at`, `updated_at`

#### `purchase`
- Achats fournisseurs — met à jour `current_stock_quantity` et recalcule le CMP
- Prix en `NUMERIC(19,3)`
- Audit : `created_at`

#### `sale`
- Ventes directes (hors facture)
- Lié optionnellement à `bill` via FK `bill_id` (V10)
- Prix en `NUMERIC(19,3)`
- Audit : `created_at`

#### `bill` & `bill_product`
- Factures clients avec lignes produits
- Statuts paiement : `PAID`, `UNPAID`, `PARTIALLY_PAID`, `GIFT`
- Tous les montants en `NUMERIC(19,3)`
- Audit : `created_at`, `updated_at`

#### `delivery_note` & `delivery_note_product`
- Bons de livraison
- Statuts : `PENDING`, `DELIVERED`, `CANCELLED`, `INVOICED`
- Convertibles en facture (`invoiced = true`)

---

## 🗄️ Gestion du Schéma de Base de Données

### Migrations Flyway (V1 → V11)

Le schéma est entièrement géré par **Flyway** :

```properties
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
spring.flyway.validate-on-migrate=true

# Production : Flyway gère tout le DDL
spring.jpa.hibernate.ddl-auto=none
```

| Version | Contenu |
|---------|---------|
| V1 | Schéma initial (11 tables) |
| V2 | Données de test (fournisseurs, produits, factures) |
| V3 | Colonne `gamme` sur `product` |
| V4–V5 | Nettoyage et dédoublonnage |
| **V6** | **16 index manquants** sur FK et colonnes filtrées |
| **V7** | **Types monétaires** : `DOUBLE PRECISION` → `NUMERIC(19,3)` |
| **V8** | **Audit** : `created_at`/`updated_at` sur 7 tables |
| **V9** | **Contraintes** : stock ≥ 0, quantités > 0, remises 0–100% |
| **V10** | **FK** `sale.bill_id → bill.id_bill` |
| **V11** | **Vue matérialisée** `mv_product_dashboard` |

Voir [DATABASE_GUIDE.md](DATABASE_GUIDE.md) pour le détail complet de chaque migration.

---

## 📝 Installation et Configuration

### Prérequis

- **Java 21+** (LTS)
- **Maven 4.x** ou Maven Wrapper
- **PostgreSQL 14+**
- **Docker & Docker Compose** (recommandé)

### 1️⃣ Démarrage avec Docker Compose (Recommandé)

```bash
# Cloner le projet
git clone https://github.com/votre-repo/stock_management.git
cd stock_management

# Démarrage avec Docker Compose
docker-compose up -d --build

# Vérifier les logs
docker-compose logs -f backend
```

**Services disponibles après démarrage :**
- **Backend API** : http://localhost:8080/api
- **Frontend Angular** : http://localhost:4200
- **PostgreSQL** : localhost:5432
- **Swagger UI** : http://localhost:8080/swagger-ui.html

**Implémentation (docker-compose.yml) :**
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: stock_db
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/stock_db
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: postgres
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "4200:4200"
```

### 2️⃣ Installation Manuelle

**Créer la base de données :**

```sql
CREATE DATABASE stock_db;
```

**Configuration `application.properties` :**

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/stock_db
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate Configuration - Crée automatiquement le schéma
spring.jpa.hibernate.ddl-auto=create
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# Data Initialization - Charge data.sql après création du schéma
spring.jpa.defer-datasource-initialization=true
spring.sql.init.mode=always

# Server Configuration
server.port=8080
server.servlet.context-path=/api
```

**Compiler et lancer :**

```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

### 3️⃣ Initialiser les Données de Test

Les données de test sont chargées automatiquement au démarrage via `data.sql`.
Si vous devez réinitialiser les données :

```bash
# Optionnel : Exécuter le script SQL d'initialisation manuellement
psql -U postgres -d stock_db -f backend/src/main/resources/data.sql
```

### 4️⃣ Démarrer l'Application

**Option 1 : Avec Maven Wrapper**

```bash
./mvnw clean spring-boot:run
```

**Option 2 : Avec Maven**

```bash
mvn clean spring-boot:run
```

**Option 3 : Compiler et exécuter**

```bash
mvn clean package
java -jar target/stock_management-0.0.1-SNAPSHOT.jar
```

---

## 🚀 Utilisation

### Accès à l'API

**Base URL :** `http://localhost:8080/api`

**Documentation Interactive (Swagger UI) :**  
`http://localhost:8080/swagger-ui.html`

### Exemples de Requêtes

**1. Créer un produit**

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

**2. Créer un achat**

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

**Implémentation (PurchaseController.createPurchase) :**
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

**3. Créer une vente**

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

**Implémentation (SaleService.createSale) :**
```java
public Sale createSale(SaleDTO saleDTO) {
    Product product = productRepository.findById(saleDTO.getProductId())
        .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
    
    // Validate stock availability (business rule)
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

**4. Consulter le résumé du stock**

```bash
curl http://localhost:8080/api/stock/summary
```

**5. Consulter les alertes de stock**

```bash
curl http://localhost:8080/api/stock/alerts?threshold=20
```

---

## 📊 Endpoints Disponibles

### Produits
- `GET /products` - Tous les produits
- `POST /products` - Créer un produit
- `GET /products/{id}` - Détails d'un produit
- `PUT /products/{id}` - Mettre à jour un produit
- `GET /products/{id}/stock` - Stock actuel

### Achats
- `POST /purchases` - Créer un achat
- `GET /purchases` - Tous les achats
- `GET /purchases/{id}` - Détails d'un achat
- `GET /purchases/search` - Rechercher avec filtres
- `GET /purchases/product/{productId}` - Achats d'un produit

### Ventes
- `POST /sales` - Créer une vente
- `GET /sales` - Toutes les ventes
- `GET /sales/{id}` - Détails d'une vente
- `GET /sales/search` - Rechercher avec filtres
- `GET /sales/product/{productId}` - Ventes d'un produit

### Mouvements de Stock
- `GET /stock-movements` - Tous les mouvements
- `GET /stock-movements/{id}` - Détails d'un mouvement
- `GET /stock-movements/search` - Rechercher avec filtres
- `GET /stock-movements/product/{productId}` - Mouvements d'un produit
- `GET /stock-movements/type/{type}` - Mouvements par type
- `GET /stock-movements/source/{source}` - Mouvements par source

### Reporting
- `GET /stock/summary` - Résumé global du stock
- `GET /stock/summary/{productId}` - Résumé d'un produit
- `GET /stock/alerts` - Alertes de stock
- `GET /stock/total-value` - Valeur totale du stock
- `POST /stock/recalculate-cmp` - Recalculer tous les CMP

---

## 🔐 Règles Métier Implémentées

### ✅ Validation

| Règle | Description |
|-------|-------------|
| **Produit obligatoire** | Erreur si produit non trouvé |
| **Fournisseur obligatoire** | Erreur si fournisseur non trouvé |
| **Stock suffisant** | Erreur si quantité vendue > stock |
| **Montants en TTC** | Tous les calculs en TTC |

### ✅ Calculs Automatiques

| Calcul | Formule |
|--------|---------|
| **Stock Final** | Initial + Achats - Ventes |
| **Valeur Stock Final** | Valeur Init + Montant Achats - Montant Ventes |
| **CMP** | Valeur Stock Final / Quantité Stock Final |
| **Montant Achat** | Quantité × Prix Unitaire TTC |
| **Montant Vente** | Quantité × Prix Vente TTC |

### ✅ Transactions

- Chaque achat = ENTREE + Mise à jour stock + Calcul CMP (Atomique)
- Chaque vente = SORTIE + Mise à jour stock + Calcul CMP (Atomique)
- Historique automatique des mouvements

---

## 📈 Cas d'Usage Avancés

### Cas 1 : Suivi Complet d'un Produit

```
1. Création : 100 unités @ 10€ = 1000€
2. Achat 1 : +50 @ 10,50€ = +525€ → Stock: 150, Valeur: 1525€, CMP: 10.17
3. Achat 2 : +30 @ 11€ = +330€ → Stock: 180, Valeur: 1855€, CMP: 10.31
4. Vente 1 : -40 @ CMP 10.31 = -412.40€ → Stock: 140, Valeur: 1442.60€, CMP: 10.31
5. Rapport : Résumé complet avec tous les mouvements enregistrés
```

### Cas 2 : Reporting Multi-Produits

```
GET /api/stock/summary
→ Résumé de tous les produits
→ Total global du stock
→ Valeur totale du patrimoine
→ CMP moyen pondéré
```

### Cas 3 : Alertes et Gestion Critique

```
GET /api/stock/alerts?threshold=50
→ Articles en stock critique
→ Niveau d'alerte (CRITICAL / LOW)
→ Déclenche réapprovisionnement
```

---

## 🐛 Dépannage

### Erreur : `Port 8080 already in use`

```bash
# Libérer le port
lsof -i :8080
kill -9 <PID>

# Ou utiliser un autre port dans application.properties
server.port=8081
```

### Erreur : `Access denied for user 'postgres'`

Vérifier les identifiants PostgreSQL dans `application.properties`

### Erreur : `Hibernate: cannot find table`

Vérifier que `spring.jpa.hibernate.ddl-auto=update` est configuré

---

## 📚 Documentation Complète

Voir les fichiers :
- [DATABASE_GUIDE.md](DATABASE_GUIDE.md) - Schéma, migrations, index, types monétaires
- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) - Guide détaillé de l'implémentation avec code réel
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Guide complet des endpoints
- [API_EXAMPLES.md](API_EXAMPLES.md) - Exemples détaillés de requêtes
- [backend/README.md](backend/README.md) - Documentation backend

---

## 🛠️ Technologies Utilisées

| Technologie | Version | Usage |
|------------|---------|-------|
| Spring Boot | 3.3.3 | Framework principal |
| Java | 21 | Langage |
| PostgreSQL | 15 | Base de données |
| Flyway | - | Migrations versionnées (V1–V11) |
| JPA/Hibernate | - | ORM |
| HikariCP | - | Pool de connexions |
| Lombok | - | Annotations |
| Swagger/OpenAPI | - | Documentation API |
| Maven | 3.9 | Build tool |

---

## 👥 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le repository
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changes (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 📞 Support

Pour des questions ou problèmes :
- Ouvrir une **Issue** sur GitHub
- Consulter la documentation Swagger : `http://localhost:8080/swagger-ui.html`
- Vérifier les logs : `target/logs/`

---

## 🎯 Roadmap Futures

- [ ] Authentification JWT
- [ ] Exportation en PDF/Excel
- [ ] Gestion des remboursements
- [ ] Notifications par email
- [ ] Dashboard Web
- [ ] Gestion des variantes de produit
- [ ] Support multi-devise
- [ ] API Webhooks

---

**Développé avec ❤️ pour une gestion de stock efficace et fiable**
