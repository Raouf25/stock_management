# Guide Flyway - Gestion des Migrations de Base de Données

## 🚀 Configuration

### Dépendances ajoutées dans `pom.xml`
```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-database-postgresql</artifactId>
</dependency>
```

### Configuration dans `application.properties`
```properties
# Flyway activé
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
spring.flyway.locations=classpath:db/migration
spring.flyway.baseline-version=0
spring.flyway.validate-on-migrate=true
```

## 📁 Structure des Migrations

Les scripts de migration doivent être placés dans :
```
backend/src/main/resources/db/migration/
```

### Convention de nommage
- **Format** : `V{version}__{description}.sql`
- **Exemples** :
  - `V1__alter_bill_decimal_precision.sql`
  - `V2__add_payment_table.sql`
  - `V3__update_customer_fields.sql`

### Règles importantes
- ✅ Version commence par `V` (majuscule)
- ✅ Numéro de version : 1, 2, 3... ou 1.0, 1.1, 2.0...
- ✅ Double underscore `__` entre version et description
- ✅ Description en snake_case
- ❌ Ne JAMAIS modifier un script déjà appliqué

## 🔄 Migration V1 - Précision Décimale

**Fichier** : `V1__alter_bill_decimal_precision.sql`

**Objectif** : Convertir les colonnes de type `DOUBLE` vers `DECIMAL(19,3)` pour une précision monétaire exacte.

**Colonnes modifiées** :
- `total` → DECIMAL(19,3)
- `deposit` → DECIMAL(19,3)
- `amount_due` → DECIMAL(19,3)
- `discount` → DECIMAL(19,3)

## 🎯 Fonctionnement Automatique

### Au démarrage de l'application

1. **Première fois** (base vide) :
   - Flyway crée la table `flyway_schema_history`
   - Exécute `V1__alter_bill_decimal_precision.sql`
   - Enregistre la migration comme appliquée

2. **Démarrages suivants** :
   - Vérifie les scripts dans `db/migration/`
   - Applique uniquement les nouvelles migrations
   - ✅ **NE TOUCHE PAS aux données existantes**

### Table de suivi : `flyway_schema_history`

```sql
SELECT * FROM flyway_schema_history;
```

| installed_rank | version | description               | type | script                              | checksum   | installed_by | installed_on        | execution_time | success |
|----------------|---------|---------------------------|------|-------------------------------------|------------|--------------|---------------------|----------------|---------|
| 1              | 1       | alter bill decimal precision | SQL  | V1__alter_bill_decimal_precision.sql | 123456789  | postgres     | 2026-02-06 14:30:00 | 45             | true    |

## 📝 Créer une Nouvelle Migration

### 1. Créer le fichier SQL

```bash
cd backend/src/main/resources/db/migration/
touch V2__add_payment_history_table.sql
```

### 2. Écrire le script SQL

```sql
-- V2__add_payment_history_table.sql

CREATE TABLE payment_history (
    id BIGSERIAL PRIMARY KEY,
    bill_id BIGINT NOT NULL REFERENCES bill(id_bill),
    payment_date TIMESTAMP NOT NULL,
    amount DECIMAL(19,3) NOT NULL,
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payment_history_bill_id ON payment_history(bill_id);
```

### 3. Redémarrer l'application

Flyway appliquera automatiquement `V2` au prochain démarrage.

## ⚠️ Bonnes Pratiques

### ✅ À FAIRE

1. **Toujours tester localement** avant la production
2. **Sauvegarder la base** avant migration importante
3. **Numéros séquentiels** : V1, V2, V3...
4. **Scripts idempotents** si possible
5. **Une migration = une fonctionnalité**

### ❌ À ÉVITER

1. ❌ **Ne JAMAIS modifier un script déjà appliqué**
   - Le checksum changera → Flyway échouera
   - Créer un nouveau script (V3) pour corriger

2. ❌ **Ne pas utiliser DROP DATABASE**
   - Flyway gère les tables, pas la base complète

3. ❌ **Éviter les scripts complexes**
   - Privilégier plusieurs petits scripts
   - Plus facile à déboguer

## 🛠️ Commandes Utiles

### Vérifier l'état des migrations
```sql
SELECT version, description, installed_on, success 
FROM flyway_schema_history 
ORDER BY installed_rank;
```

### Forcer une réparation (cas d'erreur)
```java
// Dans un bean de configuration
@Autowired
private Flyway flyway;

public void repair() {
    flyway.repair();
}
```

### Désactiver temporairement Flyway
```properties
spring.flyway.enabled=false
```

## 🔍 Débogage

### Migration échoue ?

1. **Vérifier les logs** :
```
ERROR o.f.core.internal.command.DbMigrate - Migration of schema "public" to version "1" failed!
```

2. **Vérifier la table** :
```sql
SELECT * FROM flyway_schema_history WHERE success = false;
```

3. **Corriger et réparer** :
```sql
-- Marquer la migration comme réussie (si on l'a corrigée manuellement)
UPDATE flyway_schema_history SET success = true WHERE version = '1';
```

Ou supprimer l'entrée et redémarrer :
```sql
DELETE FROM flyway_schema_history WHERE version = '1';
```

## 📊 Workflow de Migration

```
1. Développement
   ├── Créer V{n}__description.sql
   ├── Tester en local (ddl-auto=update)
   └── Commit le fichier

2. Déploiement Test
   ├── Pull du code
   ├── Démarrer l'app
   └── Flyway applique automatiquement

3. Production
   ├── Backup de la DB
   ├── Déployer
   └── Vérifier flyway_schema_history
```

## 🎓 Ressources

- [Documentation Flyway](https://flywaydb.org/documentation/)
- [Convention de nommage](https://flywaydb.org/documentation/concepts/migrations#naming)
- [Résolution de problèmes](https://flywaydb.org/documentation/usage/validate)

## ✨ Avantages de Flyway

✅ **Automatique** : S'exécute au démarrage
✅ **Versionné** : Historique complet des migrations
✅ **Sûr** : Ne ré-applique pas les migrations existantes
✅ **Traçable** : Table `flyway_schema_history`
✅ **Rollback** : Possibilité de créer des migrations DOWN
✅ **Multi-environnement** : Même code, même migrations partout
