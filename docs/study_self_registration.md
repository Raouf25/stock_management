# Étude — Inscription libre (Self-service Registration) · Bhouri Stock

> **Date :** 2026-06-30  
> **Stack :** Angular 17 · Spring Boot 3.3.7 · PostgreSQL 15 · Resend API (emails)

---

## 1. État actuel — Ce qui existe déjà

L'inscription est **largement implémentée**. Audit du code existant :

### Backend ✅

| Élément | Fichier | État |
|---------|---------|------|
| `POST /api/auth/register` | `AuthController.java` | ✅ Opérationnel |
| `AuthService.register()` | `AuthService.java` | ✅ Email unique, hash BCrypt, JWT |
| `RegisterRequest` DTO | `dto/auth/RegisterRequest.java` | ✅ Validation `@NotBlank`, `@Email`, `@Size(min=6)` |
| Route publique | `SecurityConfig.java` | ✅ `/api/auth/**` → `permitAll()` |
| Infrastructure email | `EmailService.java` + `PasswordResetEmailService.java` | ✅ Resend API opérationnelle |
| Template email HTML | `EmailTemplateService.java` | ✅ Thymeleaf (templates reset-password, factures, BL) |

### Frontend ✅

| Élément | Fichier | État |
|---------|---------|------|
| Onglet "Inscription" | `login.component.ts` | ✅ Tab register dans la page login |
| Formulaire nom/email/mdp | `login.component.ts` | ✅ `onRegister()` → `POST /api/auth/register` |
| Indicateur force mot de passe | `login.component.ts` | ✅ Barre visuelle (faible/moyen/fort) |
| Vérification confirmation mdp | `login.component.ts` | ✅ Comparaison temps réel |

---

## 2. Ce qui manque — Gaps identifiés

### Gap 1 — Email de bienvenue (Faible effort)
`AuthService.register()` crée l'utilisateur mais n'envoie **aucun email**. L'infrastructure Resend et le `EmailTemplateService` existent, il manque uniquement :
- Un template Thymeleaf `welcome-email.html`
- Un appel `emailService.sendWelcomeEmail()` dans `AuthService.register()`

### Gap 2 — Vérification d'email (Moyen effort)
Aucun mécanisme de confirmation : un utilisateur peut s'inscrire avec n'importe quelle adresse email sans la posséder. Deux approches possibles :

| Approche | Effort | UX | Recommandation |
|----------|--------|-----|----------------|
| **Vérification optionnelle** — compte actif immédiatement, email de confirmation envoyé, badge "non vérifié" visible | Faible | ⭐⭐⭐ | ✅ Recommandé |
| **Vérification obligatoire** — compte bloqué jusqu'à clic sur le lien | Moyen | ⭐⭐ | Pour v2 |

### Gap 3 — Rate limiting sur `/api/auth/register` (Faible effort)
`LoginRateLimitFilter` protège uniquement `/api/auth/login`. L'endpoint `/api/auth/register` est exposé sans limite de débit : un bot peut créer des milliers de comptes.

### Gap 4 — Politique de mot de passe (Faible effort)
`RegisterRequest` n'impose que `@Size(min=6)`. Il n'y a pas de règle de complexité côté backend. L'indicateur visuel frontend n'est pas bloquant.

### Gap 5 — Acceptation des CGU (Faible effort, UI seulement)
Pas de case à cocher "J'accepte les conditions générales". Nécessaire pour la conformité RGPD.

### Gap 6 — Protection anti-bot (Optionnel)
Aucun CAPTCHA ou honeypot. À évaluer selon l'exposition publique de l'app.

---

## 3. Plan d'implémentation

### 3.1 Backend

#### a) Email de bienvenue

**Nouveau template** `src/main/resources/templates/email/welcome-email.html` :
```html
<!-- Reprendre le style du template reset-password existant -->
<h2>Bienvenue sur Bhouri Stock, [[${userName}]] !</h2>
<p>Votre compte a été créé avec succès.</p>
<a href="[[${dashboardUrl}]]">Accéder à mon espace</a>
```

**Dans `EmailTemplateService.java`** :
```java
public String renderWelcomeEmail(String userName, String dashboardUrl) {
    Context ctx = new Context();
    ctx.setVariable("userName", userName);
    ctx.setVariable("dashboardUrl", dashboardUrl);
    return templateEngine.process("email/welcome-email", ctx);
}
```

