# Étude — Multi-tenancy (Architecture SaaS) · Bhouri Stock

> **Date :** 2026-06-30  
> **Contexte :** migration d'une application mono-tenant vers une architecture SaaS multi-tenant.  
> **Stack actuelle :** Angular 17 · Spring Boot 3.3.7 (Java 21) · PostgreSQL 15 · Flyway · JJWT

---

## 1. État actuel

### Schéma de données (12 tables métier)

```
supplier ─────────────── product ─── purchase
                         │
customer ─── bill ───── bill_product
         └── delivery_note ─── delivery_note_product
                          └─── sale

users (authentification)
password_reset_tokens
app_settings
```

Aucune table n'a de colonne `tenant_id`. Toutes les données sont globales.

### Authentification (JWT)

```java
// JwtService.generateToken()
.claim("userId", userId)
.claim("name", name)
.claim("role", role)   // USER | ADMIN
// ← aucun tenantId
```

### Repositories

Toutes les requêtes sont globales :
```java
findAll()                             // retourne TOUS les clients de TOUS les tenants
findByCustomer_CustomerId(Long id)    // pas de filtrage tenant
```

---

## 2. Stratégies de multi-tenancy

| Stratégie | Isolation | Complexité | Coût infra | Adapté ici ? |
|-----------|-----------|------------|------------|--------------|
| **Base de données séparée** | ✅ Maximale | Très élevée | Très élevé | ❌ |
| **Schéma PostgreSQL séparé** | ✅ Bonne | Élevée | Moyen | ⚠️ |
| **Colonne `tenant_id` (row-level)** | ⚠️ Bonne si bien faite | Moyenne | Faible | ✅ **Recommandé** |

### Pourquoi exclure "base séparée"
- Nécessite un `DataSource` dynamique par tenant (RoutingDataSource)
- Pool de connexions explose à l'échelle (100 tenants = 100 pools)
- Flyway doit migrer chaque base indépendamment
- Aucun bénéfice réel pour cette taille d'application

### Pourquoi exclure "schéma séparé"
- Hibernate's `MultiTenancyStrategy.SCHEMA` nécessite un `ConnectionProvider` custom
- Flyway ne gère pas nativement les migrations multi-schéma sans scripting externe
- Search_path PostgreSQL dynamique est fragile

### Pourquoi choisir "row-level" (tenant_id)
- Compatible avec le schéma Flyway existant (simple `ALTER TABLE`)
- Un seul pool de connexions
- Hibernate `@Filter` gère l'isolation automatiquement
- Moins de risques de régression sur les repositories existants
- Chemin de migration le moins invasif

---

## 3. Architecture cible

```
┌──────────────────────────────────────────────────────┐
│  JWT : { userId, tenantId, role }                    │
│                                                      │
│  JwtAuthFilter                                       │
│       └─► TenantContext.set(tenantId)  [ThreadLocal] │
│                                                      │
│  @PrePersist sur BaseEntity                          │
│       └─► entity.tenantId = TenantContext.get()      │
│                                                      │
│  Hibernate @Filter("tenantFilter")                   │
│       └─► WHERE tenant_id = :tenantId  [automatique] │
│                                                      │
│  TenantContextCleaner (afterCompletion)              │
│       └─► TenantContext.clear()                      │
└──────────────────────────────────────────────────────┘
```

---

## 4. Plan d'implémentation détaillé

### 4.1 Base de données — Migrations Flyway

#### V17 — Table `company`
```sql
CREATE TABLE company (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(100) NOT NULL UNIQUE,  -- identifiant URL-safe
    email       VARCHAR(255) NOT NULL UNIQUE,
    phone       VARCHAR(50),
    address     TEXT,
    plan        VARCHAR(50) NOT NULL DEFAULT 'TRIAL',  -- TRIAL | PRO | ENTERPRISE
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at  TIMESTAMP
);
```

#### V18 — Ajout `company_id` sur `users`
```sql
ALTER TABLE users ADD COLUMN company_id BIGINT REFERENCES company(id);
CREATE INDEX idx_users_company ON users(company_id);
```

#### V19 — Ajout `tenant_id` sur les 9 tables métier
```sql
-- Répété pour : supplier, customer, product, purchase, sale,
--               bill, bill_product, delivery_note, delivery_note_product, app_settings
ALTER TABLE supplier ADD COLUMN tenant_id BIGINT NOT NULL DEFAULT 1 REFERENCES company(id);
-- (DEFAULT 1 = tenant "seed" pour les données existantes)

CREATE INDEX idx_supplier_tenant    ON supplier(tenant_id);
CREATE INDEX idx_customer_tenant    ON customer(tenant_id);
CREATE INDEX idx_product_tenant     ON product(tenant_id);
CREATE INDEX idx_purchase_tenant    ON purchase(tenant_id);
CREATE INDEX idx_sale_tenant        ON sale(tenant_id);
CREATE INDEX idx_bill_tenant        ON bill(tenant_id);
CREATE INDEX idx_bill_product_tenant ON bill_product(tenant_id);
CREATE INDEX idx_delivery_tenant    ON delivery_note(tenant_id);
CREATE INDEX idx_delivery_p_tenant  ON delivery_note_product(tenant_id);
CREATE INDEX idx_settings_tenant    ON app_settings(tenant_id);
```

