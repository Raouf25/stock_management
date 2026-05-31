# 🧪 Guide de test rapide — Nouveaux templates PDF

## ✅ Étapes de test

### 1️⃣ Démarrer le backend

```bash
cd /Users/raouf/Projects/stock_management
./mvnw -f backend/pom.xml spring-boot:run
```

**Ou avec Docker:**
```bash
docker compose up backend
```

### 2️⃣ Se connecter (obtenir un token JWT)

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Résultat attendu:**
```json
{
  "token": "eyJhbGc...",
  "type": "Bearer",
  "user": {...}
}
```

> 💡 **Copier le token** pour les prochaines requêtes

### 3️⃣ Lister les factures

```bash
TOKEN="VOTRE_TOKEN_ICI"

curl -X GET "http://localhost:8080/api/bills" \
  -H "Authorization: Bearer $TOKEN"
```

**Résultat:** Liste des factures avec leurs IDs

### 4️⃣ Générer et télécharger une facture PDF

```bash
BILL_ID=1  # Remplacer par un ID existant

curl -X GET "http://localhost:8080/api/bills/${BILL_ID}/pdf" \
  -H "Authorization: Bearer $TOKEN" \
  --output facture_test.pdf
```

**Résultat:** Fichier `facture_test.pdf` dans le dossier courant

### 5️⃣ Générer et télécharger un bon de livraison PDF

```bash
# Lister les bons de livraison
curl -X GET "http://localhost:8080/api/delivery-notes" \
  -H "Authorization: Bearer $TOKEN"

# Télécharger un BL
BL_ID=1  # Remplacer par un ID existant

curl -X GET "http://localhost:8080/api/delivery-notes/${BL_ID}/pdf" \
  -H "Authorization: Bearer $TOKEN" \
  --output bon_livraison_test.pdf
```

**Résultat:** Fichier `bon_livraison_test.pdf` dans le dossier courant

---

## 🎨 Vérifications visuelles

Ouvrir les PDFs et vérifier :

### ✅ Facture (`facture_test.pdf`)