**Dans `EmailService.java`** :
```java
@Async
public void sendWelcomeEmail(String to, String userName) {
    String html = emailTemplateService.renderWelcomeEmail(userName, frontendUrl + "/dashboard");
    sendSimpleEmail(to, "Bienvenue sur Bhouri Stock !", html);
}
```

**Dans `AuthService.register()`** — une seule ligne à ajouter :
```java
user = userRepository.save(user);
emailService.sendWelcomeEmail(user.getEmail(), user.getName());  // ← ajout
log.info("Nouvel utilisateur inscrit: {}", user.getEmail());
```

#### b) Vérification d'email (approche optionnelle recommandée)

**Migration V20** :
```sql
ALTER TABLE users
    ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN email_verification_token VARCHAR(255),
    ADD COLUMN email_verification_expires_at TIMESTAMP;

CREATE INDEX idx_users_email_verification_token ON users(email_verification_token);
```

**Nouveau endpoint** :
```java
// AuthController.java
@GetMapping("/verify-email")
public ResponseEntity<AuthResponse> verifyEmail(@RequestParam String token) {
    return ResponseEntity.ok(authService.verifyEmail(token));
}
```

**Dans `AuthService.java`** :
```java
@Transactional
public AuthResponse register(RegisterRequest request) {
    // ... code existant ...
    
    // Générer token de vérification (UUID, expire dans 48h)
    String verificationToken = UUID.randomUUID().toString();
    user.setEmailVerificationToken(verificationToken);
    user.setEmailVerificationExpiresAt(LocalDateTime.now().plusHours(48));
    user = userRepository.save(user);
    
    // Envoyer email avec lien de vérification
    String verifyLink = frontendUrl + "/verify-email?token=" + verificationToken;
    emailService.sendWelcomeEmailWithVerification(user.getEmail(), user.getName(), verifyLink);
    
    return buildAuthResponse("Inscription réussie", user);
}

@Transactional
public AuthResponse verifyEmail(String token) {
    User user = userRepository.findByEmailVerificationToken(token).orElse(null);
    if (user == null || user.getEmailVerificationExpiresAt().isBefore(LocalDateTime.now())) {
        return AuthResponse.error("Lien de vérification invalide ou expiré");
    }
    user.setEmailVerified(true);
    user.setEmailVerificationToken(null);
    user.setEmailVerificationExpiresAt(null);
    userRepository.save(user);
    return AuthResponse.success("Email vérifié avec succès");
}
```

#### c) Rate limiting sur `/api/auth/register`

Étendre `LoginRateLimitFilter` ou créer `RegisterRateLimitFilter` :
```java
// Même pattern que LoginRateLimitFilter — par IP, max 5 inscriptions/heure
private static final int MAX_REGISTER_PER_HOUR = 5;
// Utiliser ConcurrentHashMap<String, RateLimitEntry> (existant dans LoginRateLimitFilter)
```

Ajouter dans `SecurityConfig.java` :
```java
.addFilterBefore(registerRateLimitFilter, UsernamePasswordAuthenticationFilter.class)
```

#### d) Politique de mot de passe

Dans `RegisterRequest.java`, renforcer la validation :
```java
@NotBlank
@Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
@Pattern(
    regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
    message = "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"
)
private String password;
```

---

### 3.2 Frontend

#### a) Ajout de la case CGU

Dans `login.component.ts`, formulaire register, ajouter avant le bouton submit :
```html
<div class="field-group">
  <label class="checkbox-label">
    <input type="checkbox" [(ngModel)]="acceptedTerms" name="acceptedTerms" required />
    J'accepte les <a href="/terms" target="_blank">conditions générales d'utilisation</a>
  </label>
</div>
```

Bloquer `onRegister()` si `!acceptedTerms`.

#### b) Page de confirmation `/verify-email`

Nouveau composant `verify-email.component.ts` :
- Lit le paramètre `?token=` depuis l'URL
- Appelle `GET /api/auth/verify-email?token=xxx`
- Affiche : ✅ "Email vérifié, vous pouvez vous connecter" ou ❌ "Lien expiré"

Route à ajouter dans `app.routes.ts` :
```typescript
{ path: 'verify-email', loadComponent: () => import('./components/auth/verify-email.component').then(m => m.VerifyEmailComponent) }
```

