# Frontend — Bhouri Stock

SPA Angular 17 pour la gestion de stock, la facturation et les livraisons.

---

## Stack technique

| Technologie        | Version    | Rôle                                     |
|--------------------|------------|------------------------------------------|
| Angular            | 17.3.10    | Framework SPA (Standalone Components)   |
| TypeScript         | ~5.2.2     | Langage                                  |
| RxJS               | 7.x        | Programmation réactive                   |
| Chart.js           | 4.x        | Graphiques dashboard                     |
| Angular Router     | 17.x       | Navigation SPA (lazy-loaded)            |
| HttpClient         | 17.x       | Appels API REST                          |
| Angular Signals    | 17.x       | État réactif (`ToastService`, `ConfirmDialogService`) |
| Bootstrap Icons    | CDN        | Iconographie (bi-*)                      |
| Inter (Google Fonts)| —         | Typographie principale                   |

Pas de bibliothèque CSS externe — design system CSS natif avec variables custom.

---

## Routes

| Route                       | Composant                    | Accès     |
|-----------------------------|------------------------------|-----------|
| `/login`                    | `LoginComponent`             | Public    |
| `/forgot-password`          | `ForgotPasswordComponent`    | Public    |
| `/reset-password`           | `ResetPasswordComponent`     | Public    |
| `/` ou `/dashboard`         | `DashboardComponent`         | Protégé   |
| `/products`                 | `ProductsComponent`          | Protégé   |
| `/transactions`             | `TransactionsComponent`      | Protégé   |
| `/customers`                | `CustomerListComponent`      | Protégé   |
| `/customers/edit/new`       | `CustomerEditComponent`      | Protégé   |
| `/customers/edit/:id`       | `CustomerEditComponent`      | Protégé   |
| `/suppliers`                | `SuppliersComponent`         | Protégé   |
| `/suppliers/create`         | `SupplierCreateComponent`    | Protégé   |
| `/suppliers/edit/:id`       | `SupplierEditComponent`      | Protégé   |
| `/suppliers/view/:id`       | `SupplierDetailComponent`    | Protégé   |
| `/documents/create`         | `CreateDocumentComponent`    | Protégé   |
| `/invoices/list`            | `InvoiceListComponent`       | Protégé   |
| `/delivery-notes`           | `DeliveryNoteListComponent`  | Protégé   |
| `/profile`                  | `ProfileComponent`           | Protégé   |

Toutes les routes protégées passent par `authGuard` (vérification JWT local).  
Toutes les routes sont **lazy-loaded** via `loadComponent` pour réduire le bundle initial.

---

## Services

### `ApiService` (`services/api.service.ts`)
Centralise tous les appels HTTP. Sélection :

| Méthode                        | Description                                             |
|--------------------------------|---------------------------------------------------------|
| `getAllBills(page, size)`       | Factures paginées (server-side)                         |
| `getInvoiceKPIs()`             | KPIs factures (total, CA, impayées…)                   |
| `getDeliveryNoteKPIs()`        | KPIs bons de livraison                                  |
| `getStockAlerts(limit)`        | Produits en alerte stock                                |
| `getStockTotalValue()`         | Valeur totale de l'inventaire                           |
| `getCombinedSales()`           | Ventes + achats agrégés pour graphiques                 |
| `downloadInvoicePDF(id)`       | Téléchargement PDF facture (Blob)                       |
| `downloadDeliveryNotePDF(id)`  | Téléchargement PDF BL (Blob)                            |
| `sendInvoiceByEmail(id)`       | Envoi email via Resend                                  |

### `AuthService` (`services/auth.service.ts`)
Gère le token JWT en `localStorage`, le profil utilisateur, la déconnexion et la redirection.

### `ToastService` (`services/toast.service.ts`)
Service signal-based pour les notifications. Méthodes : `success()`, `error()`, `warning()`, `info()`, `dismiss()`.

```typescript
// Usage dans n'importe quel composant
private toast = inject(ToastService);
this.toast.success('Client créé avec succès.');
this.toast.error('Erreur lors de la suppression.');
```

### `ConfirmDialogService` (`services/confirm-dialog.service.ts`)
Remplace tous les `window.confirm()`. Retourne une `Promise<boolean>`.

```typescript
const ok = await this.confirmDialog.confirm({
  title: 'Supprimer le client',
  message: 'Cette action est irréversible.',
  confirmText: 'Supprimer',
  danger: true
});
if (ok) { /* ... */ }
```

### `UrlFiltersService` (`shared/url-filters.service.ts`)
Synchronise les filtres avec les queryParams URL (200 ms debounce).  
Les filtres survivent au rechargement et à la navigation arrière.

```typescript
// Lire les params au démarrage
const p = this.urlFilters.read(this.route);
if (p['q']) this.searchText = p['q'];

// Écrire après chaque changement de filtre
this.urlFilters.write(this.router, this.route, { q: value || null });
```

### Intercepteurs HTTP

