# Guide de Déploiement - Mode Développement (Recommandé)

## Problème
`docker-compose up -d` échoue à la compilation du frontend Angular avec `npm install`. C'est causé par:
- Manque de dépendances de build dans Alpine Linux
- Problèmes de mémoire lors du build Angular
- Complexité du build multi-stage

## Solution: Mode Développement

### **Option 1: PostgreSQL + Backend local + Frontend local (Recommandé pour déverrouiller)**

**Étape 1: Lancer PostgreSQL uniquement**
```bash
cd /workspaces/stock_management
docker-compose -f docker-compose.dev-simple.yml up -d
```

Vérifier que PostgreSQL est prêt:
```bash
docker logs stock_management_postgres_dev
# Chercher: "database system is ready to accept connections"
```

**Étape 2: Lancer le Backend (Terminal 2)**
```bash
cd /workspaces/stock_management/backend
./mvnw spring-boot:run
# Chercher: "Tomcat started on port(s): 8080"
```

**Étape 3: Lancer le Frontend (Terminal 3)**
```bash
cd /workspaces/stock_management/frontend
npm install
npm start
# S'ouvrira automatiquement sur http://localhost:4200
```

**Résultat:** 
- PostgreSQL: http://localhost:5432
- Backend: http://localhost:8080
- Frontend: http://localhost:4200

---

## Pourquoi c'est mieux en dev

✅ Vous voyez les logs de compilation en temps réel
✅ Rechargement à chaud du code (ng serve avec hot reload)
✅ Debugging backend facile (Spring Boot redémarrage rapide)
✅ Pas de problèmes Docker d'isolation
✅ Plus rapide que le build complet

---

## Option 2: Full Docker (Après validation du dev)

Si le dev fonctionne bien et que tu veux Docker complet:

**Nettoyer les anciens builds:**
```bash
docker-compose down
docker rmi -f stock_management_frontend stock_management_backend
docker image prune -f
```

**Relancer avec plus d'optimisations:**
```bash
docker-compose build --no-cache
docker-compose up -d
```

---

## Tests de Santé

### Vérifier PostgreSQL
```bash
docker exec stock_management_postgres_dev psql -U postgres -d stock_db -c "SELECT 1"
```

### Vérifier Backend
```bash
curl http://localhost:8080/api/products
# Doit retourner un JSON (vide au départ)
```

### Vérifier Frontend
```bash
curl http://localhost:4200
# Doit retourner du HTML
```

---

## Dépannage

### `npm install` échoue encore localement
```bash
cd /workspaces/stock_management/frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --verbose
```

### PostgreSQL ne démarre pas
```bash
docker-compose -f docker-compose.dev-simple.yml logs postgres
docker volume rm stock_management_postgres_data_dev
docker-compose -f docker-compose.dev-simple.yml up -d
```

### Port 5432 déjà utilisé
```bash
lsof -i :5432
# Tuer le processus si besoin
```

---

## Prochaines étapes

1. **Valider en mode dev d'abord** (plus rapide, meilleur debug)
2. **Faire tous les tests** dans le navigateur
3. **Si tout fonctionne**, utiliser `docker-compose up -d` complet pour prod