#### c) Badge "email non vérifié" (optionnel)

Dans la sidebar ou la page profil, afficher un bandeau :
```html
<div *ngIf="!currentUser?.emailVerified" class="banner-warning">
  <i class="bi bi-envelope-exclamation"></i>
  Email non vérifié —
  <button (click)="resendVerification()">Renvoyer l'email</button>
</div>
```

Nécessite un nouveau endpoint `POST /api/auth/resend-verification`.

---

## 4. Impact sur le code existant

| Fichier | Type | Impact |
|---------|------|--------|
| `AuthService.java` | Modification | Ajouter `sendWelcomeEmail()` + logique vérification |
| `AuthController.java` | Modification | Ajouter `GET /verify-email` + `POST /resend-verification` |
| `RegisterRequest.java` | Modification | Renforcer `@Pattern` mot de passe |
| `User.java` | Modification | 3 nouveaux champs (`emailVerified`, `verificationToken`, `expiresAt`) |
| `UserRepository.java` | Modification | `findByEmailVerificationToken()` |
| `EmailService.java` | Modification | `sendWelcomeEmail()`, `sendWelcomeEmailWithVerification()` |
| `EmailTemplateService.java` | Modification | `renderWelcomeEmail()` |
| `LoginRateLimitFilter.java` | Modification ou copie | Étendre au register |
| **Nouveaux fichiers** | Création | Template `welcome-email.html`, `verify-email.component.ts`, migration V20 |
| `login.component.ts` | Modification | Case CGU |
| `app.routes.ts` | Modification | Route `/verify-email` |

**Aucune régression possible** sur le flow login/refresh/logout — tout est additionnel.

---

## 5. Décisions à prendre

### D1 — Vérification obligatoire ou optionnelle ?

| | Obligatoire | Optionnelle (recommandée) |
|--|-------------|--------------------------|
| **Avantage** | Garantit que chaque email est valide | UX fluide, accès immédiat |
| **Inconvénient** | Bloque l'utilisateur → abandon possible | Emails non vérifiés dans la base |
| **Quand ?** | App publique grand public | App B2B avec contrôle admin |

→ **Recommandation : optionnelle pour v1**, obligatoire si on passe en SaaS public.

### D2 — Inscription ouverte ou sur invitation ?

L'app est actuellement déployée sur Vercel avec un domaine public. Deux options :

| | Ouverte | Sur invitation |
|--|---------|----------------|
| **Avantage** | Self-service total | Contrôle qualité des inscriptions |
| **Inconvénient** | Risque spam/bots | Friction, besoin d'un flux admin |
| **Implémentation** | Rien à changer | Ajouter table `invitations`, token d'invitation requis |

→ **Recommandation : ouverte** (rate limiting suffit à bloquer les bots).

### D3 — CGU à rédiger
Le contenu des CGU (conditions générales, politique de confidentialité RGPD) doit être rédigé séparément. Page statique `/terms` à créer.

---

## 6. Estimation de l'effort

| Tâche | Effort |
|-------|--------|
| Email de bienvenue (template + service) | 0,5 j |
| Vérification email optionnelle (backend + frontend) | 2 j |
| Rate limiting register | 0,5 j |
| Politique mot de passe (backend + frontend) | 0,5 j |
| Case CGU + page /terms | 0,5 j |
| Tests + review | 0,5 j |
| **Total** | **~4,5 jours** |

---

## 7. Récapitulatif — Ce qu'il reste à faire

```
[✅ Déjà fait]  POST /api/auth/register (endpoint + service + DTO)
[✅ Déjà fait]  Formulaire d'inscription frontend (tab dans /login)
[✅ Déjà fait]  Indicateur force mot de passe (frontend)
[✅ Déjà fait]  Infrastructure email Resend

[⬜ 0,5j]  Email de bienvenue (template HTML + appel dans register())
[⬜ 0,5j]  Rate limiting sur POST /api/auth/register
[⬜ 0,5j]  Politique mot de passe renforcée (@Pattern backend + frontend cohérent)
[⬜ 0,5j]  Case CGU dans le formulaire
[⬜ 2j  ]  Vérification email optionnelle (token, endpoint, page /verify-email, badge)
```

La majorité du travail étant déjà en place, cette feature peut être livrée en **moins d'une semaine**.
