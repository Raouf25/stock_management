# Guide de Déploiement - Stock Management API

## 📌 Architecture de Déploiement

Le système utilise **JPA/Hibernate pour créer automatiquement le schéma** de base de données :
- ✅ **Pas de schema.sql** - Les tables sont générées depuis les entités Java
- ✅ **data.sql uniquement** - Pour insérer les données de test initiales
- ✅ **spring.jpa.hibernate.ddl-auto=create** - Crée le schéma au démarrage

## 📌 Déploiement Local

### Option 1 : Déploiement Classique (sans Docker)

#### 1. Prérequis
- Java 21+
- Maven 4.x
- PostgreSQL 14+

#### 2. Configurer PostgreSQL
```bash
# Créer la base de données
psql -U postgres
CREATE DATABASE stock_db;
\q
```

#### 3. Configurer l'Application
Le fichier `src/main/resources/application.properties` :
```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/stock_db
spring.datasource.username=postgres
spring.datasource.password=postgres

# JPA - Crée automatiquement le schéma
spring.jpa.hibernate.ddl-auto=create
spring.jpa.defer-datasource-initialization=true
spring.sql.init.mode=always
```

#### 4. Démarrer l'Application
```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

**Note** : Au démarrage, Hibernate :
1. Crée automatiquement toutes les tables depuis les entités `@Entity` (avec relations `@OneToMany` et `@ManyToOne`)
2. Génère les contraintes de clés étrangères et les index
3. Exécute `data.sql` pour insérer les données de test :
   - 3 fournisseurs
   - 30 clients  
   - 118 produits
   - 68 achats (avec relation bidirectionnelle vers `stock_mouvement`)
   - 92 ventes (avec relation bidirectionnelle vers `stock_mouvement`)
   - 160 mouvements de stock (68 ENTREE + 92 SORTIE)

L'API sera accessible : `http://localhost:8080/api`

---

### Option 2 : Déploiement avec Docker Compose (Recommandé)

#### 1. Prérequis
- Docker
- Docker Compose

#### 2. Lancer les Services
```bash
# Démarrer tous les services (Backend + Frontend + PostgreSQL)
docker-compose up -d --build

# Ou démarrer uniquement PostgreSQL
docker-compose -f docker-compose-db.yml up -d
```

#### 3. Vérifier l'État
```bash
docker-compose ps
docker-compose logs -f backend
```

#### 4. Accéder aux Services
```
Backend API: http://localhost:8080/api
Frontend: http://localhost:4200
Swagger UI: http://localhost:8080/swagger-ui.html
PostgreSQL: localhost:5432
```

#### 5. Réinitialiser la Base de Données
```bash
# Arrêter et supprimer les volumes
docker-compose down -v

# Redémarrer (le schéma sera recréé automatiquement)
docker-compose up -d --build
```

#### 6. Arrêter les Services
```bash
docker-compose down
```

---

### Option 3 : Déploiement Production (sans data.sql)

Pour la production, désactiver l'insertion automatique des données de test :

```properties
# application-prod.properties
spring.jpa.hibernate.ddl-auto=validate
spring.sql.init.mode=never
```

#### 1. Compiler l'Application
```bash
mvn clean package
```

#### 2. Construire l'Image Docker
```bash
docker build -t stock-management:1.0 .
```

#### 3. Vérifier l'Image
```bash
docker images | grep stock-management
```

#### 4. Lancer les Conteneurs
```bash
# Démarrer PostgreSQL
docker run -d \
  --name stock_db \
  --network stock_network \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=stock_db \
  -p 5432:5432 \
  postgres:14

# Attendre que PostgreSQL soit prêt
sleep 30

# Initialiser les données (optionnel, data.sql est chargé automatiquement)
docker exec -i stock_db psql -U postgres -d stock_db < backend/src/main/resources/data.sql

# Démarrer l'Application
docker run -d \
  --name stock_app \
  --network stock_network \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://stock_db:5432/stock_db \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=postgres \
  -p 8080:8080 \
  stock-management:1.0
```

#### 5. Vérifier les Logs
```bash
docker logs -f stock_app
docker logs -f stock_db
```

#### 6. Arrêter et Nettoyer
```bash
docker stop stock_app stock_db
docker rm stock_app stock_db
docker network rm stock_network
```

---

## 🚀 Déploiement en Production

### Recommandations

1. **Database**
   - Utiliser PostgreSQL 14+
   - Configurer des sauvegardes régulières
   - Utiliser une base de données externe (ex: AWS RDS)

2. **Application**
   - Utiliser HTTPS/TLS
   - Activer l'authentification JWT
   - Configurer les logs
   - Mettre en place la monitoring

3. **Infrastructure**
   - Utiliser Kubernetes pour l'orchestration
   - Mettre en place un load balancer
   - Configurer l'auto-scaling
   - Utiliser un CDN pour les assets statiques

### Exemple de Déploiement sur Heroku

#### 1. Prérequis
- Compte Heroku
- CLI Heroku installé
- Git configuré

#### 2. Créer l'Application Heroku
```bash
heroku login
heroku create stock-management-app
heroku addons:create cleardb:ignite  # MySQL add-on
```

#### 3. Configurer application.properties
```properties
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
```

#### 4. Déployer
```bash
git push heroku main
```

