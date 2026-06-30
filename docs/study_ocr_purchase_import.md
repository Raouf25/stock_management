# Étude — Import de documents d'achat par IA · Bhouri Stock

> **Date :** 2026-06-30  
> **Stack :** Angular 17 · Spring Boot 3.3.7 · PostgreSQL 15 · Apache PDFBox · Claude API (Anthropic)  
> **Objectif :** Upload d'un document PDF fournisseur → extraction automatique → pré-remplissage du formulaire d'achat → validation humaine → insertion en base

---

## 1. Le problème à résoudre

Saisir un bon de commande ou une facture fournisseur manuellement est lent et source d'erreurs. Un document PDF contient déjà toutes les informations structurées nécessaires :

```
┌─────────────────────────────────────┐
│  FACTURE  N° FAC-2024-0891          │
│  Date : 15/03/2024                  │
│  Fournisseur : SARL Dupont          │
│                                     │
│  Réf.    Désignation   Qté  P.U TTC │
│  P-0042  Câble HDMI    50   12,500  │
│  P-0078  Switch 8P     10   89,000  │
│                        Total: 1515  │
└─────────────────────────────────────┘
```

→ L'objectif est d'extraire ces données et de les faire correspondre aux enregistrements existants (`supplier`, `product`) **sans aucune saisie manuelle**, tout en garantissant que l'utilisateur valide avant toute modification de la base.

---

## 2. Contexte — Modèle de données existant

### Entités impliquées

```
Purchase
  ├─ datePurchase        LocalDate
  ├─ supplier            → Supplier.name
  ├─ invoiceNumber       String
  ├─ comment             String
  └─ lines[]
       ├─ product        → Product.name / Product.designation / Product.reference
       ├─ quantity        Integer
       ├─ unitPriceTTC    BigDecimal
       └─ totalLineAmountTTC  BigDecimal

Product
  ├─ reference           Long      ← identifiant numérique unique
  ├─ name                String    ← "Câble HDMI"
  ├─ designation         String    ← "HDMI 2.0 4K 1m"
  ├─ category / gamme / unit
  └─ supplier            → Supplier

Supplier
  └─ name                String    ← "SARL Dupont"
```

### Endpoint existant

`POST /api/purchases` accepte déjà un `PurchaseDTO` avec `List<PurchaseLineDTO>` — **rien à changer** dans l'API de création.

---

## 3. Comparaison des approches techniques

| Approche | Fiabilité | Coût | Confidentialité | Complexité | Verdict |
|----------|-----------|------|-----------------|------------|---------|
| **OCR local** (Tesseract) | ⭐⭐ ~40% | Gratuit | ✅ 100% local | Élevée | ❌ Fragile, trop de variantes de format |
| **Document AI** (AWS Textract / Azure Form Recognizer) | ⭐⭐⭐⭐ ~85% | ~0,01$/page | ⚠️ Données envoyées en cloud | Moyenne | ⚠️ Dépendance vendor |
| **LLM Vision** (GPT-4o / Claude avec PDF) | ⭐⭐⭐⭐⭐ ~92% | ~0,02$/page | ⚠️ Cloud | Faible | ✅ Meilleur pour docs non structurés |
| **PDFBox + LLM** *(recommandé)* | ⭐⭐⭐⭐⭐ ~90% | ~0,005$/page | ⚠️ Texte envoyé, pas le PDF | Faible | ✅ **Recommandé** |

### Pourquoi PDFBox + LLM (approche hybride)

La plupart des PDFs fournisseurs sont **numériques** (générés par un ERP ou un logiciel comptable) — ils contiennent du texte sélectionnable, pas des images scannées. Apache PDFBox extrait ce texte localement, gratuitement, sans API externe. Seul le texte (pas le PDF binaire) est envoyé au LLM pour l'extraction.

**Si le PDF est scanné** (image uniquement) : fallback OCR avec Tesseract, ou upload d'image directement à un LLM vision.

---

## 4. Architecture proposée

