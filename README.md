# Bhouri Stock — Gestion de stock & facturation

Application full-stack de gestion de stock et de facturation conforme à la législation tunisienne.

- **Backend** : Spring Boot 3.3.7 / Java 21 / PostgreSQL 15
- **Frontend** : Angular 17 (Standalone Components)
- **Production** : Railway (API) + Vercel (Frontend) — `https://bhouri-stock.com`

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

## Démarrage rapide

### Docker (recommandé)

```bash
docker-compose up -d --build
```

| Service   | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost:4200        |
| API       | http://localhost:8080/api    |
| Swagger   | http://localhost:8080/swagger-ui.html |

### Sans Docker

```bash
# Terminal 1 — Backend
cd backend && ./mvnw spring-boot:run

# Terminal 2 — Frontend
cd frontend && npm install && npm start
```

Prérequis : Java 21+, Maven 3.9+, Node 18+, PostgreSQL 15+

## Fonctionnalités principales

| Domaine            | Fonctionnalités                                                         |
|--------------------|-------------------------------------------------------------------------|
| Authentification   | JWT, login/register, mot de passe oublié, réinitialisation par email   |
| Produits           | CRUD, suivi CMP (Coût Moyen Pondéré), alertes stock faible             |
| Achats             | Saisie achat, mouvement stock automatique, recalcul CMP                |
| Ventes             | Saisie vente, validation stock, tableau de bord combiné                |
| Facturation        | Création facture/BL, génération PDF (Playwright), envoi email, statuts paiement |
| Clients            | CRUD, plaque d'immatriculation tunisienne, CIN, KPIs                   |
| Fournisseurs       | CRUD, KPIs, historique achats                                          |
| Dashboard          | KPIs temps réel, graphiques, alertes, mouvements récents               |
| Emails             | Resend API — factures, BL, réinitialisation mot de passe               |

## Variables d'environnement (backend)

| Variable                      | Description                          | Défaut               |
|-------------------------------|--------------------------------------|----------------------|
| `SPRING_DATASOURCE_URL`       | URL JDBC PostgreSQL                  | `localhost:5432`     |
| `SPRING_DATASOURCE_USERNAME`  | Utilisateur DB                       | `postgres`           |
| `SPRING_DATASOURCE_PASSWORD`  | Mot de passe DB                      | `postgres`           |
| `JWT_SECRET`                  | Clé secrète JWT (256+ bits)          | *(valeur de dev)*    |
| `RESEND_API_KEY`              | Clé API Resend pour les emails       | `dev-placeholder-key`|
| `RESEND_FROM_EMAIL`           | Adresse expéditeur                   | `onboarding@resend.dev` |
| `CORS_ALLOWED_ORIGINS`        | Origins CORS autorisées              | `localhost:4200`     |
| `FRONTEND_URL`                | URL frontend (liens emails)          | `http://localhost:4200` |

## Documentation

| Fichier                           | Contenu                          |
|-----------------------------------|----------------------------------|
| [`backend/README.md`](backend/README.md) | API, architecture, endpoints |
| [`frontend/README.md`](frontend/README.md) | Composants, routes, stack |
| [`doc/API_DOCUMENTATION.md`](doc/API_DOCUMENTATION.md) | Référence complète des endpoints |
| [`doc/DEPLOYMENT_GUIDE.md`](doc/DEPLOYMENT_GUIDE.md) | Déploiement local et production |
| [`doc/DOCKER_SETUP.md`](doc/DOCKER_SETUP.md) | Configuration Docker |
