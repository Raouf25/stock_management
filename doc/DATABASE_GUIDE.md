# Guide Base de Données — Stock Management

**Dernière mise à jour :** Juin 2026  
**Moteur :** PostgreSQL 15  
**Migrations :** Flyway (V1 → V11)

---

## Table des matières

1. [Schéma des tables](#schéma-des-tables)
2. [Stratégie de migration Flyway](#stratégie-de-migration-flyway)
3. [Index et performances](#index-et-performances)
4. [Types monétaires](#types-monétaires)
5. [Contraintes d'intégrité](#contraintes-dintégrité)
6. [Audit et traçabilité](#audit-et-traçabilité)
7. [Vue matérialisée dashboard](#vue-matérialisée-dashboard)
8. [Relation Sale ↔ Bill](#relation-sale--bill)
9. [Configuration HikariCP](#configuration-hikaricp)

---

## Schéma des tables

### Diagramme entité-relation

Le modèle s'organise en trois couches : **référentiels**, **documents commerciaux** et **lignes de détail**.

```
╔══════════════════ RÉFÉRENTIELS ═══════════════════╗
║                                                   ║
║  ┌──────────┐           ┌──────────┐              ║
║  │ supplier │           │ customer │              ║
║  └────┬─────┘           └────┬─────┘              ║
╚═══════╪════════════════════╪══════════════════════╝
        │1                   │1
        │                    │
        │N          ┌────────┼──────────────────────┐
        │           │N       │N                     │N
╔═══════╪═══════════╪════════╪══════╗               │
║       │  DOCUMENTS COMMERCIAUX    ║               │
║  ┌────▼─────┐  ┌──▼───┐  ┌▼─────▼──────┐        │
║  │ product  │  │ sale │  │    bill     │        │
║  └──┬─┬─┬──┘  └──┬───┘  └──────┬──────┘        │
║     │ │ │        │(opt)bill_id  │               │
║     │ │ │        └─────────────►│               │
║     │ │ │                      │               │
╚═════╪═╪═╪══════════════════════╪═══════════════╝
      │ │ │1                     │1     (delivery_note)
      │ │ │                      │      voir ci-dessous
      │ │ │N          ╔══════════╪═════════════════╗
      │ │ └──────────►║  LIGNES DE DÉTAIL          ║
      │ │             ║  ┌──────────────┐          ║
      │ │             ║  │ bill_product │          ║
      │ │             ║  └──────────────┘          ║
      │ └──────────►  ║  delivery_note_product     ║
      │(via purchase) ╚════════════════════════════╝
      │1
      │N
  ┌───▼────┐
  │purchase│
  └────────┘
```

**Lecture du lien `sale → bill` :** la FK `sale.bill_id` est **optionnelle** (nullable). Elle indique qu'une vente directe *peut* être rattachée à une facture existante, mais ce n'est pas obligatoire. Il n'y a pas de dépendance circulaire fonctionnelle : `bill` n'a pas besoin de `sale` pour exister, et `sale` n'a pas besoin de `bill`.

### Relations clés

| De | Vers | Cardinalité | Remarque |
|----|------|-------------|---------|
| `supplier` | `product` | 1:N | Un fournisseur livre plusieurs produits |
| `supplier` | `purchase` | 1:N | Un fournisseur fait l'objet de plusieurs achats |
| `product` | `purchase` | 1:N | Un produit peut être acheté plusieurs fois |
| `product` | `sale` | 1:N | Un produit peut être vendu plusieurs fois |
| `product` | `bill_product` | 1:N | Un produit peut figurer dans plusieurs factures |
| `product` | `delivery_note_product` | 1:N | Un produit peut figurer dans plusieurs BL |
| `customer` | `sale` | 1:N | Un client peut avoir plusieurs ventes |
| `customer` | `bill` | 1:N | Un client peut avoir plusieurs factures |
| `customer` | `delivery_note` | 1:N | Un client peut avoir plusieurs bons de livraison |
| `bill` | `bill_product` | 1:N | Une facture contient plusieurs lignes produit |
| `delivery_note` | `delivery_note_product` | 1:N | Un BL contient plusieurs lignes produit |
| `sale` | `bill` | N:1 (opt.) | Une vente peut être rattachée à une facture (V10) |
| `delivery_note` | `bill` | N:1 (opt.) | Un BL peut être converti en facture |

### Inventaire des tables

| Table | Description | Clé primaire |
|-------|-------------|-------------|
| `supplier` | Fournisseurs | `id` |
| `customer` | Clients | `customer_id` |
| `product` | Produits en stock | `id_product` |
| `purchase` | Achats fournisseurs | `id` |
| `sale` | Ventes directes | `id` |
| `bill` | Factures clients | `id_bill` |
| `bill_product` | Lignes de facture | `id` |
| `delivery_note` | Bons de livraison | `id_delivery_note` |
| `delivery_note_product` | Lignes de BL | `id_delivery_note_product` |
| `users` | Comptes utilisateurs | `id` |
| `password_reset_tokens` | Tokens reset mdp | `id` |

---

## Stratégie de migration Flyway

Les migrations sont versionnées dans `backend/src/main/resources/db/migration/`.

| Version | Fichier | Contenu |
|---------|---------|---------|
| V1 | `V1__create_tables.sql` | Schéma complet initial (11 tables) |
| V2 | `V2__initial_data.sql` | Données de test |
| V3 | `V3__add_gamme_product.sql` | Colonne `gamme` sur `product` |
| V4 | `V4__delete_demo_data.sql` | Nettoyage données de démo |
| V5 | `V5__remove_duplicate_sales_from_bills.sql` | Dédoublonnage ventes |
| V6 | `V6__add_missing_indexes.sql` | 16 index sur FK et colonnes filtrées |
| V7 | `V7__fix_monetary_types.sql` | `DOUBLE PRECISION` → `NUMERIC(19,3)` |
| V8 | `V8__add_audit_timestamps.sql` | `created_at` / `updated_at` sur 7 tables |
| V9 | `V9__add_integrity_constraints.sql` | 7 contraintes CHECK + UNIQUE reference |
| V10 | `V10__link_sale_to_bill.sql` | FK `sale.bill_id → bill.id_bill` |
| V11 | `V11__create_product_dashboard_view.sql` | Vue matérialisée `mv_product_dashboard` |

### Configuration Flyway

```properties
# application.properties
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
spring.flyway.locations=classpath:db/migration
spring.flyway.validate-on-migrate=true

# Production : Flyway gère tout le DDL, Hibernate ne touche pas au schéma
spring.jpa.hibernate.ddl-auto=none   # prod
spring.jpa.hibernate.ddl-auto=update # dev uniquement
```

---

## Index et performances

### Index créés par V6

```sql
-- sale : jointures et filtres date fréquents
CREATE INDEX idx_sale_customer      ON sale(customer_id);
CREATE INDEX idx_sale_product       ON sale(product_id);
CREATE INDEX idx_sale_date          ON sale(date_sale);
CREATE INDEX idx_sale_product_date  ON sale(product_id, date_sale);  -- composite

-- purchase : analytics fournisseur
CREATE INDEX idx_purchase_supplier       ON purchase(supplier_id);
CREATE INDEX idx_purchase_product        ON purchase(product_id);
CREATE INDEX idx_purchase_date           ON purchase(date_purchase);
CREATE INDEX idx_purchase_supplier_date  ON purchase(supplier_id, date_purchase);

-- bill : filtres statut paiement
CREATE INDEX idx_bill_customer        ON bill(customer_id);
CREATE INDEX idx_bill_payment_status  ON bill(payment_status);
CREATE INDEX idx_bill_customer_status ON bill(customer_id, payment_status);

-- bill_product : jointures (pas d'index en V1)
CREATE INDEX idx_bill_product_bill    ON bill_product(id_bill);
CREATE INDEX idx_bill_product_product ON bill_product(id_product);

-- product : lookup fournisseur, filtre catégorie
CREATE INDEX idx_product_supplier ON product(supplier_id);
CREATE INDEX idx_product_category ON product(category);

-- password_reset_tokens : deleteByUser() sans scan complet
CREATE INDEX idx_prt_user   ON password_reset_tokens(user_id);
CREATE INDEX idx_prt_expiry ON password_reset_tokens(expiry_date);

-- customer : countByStatus(), countNewCustomersThisMonth()
CREATE INDEX idx_customer_status     ON customer(status);
CREATE INDEX idx_customer_created_at ON customer(created_at);
```

### Index existants depuis V1 (delivery_note)

```sql
CREATE INDEX idx_delivery_note_number   ON delivery_note(delivery_note_number);
CREATE INDEX idx_delivery_note_date     ON delivery_note(date_delivery);
CREATE INDEX idx_delivery_note_customer ON delivery_note(customer_id);
CREATE INDEX idx_delivery_note_status   ON delivery_note(status);
CREATE INDEX idx_delivery_note_invoiced ON delivery_note(invoiced);

CREATE INDEX idx_delivery_note_product_delivery_note ON delivery_note_product(delivery_note_id);
CREATE INDEX idx_delivery_note_product_product       ON delivery_note_product(product_id);
```

---

## Types monétaires

### Règle : toujours `NUMERIC(19,3)` pour les montants

`DOUBLE PRECISION` accumule des erreurs d'arrondi sur les calculs financiers (CMP, totaux TVA, bilans). Toutes les colonnes monétaires utilisent `NUMERIC(19,3)`.

| Table | Colonnes `NUMERIC(19,3)` |
|-------|--------------------------|
| `bill` | `total`, `deposit`, `amount_due`, `discount` |
| `bill_product` | `total_product_price` |
| `bill_product` | `discount_percentage` (`NUMERIC(5,2)` — pourcentage) |
| `delivery_note` | `total_amount`, `discount` |
| `delivery_note_product` | `unit_price`, `total_price`, `discount` |
| `sale` | `unit_sale_price`, `total_sale_amount` |
| `purchase` | `unit_price_ttc`, `total_amount_ttc` |
| `product` | `unit_price_sold`, `unit_price`, `cmp`, `initial_unit_price`, `initial_stock_value`, `current_stock_value` |

### Correspondance Java : `BigDecimal`

```java
// Entité Product
@Column(precision = 19, scale = 3)
private BigDecimal unitPriceSold;

@Column(precision = 19, scale = 3)
private BigDecimal cmp;

// Calcul CMP dans PurchaseService
BigDecimal newValue = currentValue.add(
    BigDecimal.valueOf(quantity).multiply(unitPrice)
);
product.setCmp(
    newValue.divide(BigDecimal.valueOf(newQty), 3, RoundingMode.HALF_UP)
);
```

---

## Contraintes d'intégrité

Ajoutées par V9. Elles rejettent les données invalides au niveau base de données, indépendamment de l'application.

```sql
-- Stock jamais négatif
ALTER TABLE product
    ADD CONSTRAINT chk_stock_quantity_non_negative
    CHECK (current_stock_quantity >= 0);

-- Quantités toujours positives dans les transactions
ALTER TABLE sale         ADD CONSTRAINT chk_sale_quantity_positive     CHECK (quantity_sold > 0);
ALTER TABLE purchase     ADD CONSTRAINT chk_purchase_quantity_positive  CHECK (quantity > 0);
ALTER TABLE bill_product ADD CONSTRAINT chk_bill_product_quantity_positive CHECK (quantity > 0);

-- Remises dans la plage 0–100 %
ALTER TABLE bill_product          ADD CONSTRAINT chk_bill_product_discount_range  CHECK (discount_percentage >= 0 AND discount_percentage <= 100);
ALTER TABLE delivery_note_product ADD CONSTRAINT chk_dnp_discount_range           CHECK (discount >= 0 AND discount <= 100);

-- Référence produit unique
ALTER TABLE product ADD CONSTRAINT uq_product_reference UNIQUE (reference);
```

---

## Audit et traçabilité

Ajouté par V8. Chaque entité métier dispose désormais de timestamps d'audit.

| Table | `created_at` | `updated_at` | Depuis |
|-------|:-----------:|:------------:|--------|
| `users` | ✅ | ✅ (V8) | V1 |
| `customer` | ✅ | ✅ (V8) | V1 |
| `delivery_note` | ✅ | ✅ | V1 |
| `bill` | ✅ (V8) | ✅ (V8) | V8 |
| `product` | ✅ (V8) | ✅ (V8) | V8 |
| `sale` | ✅ (V8) | — | V8 |
| `purchase` | ✅ (V8) | — | V8 |
| `supplier` | ✅ (V8) | ✅ (V8) | V8 |

### Implémentation Java via callbacks JPA

```java
// Exemple : Product.java
@Column(updatable = false)
private LocalDateTime createdAt;

private LocalDateTime updatedAt;

@PrePersist
protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
}

@PreUpdate
protected void onUpdate() {
    updatedAt = LocalDateTime.now();
}
```

---

## Vue matérialisée dashboard

Créée par V11. Remplace la requête JPQL complexe à 12 sous-requêtes corrélées du `ProductRepository.findProductsDashboardData()`.

### Définition

```sql
CREATE MATERIALIZED VIEW mv_product_dashboard AS
SELECT
    p.id_product,
    p.reference,
    p.name,
    p.category,
    p.unit,
    p.unit_price,
    p.unit_price_sold,
    p.current_stock_quantity,
    COALESCE(s.qty_sold, 0)  + COALESCE(bp.qty_billed, 0)  AS total_quantity_sold,
    COALESCE(pur.qty_purchased, 0)
        - COALESCE(s.qty_sold, 0)
        - COALESCE(bp.qty_billed, 0)                        AS stock_warehouse,
    COALESCE(pur.purchase_count, 0)                         AS purchases_count,
    COALESCE(pur.avg_purchase_price, 0)                     AS average_purchase_price,
    COALESCE(s.sale_count, 0) + COALESCE(bp.bill_count, 0) AS sales_count,
    ...                                                      AS average_sale_price,
    ...                                                      AS bilan
FROM product p
LEFT JOIN (SELECT product_id, SUM(quantity_sold), ... FROM sale GROUP BY product_id) s ...
LEFT JOIN (SELECT id_product, SUM(quantity), ... FROM bill_product GROUP BY id_product) bp ...
LEFT JOIN (SELECT product_id, SUM(quantity), ... FROM purchase GROUP BY product_id) pur ...
WHERE s.product_id IS NOT NULL OR bp.id_product IS NOT NULL OR pur.product_id IS NOT NULL;

CREATE UNIQUE INDEX idx_mv_product_dashboard_pk ON mv_product_dashboard(id_product);
```

### Stratégie de rafraîchissement

```java
// ProductRepository.java
@Modifying
@Transactional
@Query(value = "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_product_dashboard", nativeQuery = true)
void refreshDashboardView();

// ProductDashboardService.java — appelé après chaque écriture
@CacheEvict(value = "dashboard-products", allEntries = true)
public void onDataChanged() {
    productRepository.refreshDashboardView();
}
```

`CONCURRENTLY` permet les lectures pendant le refresh (sans verrouillage de table). Requiert l'index UNIQUE sur `id_product`.

---

## Relation Sale ↔ Bill

Ajoutée par V10. Les ventes pouvaient déjà référencer une facture via `invoice_number` (string). La V10 ajoute une FK typée.

```sql
ALTER TABLE sale
    ADD COLUMN bill_id BIGINT,
    ADD CONSTRAINT fk_sale_bill
        FOREIGN KEY (bill_id) REFERENCES bill(id_bill)
        ON DELETE SET NULL;

CREATE INDEX idx_sale_bill ON sale(bill_id);
```

**En Java (`Sale.java`) :**

```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "bill_id")
private Bill bill;
```

- La colonne est **nullable** (les ventes existantes n'ont pas de `bill_id`).
- `ON DELETE SET NULL` : si la facture est supprimée, la vente n'est pas supprimée.
- Permet des requêtes `WHERE sale.bill.paymentStatus = 'UNPAID'` directement en JPQL.

---

## Configuration HikariCP

Configuration de production (Railway / Neon serverless PostgreSQL) :

```properties
# application-prod.properties
spring.datasource.hikari.maximum-pool-size=5
spring.datasource.hikari.minimum-idle=2
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.idle-timeout=180000      # 3 min < Neon 5 min idle
spring.datasource.hikari.max-lifetime=600000       # 10 min (= limite Neon)
spring.datasource.hikari.keepalive-time=60000      # Ping toutes les 60s
spring.datasource.hikari.connection-test-query=SELECT 1
```

Le pool de 5 connexions est calibré pour le tier gratuit de Neon (max 25 connexions). Les timeouts sont calés sous les limites de fermeture automatique de Neon.