#### 5. Initialiser les Données
```bash
heroku config:get CLEARDB_DATABASE_URL
# Puis exécuter le script SQL via l'URL fournie
```

### Exemple de Déploiement sur AWS ECS

#### 1. Prérequis
- Compte AWS
- AWS CLI configuré

#### 2. Créer ECR Repository
```bash
aws ecr create-repository --repository-name stock-management
```

#### 3. Construire et Pousser l'Image
```bash
docker tag stock-management:1.0 <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/stock-management:1.0
docker push <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/stock-management:1.0
```

#### 4. Créer une Task Definition ECS
```json
{
  "family": "stock-management",
  "containerDefinitions": [{
    "name": "stock-management",
    "image": "<ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/stock-management:1.0",
    "portMappings": [{"containerPort": 8080}],
    "environment": [
      {"name": "SPRING_DATASOURCE_URL", "value": "jdbc:mysql://..."},
      {"name": "SPRING_DATASOURCE_USERNAME", "value": "admin"},
      {"name": "SPRING_DATASOURCE_PASSWORD", "value": "..."}
    ]
  }]
}
```

#### 5. Créer le Service ECS
```bash
aws ecs create-service \
  --cluster stock-cluster \
  --service-name stock-management-service \
  --task-definition stock-management:1 \
  --desired-count 2 \
  --load-balancers targetGroupArn=arn:aws:...,containerName=stock-management,containerPort=8080
```

---

## 📊 Monitoring et Logging

### Logs de l'Application
```bash
# En local
tail -f logs/spring.log

# Avec Docker
docker logs -f stock_app

# Avec Heroku
heroku logs --tail

# Avec AWS CloudWatch
aws logs tail /ecs/stock-management --follow
```

### Health Check
```bash
# Vérifier la santé de l'application
curl http://localhost:8080/actuator/health

# Vérifier les métriques
curl http://localhost:8080/actuator/metrics
```

### Configuration du Monitoring

Ajouter dans `pom.xml` :
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

Ajouter dans `application.properties` :
```properties
management.endpoints.web.exposure.include=health,metrics,prometheus
management.metrics.export.prometheus.enabled=true
```

---

## 🔒 Sécurité

### Checklist de Sécurité

- [ ] HTTPS/TLS activé
- [ ] Authentification JWT implémentée
- [ ] CORS configuré correctement
- [ ] SQL Injection prévenue (utiliser les requêtes paramétrées - fait ✅)
- [ ] Rate limiting activé
- [ ] Validation des entrées (fait ✅)
- [ ] Gestion des erreurs sécurisée
- [ ] Logs de sécurité activés
- [ ] Secrets gérés via variables d'environnement
- [ ] Mises à jour de sécurité appliquées

### Configurer HTTPS

```properties
# application.properties
server.ssl.key-store=classpath:keystore.p12
server.ssl.key-store-password=votre_password
server.ssl.key-store-type=PKCS12
```

### Activer la Validation CORS

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("https://votre-domaine.com")
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

---

## 📈 Performance

### Optimisations Recommandées

1. **Database**
   - Ajouter des index sur les colonnes fréquemment interrogées
   - Utiliser des requêtes optimisées
   - Implémenter la pagination

2. **Cache**
   - Utiliser Redis pour le cache
   - Configurer le cache des réponses

3. **Application**
   - Utiliser l'async pour les opérations longues
   - Implémenter la compression GZIP
   - Utiliser les projections JPA

### Exemple de Configuration Cache

```java
@Configuration
@EnableCaching
public class CacheConfig {
    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("products", "sales", "purchases");
    }
}
```

Utiliser dans les services :
```java
@Cacheable("products")
public List<Product> getAllProducts() {
    return productRepository.findAll();
}
```

---

## 🐛 Troubleshooting

### Problème : Connection Timeout
```
Error: Cannot connect to database
Solución: Vérifier que MySQL est démarré et accessible
docker ps
docker logs stock_db
```

### Problème : Port Already in Use
```bash
# Trouver le processus utilisant le port
lsof -i :8080
kill -9 <PID>

# Ou utiliser un autre port
java -Dserver.port=8081 -jar app.jar
```

### Problème : OutOfMemory
```bash
# Augmenter la mémoire JVM
java -Xmx2g -Xms1g -jar app.jar
```

### Problème : Slow Queries
```sql
-- Analyser les requêtes lentes
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
```

---

## ✅ Checklist de Déploiement

- [ ] Code compilé sans erreurs
- [ ] Tests unitaires passés
- [ ] Configuration validée
- [ ] Base de données initialisée
- [ ] Données de test importées
- [ ] Endpoints testés manuellement
- [ ] Documentation mise à jour
- [ ] Logs configurés
- [ ] Monitoring actif
- [ ] Backups configurés
- [ ] Plan de rollback préparé

---

## 📞 Support et Assistance

Pour des problèmes de déploiement :
1. Consulter les logs : `docker logs -f app`
2. Vérifier la connectivité MySQL : `docker exec -it db mysql -u root -p`
3. Tester l'API : `curl http://localhost:8080/api/products`
4. Consulter la documentation Swagger : `http://localhost:8080/swagger-ui.html`

---

**Dernier mis à jour : 2024-01-18**  
**Version : 1.0.0**
