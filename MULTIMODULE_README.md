# 📦 Stock Management - Architecture Multi-Module

Système complet de gestion de stock avec **Backend API** (Spring Boot) et **Frontend Web** (Angular).

## 🏗️ Architecture

```
stock_management/ (Parent)
│
├── backend/                    # Module Backend - API REST
│   ├── pom.xml                # POM spécifique au backend
│   └── src/main/java/...      # Code source Java
│
├── frontend/                   # Module Frontend - Angular Web
│   ├── package.json           # Dépendances Node/npm
│   ├── angular.json           # Config Angular
│   └── src/app/...            # Code source TypeScript
│
├── pom-parent.xml             # POM Parent Maven (optionnel)
├── docker-compose.yml         # Orchestration multi-service
├── Dockerfile                 # Build du backend
└── README.md
```

## 🚀 Démarrage Rapide

### Option 1: Docker Compose (Recommandé)

```bash
# Se placer à la racine du projet
cd /workspaces/stock_management

# Lancer tous les services
docker-compose up -d

# Vérifier le statut
docker-compose ps

# Accéder à:
# - API:   http://localhost:8080/swagger-ui.html
# - Front: http://localhost:4200
```

### Option 2: Développement Local

#### Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
# API disponible sur http://localhost:8080
```

#### Frontend
```bash
cd frontend
npm install
npm start
# App disponible sur http://localhost:4200
```

## 📋 Modules

### Backend (Spring Boot 3.3.3)

**Technologie** : Java 21, PostgreSQL, JPA/Hibernate, REST API

**Fonctionnalités** :
- 25+ endpoints REST
- Gestion complète du stock
- Calcul automatique du CMP
- Chargement CSV au démarrage
- Transactions ACID
- Documentation Swagger/OpenAPI

**Entités Principales** :
- `Product` - Articles en stock
- `Purchase` - Achats fournisseurs
- `Sale` - Ventes clients
- `StockMouvement` - Historique complet
- `Supplier` - Fournisseurs
- `Customer` - Clients

**Services Clés** :
- `PurchaseService` - Gestion des achats
- `SaleService` - Gestion des ventes
- `StockService` - Calculs et rapports
- `CsvDataLoaderService` - Import données

### Frontend (Angular 17)

**Technologie** : TypeScript 5.2, Bootstrap 5, RxJS, HttpClient

**Composants** :
- `Dashboard` - Vue d'ensemble et alertes
- `Products` - Catalogue produits
- `Purchases` - Historique achats
- `Sales` - Historique ventes
- `StockMovement` - Traçabilité mouvements

**Services** :
- `ApiService` - Communication avec backend

## 🗄️ Base de Données

**PostgreSQL 15** (via Docker)

```yaml
Services:
  - Conteneur postgres:15
  - Port: 5432
  - DB: stock_db
  - User: postgres
  - Pass: postgres
```

**Schéma** :
- products
- purchases
- sales
- stock_movements
- suppliers
- customers

## 🔌 Integration Frontend-Backend

### Proxy Configuration

`frontend/src/proxy.conf.json` :
```json
{
  "/api": {
    "target": "http://localhost:8080",
    "changeOrigin": true
  }
}
```

### API Endpoints

| Method | Endpoint | Frontend |
|--------|----------|----------|
| GET | /api/products | Dashboard, Products |
| GET | /api/stock/summary | Dashboard |
| POST | /api/purchases | Purchases |
| POST | /api/sales | Sales |
| GET | /api/stock-movements | StockMovement |

## 📦 Build & Déploiement

### Backend
```bash
cd backend
mvn clean package -DskipTests
java -jar target/stock-management-backend-1.0.0.jar
```

### Frontend
```bash
cd frontend
npm run build
# Sortie dans dist/stock-management-frontend/
```

### Docker Multi-Stage
```bash
docker build -t stock-management:latest .
docker run -p 8080:8080 stock-management:latest
```

## 🌐 Configuration

### Backend - `src/main/resources/application.properties`

```properties
# PostgreSQL
spring.datasource.url=jdbc:postgresql://postgres:5432/stock_db
spring.datasource.username=postgres
spring.datasource.password=postgres

# CSV Loading
spring.sql.init.mode=never
spring.jpa.hibernate.ddl-auto=update

# Server
server.port=8080

# Swagger
springdoc.api-docs.path=/v3/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
```

### Frontend - `angular.json`

```json
{
  "projects": {
    "stock-management-frontend": {
      "architect": {
        "serve": {
          "options": {
            "proxyConfig": "src/proxy.conf.json"
          }
        }
      }
    }
  }
}
```

## 📊 Flux de Données

```
User (Browser)
    ↓
Angular Frontend (Port 4200)
    ↓
HTTP Proxy (:4200/api → :8080/api)
    ↓
Spring Boot API (Port 8080)
    ↓
JPA/Hibernate
    ↓
PostgreSQL (Port 5432)
```

## ✅ Vérifications

### Backend
```bash
# Check API
curl http://localhost:8080/swagger-ui.html

# Check products loaded
curl http://localhost:8080/api/products | jq 'length'

# Check stock summary
curl http://localhost:8080/api/stock/summary | jq '.[0]'
```

### Frontend
```bash
# Build test
npm run build

# Lint test
npm run lint

# Unit tests
npm test
```

## 🔐 Sécurité

**CORS Configuration** :
```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:4200")
                    .allowedMethods("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

## 🚨 Troubleshooting

### Frontend ne se charge pas
```bash
# Vérifier proxy
cat frontend/src/proxy.conf.json

# Vérifier API running
curl http://localhost:8080/api/products
```

### Port déjà utilisé
```bash
# Changer port backend
-Dserver.port=8081

# Changer port frontend
ng serve --port 4201
```

### Pas de données (CSV)
```bash
# Vérifier CsvDataLoaderService logs
docker-compose logs stock_app | grep "CSV"

# Vérifier DB
docker exec stock_management_postgres psql -U postgres -d stock_db -c "SELECT COUNT(*) FROM products;"
```

## 📚 Documentation

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [API Swagger](http://localhost:8080/swagger-ui.html)
- [DEPLOYMENT.md](DEPLOYMENT.md)

## 🎯 Fonctionnalités

- ✅ Dashboard temps réel
- ✅ Gestion produits
- ✅ Achats avec CMP
- ✅ Ventes avec validation stock
- ✅ Mouvements traçabilité
- ✅ Alertes stock faible
- ✅ Calculs automatiques
- ✅ API complète REST
- ✅ Interface web moderne
- ✅ Responsive design

## 📈 Évolutions Futures

- [ ] Authentification JWT
- [ ] Graphiques Dashboard
- [ ] Export PDF/Excel
- [ ] Pagination avancée
- [ ] Mode offline
- [ ] Push notifications
- [ ] Historique complet

## 📞 Support

En cas de problème, consultez :
1. Logs du backend : `docker-compose logs stock_app`
2. Logs frontend (Console navigateur)
3. Documentation API Swagger

## 📄 License

MIT

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2024