```
┌──────────────────────────────────────────────────────────────┐
│ FRONTEND                                                     │
│                                                              │
│  [Importer un document]                                      │
│         │                                                    │
│  ┌─────────────────┐                                         │
│  │  Drag & Drop    │  PDF / JPG / PNG (max 10 Mo)           │
│  │  Zone upload    │                                         │
│  └────────┬────────┘                                         │
│           │  POST /api/purchases/import                      │
│           ▼                                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Formulaire pré-rempli (état DRAFT)                 │    │
│  │                                                     │    │
│  │  Fournisseur : [SARL Dupont ▼]  ✅ trouvé           │    │
│  │  N° Facture  : [FAC-2024-0891]  ✅                  │    │
│  │  Date        : [15/03/2024]     ✅                  │    │
│  │                                                     │    │
│  │  Ligne 1 : Câble HDMI    ✅ → Réf. P-0042          │    │
│  │            Qté: 50  P.U: 12,500                    │    │
│  │  Ligne 2 : Switch 8P     ⚠️ → [Choisir produit ▼] │    │
│  │            Qté: 10  P.U: 89,000                    │    │
│  │                                                     │    │
│  │  [Annuler]        [Confirmer et enregistrer]        │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ BACKEND  POST /api/purchases/import                          │
│                                                              │
│  1. Réception du fichier (MultipartFile)                     │
│  2. PurchaseImportService                                    │
│       ├─ PDFBox → extraction du texte brut                   │
│       │   (si PDF image → Tesseract fallback)                │
│       │                                                      │
│       ├─ ClaudeExtractorService                              │
│       │   → prompt structuré → JSON normalisé               │
│       │                                                      │
│       └─ MatchingService                                     │
│           ├─ fuzzy match sur Supplier.name                   │
│           ├─ fuzzy match sur Product.name / .designation     │
│           │                      / .reference                │
│           └─ retourne PurchaseImportResultDTO                │
│                                                              │
│  3. Sauvegarde en table `purchase_import` (statut PENDING)  │
│  4. Retourne le DTO au frontend (pas encore en DB achat)    │
│                                                              │
│  POST /api/purchases/import/{id}/confirm                     │
│  → Valide le draft → appelle PurchaseService.createPurchase  │
│  → Marque import comme CONFIRMED                             │
└──────────────────────────────────────────────────────────────┘
```

**Principe clé — "Human in the loop"** : l'IA pré-remplit, l'humain confirme. La base de données n'est jamais modifiée directement par l'IA.

---

## 5. Plan d'implémentation

### 5.1 Backend

#### Migration V22 — Table d'audit des imports

```sql
CREATE TABLE purchase_import (
    id              BIGSERIAL PRIMARY KEY,
    original_filename VARCHAR(255),
    file_size_bytes   BIGINT,
    raw_text          TEXT,          -- texte extrait par PDFBox
    ai_response_json  TEXT,          -- réponse brute du LLM
    parsed_json       TEXT,          -- JSON normalisé après parsing
    status            VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    --   PENDING → CONFIRMED | REJECTED | ERROR
    error_message     TEXT,
    purchase_id       BIGINT REFERENCES purchase(id),  -- renseigné après confirmation
    created_by        BIGINT REFERENCES users(id),
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    confirmed_at      TIMESTAMP
);
```

→ Chaque import est tracé. En cas de problème, on peut rejouer l'extraction.

#### Dépendance Maven — Apache PDFBox

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.apache.pdfbox</groupId>
    <artifactId>pdfbox</artifactId>
    <version>3.0.2</version>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>  <!-- pour appel HTTP async -->
</dependency>
```

#### `PdfTextExtractorService.java`

```java
@Service
public class PdfTextExtractorService {

    public String extractText(MultipartFile file) throws IOException {
        try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(doc);
            if (text.isBlank()) {
                throw new UnsupportedDocumentException(
                    "PDF scanné détecté — OCR non disponible. Veuillez uploader un PDF numérique."
                );
            }
            return text;
        }
    }
}
```

#### `ClaudeExtractorService.java` — le prompt structuré

```java
@Service
public class ClaudeExtractorService {

    @Value("${claude.api.key}")
    private String apiKey;

    private static final String SYSTEM_PROMPT = """
        Tu es un assistant d'extraction de données pour un logiciel de gestion de stock.
        Analyse le texte d'une facture ou d'un bon de commande fournisseur et retourne
        un JSON valide avec exactement cette structure :

        {
          "invoiceNumber": "string ou null",
          "invoiceDate": "YYYY-MM-DD ou null",
          "supplierName": "string ou null",
          "lines": [
            {
              "productReference": "string ou null",
              "productDescription": "string",
              "quantity": nombre,
              "unitPriceTTC": nombre
            }
          ]
        }

        Règles :
        - Ne pas inventer de données. Si une valeur est absente, utiliser null.
        - unitPriceTTC est le prix unitaire TTC (toutes taxes comprises).
        - Retourner UNIQUEMENT le JSON, sans texte avant ou après.
        """;

