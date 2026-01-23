# 📦 Stock Management System - Multi-Module

Système complet de gestion de stock avec architecture multi-module : **Backend API Spring Boot** + **Frontend Angular**.

## 🎯 Caractéristiques Principales

Système professionnel et transactionnel pour la gestion complète du stock.

### 🎯 Fonctionnalités Principales

✅ **Gestion des achats** - Création, lecture, recherche par date/fournisseur  
✅ **Gestion des ventes** - Création, validation du stock disponible  
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

```
┌─────────────┐
│  Supplier   │
└──────┬──────┘
       │ 1
       │ ┌─────────┐ n
       └─┤ Product ├────────┐
         └────┬─────┘       │
              │ 1           │
              │ ┌─────────┐ n  │ 1
              ├─┤ Purchase├────┤
              │ └────┬────┘    │
              │      │ n       │
              │      │ ┌──────────────────┐
              │      └─┤ StockMouvement   │
              │        └────┬─────────────┘
              │             │ 1
              │        ┌────▼─────┐
              │ 1      │          │ n
              ├────────┤   Sale   │───┐
              │        └──────┬───┘   │
              │               │ 1     │ n
   ┌──────────┤          ┌────▼────┐  │
   │          │          │Customer │  │
   │ 1        │          └─────────┘  │
   │          │ 1                     │
   │          │ ┌─────────────┐ n    │
   │          └─┤ BillProduct ├──┐   │
   │            └─────────────┘  │   │
   │                             │ 1 │
   │                       ┌─────▼───▼┐
   └───────────────────────┤   Bill   │
                           └──────────┘
```

### Tables Principales

#### `supplier`
- Fournisseurs du système
- Relation 1:N avec `product`

#### `customer`
- Clients du système
- Relation 1:N avec `sale` et `bill`

#### `product`
- Produits en stock
- Champs de stock : `initial_stock_quantity`, `current_stock_quantity`
- Champ calculé : `cmp` (Coût Moyen Pondéré)
- Relation N:1 avec `supplier`

#### `purchase`
- Achats de produits auprès des fournisseurs
- Crée automatiquement un mouvement de stock ENTREE
- Met à jour le stock et recalcule le CMP
- Relation bidirectionnelle `@OneToMany` avec `stock_mouvement`

#### `sale`
- Ventes de produits aux clients
- Crée automatiquement un mouvement de stock SORTIE
- Décrément le stock disponible
- Lien avec `customer` et `product`
- Relation bidirectionnelle `@OneToMany` avec `stock_mouvement`

#### `stock_mouvement`
- Historique complet des mouvements de stock
- Types : `ENTREE` (achat), `SORTIE` (vente)
- Sources : `ACHAT`, `VENTE`, `AJUSTEMENT`
- Relation `@ManyToOne` avec `purchase` (plusieurs mouvements par achat possibles)
- Relation `@ManyToOne` avec `sale` (plusieurs mouvements par vente possibles)

#### `bill` & `bill_product`
- Factures clients avec produits associés
- Relation N:N entre `bill` et `product` via `bill_product`

---

## 🗄️ Gestion du Schéma de Base de Données

### Configuration JPA/Hibernate

Le schéma de base de données est **automatiquement créé par JPA/Hibernate** à partir des entités Java :

```properties
# application.properties
spring.jpa.hibernate.ddl-auto=create
spring.jpa.defer-datasource-initialization=true
spring.sql.init.mode=always
```

- **`ddl-auto=create`** : Hibernate crée automatiquement toutes les tables au démarrage depuis les annotations `@Entity`
- **data.sql seulement** : Fichier pour insérer les données de test initiales

### Données de Test

Le fichier `data.sql` contient :
- **3 fournisseurs** (Fournitures Générales, Technologie & Co, Aldecco)
- **30 clients** répartis dans toute la Tunisie
- **118 produits** (peintures, enduits, finitions, etc.)
- **68 achats** (Janvier 2025 - Janvier 2026)
- **92 ventes** (Janvier 2025 - Janvier 2026)
- **160 mouvements de stock** (68 ENTREE + 92 SORTIE)

### Structure des Tables Générées

Les tables sont créées automatiquement avec les bonnes relations :

```
supplier → product → purchase → stock_mouvement
                  ↓          ↘
customer → sale ─────────────→ stock_mouvement
         ↓
       bill → bill_product
```

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

# Démarrer tous les services (Backend + Frontend + PostgreSQL)
docker-compose up -d --build

# Vérifier les logs
docker-compose logs -f backend
```

Les services seront disponibles :
- **Backend API** : http://localhost:8080/api
- **Frontend Angular** : http://localhost:4200
- **PostgreSQL** : localhost:5432

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
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Guide complet des endpoints
- [API_EXAMPLES.md](API_EXAMPLES.md) - Exemples détaillés de requêtes
- [backend/src/main/resources/data.sql](backend/src/main/resources/data.sql) - Données d'initialisation

---

## 🛠️ Technologies Utilisées

| Technologie | Version | Usage |
|------------|---------|-------|
| Spring Boot | 3.3.3 | Framework principal |
| Java | 21 | Langage |
| PostgreSQL | 14+ | Base de données |
| JPA/Hibernate | - | ORM |
| Lombok | - | Annotations |
| Swagger/OpenAPI | - | Documentation API |
| Maven | 4.x | Build tool |

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
