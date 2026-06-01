# Stock Management - Docker Compose Instructions

## 🚀 Développement Local (Recommandé)

Pour le développement, utilisez cette approche simple :

### 1. Lancer PostgreSQL
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 2. Terminal Backend
```bash
cd backend
mvn spring-boot:run
# API sur http://localhost:8080
```

### 3. Terminal Frontend
```bash
cd frontend
npm install
npm start
# App sur http://localhost:4200
```

---

## 🏭 Production (Docker Multi-Service)

Pour déployer tout dans Docker :

### Prérequis
- Docker et Docker Compose installés
- Les fichiers Dockerfile présents :
  - `/Dockerfile` (Backend)
  - `/frontend/Dockerfile` (Frontend)

### Build et Lancement
```bash
docker-compose up -d
```

**Configuration (docker-compose.yml) :**
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: stock_management_postgres
    environment:
      POSTGRES_DB: stock_db
      POSTGRES_PASSWORD: postgres
      POSTGRES_USER: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    container_name: stock_management_backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/stock_db
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: postgres
      SPRING_JPA_HIBERNATE_DDL_AUTO: create
    depends_on:
      - postgres
    volumes:
      - ./backend/src:/workspace/src

  frontend:
    build: ./frontend
    container_name: stock_management_frontend
    ports:
      - "4200:4200"
    depends_on:
      - backend
    environment:
      BACKEND_URL: http://backend:8080/api

volumes:
  postgres_data:
```

### Accès
- Frontend: http://localhost:4200
- Backend API: http://localhost:8080/swagger-ui.html
- PostgreSQL: localhost:5432

### Logs
```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# Database logs
docker-compose logs -f postgres
```

### Arrêt
```bash
docker-compose down
```

---

## 🐛 Troubleshooting Docker

### Si PostgreSQL ne démarre pas
```bash
docker-compose down -v
docker-compose up -d postgres
```

### Si le build échoue
```bash
# Nettoyer les images
docker-compose down
docker system prune -a

# Relancer
docker-compose up --build
```

### Voir les logs
```bash
# Tous les services
docker-compose logs -f

# Un seul service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

---

## 📝 Configuration

### Variables d'Environnement

Backend (application.properties):
- `SPRING_DATASOURCE_URL`: jdbc:postgresql://postgres:5432/stock_db
- `SPRING_DATASOURCE_USERNAME`: postgres
- `SPRING_DATASOURCE_PASSWORD`: postgres

Frontend (proxy.conf.json):
- `/api` proxy vers `http://backend:8080`

---

## ✅ Vérifications

### PostgreSQL
```bash
docker exec stock_management_postgres psql -U postgres -d stock_db -c "SELECT COUNT(*) FROM products;"
```

### Backend
```bash
curl http://localhost:8080/api/products
```

### Frontend
```bash
curl http://localhost:4200
```
