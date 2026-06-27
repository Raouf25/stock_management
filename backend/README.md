# Backend — Stock Management API

API REST Spring Boot pour la gestion de stock, facturation et livraison, conforme à la législation tunisienne.

## Stack technique

| Technologie          | Version  | Rôle                                    |
|----------------------|----------|-----------------------------------------|
| Spring Boot          | 3.3.7    | Framework principal                     |
| Java                 | 21       | Langage                                 |
| PostgreSQL           | 15       | Base de données                         |
| Flyway               | —        | Migrations DB (V1 → V12)               |
| Spring Security + JWT| —        | Authentification stateless              |
| Thymeleaf            | —        | Rendu des templates PDF / email         |
| Playwright (Chromium)| —        | Génération PDF via headless browser     |
| Resend               | —        | Envoi d'emails transactionnels          |
| Lombok               | 1.18.36  | Réduction du boilerplate                |
| MapStruct            | —        | Mapping entités ↔ DTOs                  |
| SpringDoc / Swagger  | —        | Documentation API interactive           |
| Spring Cache         | —        | Cache mémoire simple                    |
| Spring Actuator      | —        | Health check, métriques                 |

## Architecture en couches

```
api/          → Contrôleurs REST + gestion des erreurs globale
service/      → Logique métier (BillService, SaleService, PdfGenerateService…)
repository/   → Accès données Spring Data JPA
model/        → Entités JPA
dto/          → Objets de transfert de données
security/     → JwtAuthFilter, JwtService, SecurityConfig
configuration/→ CORS, cache, Spring beans
util/         → NumberUtils, utilitaires
```

## Entités principales

