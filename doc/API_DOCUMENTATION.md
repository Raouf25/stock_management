# Documentation API — Stock Management

Base URL locale : `http://localhost:8080/api`
Base URL production : `https://stockmanagement-production-29ae.up.railway.app/api`

Swagger interactif : `http://localhost:8080/swagger-ui.html`

## Authentification

Toutes les routes sauf `/api/auth/**` exigent un header JWT :
```
Authorization: Bearer <token>
```

### POST `/api/auth/register`
Créer un compte.
```json
{
  "email": "user@example.com",
  "password": "motdepasse"
}
```
Réponse `200` : `{ "token": "eyJ..." }`

### POST `/api/auth/login`
Connexion.
```json
{
  "email": "user@example.com",
  "password": "motdepasse"
}
```
Réponse `200` : `{ "token": "eyJ..." }`

### POST `/api/auth/forgot-password`
Demande de réinitialisation — envoie un email via Resend.
```json
{ "email": "user@example.com" }
```

### POST `/api/auth/reset-password`
Réinitialiser le mot de passe avec le token reçu par email.
```json
{
  "token": "uuid-du-token",
  "newPassword": "nouveauMotDePasse"
}
```

### GET `/api/auth/validate-reset-token?token=<uuid>`
Valider qu'un token de reset est encore actif.

---

## Produits

### GET `/api/products`
Liste complète de tous les produits.

Réponse `200` :
```json
[
  {
    "idProduct": 1,
    "name": "CHAUX ANTIK",
    "reference": "91014419",
    "gamme": "PEINTURE",
    "initialStockQuantity": 100,
    "initialUnitPrice": 15.500,
    "currentStockQuantity": 45,
    "currentStockValue": 837.000,
    "cmp": 18.600,
    "supplierId": 1
  }
]
```

### GET `/api/products/dashboard`
Vue enrichie pour le dashboard (stocks, KPIs, alertes).

### GET `/api/products/{id}`
Détail d'un produit.

### GET `/api/products/{id}/stock`
Stock actuel (quantité + valeur + CMP).

### GET `/api/products/{id}/vendus`
Quantité totale vendue depuis l'origine.

### POST `/api/products`
Créer un produit.
```json
{
  "name": "VALPRIMER",
  "reference": "REF-001",
  "gamme": "PEINTURE",
  "initialStockQuantity": 200,
  "initialUnitPrice": 12.500,
  "supplierId": 1
}
```

### PUT `/api/products/{id}`
Modifier un produit (même corps que le POST).

### DELETE `/api/products/{id}`
Supprimer un produit.

---

## Achats

### GET `/api/purchases`
Liste de tous les achats.

### GET `/api/purchases/{id}`
Détail d'un achat.

### GET `/api/purchases/search?dateFrom=&dateTo=&supplierId=&productId=`
Recherche filtrée.

### GET `/api/purchases/product/{productId}`
Achats d'un produit spécifique.

### POST `/api/purchases`
Créer un achat. Déclenche automatiquement un mouvement ENTREE et recalcule le CMP.
```json
{
  "productId": 1,
  "supplierId": 1,
  "quantity": 50,
  "unitPriceTTC": 18.260,
  "invoiceNumber": "BL-2026-001",
  "datePurchase": "2026-06-27T09:00:00",
  "comment": "Achat trimestriel"
}
```

---

## Ventes

### GET `/api/sales`
Liste de toutes les ventes.

### GET `/api/sales/combined`
Vue combinée enrichie pour dashboard et graphiques (inclut KPIs agrégés).

### GET `/api/sales/{id}`
Détail d'une vente.

### GET `/api/sales/search?dateFrom=&dateTo=&customerId=&productId=`
Recherche filtrée.

### GET `/api/sales/product/{productId}`
Ventes d'un produit.

### POST `/api/sales`
Créer une vente. Valide le stock disponible, génère un mouvement SORTIE.
```json
{
  "productId": 1,
  "customerId": 5,
  "quantitySold": 6,
  "unitSalePrice": 18.260,
  "dateSale": "2026-06-27T10:00:00"
}
```
Erreur `400` si stock insuffisant.

---

## Factures

