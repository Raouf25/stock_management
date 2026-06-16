# Déploiement gratuit — Vercel + Railway + Neon

## Architecture

```
┌─────────────────────┐      HTTPS       ┌───────────────────────┐
│  Vercel (Frontend)  │ ──/api/:path*──▶ │  Railway (Backend)    │
│  Angular 17 SPA     │                  │  Spring Boot :8080    │
│  stock-app.vercel   │                  │  xxx.up.railway.app   │
└─────────────────────┘                  └──────────┬────────────┘
                                                    │ JDBC
                                         ┌──────────▼────────────┐
                                         │  Neon (PostgreSQL)    │
                                         │  ep-xxx.neon.tech     │
                                         └───────────────────────┘
```

## Étape 1 — Base de données : Neon (PostgreSQL free)

1. Aller sur **https://neon.tech** → **Sign up** (gratuit)
2. Créer un projet : `stock-management`
3. Copier la **connection string** :
   ```
   postgresql://neondb_owner:PASSWORD@ep-xxx.region.neon.tech/neondb?sslmode=require
   ```
   → Convertir pour JDBC :
   ```
   jdbc:postgresql://ep-xxx.region.neon.tech/neondb?sslmode=require
   ```

---

## Étape 2 — Backend : Railway

### 2.1 Créer le projet

1. Aller sur **https://railway.app** → **Sign up** (gratuit, $5/mois de crédit)
2. **New Project** → **Deploy from GitHub repo**
3. Sélectionner votre repo `stock_management`
4. Railway détecte automatiquement le `Dockerfile`

### 2.2 Variables d'environnement Railway

Dans le dashboard Railway → onglet **Variables** :

| Variable | Valeur |
|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://ep-xxx.neon.tech/neondb?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | votre username Neon |
| `SPRING_DATASOURCE_PASSWORD` | votre password Neon |
| `APP_JWT_SECRET` | chaîne aléatoire ≥ 32 chars |
| `APP_JWT_EXPIRATION` | `86400000` |
| `CORS_ALLOWED_ORIGINS` | `https://your-app.vercel.app` *(à mettre à jour après Vercel)* |
| `RESEND_API_KEY` | votre clé Resend (ou `dev-placeholder-key`) |
| `SERVER_PORT` | `8080` |

### 2.3 Générer une clé JWT sécurisée

```bash
openssl rand -base64 64
```

### 2.4 Récupérer l'URL Railway

Après le déploiement : `https://stock-management-api-xxxx.up.railway.app`

---

## Étape 3 — Frontend : Vercel

### 3.1 Déployer

1. Aller sur **https://vercel.com** → **Sign up** (gratuit)
2. **Add New Project** → Import depuis GitHub
3. Sélectionner le repo `stock_management`
4. **Root Directory** : `frontend`
5. Vercel détecte automatiquement `vercel.json`

### 3.2 Variables d'environnement Vercel

Dans Vercel → Settings → **Environment Variables** :

| Variable | Valeur |
|---|---|
| `BACKEND_URL` | `https://stock-management-api-xxxx.up.railway.app` |

### 3.3 Redéployer

Après avoir ajouté `BACKEND_URL`, cliquer **Redeploy**.

### 3.4 Récupérer l'URL Vercel

Ex. : `https://stock-management-xxxx.vercel.app`

---

## Étape 4 — Finaliser le CORS

Retourner sur Railway → Variables → mettre à jour :

```
CORS_ALLOWED_ORIGINS=https://stock-management-xxxx.vercel.app,http://localhost:4200
```

---

## Vérification

```bash
# Santé du backend
curl https://stock-management-api-xxxx.up.railway.app/api/products

# Tester le login
curl -X POST https://stock-management-api-xxxx.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

---

## Résumé des coûts

| Service | Plan | Coût |
|---|---|---|
| Vercel | Hobby | **Gratuit** |
| Railway | Trial ($5 crédit/mois) | **~Gratuit** pour < 500h/mois |
| Neon | Free Tier (0.5GB) | **Gratuit** |
| **Total** | | **0 €/mois** |

---

## Domaine personnalisé (optionnel)

- **Vercel** : Settings → Domains → ajouter `votre-domaine.com`
- **Railway** : Settings → Networking → Custom Domain

---

## Troubleshooting

### CORS error dans le navigateur
→ Vérifier `CORS_ALLOWED_ORIGINS` sur Railway (URL Vercel exacte, sans slash final)

### 502 Bad Gateway sur le backend
→ Vérifier les logs Railway : onglet **Deployments** → logs

### Écran blanc sur le frontend
→ Vérifier que `BACKEND_URL` est bien défini dans Vercel et que le redéploiement a été fait

### Base de données : Flyway migration error
→ Vérifier que `SPRING_DATASOURCE_URL` contient bien `?sslmode=require` pour Neon

