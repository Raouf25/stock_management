# 📝 Guide d'Intégration des Données CSV

## 📌 Vue d'ensemble

Le système charge automatiquement les données depuis les fichiers CSV lors du démarrage de l'application. Aucune manipulation manuelle requise !

## 📂 Fichiers CSV Utilisés

### 1. `Products.csv`
**Localisation** : `src/main/resources/Products.csv`

**Format** :
```csv
category,name,unit,unit_price_ht,unit_price_ttc,initial_stock_quantity,current_stock_quantity
Impressions,VALPRIMER,1.000 KG,8.656,10.300,150,150
Impressions,VALFIX,1.000 KG,8.209,9.769,150,150
```

**Colonnes** :
| Colonne | Type | Description |
|---------|------|-------------|
| `category` | String | Catégorie du produit (ex: Impressions) |
| `name` | String | Désignation du produit |
| `unit` | String | Unité de mesure (kg, L, pièce) |
| `unit_price_ht` | Double | Prix unitaire HT |
| `unit_price_ttc` | Double | Prix unitaire TTC |
| `initial_stock_quantity` | Integer | Quantité initiale en stock |
| `current_stock_quantity` | Integer | Quantité actuelle (généralement = initiale) |

**Exemple de contenu complet** :
```csv
category,name,unit,unit_price_ht,unit_price_ttc,initial_stock_quantity,current_stock_quantity
Impressions,VALPRIMER,1.000 KG,8.656,10.300,150,150
Impressions,VALPRIMER,4.000 KG,30.311,36.071,150,150
Impressions,VALPRIMER,18.000 KG,126.450,150.476,150,150
Impressions,VALFIX,1.000 KG,8.209,9.769,150,150
Impressions,VALFIX,4.000 KG,27.744,33.015,150,150
Impressions,VALFIX,18.000 KG,118.260,140.729,150,150
```

### 2. `Feuille1.csv` (Optionnel)
**Localisation** : `src/main/resources/Feuille1.csv`

**Contient** : Historique de ventes (à usage futur)

**Format** :
```csv
DATE,CLIENT,CHANTIER,DESIGNATION,PRIX ACHAT,PRIX VENTE,QUANTITE,TOTAL ACHAT TTC,TOTAL VENTE TTC,PAIEMENT CLIENT
2/8/2024,BOUSRIA,,VALETANCHE 18 KG,115,140,6,690,840,PAID
```

## 🔄 Flux de Chargement Automatique

### Au Démarrage de l'Application

```
1. Application Startup
   ↓
2. ApplicationReadyEvent (tous les beans prêts)
   ↓
3. CsvDataLoaderService.loadDataFromCsv()
   ├─ if (productRepository.count() > 0) {
   │    log "Données existent déjà"
   │    return
   │ }
   ├─ createDefaultSuppliers()
   │  └─ Créer "VALDECO" et "DEFAULT_SUPPLIER"
   ├─ loadProductsFromCsv()
   │  ├─ Ouvrir Products.csv
   │  ├─ Pour chaque ligne :
   │  │  ├─ Parser les valeurs
   │  │  ├─ Créer Product
   │  │  └─ Sauvegarder en DB
   │  └─ Fermer le fichier
   └─ log "Chargement terminé"
```

### Variables d'Environnement

```properties
# Dans application.properties
spring.sql.init.mode=never           # Pas de SQL init
spring.jpa.defer-datasource-initialization=false
```

## ✨ Idempotence Garantie

**Fonctionnement** :

```java
if (productRepository.count() > 0) {
    logger.info("Les données existent déjà. Pas de rechargement.");
    return;
}
```

**Avantages** :
- ✅ Redémarrage sans duplication des données
- ✅ Pas de suppression de données existantes
- ✅ Sûr pour les redémarrages
- ✅ Permet les migrations progressives

## 🛠️ Ajouter des Produits via CSV

### Méthode 1 : Avant le Démarrage (Recommandé)

1. **Éditer** `src/main/resources/Products.csv`
2. **Ajouter** une nouvelle ligne :
   ```csv
   Impressions,NOUVEAU_PRODUIT,1.000 KG,5.0,6.0,100,100
   ```
3. **Supprimer** les données de la base de données
4. **Redémarrer** l'application

### Méthode 2 : Via l'API REST (Après Démarrage)

```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "designation": "NOUVEAU_PRODUIT",
    "name": "Nouveau Produit",
    "category": "Impressions",
    "unit": "1.000 KG",
    "initialStockQuantity": 100,
    "currentStockQuantity": 100,
    "initialStockValue": 600.0,
    "currentStockValue": 600.0,
    "cmp": 6.0,
    "unitPriceBought": 5.0,
    "unitPriceSold": 6.0
  }'
```

### Méthode 3 : Bulk Import (SQL Direct)