| Entité           | Table                | Description                                  |
|------------------|----------------------|----------------------------------------------|
| `User`           | `user`               | Comptes utilisateurs (email + mot de passe)  |
| `Product`        | `product`            | Articles en stock (CMP, quantités)           |
| `Supplier`       | `supplier`           | Fournisseurs                                 |
| `Customer`       | `customer`           | Clients (CIN, plaque d'immatriculation)      |
| `Purchase`       | `purchase`           | Achats fournisseurs                          |
| `Sale`           | `sale`               | Ventes clients                               |
| `Bill`           | `bill`               | Factures (TVA, dépôt, statut paiement)      |
| `BillProduct`    | `bill_product`       | Lignes de facture                            |
| `DeliveryNote`   | `delivery_note`      | Bons de livraison                            |
| `PasswordResetToken` | `password_reset_token` | Tokens de réinitialisation           |

## Migrations Flyway

Les migrations sont dans `src/main/resources/db/migration/` :

| Version | Description                               |
|---------|-------------------------------------------|
| V1      | Création des tables principales           |
| V2      | Données initiales                         |
| V3      | Ajout gamme produit                       |
| V4      | Suppression données de démo               |
| V5      | Nettoyage des ventes dupliquées           |
| V6      | Index manquants                           |
| V7      | Types monétaires (NUMERIC précis)         |
| V8      | Horodatage d'audit (created_at, updated_at) |
| V9      | Contraintes d'intégrité                   |
| V10     | Lien vente → facture                      |
| V11     | Vue dashboard produits                    |
| V12     | Suppression colonnes purchase orphelines  |

## Endpoints REST

### Authentification — `/api/auth`
| Méthode | Route                       | Description                       |
|---------|-----------------------------|-----------------------------------|
| POST    | `/register`                 | Créer un compte                   |
| POST    | `/login`                    | Connexion → JWT                   |
| POST    | `/forgot-password`          | Demande de réinitialisation       |
| POST    | `/reset-password`           | Réinitialiser avec token          |
| GET     | `/validate-reset-token`     | Valider un token de reset         |

### Produits — `/api/products`
| Méthode | Route                       | Description                       |
|---------|-----------------------------|-----------------------------------|
| GET     | `/`                         | Liste complète                    |
| GET     | `/dashboard`                | Vue dashboard (CMP, stock, KPIs)  |
| GET     | `/{id}`                     | Détail produit                    |
| GET     | `/{id}/stock`               | Stock actuel                      |
| GET     | `/{id}/vendus`              | Quantité vendue                   |
| GET     | `/{id}/inventory`           | Inventaire complet                |
| GET     | `/categories`               | Liste des catégories              |
| GET     | `/stats/categories`         | Stats par catégorie               |
| GET     | `/supplier/{supplierId}`    | Produits par fournisseur          |
| POST    | `/`                         | Créer produit                     |
| PUT     | `/{id}`                     | Modifier produit                  |
| DELETE  | `/{id}`                     | Supprimer produit                 |

### Achats — `/api/purchases`
| Méthode | Route                   | Description                       |
|---------|-------------------------|-----------------------------------|
| GET     | `/`                     | Liste des achats                  |
| GET     | `/{id}`                 | Détail achat                      |
| GET     | `/search`               | Recherche par filtre              |
| GET     | `/product/{productId}`  | Achats par produit                |
| POST    | `/`                     | Créer achat (→ mouvement stock)   |

### Ventes — `/api/sales`
| Méthode | Route                   | Description                              |
|---------|-------------------------|------------------------------------------|
| GET     | `/`                     | Liste des ventes                         |
| GET     | `/combined`             | Vue combinée pour dashboard/graphiques   |
| GET     | `/{id}`                 | Détail vente                             |
| GET     | `/search`               | Recherche par filtre                     |
| GET     | `/product/{productId}`  | Ventes par produit                       |
| POST    | `/`                     | Créer vente (→ validation stock)         |

### Factures — `/api/bills`
| Méthode | Route                    | Description                             |
|---------|--------------------------|-----------------------------------------|
| GET     | `/`                      | Liste des factures                      |
| GET     | `/{id}`                  | Détail facture                          |
| GET     | `/kpis`                  | KPIs (total, payées, impayées…)         |
| GET     | `/generate/{id}`         | Téléchargement PDF                      |
| POST    | `/create`                | Créer facture                           |
| POST    | `/{id}/send-email`       | Envoyer par email (Resend)              |
| POST    | `/{id}/register-payment` | Enregistrer un paiement                 |

### Prévisualisation — `/api/invoices`
| Méthode | Route               | Description                              |
|---------|---------------------|------------------------------------------|
| GET     | `/preview/{billId}` | HTML temps réel pour iframe Angular      |

### Stock — `/api/stock`
| Méthode | Route                    | Description                   |
|---------|--------------------------|-------------------------------|
| GET     | `/summary`               | Résumé global (tous produits) |
| GET     | `/summary/{productId}`   | Résumé par produit            |
| GET     | `/alerts`                | Alertes stock faible          |
| GET     | `/total-value`           | Valeur totale du stock        |
| POST    | `/recalculate-cmp`       | Recalcul du CMP               |

### Clients — `/api/customers`
| Méthode | Route        | Description               |
|---------|--------------|---------------------------|
| GET     | `/`          | Liste des clients         |
| GET     | `/search`    | Recherche par nom / ville |
| GET     | `/kpis`      | KPIs clients              |
| GET     | `/{id}`      | Détail client             |
| POST    | `/`          | Créer client              |
| PUT     | `/{id}`      | Modifier client           |
| DELETE  | `/{id}`      | Supprimer client          |

### Fournisseurs — `/api/suppliers`
| Méthode | Route    | Description                |
|---------|----------|----------------------------|
| GET     | `/`      | Liste des fournisseurs     |
| GET     | `/kpis`  | KPIs fournisseurs          |
| GET     | `/{id}`  | Détail fournisseur         |
| POST    | `/`      | Créer fournisseur          |
| PUT     | `/{id}`  | Modifier fournisseur       |
| DELETE  | `/{id}`  | Supprimer fournisseur      |

## Génération de PDF

Le service `PdfGenerateService` utilise **Playwright (Chromium headless)** pour convertir les templates Thymeleaf en PDF haute qualité :

- `facture_v3.html` — template actif (prévisualisation + PDF)
- `bon-livraison.html` — bon de livraison
- `facture_v4.html`, `facture_v5.html` — variantes

La plaque d'immatriculation tunisienne (ex : `7890 تونس 789`) est rendue via 3 spans en `inline-flex` pour éviter le réordonnancement bidi du navigateur.

## Emails (Resend)

4 templates HTML Thymeleaf dans `email-templates/` :

| Template                        | Déclencheur                        |
|---------------------------------|------------------------------------|
| `invoice-notification.html`     | Envoi de facture                   |
| `delivery-note-notification.html` | Envoi de bon de livraison        |
| `password-reset.html`           | Réinitialisation mot de passe     |
| `generic-notification.html`     | Notifications génériques           |

## Règles métier

**Calcul du CMP :**
```
CMP = Valeur stock courante / Quantité stock courante
```

**Mise à jour au déclenchement d'un achat :**
```
Nouvelle valeur = (CMP actuel × Qté actuelle) + (Prix unitaire × Qté achetée)
Nouvelle Qté    = Qté actuelle + Qté achetée
Nouveau CMP     = Nouvelle valeur / Nouvelle Qté
```

**Validation d'une vente :**
```
Qté disponible >= Qté demandée  → OK
Qté disponible <  Qté demandée  → Exception HTTP 400
```

## Démarrage

### Prérequis
- Java 21+, Maven 3.9+, PostgreSQL 15+

### Local
```bash
# PostgreSQL via Docker
docker run -d --name pg -e POSTGRES_DB=stock_db -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15

cd backend
./mvnw spring-boot:run
```

L'application démarre sur `http://localhost:8080`. Flyway applique automatiquement les migrations V1→V12.

### Variables d'environnement requises en production
```
SPRING_DATASOURCE_URL
SPRING_DATASOURCE_USERNAME
SPRING_DATASOURCE_PASSWORD
JWT_SECRET
RESEND_API_KEY
RESEND_FROM_EMAIL
CORS_ALLOWED_ORIGINS
FRONTEND_URL
```

## Swagger / OpenAPI

Accessible en local sur : `http://localhost:8080/swagger-ui.html`

---

**Version** : 1.0.0 | **Spring Boot** : 3.3.7 | **Java** : 21 | **BD** : PostgreSQL 15
