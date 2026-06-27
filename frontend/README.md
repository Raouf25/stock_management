# Frontend — Bhouri Stock

SPA Angular 17 pour la gestion de stock, la facturation et les livraisons.

## Stack technique

| Technologie           | Version   | Rôle                              |
|-----------------------|-----------|-----------------------------------|
| Angular               | 17.3.10   | Framework SPA (Standalone Components) |
| TypeScript            | ~5.2.2    | Langage                           |
| Angular CDK           | 17.3.10   | Composants utilitaires            |
| RxJS                  | —         | Programmation réactive            |
| Angular Router        | —         | Navigation SPA                    |
| HttpClient            | —         | Appels API REST                   |

Pas de bibliothèque CSS externe — styles entièrement custom (CSS natif par composant).

## Routes et composants

| Route                        | Composant                    | Accès     |
|------------------------------|------------------------------|-----------|
| `/login`                     | `LoginComponent`             | Public    |
| `/forgot-password`           | `ForgotPasswordComponent`    | Public    |
| `/reset-password`            | `ResetPasswordComponent`     | Public    |
| `/dashboard`                 | `DashboardComponent`         | Protégé   |
| `/products`                  | `ProductsComponent`          | Protégé   |
| `/transactions`              | `TransactionsComponent`      | Protégé   |
| `/customers`                 | `CustomerListComponent`      | Protégé   |
| `/customers/create`          | `CustomerCreateComponent`    | Protégé   |
| `/customers/edit/:id`        | `CustomerEditComponent`      | Protégé   |
| `/suppliers`                 | `SuppliersComponent`         | Protégé   |
| `/suppliers/create`          | `SupplierCreateComponent`    | Protégé   |
| `/suppliers/edit/:id`        | `SupplierEditComponent`      | Protégé   |
| `/suppliers/view/:id`        | `SupplierDetailComponent`    | Protégé   |
| `/documents/create`          | `CreateDocumentComponent`    | Protégé   |
| `/invoices/list`             | `InvoiceListComponent`       | Protégé   |
| `/profile`                   | `ProfileComponent`           | Protégé   |
| `/delivery-notes`            | → redirect `/invoices/list`  | Protégé   |

Toutes les routes protégées passent par `authGuard` (vérification JWT).

## Fonctionnalités par composant

### Dashboard
- KPIs temps réel : CA total, ventes du jour, stock faible, valeur inventaire
- Graphiques des ventes (données `/api/sales/combined`)
- Tableau des produits disponibles avec alertes stock

### Authentification (`auth/`)
- Login avec JWT stocké en `localStorage`
- Demande de réinitialisation par email
- Formulaire de nouveau mot de passe via token

### Produits (`products/`)
- Liste avec recherche en temps réel
- Affichage CMP, stock actuel, valeur initiale/actuelle

### Transactions (`transactions/`)
- Onglets Achats / Ventes dans la même vue
- Création d'achat avec sélection fournisseur + produit
- Création de vente avec validation stock côté frontend
- Historique complet avec filtres

### Clients (`customers/`)
- Liste avec recherche et KPIs (total, actifs, chiffre d'affaires)
- Création / édition : nom, adresse, téléphone, MF fiscal, CIN, plaque d'immatriculation
- Suppression avec confirmation

### Fournisseurs (`suppliers/`)
- Liste avec KPIs
- CRUD complet
- Vue détail avec historique achats

### Créer un document (`create-document/`)
- Stepper 3 étapes : Produits → Informations → Récapitulatif
- Mode **Facture** ou **Bon de Livraison** (toggle)
- Calcul TVA (19%) optionnel
- Champ dépôt / acompte → calcul Net à Régler
- Génération et émission directe depuis le formulaire

### Factures & BL (`invoices/`)
- Vue unifiée avec onglets **Factures** / **Bons de Livraison**
- KPIs : total, montant total, total dû, payées, impayées
- Drawer latéral avec prévisualisation HTML temps réel (iframe → `/api/invoices/preview/{id}`)
- Actions : télécharger PDF, envoyer par email, encaisser
- Filtres : numéro, client, statut, plage de dates

### Profil (`profile/`)
- Affichage des informations de l'utilisateur connecté
- Modification du mot de passe

## Structure des dossiers

```
frontend/src/app/
├── components/
│   ├── auth/               # login, forgot-password, reset-password
│   ├── create-document/    # création facture / BL (stepper)
│   ├── customers/          # list, create, edit
│   ├── dashboard/          # tableau de bord
│   ├── delivery-notes/     # liste BL (standalone, redirigé)
│   ├── invoices/           # liste unifiée factures + BL + drawer
│   ├── products/           # liste produits
│   ├── profile/            # profil utilisateur
│   ├── shared/             # composants partagés (navbar, sidebar)
│   ├── stock-movement/     # historique mouvements
│   ├── suppliers/          # list, create, edit, detail
│   └── transactions/       # achats + ventes
├── services/
│   ├── api.service.ts      # appels HTTP vers le backend
│   └── auth.guard.ts       # protection des routes JWT
├── app.routes.ts
├── app.component.ts        # shell avec sidebar
└── environments/
    ├── environment.ts
    └── environment.prod.ts
```

## Configuration API

L'URL du backend est définie dans `environments/environment.ts` :

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

En développement, le proxy Angular (`proxy.conf.json`) route `/api` vers `http://localhost:8080`.

## Démarrage

```bash
cd frontend
npm install
npm start          # http://localhost:4200
npm run build      # build de production → dist/
```

## Déploiement

Production sur **Vercel** : `https://bhouri-stock.com`

```bash
npm run build
# dist/ déployé sur Vercel (ou tout serveur statique / nginx)
```

---

**Version** : 1.0.0 | **Angular** : 17.3.10 | **TypeScript** : 5.2.2 | **Node** : 18+