```sql
INSERT INTO product (
  designation, name, category, unit,
  initial_stock_quantity, current_stock_quantity,
  initial_stock_value, current_stock_value, cmp,
  unit_price_bought, unit_price_sold, supplier_id
) VALUES (
  'PRODUIT_NEW', 'Produit Nouveau', 'Impressions', '1.000 KG',
  100, 100, 600.0, 600.0, 6.0, 5.0, 6.0, 1
);
```

## 🔄 Format de Parsing

### Conversion des Valeurs

```java
// Doubles
"8.656" → 8.656
"8,656" → 8.656 (conversion virgule → point)

// Entiers
"150" → 150
"0" → 0 (si erreur)

// Gestion d'erreurs
Valeur invalide → log warning → défaut (0.0 ou 0)
```

## 📊 Exemple de Données Chargées

**Avant le chargement** :
```
Produits en DB : 0
Fournisseurs : 0
Mouvements : 0
```

**Après le chargement** (118 lignes de Products.csv) :
```
Produits en DB : 118 ✓
Fournisseurs : 2 ✓
  - VALDECO
  - DEFAULT_SUPPLIER
Mouvements : 0 (créés lors des achats/ventes)
Stock initial total : ~17,700 unités
Valeur initiale : ~200,000.00 TTC
```

## 🚨 Troubleshooting

### Les données ne se chargent pas

**Symptômes** :
```
GET /api/products → []
Logs : "Données existent déjà" (incorrect)
```

**Solutions** :

1. **Vérifier le fichier CSV existe**
   ```bash
   ls -la src/main/resources/Products.csv
   ```

2. **Vérifier les logs**
   ```bash
   docker-compose logs stock_app | grep -i "csv\|loader"
   ```

3. **Vérifier que la BD est vide**
   ```bash
   curl http://localhost:8080/api/products
   # Doit retourner []
   ```

4. **Supprimer les données et redémarrer**
   ```bash
   docker-compose exec postgres psql -U postgres -d stock_db << EOF
   DELETE FROM stock_mouvement;
   DELETE FROM sale;
   DELETE FROM purchase;
   DELETE FROM product;
   DELETE FROM supplier;
   EOF
   docker-compose restart stock_app
   ```

### Erreurs de parsing

**Symptômes** :
```
WARN [...] Erreur lors du traitement de la ligne 42
```

**Causes possibles** :
- Colonne manquante
- Format nombre invalide
- Encodage UTF-8 incorrect

**Solution** :
```bash
# Vérifier l'encodage du fichier
file -i src/main/resources/Products.csv
# Doit être : UTF-8 ou ASCII

# Convertir si nécessaire
iconv -f ISO-8859-1 -t UTF-8 Products.csv > Products_utf8.csv
mv Products_utf8.csv Products.csv
```

### Port 8080 occupé

```bash
# Identifier le processus
lsof -i :8080

# Terminer
kill -9 <PID>

# Ou changer le port dans application.properties
server.port=8081
```

## 📈 Intégration avec Feuille1.csv

**Structure de Feuille1.csv** :
```csv
DATE,CLIENT,CHANTIER,DESIGNATION,PRIX ACHAT,PRIX VENTE,QUANTITE,TOTAL ACHAT TTC,TOTAL VENTE TTC,PAIEMENT CLIENT
```

**Utilisation future** :
- Importer les ventes historiques
- Créer les mouvements automatiquement
- Valider les historiques

**Service à créer** (optionnel) :
```java
@Service
public class SalesHistoryLoaderService {
    @EventListener(ApplicationReadyEvent.class)
    public void loadHistoricalSales() {
        // Implémenter le chargement depuis Feuille1.csv
    }
}
```

## 🔒 Bonnes Pratiques

### ✅ Avant de Charger les Données

1. ✓ Vérifier le format du CSV
2. ✓ Vérifier l'encodage (UTF-8)
3. ✓ Tester avec un petit fichier d'abord
4. ✓ Sauvegarder un backup

### ✅ Après le Chargement

1. ✓ Vérifier le nombre de produits
2. ✓ Vérifier les fournisseurs créés
3. ✓ Tester un achat/vente
4. ✓ Vérifier les mouvements générés

### ✅ En Production

1. ✓ Utiliser les variables d'environnement
2. ✓ Logging actif pour audit
3. ✓ Backups réguliers
4. ✓ Versionning des fichiers CSV

## 📞 Support

### Vérifier le Chargement

```bash
# API
curl http://localhost:8080/api/products | jq 'length'
# Doit retourner > 0

# Logs
docker-compose logs stock_app | grep "Chargement"

# Base de données
docker-compose exec postgres psql -U postgres -d stock_db -e \
  "SELECT COUNT(*) FROM stock_db.product;"
```

### Réinitialiser et Recommencer

```bash
# 1. Arrêter l'application
docker-compose down

# 2. Nettoyer la base de données
docker volume rm stock_management_postgres_data

# 3. Redémarrer
docker-compose up -d

# 4. Vérifier
curl http://localhost:8080/api/products
```

---

**Gestion des données CSV complète et automatisée ✓**