| Intercepteur         | Rôle                                                              |
|----------------------|-------------------------------------------------------------------|
| `authInterceptor`    | Injecte `Authorization: Bearer <token>` sur chaque requête sortante |
| `errorInterceptor`   | 401 → logout + redirect `/login` ; 429 → log ; 5xx → log        |

---

## Composants partagés (`app/shared/`)

| Composant / Service              | Sélecteur / Classe                  | Description                                                 |
|----------------------------------|-------------------------------------|-------------------------------------------------------------|
| `ToastOutletComponent`           | `<app-toast-outlet>`                | Rendu des toasts (top-right, animés, auto-dismiss)          |
| `ConfirmDialogComponent`         | `<app-confirm-dialog>`              | Modal de confirmation avec variant danger                   |
| `CommandPaletteComponent`        | `<app-command-palette>`             | Palette ⌘K avec 12 commandes, navigation clavier            |
| `PaginatorComponent`             | `<app-paginator>`                   | Pagination avec ellipsis, sélecteur taille, info X–Y sur N  |
| `StatusBadgeComponent`           | `<app-status-badge [value]="...">`  | Badge coloré pour tous les statuts (paiement, BL, client)   |
| `StockAlertBannerComponent`      | `<app-stock-alert-banner>`          | Bannière rouge/ambre alertes stock critique / faible         |
| `SkeletonTableComponent`         | `<app-skeleton-table>`              | Skeleton shimmer pour tableaux en chargement                |
| `SkeletonCardsComponent`         | `<app-skeleton-cards>`              | Skeleton shimmer pour grilles de KPI cards                  |
| `UrlFiltersService`              | `inject(UrlFiltersService)`         | Persistance filtres dans l'URL                              |

Tous les composants partagés sont **standalone** et s'importent individuellement.

---

## Design System

Défini dans `src/styles.css`. Toutes les valeurs sont des **CSS custom properties** sur `:root`.

### Palette de couleurs

| Token                     | Valeur     | Usage                         |
|---------------------------|------------|-------------------------------|
| `--color-primary`         | `#6366f1`  | Actions principales, liens actifs |
| `--color-primary-hover`   | `#4f46e5`  | Hover boutons primaires       |
| `--color-bg`              | `#f8fafc`  | Fond de page                  |
| `--color-surface`         | `#ffffff`  | Cartes, modals                |
| `--color-surface-2`       | `#f1f5f9`  | Entêtes tableaux, fond secondaire |
| `--color-border`          | `#e2e8f0`  | Bordures standard             |
| `--color-text`            | `#0f172a`  | Texte principal               |
| `--color-text-muted`      | `#64748b`  | Texte secondaire              |
| `--color-success`         | `#10b981`  | Succès, stock OK              |
| `--color-warning`         | `#f59e0b`  | Avertissements, stock faible  |
| `--color-danger`          | `#ef4444`  | Erreurs, rupture critique     |
| `--color-info`            | `#3b82f6`  | Informatif                    |
| `--sidebar-bg`            | `#1a1e4e`  | Fond sidebar                  |
| `--sidebar-active-bg`     | `#4f46e5`  | Lien actif sidebar            |

### Autres tokens

| Catégorie   | Tokens disponibles                                                          |
|-------------|-----------------------------------------------------------------------------|
| Typographie | `--font-sans` (Inter), `--font-mono`                                       |
| Ombres      | `--shadow-xs` → `--shadow-xl`                                              |
| Rayons      | `--radius-sm` (6px) → `--radius-full` (9999px)                            |
| Espacement  | `--space-1` (4px) → `--space-8` (32px)                                    |
| Transitions | `--transition` (150ms), `--transition-md` (250ms), `--transition-slow` (350ms) |
| Sidebar     | `--sidebar-width` (248px), `--sidebar-width-sm` (68px)                    |

### Classes utilitaires

| Classe             | Description                                          |
|--------------------|------------------------------------------------------|
| `.page`            | Conteneur de page (padding, animation fadeIn)        |
| `.page-header`     | En-tête de page (flex, titre + actions)              |
| `.card`            | Carte avec ombre, hover lift                         |
| `.kpi-card`        | KPI card avec top-border accent coloré               |
| `.kpi-trend`       | Badge tendance ↑↓ (`.up`, `.down`, `.neutral`)       |
| `.filter-bar`      | Barre de filtres (flex, gap, border)                 |
| `.table`           | Table standard avec hover row                        |
| `.badge`           | Pill badge (`.badge-success`, `.badge-danger`…)      |
| `.btn-primary`     | Bouton primaire violet                               |
| `.btn-secondary`   | Bouton secondaire gris                               |
| `.btn-danger`      | Bouton de suppression rouge                          |
| `.alert-banner`    | Bannière alerte inline (warning/danger/info)         |
| `.empty-state`     | Bloc "aucun résultat"                               |

---

## Fonctionnalités par composant

### Dashboard (`dashboard/`)
- KPI cards avec tendances ↑↓ (comparaison mois courant vs mois précédent)
- Bannière alertes stock critique / faible en tête de page
- Graphiques Chart.js : Ventes vs Achats, statuts paiement, Top 5 produits, catégories
- Skeleton screen pendant le chargement
- Bootstrap Icons dans les icon-boxes colorées

