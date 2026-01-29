# 🚀 Stock Management Project Startup Guide

## 🎯 Latest Updates (January 29, 2026)

### ✨ New Features
- ✅ **Per-item discounts**: Individual discount percentage (0-100%)
- ✅ **Database storage**: New `discount_percentage` field in `bill_product`
- ✅ **PDF display**: "Discount (%)" column in generated invoices
- ✅ **User interface**: Discount input fields in the form
- ✅ **Validation**: Client-side and server-side controls

### 🔄 Database Migration
- **Automatic** via Hibernate DDL (`ddl-auto=create`)
- **Compatible** with existing data
- **New schema**: `discount_percentage` column added

---

## ✅ Steps to Start

### 1️⃣ Démarrer PostgreSQL

```bash
docker-compose -f docker-compose.dev.yml up -d
```

Vérifier que PostgreSQL est running :
```bash
docker ps | grep postgres
```

### 2️⃣ Compiler et Lancer le Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

**Attendus :**
- Logs : "Started StockManagementApplication"
- API sur : http://localhost:8080/swagger-ui.html

### 3️⃣ Démarrer le Frontend (nouveau terminal)

```bash
cd frontend
npm install
npm start
```

**Attendus :**
- Logs : "Angular Live Development Server"
- App sur : http://localhost:4200

---

## ✨ Accès à l'Application

| Élément | URL |
|---------|-----|
| Dashboard | http://localhost:4200 |
| Produits | http://localhost:4200/products |
| Achats | http://localhost:4200/purchases |
| Ventes | http://localhost:4200/sales |
| Mouvements | http://localhost:4200/stock-movement |
| Factures | http://localhost:4200/invoices |
| API Swagger | http://localhost:8080/swagger-ui.html |
| PostgreSQL | localhost:5432 |

---

## 🔍 Tests Rapides

### Vérifier la Connexion DB
```bash
# Du terminal backend
curl http://localhost:8080/api/products
```

### Vérifier le Frontend
```bash
curl http://localhost:4200
```

### Logs PostgreSQL
```bash
docker-compose -f docker-compose.dev.yml logs postgres
```

---

## 🐛 Troubleshooting

### Port 8080 déjà utilisé
```bash
mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8081
```

### Port 4200 déjà utilisé
```bash
ng serve --port 4201
```

### PostgreSQL ne démarre pas
```bash
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d postgres
```

### Nettoyer et recommencer
```bash
# Arrêter tout
docker-compose -f docker-compose.dev.yml down

# Relancer
docker-compose -f docker-compose.dev.yml up -d
```

---

## 📝 Configuration

**Backend utilise PostgreSQL :**
- URL: jdbc:postgresql://localhost:5432/stock_db
- User: postgres
- Pass: postgres
- Auto-create tables: oui (ddl-auto=update)
- CSV auto-load: oui (au démarrage si vide)

**Frontend proxy vers Backend :**
- /api → http://localhost:8080/api

---

## ✅ Checklist de Démarrage

- [ ] PostgreSQL running (`docker ps | grep postgres`)
- [ ] Backend compilé (`mvn clean install`)
- [ ] Backend démarré (logs "Started StockManagementApplication")
- [ ] Frontend npm install complété
- [ ] Frontend démarré (logs "Angular Live Development Server")
- [ ] Dashboard accessible http://localhost:4200
- [ ] API accessible http://localhost:8080/swagger-ui.html

---

**Bon développement! 🎉**
