# Backend — Bhouri Stock API

API REST Spring Boot pour la gestion de stock, facturation et livraison, conforme à la législation tunisienne.

---

## Stack technique

| Technologie              | Version  | Rôle                                            |
|--------------------------|----------|-------------------------------------------------|
| Spring Boot              | 3.3.7    | Framework principal                             |
| Java                     | 21       | Langage                                         |
| PostgreSQL               | 15       | Base de données                                 |
| Flyway                   | —        | Migrations DB (V1 → V13)                       |
| Spring Security + JWT    | —        | Authentification stateless + refresh token      |
| Thymeleaf                | —        | Rendu des templates PDF et email                |
| Playwright (Chromium)    | —        | Génération PDF via headless browser             |
| Resend                   | —        | Envoi d'emails transactionnels                  |
| Lombok                   | 1.18.36  | Réduction du boilerplate                        |
| MapStruct                | —        | Mapping entités ↔ DTOs                          |
| Caffeine                 | —        | Cache mémoire (PDF, requêtes lourdes)           |
| SpringDoc / Swagger      | —        | Documentation API interactive                   |
| Spring Actuator          | —        | Health check, métriques                         |

---

## Architecture en couches

```
api/           → Contrôleurs REST + gestion des erreurs globale
service/       → Logique métier (BillService, SaleService, PdfGenerateService…)
repository/    → Accès données Spring Data JPA
model/         → Entités JPA
dto/           → Objets de transfert de données
security/      → JwtAuthFilter, JwtService, SecurityConfig, RefreshToken
configuration/ → CORS, cache Caffeine, Spring beans
util/          → NumberUtils, utilitaires
```

---

## Entités principales

