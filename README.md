# API REST de Gestion de Stock - Stock Management

## 📋 Vue d'ensemble

Une **API REST complète et transactionnelle** développée avec **Spring Boot 3.3.3** et **Java 21**, dédiée à la gestion professionnelle des stocks et des achats-ventes.

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
│           Database (MySQL/MariaDB)            │
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
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
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
              ├────────┤   Sale   │
              │        └──────────┘
              │ 1          │
              │ ┌─────────┐ n
              └─┤ BillProduct├──┐
                └─────────────┘  │
                                  │ 1
                            ┌─────▼──┐
                            │  Bill   │
                            └─────────┘
```

### Tables Principales

#### `supplier`
```sql
CREATE TABLE supplier (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  web_site VARCHAR(255),
  tva_code VARCHAR(20),
  contact_person VARCHAR(255)
);
```

#### `product`
```sql
CREATE TABLE product (
  id_product BIGINT PRIMARY KEY AUTO_INCREMENT,
  designation VARCHAR(100),
  name VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  unit VARCHAR(50),
  initial_stock_quantity INT,
  initial_unit_price DECIMAL(10,2),
  initial_stock_value DECIMAL(12,2),
  current_stock_quantity INT,
  current_stock_value DECIMAL(12,2),
  cmp DECIMAL(10,2),
  supplier_id BIGINT,
  FOREIGN KEY (supplier_id) REFERENCES supplier(id)
);
```

#### `purchase`
```sql
CREATE TABLE purchase (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  date_purchase DATETIME,
  supplier_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  invoice_number VARCHAR(100),
  quantity INT,
  unit_price_ttc DECIMAL(10,2),
  total_amount_ttc DECIMAL(12,2),
  comment TEXT,
  FOREIGN KEY (supplier_id) REFERENCES supplier(id),
  FOREIGN KEY (product_id) REFERENCES product(id_product)
);
```

#### `sale`
```sql
CREATE TABLE sale (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  date_sale DATETIME,
  product_id BIGINT NOT NULL,
  quantity_sold INT,
  unit_sale_price DECIMAL(10,2),
  total_sale_amount DECIMAL(12,2),
  FOREIGN KEY (product_id) REFERENCES product(id_product)
);
```

#### `stock_mouvement`
```sql
CREATE TABLE stock_mouvement (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  quantity INT,
  date DATETIME,
  type ENUM('ENTREE', 'SORTIE'),
  source ENUM('ACHAT', 'VENTE', 'AJUSTEMENT'),
  purchase_id BIGINT,
  sale_id BIGINT,
  reference VARCHAR(100),
  FOREIGN KEY (product_id) REFERENCES product(id_product),
  FOREIGN KEY (purchase_id) REFERENCES purchase(id),
  FOREIGN KEY (sale_id) REFERENCES sale(id)
);
```

---

## 📝 Installation et Configuration

### Prérequis

- **Java 21+** (LTS)
- **Maven 4.x** ou Maven Wrapper
- **MySQL 8.0+** ou **MariaDB 10.5+**

### 1️⃣ Cloner le Projet

```bash
git clone https://github.com/Raouf25/stock_management.git
cd stock_management
```

### 2️⃣ Configurer la Base de Données

**Créer la base de données :**

```sql
CREATE DATABASE stock_db;
USE stock_db;
```

**Mettre à jour `application.properties` :**

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/stock_db
spring.datasource.username=root
spring.datasource.password=votre_motdepasse
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true

# Server Configuration
server.port=8080
server.servlet.context-path=/api

# Application Name
spring.application.name=stock_management
```

### 3️⃣ Initialiser les Données de Test

Après le démarrage de l'application :

```bash
# Exécuter le script SQL d'initialisation
mysql -u root -p stock_db < INIT_DATA.sql
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

### Erreur : `Access denied for user 'root'`

Vérifier les identifiants MySQL dans `application.properties`

### Erreur : `Hibernate: cannot find table`

Vérifier que `spring.jpa.hibernate.ddl-auto=update` est configuré

---

## 📚 Documentation Complète

Voir les fichiers :
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Guide complet des endpoints
- [API_EXAMPLES.md](API_EXAMPLES.md) - Exemples détaillés de requêtes
- [INIT_DATA.sql](INIT_DATA.sql) - Script d'initialisation des données

---

## 🛠️ Technologies Utilisées

| Technologie | Version | Usage |
|------------|---------|-------|
| Spring Boot | 3.3.3 | Framework principal |
| Java | 21 | Langage |
| MySQL | 8.0+ | Base de données |
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