    public String extractFromText(String pdfText) {
        // Appel à l'API Claude via HTTP (WebClient)
        // Model : claude-haiku-4-5 (rapide + économique pour cette tâche)
        // Max tokens : 1024 (le JSON structuré est court)
        ...
    }
}
```

> **Choix du modèle :** `claude-haiku-4-5` suffit pour l'extraction structurée (tâche simple, prompt court). Coût ≈ 0,001 $ par document. Switcher sur `claude-sonnet-4-6` si la précision est insuffisante.

#### `MatchingService.java` — le cœur de la fiabilité

```java
@Service
@RequiredArgsConstructor
public class MatchingService {

    private final SupplierRepository supplierRepo;
    private final ProductRepository productRepo;

    // Score de similarité minimum pour considérer un match (0.0 à 1.0)
    private static final double MIN_SCORE = 0.75;

    public MatchResult<Supplier> matchSupplier(String extractedName) {
        return supplierRepo.findAll().stream()
            .map(s -> new ScoredMatch<>(s, similarity(extractedName, s.getName())))
            .filter(m -> m.score() >= MIN_SCORE)
            .max(Comparator.comparingDouble(ScoredMatch::score))
            .map(m -> MatchResult.found(m.entity(), m.score()))
            .orElse(MatchResult.notFound(extractedName));
    }

    public MatchResult<Product> matchProduct(String reference, String description) {
        // 1. Match exact sur la référence numérique (fiable à 100%)
        if (reference != null) {
            try {
                Long ref = Long.parseLong(reference.replaceAll("[^0-9]", ""));
                Optional<Product> exact = productRepo.findByReference(ref);
                if (exact.isPresent()) return MatchResult.found(exact.get(), 1.0);
            } catch (NumberFormatException ignored) {}
        }

        // 2. Fuzzy match sur name + designation
        return productRepo.findAll().stream()
            .map(p -> {
                double scoreName  = similarity(description, p.getName());
                double scoreDesig = similarity(description, p.getDesignation());
                return new ScoredMatch<>(p, Math.max(scoreName, scoreDesig));
            })
            .filter(m -> m.score() >= MIN_SCORE)
            .max(Comparator.comparingDouble(ScoredMatch::score))
            .map(m -> MatchResult.found(m.entity(), m.score()))
            .orElse(MatchResult.notFound(description));
    }

    // Indice de Jaro-Winkler (précis pour les noms propres et désignations)
    private double similarity(String a, String b) {
        if (a == null || b == null) return 0;
        return JaroWinklerSimilarity.apply(
            normalize(a), normalize(b)
        );
    }

    private String normalize(String s) {
        return s.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", " ")
                .trim();
    }
}
```

#### `PurchaseImportResultDTO.java` — ce que le frontend reçoit

```java
public record PurchaseImportResultDTO(
    Long importId,              // ID dans purchase_import (pour la confirmation)
    String invoiceNumber,
    LocalDate invoiceDate,

    MatchResult<SupplierDTO> supplier,  // { matched: true/false, entity, score, rawValue }

    List<LineResult> lines
) {
    public record LineResult(
        String rawDescription,
        MatchResult<ProductDTO> product,
        Integer quantity,
        BigDecimal unitPriceTTC,
        BigDecimal totalLineTTC
    ) {}
}

public record MatchResult<T>(
    boolean matched,
    T entity,            // null si non trouvé
    Double score,        // 0.0 à 1.0 (null si non trouvé)
    String rawValue      // valeur brute extraite du document
) {}
```

#### Nouveaux endpoints

```
POST /api/purchases/import
     Content-Type: multipart/form-data
     Body: file (PDF/image)
     → PurchaseImportResultDTO   (statut PENDING, pas encore en DB achat)