| Entité               | Table                    | Description                                          |
|----------------------|--------------------------|------------------------------------------------------|
| `User`               | `user`                   | Comptes utilisateurs (email + mot de passe hashé)    |
| `Product`            | `product`                | Articles en stock (CMP, seuils d'alerte)            |
| `Supplier`           | `supplier`               | Fournisseurs                                         |
| `Customer`           | `customer`               | Clients (CIN, MF fiscal, plaque d'immatriculation)   |
| `Purchase`           | `purchase`               | Achats fournisseurs → recalcul CMP automatique       |
| `Sale`               | `sale`                   | Ventes clients → validation stock                   |
| `Bill`               | `bill`                   | Factures (TVA, dépôt, statut paiement, net à payer) |
| `BillProduct`        | `bill_product`           | Lignes de facture                                    |
| `DeliveryNote`       | `delivery_note`          | Bons de livraison (PENDING / DELIVERED / INVOICED)  |
| `PasswordResetToken` | `password_reset_token`   | Tokens de réinitialisation (TTL 24 h)               |

---

## Migrations Flyway

Fichiers dans `src/main/resources/db/migration/` :

| Version | Description                                      |
|---------|--------------------------------------------------|
| V1      | Création des tables principales                  |
| V2      | Données initiales                                |
| V3      | Ajout gamme produit                              |
| V4      | Suppression données de démo                      |
| V5      | Nettoyage des ventes dupliquées                  |
| V6      | Index manquants                                  |
| V7      | Types monétaires (`NUMERIC` précis)              |
| V8      | Horodatage d'audit (`created_at`, `updated_at`)  |
| V9      | Contraintes d'intégrité                          |
| V10     | Lien vente → facture                             |
| V11     | Vue dashboard produits (`product_dashboard_view`)|
| V12     | Suppression colonnes `purchase` orphelines       |
| V13     | Refresh token (`refresh_token` table)            |

---

## Endpoints REST

### Authentification — `/api/auth`
| Méthode | Route                    | Accès  | Description                         |
|---------|--------------------------|--------|-------------------------------------|
| POST    | `/register`              | Public | Créer un compte                     |
| POST    | `/login`                 | Public | Connexion → JWT + refresh cookie    |
| POST    | `/refresh-token`         | Public | Renouveler JWT via cookie           |
| POST    | `/logout`                | Auth   | Invalider le refresh token          |
| POST    | `/forgot-password`       | Public | Demande de réinitialisation         |
| POST    | `/reset-password`        | Public | Réinitialiser avec token            |
| GET     | `/validate-reset-token`  | Public | Valider un token de reset           |

### Produits — `/api/products`
| Méthode | Route                        | Description                         |
|---------|------------------------------|-------------------------------------|
| GET     | `/`                          | Liste complète                      |
| GET     | `/dashboard`                 | Vue dashboard (CMP, stock, KPIs)    |
| GET     | `/{id}`                      | Détail produit                      |
| GET     | `/{id}/stock`                | Stock actuel                        |
| GET     | `/{id}/vendus`               | Quantité vendue                     |
| GET     | `/{id}/inventory`            | Inventaire complet                  |
| GET     | `/categories`                | Liste des catégories                |
| GET     | `/stats/categories`          | Stats par catégorie                 |
| GET     | `/supplier/{supplierId}`     | Produits par fournisseur            |
| POST    | `/`                          | Créer produit                       |
| PUT     | `/{id}`                      | Modifier produit                    |
| DELETE  | `/{id}` *(ADMIN)*            | Supprimer produit                   |

### Achats — `/api/purchases`
| Méthode | Route                   | Description                              |
|---------|-------------------------|------------------------------------------|
| GET     | `/`                     | Liste paginée (`?page=&size=`)           |
| GET     | `/{id}`                 | Détail achat                             |
| GET     | `/search`               | Recherche par filtre                     |
| GET     | `/product/{productId}`  | Achats par produit                       |
| GET     | `/export/csv`           | Export CSV                               |
| POST    | `/`                     | Créer achat (→ mouvement stock + CMP)    |

### Ventes — `/api/sales`
| Méthode | Route                   | Description                              |
|---------|-------------------------|------------------------------------------|
| GET     | `/`                     | Liste des ventes                         |
| GET     | `/combined`             | Vue combinée ventes+achats (dashboard)   |
| GET     | `/{id}`                 | Détail vente                             |
| GET     | `/search`               | Recherche par filtre                     |
| GET     | `/product/{productId}`  | Ventes par produit                       |
| GET     | `/export/csv`           | Export CSV                               |
| POST    | `/`                     | Créer vente (→ validation stock)         |

### Factures — `/api/bills`
| Méthode | Route                     | Description                               |
|---------|---------------------------|-------------------------------------------|
| GET     | `/`                       | Liste paginée (`?page=&size=`)            |
| GET     | `/{id}`                   | Détail facture                            |
| GET     | `/kpis`                   | KPIs (total, CA, payées, impayées…)       |
| GET     | `/generate/{id}`          | Téléchargement PDF (Playwright)           |
| GET     | `/export/csv`             | Export CSV                                |
| POST    | `/create`                 | Créer facture                             |
| POST    | `/{id}/send-email`        | Envoyer par email (Resend)               |
| POST    | `/{id}/register-payment`  | Enregistrer un paiement                   |
| DELETE  | `/{id}` *(ADMIN)*         | Supprimer facture                         |

### Prévisualisation — `/api/invoices`
| Méthode | Route               | Description                               |
|---------|---------------------|-------------------------------------------|
| GET     | `/preview/{billId}` | HTML Thymeleaf temps réel (iframe Angular)|

### Bons de livraison — `/api/delivery-notes`
| Méthode | Route                     | Description                             |
|---------|---------------------------|-----------------------------------------|
| GET     | `/`                       | Liste des BL                            |
| GET     | `/{id}`                   | Détail BL                               |
| GET     | `/{id}/generate`          | Téléchargement PDF BL                   |
| GET     | `/kpis`                   | KPIs BL                                 |
| POST    | `/`                       | Créer BL                                |
| POST    | `/{id}/status`            | Mettre à jour statut                    |
| POST    | `/bulk-invoice`           | Convertir plusieurs BL en facture       |
| DELETE  | `/{id}` *(ADMIN)*         | Supprimer BL                            |

### Stock — `/api/stock`
| Méthode | Route                    | Description                      |
|---------|--------------------------|----------------------------------|
| GET     | `/summary`               | Résumé global (tous produits)    |
| GET     | `/summary/{productId}`   | Résumé par produit               |
| GET     | `/alerts`                | Alertes stock faible/critique    |
| GET     | `/total-value`           | Valeur totale de l'inventaire    |
| POST    | `/recalculate-cmp`       | Recalcul du CMP                  |

### Clients — `/api/customers`
| Méthode | Route        | Description                 |
|---------|--------------|-----------------------------|
| GET     | `/`          | Liste des clients           |
| GET     | `/search`    | Recherche par nom / ville   |
| GET     | `/kpis`      | KPIs clients                |
| GET     | `/{id}`      | Détail client               |
| POST    | `/`          | Créer client                |
| PUT     | `/{id}`      | Modifier client             |
| DELETE  | `/{id}` *(ADMIN)* | Supprimer client       |

### Fournisseurs — `/api/suppliers`
| Méthode | Route    | Description                 |
|---------|----------|-----------------------------|
| GET     | `/`      | Liste des fournisseurs      |
| GET     | `/kpis`  | KPIs fournisseurs           |
| GET     | `/{id}`  | Détail fournisseur          |
| POST    | `/`      | Créer fournisseur           |
| PUT     | `/{id}`  | Modifier fournisseur        |
| DELETE  | `/{id}` *(ADMIN)* | Supprimer fournisseur |

### Reporting — `/api/reporting`
| Méthode | Route         | Description                         |
|---------|---------------|-------------------------------------|
| GET     | `/dashboard`  | Agrégats pour le dashboard général  |

---

## Sécurité

### JWT stateless
- Access token en header `Authorization: Bearer <token>` (durée configurable, défaut 24 h)
- Refresh token httpOnly cookie `refreshToken` (durée configurable, défaut 7 j)
- `JwtAuthFilter` valide chaque requête entrante
- `SecurityConfig` : endpoints publics `/api/auth/**`, tout le reste protégé

### Rôles
| Rôle    | Accès                                                   |
|---------|---------------------------------------------------------|
| `USER`  | Lecture + création + modification                       |
| `ADMIN` | Tout + suppression (`@PreAuthorize("hasRole('ADMIN')")`) |

### Rate limiter
- Filtre en mémoire (`RateLimiterFilter`) — 60 req/min par IP
- Nettoyage automatique des entrées obsolètes toutes les 5 minutes

---

## Cache Caffeine

| Cache       | TTL     | Max entrées | Usage                           |
|-------------|---------|-------------|---------------------------------|
| `pdfData`   | 10 min  | 200         | Données Thymeleaf pour PDF      |

---

## Génération de PDF

`PdfGenerateService` utilise **Playwright (Chromium headless)** :

1. `InvoicePdfDataService` construit le `Map<String, Object>` de données
2. Thymeleaf convertit le template en HTML
3. Playwright génère le PDF (page A4, marges configurables)

Templates actifs :
- `facture_v3.html` — facture (prévisualisation + PDF)
- `bon-livraison.html` — bon de livraison

La plaque d'immatriculation tunisienne (ex : `7890 تونس 789`) est rendue via 3 `<span>` en `inline-flex` pour éviter le réordonnancement bidi.

---

## Emails (Resend)

| Template                          | Déclencheur                        |
|-----------------------------------|------------------------------------|
| `invoice-notification.html`       | Envoi de facture                   |
| `delivery-note-notification.html` | Envoi de bon de livraison          |
| `password-reset.html`             | Réinitialisation mot de passe      |
| `generic-notification.html`       | Notifications génériques           |

---

## Règles métier

### Calcul du CMP (Coût Moyen Pondéré)
```
À chaque achat :
  nouvelle_valeur = (CMP_actuel × qté_actuelle) + (prix_unitaire × qté_achetée)
  nouvelle_qté    = qté_actuelle + qté_achetée
  nouveau_CMP     = nouvelle_valeur / nouvelle_qté
```

### Validation d'une vente
```
qté_disponible >= qté_demandée  → OK (stock décrémenté)
qté_disponible <  qté_demandée  → HTTP 400 Bad Request
```

### Alertes stock
```
stock ≤ seuil_alerte_critique  → CRITIQUE (rouge)
stock ≤ seuil_alerte           → FAIBLE (ambre)
```

### Calcul facture
```
sous_total = Σ (quantité × prix_unitaire)
TVA        = sous_total × 19%  (optionnel)
total_TTC  = sous_total + TVA
net_à_payer = total_TTC − dépôt
```

---

## Démarrage

### Prérequis
Java 21+, Maven 3.9+, PostgreSQL 15+

### Local (sans Docker)
```bash
# PostgreSQL via Docker
docker run -d --name pg \
  -e POSTGRES_DB=stock_db \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgres:15

cd backend
./mvnw spring-boot:run
```

Flyway applique automatiquement les migrations V1 → V13 au démarrage.

### Variables d'environnement
```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/stock_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
JWT_SECRET=<256-bit-secret>
APP_JWT_EXPIRATION=86400000
APP_JWT_REFRESH_EXPIRATION=604800000
RESEND_API_KEY=<key>
RESEND_FROM_EMAIL=noreply@example.com
CORS_ALLOWED_ORIGINS=http://localhost:4200
FRONTEND_URL=http://localhost:4200
```

---

## Swagger / OpenAPI

`http://localhost:8080/swagger-ui.html`  
Spec JSON : `http://localhost:8080/v3/api-docs`

---

## Actuator

| Endpoint                          | Description      |
|-----------------------------------|------------------|
| `/actuator/health`                | État de l'API    |
| `/actuator/info`                  | Version, build   |

---

**Version** : 2.0.0 | **Spring Boot** : 3.3.7 | **Java** : 21 | **DB** : PostgreSQL 15
