# TODO List — Fonctionnalités à intégrer depuis Arab-Enterprise-Kit-Lite

> Inspiré de l'analyse comparative avec le projet [Arab-Enterprise-Kit-Lite](../Arab-Enterprise-Kit-Lite).
> Classé par priorité décroissante.

---

## Priorité 1 — Impact immédiat (Quick Wins)

### [x] 1.1 Pages d'erreur dédiées (403, 404, 500)
- ✅ `ForbiddenComponent` (403)
- ✅ `NotFoundComponent` (404) — branché sur le wildcard `**`
- ✅ `ServerErrorComponent` (500)
- ✅ Routes `/error/403`, `/error/404`, `/error/500` dans `app.routes.ts`
- ✅ `ErrorInterceptor` redirige automatiquement selon le code HTTP

### [x] 1.2 Dark Mode / Light Mode
- ✅ Toggle dans la sidebar (bouton "Mode sombre / Mode clair")
- ✅ `LayoutService` avec signal `isDarkMode`, `[data-theme="dark"]` sur `<html>`
- ✅ Persistance `localStorage` + détection `prefers-color-scheme`
- ✅ CSS variables complètes dans `styles.css` (`:root` + `[data-theme="dark"]`)
- ✅ Overrides Bootstrap 5 (`--bs-body-bg`, `--bs-body-color`, `--bs-table-*`, etc.)
- ✅ Suppression du double-chargement Bootstrap (`angular.json` / `index.html`)
- ✅ Migration de 28 fichiers (CSS + TS inline styles) de hex hardcodé vers CSS vars

### [x] 1.3 Verrouillage de compte après tentatives échouées
- ✅ Migration `V14` : colonnes `failed_login_attempts` + `locked_until` sur `users`
- ✅ Logique de lock dans `AuthService` (backend) — 5 tentatives → 15 min
- ✅ Incrémentation compteur à chaque échec, reset au succès
- ✅ HTTP 423 avec `minutesRemaining` pour compte verrouillé
- ✅ HTTP 401 avec `attemptsLeft` pour tentatives restantes

---

## Priorité 2 — Amélioration de l'existant

### [x] 2.1 Module User Management (Interface Admin)
- ✅ `GET /api/users` — liste paginée (ADMIN only)
- ✅ `POST /api/users` — créer un utilisateur
- ✅ `PUT /api/users/{id}` — modifier un utilisateur
- ✅ `PUT /api/users/{id}/reset-password` — reset admin
- ✅ `PATCH /api/users/{id}/toggle-status` — activer/désactiver
- ✅ `DELETE /api/users/{id}` — supprimer
- ✅ Page `/admin/users` avec liste, recherche (debounce 200ms) et pagination
- ✅ `RoleBadgeComponent`, `UserFormComponent`
- ✅ `AdminGuard` (canActivate) — accessible ADMIN uniquement
- ✅ Section "Administration" dans la sidebar (visible ADMIN seulement)

### [x] 2.2 Page Paramètres de l'entreprise (Settings)
- ✅ Migration `V16` : table `app_settings` avec seed des valeurs par défaut
- ✅ `GET /api/settings` — récupérer la configuration
- ✅ `PUT /api/settings` — mettre à jour (ADMIN only)
- ✅ Paramètres : nom entreprise, email, téléphone, adresse, devise, TVA, préfixe facture, notifications email
- ✅ Page `/settings` — formulaire réactif, lecture seule pour non-ADMIN

### [ ] 2.3 Opérations en masse (Bulk Operations)
- Ajouter cases à cocher dans les listes (factures, bons de livraison, clients, fournisseurs)
- **Factures :** suppression en masse + mise à jour de statut en masse
- **Clients / Fournisseurs :** suppression en masse
- Barre d'actions contextuelle qui apparaît lors d'une sélection
- **Backend :**
  - `DELETE /api/bills/bulk` — suppression multiple
  - `PATCH /api/bills/bulk-status` — changement de statut multiple

### [ ] 2.4 Filtres avancés sur les factures
- **Backend :** enrichir `/api/bills` avec paramètres :
  - `from` / `to` — plage de dates
  - `status` — filtre par statut (PAID, UNPAID, PARTIALLY_PAID)
  - `customerId` — filtre par client
- **Frontend :**
  - Panneau de filtres dépliable dans `InvoiceListComponent`
  - Date range picker (from/to)
  - Sélecteur de statut multi-choix
  - Persistance des filtres dans les query params