- [ ] **Header avec gradient purple/indigo** (#667eea → #764ba2)
- [ ] **Icône 📄 avec effet glassmorphism** (cercle semi-transparent)
- [ ] **Badge "Stock ERP · Facturation"** en blanc avec letterspacing
- [ ] **Titre "Facture"** en grand, blanc et gras
- [ ] **Numéro de facture** bien visible
- [ ] **Tagline "Gestion intelligente de stock"** en bas du header
- [ ] **Section info** avec fond blanc et bordures purple clair
- [ ] **Tableau produits** avec header en gradient purple/indigo
- [ ] **Références produits** avec fond purple clair (#f8f7ff)
- [ ] **Totaux** avec bordure purple
- [ ] **Ligne "Net à payer"** avec fond gradient purple/indigo blanc
- [ ] **Footer "📦 Stock ERP"** avec branding et copyright

### ✅ Bon de livraison (`bon_livraison_test.pdf`)

- [ ] **Header avec gradient purple/indigo** (#667eea → #764ba2)
- [ ] **Icône 🚚 avec effet glassmorphism** (cercle semi-transparent)
- [ ] **Badge "Stock ERP · Livraison"** en blanc avec letterspacing
- [ ] **Titre "Bon de Livraison"** en grand, blanc et gras
- [ ] **Numéro BL** bien visible
- [ ] **Tagline "Gestion intelligente de stock"** en bas du header
- [ ] **Section info** avec fond blanc et bordures purple clair
- [ ] **Tableau produits** avec header en gradient purple/indigo
- [ ] **Références produits** avec fond purple clair (#f8f7ff)
- [ ] **Totaux** avec bordure purple
- [ ] **Ligne "Total"** avec fond gradient purple/indigo blanc
- [ ] **Notes** (si présentes) avec bordure purple à gauche
- [ ] **Footer "📦 Stock ERP"** avec branding et copyright

---

## 🎨 Comparaison avant/après

### **Avant (v2.2):**
- Facture : bleu basique (#2563eb)
- BL : vert basique (#16a34a)
- Design simple sans gradient
- Pas de branding unifié

### **Après (v3.0):**
- **Facture & BL : gradient purple/indigo** (#667eea → #764ba2) ✅
- **Design moderne avec glassmorphism** ✅
- **Branding "Stock ERP" unifié** ✅
- **Cohérence totale avec les emails** ✅

---

## 📧 Test d'envoi d'email avec PDF

```bash
# Envoyer une facture par email
curl -X POST "http://localhost:8080/api/bills/${BILL_ID}/send-email" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Envoyer un BL par email
curl -X POST "http://localhost:8080/api/delivery-notes/${BL_ID}/send-email" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Vérifier dans la boîte mail:**
- [ ] Email avec template moderne (gradient purple/indigo)
- [ ] PDF attaché avec le même style visuel
- [ ] Cohérence totale email + PDF

---

## 🐛 Debugging (en cas de problème)

### ❌ Erreur "PDF generation failed"

**Vérifier les logs:**
```bash
tail -f /Users/raouf/Projects/stock_management/backend/logs/stock_management.log
```

**Causes possibles:**
- Variables Thymeleaf manquantes
- Erreur Flying Saucer (CSS non supporté)
- Données manquantes (produits, client, etc.)

### ❌ PDF généré mais styles incorrects

**Vérifier:**
1. Cache du navigateur (vider le cache)
2. Version du PDF reader (tester avec Adobe Reader)
3. Logs Flying Saucer pour warnings CSS

### ❌ Templates non rechargés

**Rebuild complet:**
```bash
cd /Users/raouf/Projects/stock_management
./mvnw -f backend/pom.xml clean package -DskipTests
./mvnw -f backend/pom.xml spring-boot:run
```

---

## 🎯 Checklist complète

### Backend
- [ ] Backend démarré sans erreurs
- [ ] Connexion utilisateur réussie (token obtenu)
- [ ] Endpoints `/api/bills` et `/api/delivery-notes` accessibles

### PDFs
- [ ] Facture PDF téléchargée et ouverte
- [ ] Bon de livraison PDF téléchargé et ouvert
- [ ] Gradients purple/indigo visibles
- [ ] Icônes glassmorphism rendues
- [ ] Branding "Stock ERP" présent partout
- [ ] Tableaux bien formatés
- [ ] Footer complet avec copyright

### Emails
- [ ] Email de facture envoyé
- [ ] Email de BL envoyé
- [ ] PDFs attachés corrects
- [ ] Cohérence visuelle email + PDF

---

## 📊 Résultat attendu

**Avant:**
```
┌─────────────────────┐
│  Email moderne      │ ← Gradient purple/indigo ✅
│  (purple/indigo)    │
└─────────────────────┘
         vs
┌─────────────────────┐
│  PDF basique bleu   │ ← Bleu basique ❌
│  ou vert            │
└─────────────────────┘
```

**Après:**
```
┌─────────────────────┐
│  Email moderne      │ ← Gradient purple/indigo ✅
│  (purple/indigo)    │
└─────────────────────┘
         +
┌─────────────────────┐
│  PDF moderne        │ ← Gradient purple/indigo ✅
│  (purple/indigo)    │ ← MÊME STYLE !
└─────────────────────┘
```

---

## 🎉 Succès !

Si tous les tests passent, vous avez maintenant :

✅ **Identité visuelle unifiée** — Emails + PDFs cohérents  
✅ **Design moderne** — Gradient purple/indigo + glassmorphism  
✅ **Branding professionnel** — "Stock ERP" partout  
✅ **Expérience utilisateur premium** 🚀

---

**Questions/Problèmes ?**
Consulter `PDF_TEMPLATES_UPGRADE_REPORT.md` pour plus de détails.

