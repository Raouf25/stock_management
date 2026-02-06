# Migration de Précision Décimale pour les Factures

## Changements effectués

### Backend (Java)

1. **Modèle Bill.java**
   - Changé les types de `double`/`Double` vers `BigDecimal` pour :
     - `total` 
     - `deposit` (acompte)
     - `amountDue` (montant dû)
     - `discount` (remise)
   - Ajouté `@Column(precision = 19, scale = 3)` pour garantir 3 chiffres après la virgule

2. **BillService.java**
   - Mise à jour de toutes les méthodes pour utiliser `BigDecimal` :
     - `save()` : Calcul du total avec précision décimale
     - `createInvoice()` : Calculs TVA et totaux avec BigDecimal
     - `registerPayment()` : Enregistrement des paiements avec précision de 3 décimales
     - `getInvoiceKPIs()` : Statistiques calculées avec BigDecimal
   - Utilisation de `.setScale(3, BigDecimal.ROUND_HALF_UP)` pour garantir 3 décimales

3. **InvoicePdfDataService.java**
   - Conversion de `BigDecimal` vers `double` uniquement pour l'affichage PDF
   - Utilisation de `.doubleValue()` pour la compatibilité

4. **Migration SQL**
   - Fichier : `backend/src/main/resources/db/migration/alter_bill_decimal_precision.sql`
   - Conversion des colonnes PostgreSQL de `DOUBLE` vers `DECIMAL(19,3)`

### Frontend (Angular)

1. **invoice-list.component.ts**
   - Tous les montants affichés avec 3 décimales : `| number:'1.3-3'`
   - Modale de paiement affiche le montant avec `.toFixed(3)`
   - Champs concernés :
     - Montant total des statistiques
     - Total dû des statistiques
     - Total de chaque facture
     - Acompte
     - Montant dû
     - Montant dans la modale de paiement

## Pourquoi BigDecimal ?

Les types `double` et `float` en Java ont des problèmes de précision pour les calculs monétaires :
```java
// Problème avec double :
0.1 + 0.2 = 0.30000000000000004

// Solution avec BigDecimal :
new BigDecimal("0.1").add(new BigDecimal("0.2")) = 0.3
```

## Migration de la base de données

### 🚀 Avec Flyway (Recommandé - Automatique)

**Flyway est maintenant configuré et gérera automatiquement la migration !**

1. **Au prochain démarrage du backend**, Flyway exécutera automatiquement :
   - `V1__alter_bill_decimal_precision.sql`

2. **Vérification** :
```sql
-- Voir l'historique des migrations
SELECT * FROM flyway_schema_history;

-- Vérifier les types de colonnes
SELECT column_name, data_type, numeric_precision, numeric_scale 
FROM information_schema.columns 
WHERE table_name = 'bill' 
AND column_name IN ('total', 'deposit', 'amount_due', 'discount');
```

### 📋 Configuration Flyway

**Dépendances ajoutées** (`pom.xml`) :
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

**Configuration** (`application.properties`) :
```properties
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
spring.flyway.locations=classpath:db/migration
spring.flyway.baseline-version=0
```

**Script de migration** :
- Fichier : `backend/src/main/resources/db/migration/V1__alter_bill_decimal_precision.sql`
- S'exécute automatiquement au démarrage
- Ne s'exécute qu'une seule fois (tracé dans `flyway_schema_history`)

### ⚙️ Migration Manuelle (Alternative)

Si vous préférez exécuter manuellement :

```bash
# Se connecter à PostgreSQL
psql -U your_user -d stock_management

# Exécuter le script de migration
\i backend/src/main/resources/db/migration/alter_bill_decimal_precision.sql
```

Ou exécuter directement :
```sql
ALTER TABLE bill ALTER COLUMN total TYPE DECIMAL(19,3);
ALTER TABLE bill ALTER COLUMN deposit TYPE DECIMAL(19,3);
ALTER TABLE bill ALTER COLUMN amount_due TYPE DECIMAL(19,3);
ALTER TABLE bill ALTER COLUMN discount TYPE DECIMAL(19,3);
```

## Précision des calculs

- **19 chiffres au total** : 16 avant la virgule, 3 après
- **Scale = 3** : Toujours 3 chiffres après la virgule (ex: 123.456)
- **Arrondi** : `ROUND_HALF_UP` (arrondi mathématique standard)

## Exemples de valeurs

| Avant (double) | Après (BigDecimal) |
|----------------|-------------------|
| 100.5         | 100.500          |
| 99.99         | 99.990           |
| 1234.567      | 1234.567         |
| 0.1           | 0.100            |

## Tests recommandés

1. Créer une nouvelle facture
2. Vérifier l'affichage avec 3 décimales
3. Enregistrer un paiement partiel
4. Vérifier que les calculs sont précis
5. Télécharger le PDF et vérifier le formatage

## Notes importantes

- Les anciennesvaleurs dans la DB seront automatiquement converties
- Aucune perte de données lors de la migration
- Les valeurs NULL restent NULL
- La compatibilité avec l'API REST est maintenue
