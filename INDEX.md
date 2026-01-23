# 📚 Index Documentation - Stock Management API

## 🎯 Accès Rapide par Besoin

### Je Veux Démarrer l'Application
👉 [DEPLOYMENT.md](DEPLOYMENT.md) - Section "Démarrage avec Docker Compose"
```bash
docker-compose up -d
```

### Je Veux Tester l'API
👉 Plusieurs options :
1. [CURL_EXAMPLES.sh](CURL_EXAMPLES.sh) - 25+ exemples de requêtes
2. [Stock_Management_API.postman_collection.json](Stock_Management_API.postman_collection.json) - Importer dans Postman
3. [test-api.sh](test-api.sh) - Script de test automatisé
4. [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) - Interface Swagger

### Je Veux Charger les Données CSV
👉 [CSV_INTEGRATION_GUIDE.md](CSV_INTEGRATION_GUIDE.md)
- Automatique au démarrage ✓
- Format du fichier
- Troubleshooting

### Je Veux Comprendre le Chargement CSV
👉 [CSV_LOADER_README.md](CSV_LOADER_README.md)
- Architecture du système CSV
- Idempotence
- Configuration Spring Boot

### Je Veux Déployer en Production
👉 [DEPLOYMENT.md](DEPLOYMENT.md)
- Docker Compose
- Configuration manuelle
- Monitoring
- Troubleshooting