POST /api/purchases/import/{importId}/confirm
     Body: PurchaseDTO (le formulaire validé par l'utilisateur)
     → PurchaseDTO   (achat créé en base, import marqué CONFIRMED)

POST /api/purchases/import/{importId}/reject
     → void   (import marqué REJECTED, aucune modification achat)

GET  /api/purchases/import
     → Page<PurchaseImportSummaryDTO>   (historique des imports, ADMIN only)
```

---

### 5.2 Frontend

#### Nouveau composant `PurchaseImportComponent`

**État 1 — Zone de dépôt**
```html
<div class="upload-zone" (dragover)="onDragOver($event)" (drop)="onDrop($event)" (click)="fileInput.click()">
  <i class="bi bi-file-earmark-arrow-up"></i>
  <p>Glissez une facture PDF ici ou <span class="link">cliquez pour choisir</span></p>
  <small>PDF, JPG, PNG · Max 10 Mo</small>
  <input #fileInput type="file" accept=".pdf,.jpg,.jpeg,.png" hidden (change)="onFileSelect($event)" />
</div>
```

**État 2 — Analyse en cours**
```html
<div class="analyzing">
  <div class="spinner-lg"></div>
  <p>Analyse du document en cours…</p>
  <small>L'IA extrait les informations de votre facture</small>
</div>
```

**État 3 — Résultats à confirmer**
```html
<!-- En-tête du document -->
<div class="import-header">
  <div class="field">
    <label>Fournisseur</label>
    <div class="match-field" [class.match-ok]="result.supplier.matched" [class.match-ko]="!result.supplier.matched">
      <i class="bi" [class.bi-check-circle-fill]="result.supplier.matched" [class.bi-exclamation-triangle-fill]="!result.supplier.matched"></i>
      <select [(ngModel)]="form.supplierId" *ngIf="!result.supplier.matched">
        <option *ngFor="let s of suppliers" [value]="s.id">{{ s.name }}</option>
      </select>
      <span *ngIf="result.supplier.matched">{{ result.supplier.entity.name }}</span>
      <small class="raw-value" *ngIf="!result.supplier.matched">"{{ result.supplier.rawValue }}" non trouvé</small>
    </div>
  </div>
  <!-- N° facture, date... -->
</div>

<!-- Lignes -->
<div class="import-lines">
  <div class="line-row" *ngFor="let line of result.lines; let i = index">
    <div class="match-indicator" [class.ok]="line.product.matched" [class.ko]="!line.product.matched">
      {{ line.product.matched ? '✅' : '⚠️' }}
    </div>
    <div class="line-desc">
      <span class="matched-name" *ngIf="line.product.matched">{{ line.product.entity.name }}</span>
      <select *ngIf="!line.product.matched" [(ngModel)]="form.lines[i].productId">
        <option *ngFor="let p of products" [value]="p.id">{{ p.name }}</option>
      </select>
      <small class="raw-value">"{{ line.rawDescription }}"</small>
    </div>
    <input type="number" [(ngModel)]="form.lines[i].quantity" />
    <input type="number" [(ngModel)]="form.lines[i].unitPriceTTC" />
    <span class="line-total">{{ form.lines[i].quantity * form.lines[i].unitPriceTTC | number:'1.3-3' }}</span>
  </div>
</div>

<!-- Actions -->
<div class="import-actions">
  <button class="btn-cancel" (click)="reject()">Annuler</button>
  <button class="btn-primary" (click)="confirm()" [disabled]="!isValid()">
    <i class="bi bi-check-lg"></i> Confirmer et enregistrer
  </button>
</div>
```

#### Intégration dans la page Products (existante)

Dans `products.component.ts`, le bouton "Nouvel Achat" existant est accompagné d'un bouton "Importer" :

```html
<div class="action-group">
  <button class="btn-primary" (click)="openPurchaseForm()">
    <i class="bi bi-plus-lg"></i> Nouvel Achat
  </button>
  <button class="btn-secondary" (click)="openImport()">
    <i class="bi bi-file-earmark-arrow-up"></i> Importer
  </button>
</div>
```

---

## 6. Gestion des cas difficiles

| Cas | Comportement |
|-----|-------------|
| **PDF scanné** (pas de texte) | Message d'erreur clair : "PDF scanné non supporté. Veuillez uploader un PDF numérique ou une photo de bonne qualité." |
| **Fournisseur non trouvé** | Champ fournisseur en rouge, dropdown de sélection manuelle |
| **Produit non trouvé** | Ligne en orange, dropdown de sélection manuelle avec filtre de recherche |
| **Plusieurs factures dans un PDF** | L'IA extrait la première — avertissement si le total ne correspond pas |
| **Prix HT vs TTC ambigu** | L'IA indique sa confiance ; si doute, champ de prix éditable |
| **Devise étrangère** | Extraite telle quelle, conversion manuelle à charge de l'utilisateur |
| **API Claude indisponible** | Fallback : affiche le PDF dans un viewer + formulaire manuel classique |
| **Timeout LLM (> 30s)** | Le job est relancé en arrière-plan, notification quand prêt |

---

## 7. Sécurité et confidentialité

### Ce qui est envoyé à l'API Claude
Uniquement le **texte brut** extrait par PDFBox — pas le fichier PDF binaire. Cela réduit :
- La surface de données envoyées (pas de signatures, tampons, logos)
- Le coût (facturation par token sur le texte, pas sur le PDF)

### Alternatives si les données sont sensibles (option)
- Déployer **Ollama** en local avec un modèle LLM (ex: `Qwen2.5:7b`) — 100% on-premise, zéro cloud
- Performances légèrement inférieures mais confidentialité totale

### Validation côté backend
Même avec un utilisateur malicieux qui modifie le DTO avant confirmation, toutes les validations de `PurchaseService.createPurchase()` restent actives — le flow de confirmation passe par le même service.

---

## 8. Configuration

```properties
# application.properties
claude.api.key=${CLAUDE_API_KEY}
claude.model=claude-haiku-4-5-20251001
claude.max.tokens=1024
claude.timeout.seconds=30

purchase.import.max.file.size.mb=10
purchase.import.allowed.types=application/pdf,image/jpeg,image/png
```

---

## 9. Estimation de l'effort

| Phase | Tâches | Jours |
|-------|--------|-------|
| **Phase 1** — Backend infrastructure | `PdfTextExtractorService`, `ClaudeExtractorService`, migration V22 | 2 j |
| **Phase 2** — Matching | `MatchingService` (Jaro-Winkler), `PurchaseImportResultDTO`, tests unitaires matching | 2 j |
| **Phase 3** — API | `PurchaseImportController` (3 endpoints), `PurchaseImportService` | 1,5 j |
| **Phase 4** — Frontend | `PurchaseImportComponent` (upload + preview + confirmation), intégration Products page | 3 j |
| **Phase 5** — Edge cases & tests | PDF scanné, timeouts, fallbacks, tests E2E | 1,5 j |
| **Total** | | **~10 jours** |

---

## 10. Coût opérationnel estimé

| Volume | Coût Claude Haiku |
|--------|------------------|
| 10 imports/mois | ~0,01 $ |
| 100 imports/mois | ~0,10 $ |
| 1 000 imports/mois | ~1,00 $ |

Négligeable. Même en passant sur `claude-sonnet-4-6` pour plus de précision, le coût reste sous 10 $/mois pour un usage professionnel standard.

---

## 11. Récapitulatif — Décisions à prendre

| # | Question | Recommandation |
|---|----------|---------------|
| D1 | **LLM à utiliser** | Claude Haiku (rapide, économique) ou Sonnet (plus précis) |
| D2 | **PDF scanné** | Message d'erreur v1, Tesseract OCR v2 |
| D3 | **Confidentialité** | API Claude (cloud) ou Ollama local (on-premise) |
| D4 | **Seuil de matching** | 0.75 recommandé — ajustable par config |
| D5 | **Persistance du PDF** | Conserver le fichier original en `/uploads/imports/` ou ne conserver que le texte extrait |
| D6 | **Imports multiples** | Un upload → un achat (v1), multi-import batch (v2) |

---

## 12. Ce qui n'existait pas vs ce qui existe déjà

```
[✅ Déjà fait]  POST /api/purchases — endpoint de création
[✅ Déjà fait]  PurchaseDTO avec List<PurchaseLineDTO>
[✅ Déjà fait]  PurchaseService.createPurchase()
[✅ Déjà fait]  Formulaire "Nouvel Achat" dans Products page

[⬜ Phase 1]  PdfTextExtractorService (PDFBox)
[⬜ Phase 1]  ClaudeExtractorService (API Anthropic)
[⬜ Phase 1]  Migration V22 (purchase_import table)
[⬜ Phase 2]  MatchingService (fuzzy match fournisseur + produit)
[⬜ Phase 3]  POST /api/purchases/import + /confirm + /reject
[⬜ Phase 4]  PurchaseImportComponent (Angular)
[⬜ Phase 4]  Bouton "Importer" dans Products page
```
