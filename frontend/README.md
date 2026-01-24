# 📱 Stock Management Frontend - Angular

Interface web moderne pour visualiser et gérer toutes les fonctionnalités de l'API de gestion de stock.

## 🎯 Fonctionnalités

### 📊 Dashboard
- Résumé global du stock
- Valeur totale de l'inventaire
- Alertes de stock faible
- Tableau récapitulatif par produit

### 📦 Gestion des Produits
- Liste complète des produits
- Recherche en temps réel
- Affichage du CMP (Coût Moyen Pondéré)
- Suivi des valeurs initiales et actuelles

### 🛒 Gestion des Achats
- Création de nouveaux achats
- Suivi des fournisseurs
- Historique des factures
- Montants TTC calculés automatiquement

### 💰 Gestion des Ventes
- Enregistrement des ventes
- Validation du stock disponible
- Suivi des montants de vente
- Historique complet

### 📊 Mouvements de Stock
- Vue d'ensemble des mouvements (entrées/sorties)
- Filtrage par type (ENTREE/SORTIE)
- Filtrage par source (ACHAT/VENTE/AJUSTEMENT)
- Traçabilité complète

### 🧧 Gestion des Factures
- Liste des factures avec filtres avancés
- Recherche par numéro, client, montant
- Filtrage par plage de dates
- Tri par date ou montant (croissant/décroissant)
- Téléchargement PDF conforme législation tunisienne
- Affichage des statuts (PAID, UNPAID, PARTIAL)
- Totaux et reste à encaisser

## 🚀 Installation

### Prérequis
- Node.js 18+ avec npm
- Angular CLI 17+
- Backend API en cours d'exécution sur `http://localhost:8080`

### Installation des dépendances

```bash
cd frontend
npm install
```

## 💻 Développement

### Lancer en mode développement
```bash
npm start
```
L'application s'ouvre automatiquement à `http://localhost:4200`

### Compilation
```bash
npm run build
```

### Tests
```bash
npm test
```

## 🌐 Configuration API

Modifier `src/proxy.conf.json` pour changer l'URL de l'API :

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

## 📁 Structure des Dossiers

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── dashboard/         # Tableau de bord principal
│   │   │   ├── products/          # Gestion des produits
│   │   │   ├── purchases/         # Gestion des achats
│   │   │   ├── sales/             # Gestion des ventes
│   │   │   └── stock-movement/    # Mouvements de stock
│   │   ├── services/
│   │   │   └── api.service.ts     # Service d'appel API
│   │   ├── app.routes.ts          # Routes de l'application
│   │   ├── app.component.ts       # Composant principal
│   │   └── app.component.html
│   ├── styles.css                 # Styles globaux
│   ├── main.ts                    # Point d'entrée
│   └── index.html
├── angular.json                   # Configuration Angular
├── tsconfig.json                  # Configuration TypeScript
└── package.json
```

## 🎨 Technologie

- **Framework** : Angular 17 (Standalone Components)
- **Styling** : Bootstrap 5 + CSS personnalisé
- **HTTP** : HttpClient avec RxJS
- **Charting** : Chart.js (optionnel pour graphiques)
- **TypeScript** : Dernière version

## 🌟 Fonctionnalités principales

### 1. Affichage du Dashboard
```
- Carte de statistiques (KPI)
- Alertes de stock faible
- Tableau récapitulatif complet
```

### 2. Gestion des Produits
```
- Recherche dynamique
- Affichage du CMP
- Suivi des valeurs
- Filtrage smart
```

### 3. Transactions (Achats/Ventes)
```
- Formulaire intuitif
- Validation côté client
- Intégration automatique stock
- Historique complet
```

### 4. Traçabilité
```
- Tous les mouvements enregistrés
- Filtrage par type et source
- Dates et références
- Export possible
```

## 📡 API Endpoints Utilisés

Le frontend appelle ces endpoints du backend :

```
GET    /api/products                      # Liste des produits
GET    /api/stock/summary                 # Résumé du stock
GET    /api/stock/total-value             # Valeur totale
GET    /api/stock/alerts?threshold=10     # Alertes
GET    /api/purchases                     # Liste des achats
POST   /api/purchases                     # Créer achat
GET    /api/sales                         # Liste des ventes
POST   /api/sales                         # Créer vente
GET    /api/stock-movements               # Mouvements
GET    /api/suppliers                     # Fournisseurs
GET    /api/customers                     # Clients
```

## 🔐 CORS

L'API backend doit avoir CORS configuré pour accepter les requêtes du frontend :

```java
// Voir CorsConfig.java dans le backend
@CrossOrigin(origins = "http://localhost:4200")
```

## 📦 Déploiement

### Production Build
```bash
npm run prod
```

### Serveur Static
```bash
ng serve --prod
```

### Docker (optionnel)
```dockerfile
FROM node:18 as builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🐛 Troubleshooting

### Port 4200 déjà utilisé
```bash
ng serve --port 4201
```

### CORS Error
Vérifier que le backend a CORS activé et que l'URL proxy est correcte

### Module not found
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📊 Exemples d'Utilisation

### Créer un achat
1. Aller à "Achats"
2. Cliquer "Nouveau Achat"
3. Sélectionner fournisseur et produit
4. Entrer quantité et prix
5. Cliquer "Créer Achat"

### Vérifier les alertes
1. Aller au Dashboard
2. Voir la section "Alertes"
3. Cliquer sur le produit pour plus de détails

## 🔄 Cycle de Vie

```
1. Chargement de l'app (main.ts)
2. Bootstrap du composant racine (AppComponent)
3. Routing vers Dashboard par défaut
4. ApiService appelle les endpoints
5. Composants affichent les données
```

## 📝 Notes

- Les données sont chargées dynamiquement à chaque navigation
- Les modifications prennent effet immédiatement après création
- Les formules CMP sont calculées côté backend
- L'interface est responsive (mobile-friendly)

## 💡 Prochaines Étapes

- [ ] Ajouter graphiques Dashboard
- [ ] Exporter PDF/Excel
- [ ] Pagination des tableaux
- [ ] Filtres avancés
- [ ] Authentification JWT
- [ ] Notifications push
- [ ] Mode hors-ligne

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2024  
**License** : MIT