> **Données existantes :** toutes rattachées au `tenant_id = 1` (company "Bhouri Stock" par défaut).

---

### 4.2 Backend — Nouveaux composants

#### `TenantContext.java`
```java
// Stockage ThreadLocal — lifecycle: request → response
public final class TenantContext {
    private static final ThreadLocal<Long> CURRENT = new ThreadLocal<>();

    public static void set(Long tenantId)  { CURRENT.set(tenantId); }
    public static Long  get()              { return CURRENT.get(); }
    public static void  clear()            { CURRENT.remove(); }
}
```

#### `BaseEntity.java`
```java
@MappedSuperclass
public abstract class BaseEntity {

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private Long tenantId;

    @PrePersist
    void assignTenant() {
        if (this.tenantId == null) {
            this.tenantId = TenantContext.get();
        }
    }
}
```
Toutes les entités métier (`Supplier`, `Customer`, `Product`, `Bill`, etc.) **étendent `BaseEntity`**.

#### `Company.java` (nouvelle entité)
```java
@Entity
@Table(name = "company")
public class Company {
    @Id @GeneratedValue(strategy = IDENTITY)
    private Long id;
    private String name;
    private String slug;
    private String email;
    private String plan;
    private boolean active;
    private LocalDateTime expiresAt;
}
```

#### Filtre Hibernate — déclaré sur chaque entité
```java
@Entity
@Table(name = "supplier")
@FilterDef(name = "tenantFilter",
           parameters = @ParamDef(name = "tenantId", type = Long.class))
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
public class Supplier extends BaseEntity { ... }
```

#### `TenantHibernateInterceptor.java`
```java
// Injecté dans JpaTransactionManager ou via AOP pour activer le filtre
// Alternative plus simple : enableFilter dans un @Aspect @Around("@annotation(Transactional)")
@Component
@Aspect
public class TenantFilterAspect {

    @Autowired
    private EntityManager em;

    @Around("@annotation(org.springframework.transaction.annotation.Transactional)")
    public Object applyTenantFilter(ProceedingJoinPoint pjp) throws Throwable {
        Long tenantId = TenantContext.get();
        if (tenantId != null) {
            em.unwrap(Session.class)
              .enableFilter("tenantFilter")
              .setParameter("tenantId", tenantId);
        }
        try {
            return pjp.proceed();
        } finally {
            if (tenantId != null) {
                em.unwrap(Session.class).disableFilter("tenantFilter");
            }
        }
    }
}
```

#### `JwtAuthFilter.java` — propagation du tenant
```java
// Dans doFilterInternal(), après validation du token :
Long tenantId = jwtService.getTenantIdFromToken(token);
TenantContext.set(tenantId);
try {
    filterChain.doFilter(request, response);
} finally {
    TenantContext.clear();   // nettoyage obligatoire (thread pool réutilisé)
}
```

#### `JwtService.java` — ajout `tenantId` dans le token
```java
public String generateToken(Long userId, Long tenantId, String email, String name, String role) {
    return Jwts.builder()
        .subject(email)
        .claim("userId",   userId)
        .claim("tenantId", tenantId)   // ← nouveau claim
        .claim("name",     name)
        .claim("role",     role)
        .issuedAt(now)
        .expiration(expiryDate)
        .signWith(getSigningKey())
        .compact();
}

public Long getTenantIdFromToken(String token) {
    return getClaims(token).get("tenantId", Long.class);
}
```

---

### 4.3 Nouveaux endpoints

#### `CompanyController.java` (SUPER_ADMIN)
```
POST   /api/admin/companies          — créer un tenant
GET    /api/admin/companies          — lister tous les tenants
GET    /api/admin/companies/{id}     — détail d'un tenant
PUT    /api/admin/companies/{id}     — modifier (plan, statut)
DELETE /api/admin/companies/{id}     — désactiver
```

#### `AuthService.java` — inscription avec création de tenant
```
POST /api/auth/register-company      — crée company + user ADMIN en une transaction
```

---

### 4.4 Frontend — Changements

#### Nouveaux rôles
```typescript
// auth.service.ts
role?: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
```

#### Flux d'inscription
- Page `/register` → formulaire (nom entreprise, email, mot de passe)
- Appel `POST /api/auth/register-company`
- Redirection vers `/dashboard` avec token JWT incluant `tenantId`

#### Panel Super Admin
- Route `/superadmin/companies` (guard `superAdminGuard`)
- Liste des tenants : nom, plan, statut, date expiration, nb utilisateurs
- Actions : activer/désactiver, changer le plan

