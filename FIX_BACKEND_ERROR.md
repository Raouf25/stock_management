# ✅ RÉSOLUTION - Backend `mvn spring-boot:run` KO

## 🔴 Problème Trouvé

**application.properties** était configuré pour **MySQL** mais :
- ❌ Pas de driver MySQL dans pom.xml
- ❌ pom.xml avait PostgreSQL
- ❌ Port MySQL (3306) vs PostgreSQL (5432)
- ❌ Dialect MySQL vs PostgreSQL

---

## ✅ Solution Appliquée

### 1. Corrigé application.properties

**Avant :**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/stock_db
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
```

**Après :**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/stock_db
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

### 2. Aligné avec Docker Compose

- ✅ PostgreSQL (port 5432)
- ✅ User: postgres
- ✅ Password: postgres
- ✅ DB: stock_db

---

## 🚀 Démarrage Correct

### Option 1: Script Automatique

**Linux/Mac:**
```bash
chmod +x startup.sh
./startup.sh
```

**Windows:**
```bash
startup.bat
```

### Option 2: Manuel (Recommandé pour Développement)

**Terminal 1 - PostgreSQL:**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

**Terminal 2 - Backend:**
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm install
npm start
```

---

## ✨ Résultat Attendu

### Backend (Terminal 2)
```
Started StockManagementApplication in X.XXX seconds (process time: X.XXXs)
Tomcat started on port(s): 8080 (http)
```

### Frontend (Terminal 3)
```
Angular Live Development Server
✔ Compiled successfully
```

### Accès
- **Dashboard:** http://localhost:4200
- **API Swagger:** http://localhost:8080/swagger-ui.html
- **PostgreSQL:** localhost:5432

---

## 📁 Fichiers Créés pour Aider

| Fichier | Contenu |
|---------|---------|
| `STARTUP_GUIDE.md` | Guide détaillé de démarrage |
| `DOCKER_SETUP.md` | Configuration Docker |
| `startup.sh` | Script auto Linux/Mac |
| `startup.bat` | Script auto Windows |
| `backend/src/main/resources/application.properties` | ✅ Corrigé PostgreSQL |

---

## 🔍 Vérifications

### Avant de Démarrer
```bash
# PostgreSQL running
docker ps | grep postgres

# Java & Maven présents
java -version
mvn -version

# Vérifier pom.xml
grep -i postgresql backend/pom.xml
```

### Après Démarrage
```bash
# Backend compiling
curl http://localhost:8080/api/products

# Frontend running
curl http://localhost:4200

# DB connection
docker exec stock_management_postgres psql -U postgres -d stock_db -c "SELECT COUNT(*) FROM products;"
```

---

## 💡 Notes Importantes

1. **PostgreSQL doit être running** avant le backend
2. **Configuration alignée :** pom.xml + application.properties + docker-compose
3. **Dialect Hibernate correct** pour PostgreSQL
4. **Ports:** DB (5432), Backend (8080), Frontend (4200)

---

**Status:** ✅ **RÉSOLU**

Maintenant `mvn spring-boot:run` devrait démarrer sans erreur!
