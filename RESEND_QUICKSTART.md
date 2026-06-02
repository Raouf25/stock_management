# 🚀 Démarrage rapide — Resend Email

## Configuration en 5 minutes

### 1️⃣ Créer un compte Resend

1. Allez sur **https://resend.com**
2. Cliquez **"Get Started"**
3. Inscrivez-vous avec votre email pro
4. Vérifiez votre email

⏱️ **Temps** : 2 minutes

---

### 2️⃣ Obtenir votre clé API

1. Une fois connecté, allez dans **"API Keys"** (menu gauche)
2. Cliquez **"Create API Key"**
3. Nom : `Bhouri Stock - Development`
4. Permission : **"Sending access"** ✅
5. Cliquez **"Create"**
6. **COPIEZ la clé** (commence par `re_`) — elle ne sera plus affichée

```bash
# Exemple de clé
re_AbCdEfGh123456789_xxxxxxxxxxxxxxxxx
```

⏱️ **Temps** : 1 minute

---

### 3️⃣ Configurer le projet

#### Option A : Variable d'environnement (recommandé)

```bash
# Terminal macOS/Linux
export RESEND_API_KEY="re_votre_cle_ici"

# Terminal Windows PowerShell
$env:RESEND_API_KEY="re_votre_cle_ici"
```

#### Option B : Fichier .env

```bash
# À la racine du projet
cp .env.example .env

# Éditez .env et remplacez :
RESEND_API_KEY=re_votre_cle_ici
```

⏱️ **Temps** : 30 secondes

---

### 4️⃣ Démarrer le backend

```bash
cd /Users/raouf/Projects/stock_management

# Vérifier que la clé est définie
echo $RESEND_API_KEY

# Démarrer
./mvnw -f backend/pom.xml spring-boot:run
```

**Logs attendus** :
```
Started StockManagementApplication in 5.432 seconds
```

⏱️ **Temps** : 1 minute

---

### 5️⃣ Tester l'envoi d'email

#### Test 1 : Reset password

```bash
curl -X POST http://localhost:8080/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Logs backend** :
```
════════════════════════════════════════════════════════
📨 Envoi email de réinitialisation via Resend
📧 Destinataire : test@example.com
🔗 Lien : http://localhost:4200/reset-password?token=...
════════════════════════════════════════════════════════
✅ Email envoyé avec succès via Resend à test@example.com (id=abc123)
```

#### Test 2 : Facture PDF (via UI)

1. Démarrer le frontend :
   ```bash
   cd frontend
   npm start
   ```

2. Ouvrir http://localhost:4200

3. Se connecter

4. Créer une facture

5. Cliquer **"Envoyer par email"**

6. Vérifier les logs backend :
   ```
   ════════════════════════════════════════════════════════
   📧 Envoi email via Resend avec PDF
   📧 Destinataire : client@example.com
   📎 Pièce jointe : facture_001.pdf (45678 bytes)
   ════════════════════════════════════════════════════════
   ✅ Email avec PDF envoyé avec succès (id=xyz789)
   ```

7. **Vérifier votre boîte email** 📬

⏱️ **Temps** : 1 minute

---

## ✅ Vérification finale

### Dashboard Resend

1. Allez sur **https://resend.com/emails**
2. Vous devriez voir vos emails envoyés
3. Cliquez sur un email pour voir :
   - Status : `delivered` ✅
   - Timestamp
   - Destinataire
   - Attachments (si PDF)

### Logs backend

Vérifiez que vous voyez :
```
✅ Email envoyé avec succès via Resend à ... (id=...)
```

**Si vous voyez ❌** → Vérifier :
- Clé API correcte (`echo $RESEND_API_KEY`)
- Internet disponible
- Firewall n'bloque pas api.resend.com

---

## 🎓 Prochaines étapes

### Pour le développement
- ✅ Utiliser `onboarding@resend.dev` comme email "from" (free tier)
- ✅ Tester tous les scénarios d'email
- ✅ Monitorer le Dashboard Resend

### Pour la production
1. **Vérifier un domaine custom** (recommandé)
   - Dashboard Resend → Domains → Add Domain
   - Votre domaine : `votredomaine.com`
   - Configurer DNS : SPF + DKIM + DMARC (guide fourni par Resend)
   - Attendre validation (~10 min)

2. **Générer une clé API de production**
   - Nom : `Bhouri Stock - Production`
   - Permission : "Sending access"
   - **Stocker en secret sécurisé** (jamais dans le code)

3. **Configurer variables prod**
   ```bash
   RESEND_API_KEY=re_live_xxxxxxxxxxxxxxxxx
   RESEND_FROM_EMAIL=noreply@votredomaine.com
   RESEND_FROM_NAME=Bhouri Stock
   ```

4. **Activer monitoring**
   - Alertes si bounce rate > 5%
   - Webhooks pour tracking delivery

---

## 🆘 Troubleshooting

### Erreur : "403 Forbidden"
**Cause** : Clé API invalide ou révoquée  
**Solution** : Regénérer une nouvelle clé sur https://resend.com/api-keys

### Erreur : "422 Unprocessable Entity"
**Cause** : Email "from" non vérifié (domaine custom)  
**Solution** : Utiliser `onboarding@resend.dev` ou vérifier votre domaine

### Email non reçu
**Cause** : Email en spam ou bounce  
**Solution** : 
1. Vérifier Dashboard Resend → Recent Activity
2. Vérifier dossier Spam
3. Tester avec un autre email

### Variable RESEND_API_KEY non trouvée
**Cause** : Variable non exportée  
**Solution** :
```bash
# Vérifier
echo $RESEND_API_KEY

# Si vide, exporter
export RESEND_API_KEY="re_votre_cle"
```

---

## 📊 Limites plan Free

- **3,000 emails/mois** (100/jour)
- **1 domaine vérifié**
- **40 MB par email** (attachments inclus)
- Support community

**Largement suffisant pour le développement et petites productions** ✅

Si besoin de plus : Plan Pro $20/mois (50,000 emails)

---

## 📚 Ressources

- **Dashboard** : https://resend.com
- **Documentation** : https://resend.com/docs
- **Status** : https://status.resend.com
- **Support** : support@resend.com

---

**Configuration terminée !** 🎉  
Vous êtes prêt à envoyer des emails professionnels avec Resend.