### GET `/api/bills`
Liste des factures avec statut de paiement.

Réponse :
```json
[
  {
    "billId": 13,
    "billNumber": "FAC-0013",
    "clientName": "Devis Travaux Express",
    "dateBill": "2026-06-27",
    "totalHT": 109.560,
    "tva": 20.816,
    "totalTTC": 130.376,
    "paymentStatus": "UNPAID",
    "paymentTerms": "30 jours"
  }
]
```

### GET `/api/bills/{id}`
Détail complet d'une facture (client, livreur, lignes produits, totaux).

### GET `/api/bills/kpis`
KPIs : total factures, montant total, total dû, nombre payées/impayées.

### GET `/api/bills/generate/{id}`
Télécharger la facture en PDF (Playwright → Chromium).

Header réponse : `Content-Disposition: attachment; filename="FAC-0013.pdf"`

### POST `/api/bills/create`
Créer une facture.
```json
{
  "customerId": 5,
  "deliveryUserId": 2,
  "applyTva": true,
  "deposit": 0,
  "paymentTerms": "30 jours",
  "products": [
    { "productId": 1, "quantity": 6, "unitPrice": 18.260, "discount": 0 }
  ]
}
```

### POST `/api/bills/{id}/send-email`
Envoyer la facture par email au client (via Resend).

### POST `/api/bills/{id}/register-payment`
Enregistrer un paiement.
```json
{
  "amount": 130.376,
  "method": "Virement"
}
```

---

## Prévisualisation

### GET `/api/invoices/preview/{billId}`
Retourne le HTML de la facture rendu par Thymeleaf (template `facture_v3`).
Utilisé par l'iframe Angular pour la prévisualisation temps réel.

---

## Stock

### GET `/api/stock/summary`
Résumé global (tous les produits) : quantités, valeurs, CMP.

### GET `/api/stock/summary/{productId}`
Résumé pour un produit spécifique.

### GET `/api/stock/alerts?threshold=10`
Produits dont le stock est inférieur au seuil (défaut : 10).

### GET `/api/stock/total-value`
Valeur totale du stock en DNT.

### POST `/api/stock/recalculate-cmp`
Recalcule le CMP de tous les produits depuis l'historique des mouvements.

---

## Clients

### GET `/api/customers`
Liste des clients.

### GET `/api/customers/search?q=nom`
Recherche par nom ou ville.

### GET `/api/customers/kpis`
KPIs : total clients, actifs, chiffre d'affaires total.

### GET `/api/customers/{id}`
Détail d'un client.

### POST `/api/customers`
Créer un client.
```json
{
  "name": "Devis Travaux Express",
  "address": "159 Boulevard Artisanal, Kairouan",
  "phone": "+216 77 777 777",
  "taxId": "159753486/G/M/000",
  "cin": "07890123",
  "licensePlate": "7890 تونس 789"
}
```

### PUT `/api/customers/{id}`
Modifier un client.

### DELETE `/api/customers/{id}`
Supprimer un client.

---

## Fournisseurs

### GET `/api/suppliers`
Liste des fournisseurs.

### GET `/api/suppliers/kpis`
KPIs fournisseurs.

### GET `/api/suppliers/{id}`
Détail d'un fournisseur.

### POST `/api/suppliers`
Créer un fournisseur.
```json
{
  "name": "VALDECO",
  "address": "Zone Industrielle, Sfax",
  "phone": "+216 74 000 000",
  "email": "contact@valdeco.tn",
  "taxId": "123456789"
}
```

### PUT `/api/suppliers/{id}`
Modifier un fournisseur.

### DELETE `/api/suppliers/{id}`
Supprimer un fournisseur.

---

## Codes d'erreur

| Code | Signification                                            |
|------|----------------------------------------------------------|
| 400  | Données invalides (stock insuffisant, champ manquant…)  |
| 401  | Token JWT manquant ou expiré                            |
| 403  | Accès refusé                                            |
| 404  | Ressource introuvable                                   |
| 500  | Erreur serveur interne                                  |

Format d'erreur standard :
```json
{
  "timestamp": "2026-06-27T10:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Quantité insuffisante en stock. Stock disponible : 3"
}
```