### [ ] 2.5 Cycle de vie des statuts de facture étendu
- Ajouter les statuts `DRAFT` et `OVERDUE` à l'enum `BillStatus`
- **DRAFT :** facture en cours de rédaction, non encore envoyée
- **OVERDUE :** facture impayée dont la date d'échéance est dépassée
- Ajouter un champ `due_date` (date d'échéance) sur les factures
- Job planifié (`@Scheduled`) pour passer automatiquement les factures en `OVERDUE`
- Mettre à jour `StatusBadgeComponent` pour afficher les nouveaux statuts
- Mettre à jour les KPIs du dashboard pour intégrer les factures `OVERDUE`

---

## Priorité 3 — Évolutions majeures

### [ ] 3.1 Internationalisation (i18n) — Arabe RTL + Anglais
- Intégrer `ngx-translate` + `@ngx-translate/http-loader`
- Créer les fichiers de traduction : `assets/i18n/fr.json`, `en.json`, `ar.json`
- Extraire tous les textes de l'interface vers les fichiers i18n
- Créer un `LanguageService` pour changer la langue à la volée (sans rechargement)
- Gérer le basculement `dir="rtl"` / `dir="ltr"` selon la langue (arabe = RTL)
- Persister la préférence de langue en `localStorage`
- Ajouter un sélecteur de langue dans la navbar/sidebar

### [ ] 3.2 Inscription libre (Self-service Registration)
- **Backend :**
  - `POST /api/auth/register` — enregistrement utilisateur libre
  - Validation email unique, règles mot de passe
  - Email de bienvenue à la création du compte
- **Frontend :**
  - Page `/register` avec formulaire d'inscription
  - Lien depuis la page de login
  - Validation réactive (Angular Reactive Forms)

### [ ] 3.3 Spring Boot Actuator + Health Checks
- Ajouter la dépendance `spring-boot-starter-actuator`
- Exposer les endpoints `/actuator/health`, `/actuator/info`
- Brancher les health checks dans `docker-compose.yml` et `docker-compose.prod.yml`
- Protéger l'endpoint Actuator (accès restreint ou réseau interne uniquement)

### [ ] 3.4 Multi-tenancy (Architecture SaaS)
> ⚠️ Chantier structurant — à planifier séparément avant d'implémenter.

- Ajouter une table `companies` (tenant)
- Ajouter colonne `tenant_id` sur toutes les entités métier
- Implémenter `TenantContext` (ThreadLocal) pour isoler les données par tenant
- Filtre Hibernate automatique sur `tenant_id`
- Middleware d'extraction du tenant depuis le JWT ou le header HTTP
- Assignment automatique du `tenant_id` via `@PrePersist` dans `BaseEntity`
- Panel Super Admin : gestion des tenants, stats globales
- Route `/admin/companies` (SUPER_ADMIN only)

---

## Récapitulatif

| # | Fonctionnalité | Priorité | Effort | Statut |
|---|---------------|----------|--------|--------|
| 1.1 | Pages d'erreur (403/404/500) | 🔴 Haute | Faible | ✅ Livré |
| 1.2 | Dark / Light mode | 🔴 Haute | Faible | ✅ Livré |
| 1.3 | Verrouillage compte (login attempts) | 🔴 Haute | Moyen | ✅ Livré |
| 2.1 | User Management (interface admin) | 🟠 Moyenne | Moyen | ✅ Livré |
| 2.2 | Page Paramètres entreprise | 🟠 Moyenne | Moyen | ✅ Livré |
| 2.3 | Opérations en masse (bulk) | 🟠 Moyenne | Moyen | ⬜ À faire |
| 2.4 | Filtres avancés factures | 🟠 Moyenne | Faible | ⬜ À faire |
| 2.5 | Statuts facture étendus (DRAFT/OVERDUE) | 🟠 Moyenne | Moyen | ⬜ À faire |
| 3.1 | i18n — Arabe RTL + Anglais | 🟡 Basse | Élevé | ⬜ À faire |
| 3.2 | Inscription libre (self-registration) | 🟡 Basse | Moyen | ⬜ À faire |
| 3.3 | Spring Boot Actuator | 🟡 Basse | Faible | ⬜ À faire |
| 3.4 | Multi-tenancy (SaaS) | 🟡 Basse | Très élevé | ⬜ À faire |
