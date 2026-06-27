# Bhouri Stock — Gestion de stock & facturation

Application full-stack de gestion de stock et de facturation conforme à la législation tunisienne.

- **Backend** : Spring Boot 3.3.7 / Java 21 / PostgreSQL 15
- **Frontend** : Angular 17 (Standalone Components, lazy-loaded)
- **Production** : Railway (API) + Vercel (Frontend)

---

## Architecture

```
stock_management/
├── backend/          # API REST Spring Boot
├── frontend/         # SPA Angular 17
├── doc/              # Documentation technique
├── exercises/        # Exercices pédagogiques
├── scripts/          # Scripts utilitaires
├── docker-compose.yml
└── docker-compose.dev.yml
```

---

## Démarrage rapide

### Docker (recommandé)

```bash
docker-compose up -d --build
```

| Service   | URL                                          |
|-----------|----------------------------------------------|
| Frontend  | http://localhost:4200                        |
| API       | http://localhost:8080/api                    |
| Swagger   | http://localhost:8080/swagger-ui.html        |

### Sans Docker

```bash
# Terminal 1 — Backend
cd backend
JAVA_HOME=$HOME/.sdkman/candidates/java/21.0.10-graal ./mvnw spring-boot:run

# Terminal 2 — Frontend
cd frontend && npm install && npm start
```

**Prérequis** : Java 21+, Maven 3.9+, Node 18+, PostgreSQL 15+

---

## Fonctionnalités

| Domaine              | Fonctionnalités                                                                                  |
|----------------------|--------------------------------------------------------------------------------------------------|
| Authentification     | JWT stateless + refresh token httpOnly cookie, login/register, réinitialisation par email        |
| Rôles                | ADMIN / USER — `@PreAuthorize` sur les endpoints de suppression                                  |
| Produits             | CRUD, suivi CMP (Coût Moyen Pondéré), alertes stock faible / critique                            |
| Achats               | Saisie achat, mouvement stock automatique, recalcul CMP, pagination, export CSV                  |
| Ventes               | Saisie vente, validation stock, tableau de bord combiné, export CSV                              |
| Facturation          | Création facture/BL, génération PDF (Playwright), envoi email Resend, statuts paiement, export CSV |
| Clients              | CRUD, plaque d'immatriculation tunisienne, CIN, KPIs, filtres persistants URL                    |
| Fournisseurs         | CRUD, KPIs, historique achats                                                                    |
| Dashboard            | KPIs temps réel avec tendances ↑↓, graphiques Chart.js, bannière alertes stock critique          |
| UX / UI              | Design system CSS (Inter, tokens), Toast centralisé, ConfirmDialog, Paginator, StatusBadge, SkeletonScreen, Command Palette ⌘K |
| Cache                | Caffeine — données PDF factures (TTL 10 min, max 200 entrées)                                    |
| Emails               | Resend API — factures, BL, réinitialisation mot de passe                                         |

---

## Variables d'environnement (backend)

| Variable                      | Description                          | Défaut                    |
|-------------------------------|--------------------------------------|---------------------------|
| `SPRING_DATASOURCE_URL`       | URL JDBC PostgreSQL                  | `localhost:5432/stockdb`  |
| `SPRING_DATASOURCE_USERNAME`  | Utilisateur DB                       | `postgres`                |
| `SPRING_DATASOURCE_PASSWORD`  | Mot de passe DB                      | `postgres`                |
| `JWT_SECRET`                  | Clé secrète JWT (256+ bits)          | *(valeur de dev)*         |
| `APP_JWT_EXPIRATION`          | Durée JWT (ms)                       | `86400000` (24 h)         |
| `APP_JWT_REFRESH_EXPIRATION`  | Durée refresh token (ms)             | `604800000` (7 j)         |
| `RESEND_API_KEY`              | Clé API Resend pour les emails       | `dev-placeholder-key`     |
| `RESEND_FROM_EMAIL`           | Adresse expéditeur                   | `onboarding@resend.dev`   |
| `CORS_ALLOWED_ORIGINS`        | Origins CORS autorisées              | `localhost:4200`          |
| `FRONTEND_URL`                | URL frontend (liens dans les emails) | `http://localhost:4200`   |

---

## Documentation

| Fichier                                              | Contenu                                          |
|------------------------------------------------------|--------------------------------------------------|
| [`backend/README.md`](backend/README.md)             | Stack, architecture, endpoints, sécurité         |
| [`frontend/README.md`](frontend/README.md)           | Composants, routes, design system, shared libs   |
| [`doc/API_DOCUMENTATION.md`](doc/API_DOCUMENTATION.md) | Référence complète de tous les endpoints       |
| [`doc/DATABASE_GUIDE.md`](doc/DATABASE_GUIDE.md)    | Schéma DB, migrations Flyway (V1→V13)            |
| [`doc/DEPLOYMENT_GUIDE.md`](doc/DEPLOYMENT_GUIDE.md)| Déploiement local et production Railway/Vercel   |
| [`doc/DOCKER_SETUP.md`](doc/DOCKER_SETUP.md)        | Configuration Docker Compose dev/prod            |
| [`doc/TESTING_GUIDE.md`](doc/TESTING_GUIDE.md)      | Tests unitaires, intégration, CI GitHub Actions  |

---

## Accès rapide (dev)

| Outil              | URL                                             |
|--------------------|-------------------------------------------------|
| Application        | http://localhost:4200                           |
| Swagger UI         | http://localhost:8080/swagger-ui.html           |
| H2 Console (dev)   | http://localhost:8080/h2-console *(si activé)*  |
| Actuator Health    | http://localhost:8080/actuator/health           |