#### Pas de changement pour les utilisateurs normaux
Le `tenantId` est transparent — il vient du JWT et n'apparaît jamais dans l'UI.

---

## 5. Impact par couche

### Backend

| Fichier | Type de modification | Impact |
|---------|---------------------|--------|
| `JwtService.java` | Ajouter claim `tenantId` | Faible — 2 méthodes |
| `JwtAuthFilter.java` | Lire + propager tenantId | Faible — ~5 lignes |
| `AuthService.java` | Passer tenantId à generateToken | Faible |
| Toutes les entités (9) | Étendre `BaseEntity` | Moyen — refactor non breaking |
| Tous les repos (9) | Aucun changement (filtre Hibernate transparent) | Nul |
| `SecurityConfig.java` | Ajouter route SUPER_ADMIN | Faible |
| Nouveau : `TenantContext`, `BaseEntity`, `TenantFilterAspect`, `Company`, `CompanyController` | Création | Moyen |

### Base de données

| Migration | Tables modifiées | Données existantes |
|-----------|-----------------|-------------------|
| V17 | — (nouvelle table `company`) | Seed: 1 company "Bhouri Stock" |
| V18 | `users` | `company_id = 1` pour tous |
| V19 | 10 tables métier | `tenant_id = 1` pour toutes |

> Aucune donnée perdue. Migration additive uniquement.

### Frontend

| Composant | Modification |
|-----------|-------------|
| `auth.service.ts` | Lire `tenantId` depuis le JWT décodé |
| `admin.guard.ts` | Ajouter `super-admin.guard.ts` |
| `app.routes.ts` | Ajouter route `/superadmin/*` |
| Nouveau : `register-company.component.ts` | Création |
| Nouveau : `superadmin/companies/*.component.ts` | Création |
| Tout le reste | **Aucun changement** |

---

## 6. Gestion des risques

### Risque 1 — Fuite de données cross-tenant
**Probabilité :** Faible si le filtre Hibernate est toujours activé.  
**Mitigation :**
- Test d'intégration dédié : login tenant A → requête → vérifier que les données de B sont invisibles
- Code review systématique : tout `findAll()` sans filtre doit déclencher une alerte
- Audit log sur les accès (extension future)

### Risque 2 — TenantContext non nettoyé (thread leak)
**Probabilité :** Certaine si le `finally` est absent.  
**Mitigation :**
- Le `TenantContext.clear()` est dans le `finally` de `JwtAuthFilter`
- Test : vérifier qu'après une requête, `TenantContext.get()` retourne `null`

### Risque 3 — Performances (index manquants)
**Probabilité :** Moyenne si les index `tenant_id` ne sont pas créés.  
**Mitigation :**
- Tous les index sont créés dans V19
- EXPLAIN ANALYZE après migration sur les requêtes les plus fréquentes (`bill`, `product`)

### Risque 4 — Migration des données existantes
**Probabilité :** Faible — migration purement additive.  
**Mitigation :**
- `DEFAULT 1` sur les colonnes `tenant_id` / `company_id` dans la migration
- Rollback possible en supprimant les colonnes (aucune contrainte NOT NULL critique avant le seeding)

---

## 7. Estimation de l'effort

| Phase | Tâches | Jours |
|-------|--------|-------|
| **Phase 1** — Infrastructure | `TenantContext`, `BaseEntity`, `TenantFilterAspect`, `JwtService` update, migrations V17-V19 | 3 j |
| **Phase 2** — Entités + repos | Ajouter `@FilterDef/@Filter` sur les 9 entités + tests d'isolation | 2 j |
| **Phase 3** — API Company | `CompanyController`, `AuthService.registerCompany()`, `CompanyRepository` | 2 j |
| **Phase 4** — Frontend | Page register-company, panel superadmin, super-admin guard | 3 j |
| **Phase 5** — Tests & audit | Tests d'intégration cross-tenant, charge, review sécurité | 2 j |
| **Total** | | **~12 jours** |

---

## 8. Recommandation finale

**Approche choisie : row-level isolation avec Hibernate @Filter.**

C'est le chemin le moins risqué pour le codebase actuel :
- Aucune réécriture des repositories (le filtre est transparent)
- Migrations Flyway additives (pas de perte de données)
- Le JWT porte déjà tout le contexte nécessaire — ajouter `tenantId` est un changement minimal
- Déploiement progressif possible : activer la fonctionnalité tenant par tenant

**Ordre de priorité des phases :**
1. Phases 1+2 (backend infrastructure) → peuvent être mergées sans toucher au frontend
2. Phase 3 (API company) → nécessaire avant d'ouvrir l'inscription
3. Phases 4+5 → finition et sécurisation

**Prérequis avant de démarrer :**
- Décider du modèle commercial (plans TRIAL/PRO/ENTERPRISE et leurs limites)
- Définir les limites par plan (nb utilisateurs max, nb produits max, stockage)
- Choisir si l'inscription est libre ou sur invitation uniquement
