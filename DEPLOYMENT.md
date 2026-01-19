# Instructions de Déploiement - Stock Management API

## 📋 Prérequis

- Docker & Docker Compose (recommandé)
- Ou : Java 21+ et MySQL 8.0+
- Maven 3.9+

## 🚀 Déploiement avec Docker Compose (Recommandé)

### 1. Démarrer les services

```bash
cd /workspaces/stock_management

# Démarrer MySQL et l'application Spring Boot
docker-compose up -d

# Afficher les logs
docker-compose logs -f stock_app
```

### 2. Vérifier le démarrage

```bash
# Vérifier la santé de l'API
curl http://localhost:8080/actuator/health

# Accéder à Swagger UI
open http://localhost:8080/swagger-ui.html
```

### 3. Arrêter les services

```bash
docker-compose down

# Avec suppression des volumes
docker-compose down -v
```

## 🏗️ Déploiement Manuel (Sans Docker)

### 1. Configuration MySQL

```bash
# Créer la base de données
mysql -u root -p << EOF
CREATE DATABASE stock_db;
CREATE USER 'stock_user'@'localhost' IDENTIFIED BY 'stock_password';
GRANT ALL PRIVILEGES ON stock_db.* TO 'stock_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
EOF
```

### 2. Compiler l'application

```bash
cd /workspaces/stock_management
mvn clean install
```

### 3. Démarrer l'application

```bash
mvn spring-boot:run
```

### 4. Accéder à l'application

- **API REST** : http://localhost:8080/api
- **Swagger UI** : http://localhost:8080/swagger-ui.html
- **OpenAPI JSON** : http://localhost:8080/v3/api-docs

## 🐘 Déploiement avec PostgreSQL (Alternative)

### 1. Démarrer PostgreSQL avec Docker

```bash
docker-compose --profile postgres up -d
```

### 2. Démarrer l'application avec PostgreSQL

```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=postgresql"
```

Ou modifier `application.properties` et utiliser la configuration PostgreSQL.

## 📊 Initialisation des Données

### Chargement Automatique

Les données se chargent automatiquement depuis `src/main/resources/Products.csv` au démarrage de l'application.

**Conditions :**
- La base de données doit être vide
- Le fichier `Products.csv` doit exister dans le classpath

### Vérifier le chargement

```bash
# Attendre quelques secondes après le démarrage et vérifier les logs
docker-compose logs stock_app | grep "Chargement des données"

# Obtenir le nombre de produits chargés
curl http://localhost:8080/api/products | jq 'length'
```

### Forcer le rechargement

Pour forcer un rechargement des données CSV, supprimez les données existantes :

```bash
# Avec Docker
docker-compose exec mysql mysql -u stock_user -pstock_password stock_db << EOF
DELETE FROM stock_mouvement;
DELETE FROM sale;
DELETE FROM purchase;
DELETE FROM product;
DELETE FROM supplier;
EOF

# Redémarrer l'application
docker-compose restart stock_app
```

## 📝 Configuration de l'Environnement

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# MySQL Configuration
MYSQL_ROOT_PASSWORD=root
MYSQL_USER=stock_user
MYSQL_PASSWORD=stock_password
MYSQL_DATABASE=stock_db

# Spring Boot Configuration
SPRING_PROFILES_ACTIVE=default
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_SQL_INIT_MODE=never
```

Puis utilisez-le avec Docker Compose :

```bash
docker-compose --env-file .env up -d
```

## 🔧 Configuration pour Production

### 1. Optimiser les performances

Modifiez `application.properties` :

```properties
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false
spring.jpa.properties.hibernate.use_sql_comments=false
spring.jpa.properties.hibernate.jdbc.batch_size=20
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true

# Pool de connexions
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
```

### 2. Sécurité

- Changer tous les mots de passe par défaut
- Utiliser des variables d'environnement pour les credentials
- Activer HTTPS (certificat SSL)
- Configurer les pare-feu

### 3. Monitoring

```properties
management.endpoints.web.exposure.include=health,metrics,prometheus
management.metrics.export.prometheus.enabled=true
```

## 🐛 Troubleshooting

### L'application ne démarre pas

```bash
# Vérifier les logs
docker-compose logs stock_app

# Vérifier que le port 8080 est disponible
lsof -i :8080

# Vérifier que MySQL est prêt
docker-compose exec mysql mysqladmin ping
```

### Connexion à la base de données échouée

```bash
# Vérifier les variables d'environnement
docker-compose config

# Vérifier la connectivité MySQL
docker-compose exec stock_app wget -O- http://mysql:3306

# Vérifier les logs MySQL
docker-compose logs mysql
```

### Les données ne se chargent pas

```bash
# Vérifier que le fichier CSV existe
ls -la src/main/resources/Products.csv

# Vérifier que le service CsvDataLoaderService s'exécute
docker-compose logs stock_app | grep "CsvDataLoader"

# Vérifier que spring.sql.init.mode=never dans application.properties
grep "spring.sql.init.mode" src/main/resources/application.properties
```

### Le port 8080 est déjà utilisé

```bash
# Changer le port dans docker-compose.yml
# De: "8080:8080"
# À: "8081:8080"

docker-compose up -d
```

## 📊 Vérification du Déploiement

### Checklist

- [ ] Docker & Docker Compose installés
- [ ] Port 8080 disponible
- [ ] Fichier `Products.csv` existe
- [ ] `application.properties` configuré correctement
- [ ] Logs indiquent "Chargement des données terminé"
- [ ] Endpoint `/api/products` retourne des données
- [ ] Swagger UI accessible à `/swagger-ui.html`

### Tests de Validation

```bash
# Test 1: Santé de l'API
curl -s http://localhost:8080/actuator/health | jq '.status'

# Test 2: Nombre de produits
curl -s http://localhost:8080/api/products | jq 'length'

# Test 3: Créer un achat (remplacer les IDs)
curl -X POST http://localhost:8080/api/purchases \
  -H "Content-Type: application/json" \
  -d '{
    "datePurchase": "2024-01-19T10:30:00",
    "supplierId": 1,
    "productId": 1,
    "invoiceNumber": "TEST-001",
    "quantity": 10,
    "unitPriceTTC": 10.30
  }' | jq '.'

# Test 4: Résumé de stock
curl -s http://localhost:8080/api/stock/summary | jq '.'
```

## 🔄 Mise à Jour de l'Application

### Avec Docker Compose

```bash
# Recompiler l'image
docker-compose build --no-cache

# Redémarrer l'application
docker-compose up -d

# Vérifier les logs
docker-compose logs -f stock_app
```

### Sans Docker

```bash
# Mettre le code à jour depuis git
git pull

# Recompiler
mvn clean install

# Redémarrer
mvn spring-boot:run
```

## 📚 Ressources Additionnelles

- [Documentation API](CSV_LOADER_README.md)
- [Configuration Spring Boot](src/main/resources/application.properties)
- [Swagger UI](http://localhost:8080/swagger-ui.html)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Docker Documentation](https://docs.docker.com/)
