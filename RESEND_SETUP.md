# Configuration Resend — Emails de réinitialisation de mot de passe

## 📧 Vue d'ensemble

Le système utilise **Resend** (API HTTP) pour envoyer des emails de réinitialisation de mot de passe.
L'implémentation remplace SMTP (Gmail) par un appel REST direct à l'API Resend.

---

## 🚀 Configuration rapide

### 1. Créer un compte Resend

1. Allez sur [resend.com](https://resend.com) et créez un compte gratuit
2. Vérifiez votre email

### 2. Obtenir votre clé API

1. Tableau de bord Resend → **API Keys**
2. Cliquez sur **"Create API Key"**
3. Nom : `Bhouri Stock - Password Reset`
4. Permission : `Sending access`
5. Copiez la clé : `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 3. (Optionnel) Configurer un domaine

**Pour la production :**
1. **Domains** → **Add Domain**
2. Entrez votre domaine (ex: `stockerp.com`)
3. Ajoutez les enregistrements DNS (SPF, DKIM, DMARC)
4. Attendez la vérification (quelques minutes)

**Pour les tests (FREE) :**
- Utilisez `onboarding@resend.dev` (domaine partagé)
- Limite : 100 emails/jour
- Visible comme "sent via Resend"

---

## ⚙️ Variables d'environnement

### Backend (`application.properties`)

```properties
# Clé API Resend (obligatoire)
resend.api-key=${RESEND_API_KEY:re_test_placeholder}

# Email expéditeur (domaine vérifié ou onboarding@resend.dev)
resend.from-email=${RESEND_FROM_EMAIL:onboarding@resend.dev}

# Nom affiché dans l'email
resend.from-name=${RESEND_FROM_NAME:Bhouri Stock}
```

### Injection en production

**Docker Compose :**
```yaml
services:
  backend:
    environment:
      RESEND_API_KEY: re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      RESEND_FROM_EMAIL: noreply@votredomaine.com
      RESEND_FROM_NAME: Bhouri Stock
```

**Kubernetes Secret :**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: resend-credentials
stringData:
  api-key: re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Variable d'environnement shell :**
```bash
export RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
./mvnw spring-boot:run
```

---

## 📂 Code implémenté

### Backend

**`PasswordResetEmailService.java`**
```java
@Service
public class PasswordResetEmailService {
    @Value("${resend.api-key}") private String resendApiKey;
    
    @Async
    public void sendResetEmail(String to, String userName, String resetLink) {
        // Appel HTTP POST https://api.resend.com/emails
        // Header: Authorization: Bearer {resendApiKey}
        // Body: { from, to, subject, html }
    }
}
```

**Template email HTML :**
- Design responsive (table-based pour compatibilité email)
- Gradient indigo/violet cohérent avec l'UI
- Bouton CTA + lien de secours
- Avertissement d'expiration (1h)
- Footer © 2026

### Frontend

**Pages redesignées (two-panel layout) :**
1. **`login.component.ts`** — Connexion / Inscription
2. **`forgot-password.component.ts`** — Demande de réinitialisation
3. **`reset-password.component.ts`** — Nouveau mot de passe

**Fonctionnalités :**
- Left panel : branding + features/tips
- Right panel : formulaire centré
- Password strength meter (Faible/Moyen/Fort)
- Real-time match indicator
- Badge "Envoyé via Resend" dans l'état succès
- Animations (slideUp, popIn, float)

---

## 🧪 Test en local

### Backend

1. Démarrer le backend :
   ```bash
   cd backend
   RESEND_API_KEY="re_your_test_key" ./mvnw spring-boot:run
   ```

2. Déclencher un reset via Postman :
   ```bash
   curl -X POST http://localhost:8080/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

3. **Logs** :
   ```
   ════════════════════════════════════════════════════════
   📨 Envoi email de réinitialisation via Resend
   📧 Destinataire : test@example.com
   🔗 Lien         : http://localhost:4200/reset-password?token=...
   ════════════════════════════════════════════════════════
   ✅ Email envoyé avec succès via Resend à test@example.com (id=abc123)
   ```

### Frontend

1. Lancer Angular :
   ```bash
   cd frontend
   npm start
   ```

2. Tester le flux complet :
   - `http://localhost:4200/login` → clic "Mot de passe oublié ?"
   - Entrer un email → "Envoyer le lien"
   - Vérifier la boîte de réception (ou logs backend si mode test)
   - Cliquer sur le lien dans l'email
   - Définir un nouveau mot de passe
   - Se connecter

---

## 📊 Limites & Tarifs Resend

| Plan       | Prix         | Emails/mois | Domaines | Support    |
|------------|--------------|-------------|----------|------------|
| **Free**   | $0           | 3,000       | 1        | Community  |
| **Pro**    | $20/mois     | 50,000      | 10       | Email      |
| **Business** | Custom     | Illimité    | Illimité | Phone/Slack|

**Pour Bhouri Stock (production moyenne) :**
- ~100 resets/mois → **Plan Free** suffisant
- Si > 3000 resets/mois → **Plan Pro** recommandé

---

## 🛡️ Sécurité

### Bonnes pratiques appliquées

✅ **Anti-enumeration** : Réponse identique que l'email existe ou non  
✅ **Token unique** : UUID v4 généré par `java.util.UUID`  
✅ **Expiration** : 1 heure (configurable dans `PasswordResetToken.java`)  
✅ **Usage unique** : Token marqué `used=true` après reset  
✅ **Async** : Envoi email en arrière-plan (`@Async`)  
✅ **Logs** : Pas d'exposition du token en clair (sauf dev)  

### Protection supplémentaire (optionnel)

- **Rate limiting** : Limiter à 3 demandes/heure par IP (Spring Bucket4j)
- **CAPTCHA** : Google reCAPTCHA v3 sur le formulaire forgot-password
- **2FA** : TOTP (Google Authenticator) pour les comptes sensibles

---

## 🔍 Debugging

### Email non reçu

1. **Vérifier les logs backend** :
   ```bash
   tail -f backend/logs/stock_management.log | grep Resend
   ```

2. **Tester la clé API** :
   ```bash
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer re_your_key" \
     -H "Content-Type: application/json" \
     -d '{
       "from": "onboarding@resend.dev",
       "to": "votre@email.com",
       "subject": "Test",
       "html": "<p>Hello World</p>"
     }'
   ```

3. **Vérifier le Dashboard Resend** :
   - Logs → Recent Activity
   - Voir status : `delivered` / `bounced` / `complained`

### Erreur 403 Forbidden

→ Clé API invalide ou révoquée  
→ Regénérer une nouvelle clé API

### Erreur 422 Unprocessable Entity

→ Email `from` non vérifié (domaine custom non validé)  
→ Utiliser `onboarding@resend.dev` en test

---

## 📖 Documentation officielle

- **API Reference** : https://resend.com/docs/api-reference/emails/send-email
- **Dashboard** : https://resend.com/emails
- **Status** : https://status.resend.com

---

## ✅ Checklist déploiement production

- [ ] Créer un compte Resend
- [ ] Générer une clé API prod (permissions `Sending access`)
- [ ] Ajouter et vérifier le domaine (DNS SPF/DKIM/DMARC)
- [ ] Configurer `RESEND_API_KEY` en secret (Docker/K8s)
- [ ] Configurer `RESEND_FROM_EMAIL` avec le domaine vérifié
- [ ] Tester un email de reset en staging
- [ ] Monitorer les logs Resend après déploiement
- [ ] Configurer des alertes (bounce rate > 5%)

---

**Implémentation finalisée le 31 mai 2026**  
*Stack : Spring Boot 3.3.7 + Resend API + Angular 17*