### Authentification (`auth/`)
- Login → JWT stocké en `localStorage` + refresh token httpOnly cookie
- Demande/réinitialisation de mot de passe par email (Resend)
- `authGuard` redirige `/login` si token absent ou expiré

### Produits (`products/`)
- Recherche debounce 300 ms avec persistance `?q=` dans l'URL
- Graphiques de distribution de stock et catégories
- Affichage CMP, stock actuel, valeur initiale/actuelle

### Clients (`customers/`)
- Recherche + filtres (statut, adresse) persistants dans l'URL (`?q=&status=&addr=`)
- `<app-status-badge>` pour ACTIVE / INACTIVE / BLOCKED / PROSPECT
- ConfirmDialog avant suppression (remplace `window.confirm`)
- Toast centralisé pour succès / erreur

### Fournisseurs (`suppliers/`)
- Recherche debounce 300 ms
- Skeleton table pendant le chargement initial
- ConfirmDialog avant suppression

### Factures & BL (`invoices/`)
- Onglets Factures / Bons de Livraison
- Pagination server-side avec `<app-paginator>` (20 / page par défaut)
- `<app-status-badge>` pour PAID / UNPAID / PARTIALLY_PAID / DELIVERED / INVOICED
- Drawer latéral avec iframe de prévisualisation facture en temps réel
- Actions : télécharger PDF, envoyer par email, encaisser
- ConfirmDialog avant suppression et envoi email

### Créer un document (`create-document/`)
- Stepper 3 étapes : Produits → Informations → Récapitulatif
- Mode **Facture** ou **Bon de Livraison** (toggle queryParam `?mode=`)
- Calcul TVA (19%) optionnel
- Champ dépôt / acompte → calcul Net à Régler
- ConfirmDialog avant abandon du formulaire

### Bons de livraison (`delivery-notes/`)
- Sélection multiple → conversion groupée en facture
- Mise à jour statut PENDING → DELIVERED
- Téléchargement PDF individuel

### Profil (`profile/`)
- Informations de l'utilisateur connecté
- Modification du mot de passe

---

## Command Palette ⌘K

Accessible via `⌘K` (macOS) ou `Ctrl+K` (Windows/Linux), ou via le bouton "Rechercher…" en bas de la sidebar.

- 12 commandes (navigation + actions rapides)
- Recherche fuzzy sur label, sous-titre et mots-clés
- Navigation clavier ↑↓ + Entrée
- Fermeture par Escape ou clic backdrop

---

## Structure des dossiers

```
frontend/src/app/
├── components/
│   ├── auth/               # login, forgot-password, reset-password
│   ├── create-document/    # création facture / BL (stepper)
│   ├── customers/          # list, create, edit
│   ├── dashboard/          # tableau de bord + graphiques
│   ├── delivery-notes/     # liste BL (standalone)
│   ├── invoices/           # liste unifiée factures + BL + drawer
│   ├── products/           # liste produits + graphiques
│   ├── profile/            # profil utilisateur
│   ├── stock-movement/     # historique mouvements
│   ├── suppliers/          # list, create, edit, detail
│   └── transactions/       # achats + ventes
├── services/
│   ├── api.service.ts           # tous les appels HTTP
│   ├── auth.service.ts          # gestion JWT
│   ├── auth.guard.ts            # protection routes
│   ├── auth.interceptor.ts      # injection Bearer token
│   ├── error.interceptor.ts     # gestion globale 401/429/5xx
│   ├── toast.service.ts         # notifications (signal-based)
│   └── confirm-dialog.service.ts# ConfirmDialog (Promise-based)
├── shared/
│   ├── command-palette.component.ts  # ⌘K palette
│   ├── confirm-dialog.component.ts   # modal de confirmation
│   ├── paginator.component.ts        # pagination universelle
│   ├── skeleton.component.ts         # skeleton table + cards
│   ├── status-badge.component.ts     # badge statut unifié
│   ├── stock-alert-banner.component.ts # bannière alertes stock
│   ├── toast-outlet.component.ts     # rendu des toasts
│   └── url-filters.service.ts        # filtres persistants URL
├── app.component.ts        # shell (sidebar + router-outlet)
├── app.component.html      # template shell
├── app.component.css       # styles sidebar (CSS variables)
├── app.routes.ts           # routes lazy-loaded
└── environments/
    ├── environment.ts          # dev (apiUrl localhost:8080)
    └── environment.prod.ts     # prod
```

---

## Configuration

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

En développement, le proxy Angular (`proxy.conf.json`) peut router `/api` vers `http://localhost:8080`.

---

## Démarrage

```bash
cd frontend
npm install
npm start          # http://localhost:4200  (dev server)
npm run build      # build production → dist/
npx ng build --configuration=production
```

---

## Déploiement

Production sur **Vercel** — build `npm run build`, dossier `dist/` déployé.

```bash
npm run build
# dist/frontend/browser/ → Vercel / nginx
```

---

**Version** : 2.0.0 | **Angular** : 17.3.10 | **TypeScript** : 5.2.2 | **Node** : 18+