### Je Veux Comprendre l'Implémentation Technique
👉 [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- Tous les modèles créés
- Tous les services implémentés
- Tous les contrôleurs
- Architecture détaillée

### Je Veux Vérifier la Complétude
👉 [COMPLETION_REPORT.md](COMPLETION_REPORT.md)
- Checklist de livraison
- Récapitulatif des réalisations
- Statut de chaque composant

---

## 📁 Structure de la Documentation

### Documents Essentiels
```
📄 README.md                          → Vue d'ensemble générale
📄 COMPLETION_REPORT.md               → Résumé de ce qui a été fait
📄 IMPLEMENTATION_SUMMARY.md          → Détails techniques
```

### Guides Opérationnels
```
📄 DEPLOYMENT.md                      → Déploiement et infrastructure
📄 CSV_LOADER_README.md               → Système de chargement CSV
📄 CSV_INTEGRATION_GUIDE.md           → Intégration des données
```

### Aide au Développement
```
📄 CURL_EXAMPLES.sh                   → 25+ exemples de requêtes
📄 Stock_Management_API.postman_collection.json → Collection Postman
📄 test-api.sh                        → Script de test automatisé
📄 INDEX.md                           → Ce fichier
```

### Configuration
```
📄 application.properties              → Configuration Spring Boot
📄 docker-compose.yml                  → Docker Compose (PostgreSQL + App)
📄 Dockerfile                          → Image Docker multi-stage
📄 pom.xml                             → Dépendances Maven
📄 application-postgresql.properties   → Configuration PostgreSQL (optionnel)
```

---

## 🎓 Tutoriels Rapides

### 1️⃣ Premiers Pas (5 minutes)
```bash
# 1. Démarrer l'application
docker-compose up -d

# 2. Attendre 30 secondes

# 3. Vérifier le démarrage
curl http://localhost:8080/actuator/health

# 4. Accéder à Swagger
open http://localhost:8080/swagger-ui.html

# 5. Créer un achat
curl -X POST http://localhost:8080/api/purchases \
  -H "Content-Type: application/json" \
  -d '{
    "datePurchase": "2024-01-19T10:30:00",
    "supplierId": 1,
    "productId": 1,
    "invoiceNumber": "BL-001",
    "quantity": 50,
    "unitPriceTTC": 10.30
  }'
```

### 2️⃣ Tester Tous les Endpoints (10 minutes)
```bash
# Option 1 : Script automatisé
./test-api.sh

# Option 2 : Exemples cURL
source CURL_EXAMPLES.sh
# Puis copier-coller les exemples

# Option 3 : Swagger UI
open http://localhost:8080/swagger-ui.html
```

### 3️⃣ Déployer en Production (20 minutes)
```bash
# Consulter DEPLOYMENT.md section "Configuration pour Production"
# - Optimiser les performances
# - Configurer la sécurité
# - Mettre en place le monitoring
```

---

## 🔍 Par Rôle

### 👨‍💼 Gestionnaire de Projet
Lire dans cet ordre :
1. [COMPLETION_REPORT.md](COMPLETION_REPORT.md) - Qu'est-ce qui a été livré ?
2. [DEPLOYMENT.md](DEPLOYMENT.md) - Comment déployer ?
3. [CURL_EXAMPLES.sh](CURL_EXAMPLES.sh) - Exemples fonctionnels

### 👨‍💻 Développeur Frontend
Lire dans cet ordre :
1. [README.md](README.md) - Vue d'ensemble
2. [Stock_Management_API.postman_collection.json](Stock_Management_API.postman_collection.json) - Importer dans Postman
3. [CURL_EXAMPLES.sh](CURL_EXAMPLES.sh) - Comprendre les requêtes
4. [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs) - Spec OpenAPI

### 👨‍💻 Développeur Backend
Lire dans cet ordre :
1. [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Architecture détaillée
2. [CSV_LOADER_README.md](CSV_LOADER_README.md) - Système CSV
3. Code source dans `src/main/java/...`
4. [DEPLOYMENT.md](DEPLOYMENT.md) - Configuration

### 🛠️ DevOps/Infrastructure
Lire dans cet ordre :
1. [DEPLOYMENT.md](DEPLOYMENT.md) - Instructions de déploiement
2. `docker-compose.yml` - Configuration Docker
3. `Dockerfile` - Image de build
4. `application.properties` - Configuration Spring Boot

### 🧪 QA/Testeur
Lire dans cet ordre :
1. [test-api.sh](test-api.sh) - Script de test
2. [CURL_EXAMPLES.sh](CURL_EXAMPLES.sh) - Exemples de requêtes
3. [Stock_Management_API.postman_collection.json](Stock_Management_API.postman_collection.json) - Tests Postman
4. [DEPLOYMENT.md](DEPLOYMENT.md#-vérification-du-déploiement) - Checklist

---

## 🆘 Résolution de Problèmes

### Les données ne se chargent pas
👉 [CSV_INTEGRATION_GUIDE.md](CSV_INTEGRATION_GUIDE.md#-troubleshooting)

### L'application ne démarre pas
👉 [DEPLOYMENT.md](DEPLOYMENT.md#-troubleshooting)

### L'API retourne une erreur
👉 [CURL_EXAMPLES.sh](CURL_EXAMPLES.sh) + logs

### Le port 8080 est occupé
👉 [DEPLOYMENT.md](DEPLOYMENT.md#-troubleshooting)

### Les calculs du CMP sont incorrects
👉 [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md#-règles-de-calcul-métier)

---

## 📊 Endpoints Disponibles

### Produits
```
GET    /api/products
POST   /api/products
GET    /api/products/{id}
GET    /api/products/{id}/stock
```

### Achats
```
POST   /api/purchases
GET    /api/purchases
GET    /api/purchases/{id}
GET    /api/purchases/search?...
GET    /api/purchases/product/{id}
```

### Ventes
```
POST   /api/sales
GET    /api/sales
GET    /api/sales/{id}
GET    /api/sales/search?...
GET    /api/sales/product/{id}
```

### Mouvements
```
GET    /api/stock-movements
GET    /api/stock-movements/{id}
GET    /api/stock-movements/search?...
GET    /api/stock-movements/type/{type}
GET    /api/stock-movements/source/{source}
```

### Reporting
```
GET    /api/stock/summary
GET    /api/stock/{id}/summary
GET    /api/stock/alerts?threshold=10
GET    /api/stock/total-value
POST   /api/stock/recalculate-cmp
```

---

## 🚀 Commandes Utiles

### Démarrage
```bash
docker-compose up -d          # Démarrer
docker-compose down           # Arrêter
docker-compose logs -f        # Logs
docker-compose restart        # Redémarrer
docker-compose down -v        # Nettoyer (avec volumes)
```

### Tests
```bash
./test-api.sh                 # Test automatisé
curl http://localhost:8080/actuator/health   # Health check
```

### Base de données
```bash
docker-compose exec postgres psql -U postgres -d stock_db
# SELECT COUNT(*) FROM product;
```

---

## 💾 Fichiers CSV

### Products.csv
```
Location  : src/main/resources/Products.csv
Status    : ✅ Chargé automatiquement au démarrage
Contenu   : 118 produits avec stock initial
Colonnes  : category, name, unit, prix_ht, prix_ttc, qty_init, qty_current
```

### Feuille1.csv
```
Location  : src/main/resources/Feuille1.csv
Status    : 📌 Futur (pour historique des ventes)
Contenu   : Historique des transactions
```

---

## 📞 Support & Contact

### Avant de Demander de l'Aide
1. ✓ Consulter [DEPLOYMENT.md](DEPLOYMENT.md#-troubleshooting)
2. ✓ Consulter [CSV_INTEGRATION_GUIDE.md](CSV_INTEGRATION_GUIDE.md#-troubleshooting)
3. ✓ Vérifier les logs : `docker-compose logs stock_app`
4. ✓ Tester avec Swagger : http://localhost:8080/swagger-ui.html

### Informations à Fournir
- Version Java (check : `java -version`)
- Erreur exacte / logs
- Étapes pour reproduire
- Système d'exploitation

---

## 🎯 Points Clés

✅ **Automatisation CSV** : Données chargées au démarrage  
✅ **Intégrité ACID** : Toutes les opérations transactionnelles  
✅ **Calculs CMP** : Automatiques et recalculés après chaque achat/vente  
✅ **Validation Métier** : Stricte avec messages clairs  
✅ **Documentation Complète** : 10+ fichiers de docs  
✅ **Docker Ready** : docker-compose up -d et c'est parti !  

---

## 📚 Ressources Externes

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Hibernate/JPA](https://hibernate.org/orm/)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [OpenAPI/Swagger](https://swagger.io/)

---

**Navigation facile dans la documentation ✓**

*Besoin d'aide ? Consultez d'abord [DEPLOYMENT.md](DEPLOYMENT.md)*
