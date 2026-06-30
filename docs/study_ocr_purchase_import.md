# Étude — Import de documents d'achat par IA (PDF + Photo mobile) · Bhouri Stock

> **Date :** 2026-06-30  
> **Stack :** Angular 17 (PWA) · Spring Boot 3.3.7 · PostgreSQL 15 · Apache PDFBox · Claude Vision API  
> **Objectif :** Upload d'un document (PDF numérique, PDF scanné, ou **photo prise sur mobile**) → extraction automatique par IA → pré-remplissage du formulaire d'achat → validation humaine → insertion en base

---

## 1. Le problème élargi

La première version de cette étude supposait des PDFs numériques. En réalité, les documents fournisseurs arrivent sous plusieurs formes :

| Source | Format | Contenu |
|--------|--------|---------|
| ERP fournisseur | PDF numérique | Texte sélectionnable ✅ |
| Scanner bureau | PDF/image | Image raster ⚠️ |
| **Photo mobile** | **JPG, HEIC, PNG** | **Image raster, perspective, ombres** ⚠️ |
| Email fournisseur | PDF joint | Souvent numérique ✅ |

Une photo prise avec un smartphone est le cas le plus exigeant : perspective déformée, ombres, flou, format HEIC (iPhone), taille 8–15 Mo, rotation EXIF arbitraire.

---

## 2. Analyse des approches — avec photo mobile

| Approche | PDF numérique | PDF scanné | Photo mobile | Verdict |
|----------|:---:|:---:|:---:|---------|
| PDFBox seul | ✅ | ❌ | ❌ | Insuffisant |
| Tesseract OCR | ❌ | ⚠️ 50% | ⚠️ 30% | Trop fragile |
| AWS Textract / Google Doc AI | ✅ | ✅ | ✅ | Vendor lock-in, $0.015/page |
| **Claude Vision API** | ✅ (via image) | ✅ | ✅ | ✅ **Recommandé** |
| PDFBox + Claude Vision (hybride) | ✅ (texte) | ✅ (image) | ✅ (image) | ✅✅ **Optimal** |

### Pourquoi Claude Vision gagne sur la photo mobile

Claude Vision comprend nativement :
- Documents en perspective (photo prise en diagonale)
- Ombres et éclairage inégal
- Texte manuscrit partiel
- Tableaux mal alignés
- Plusieurs langues mélangées (arabe + français sur une même facture)

Ce qu'aucun OCR classique ne gère correctement sans pré-traitement lourd.

---

## 3. Architecture cible — Pipeline unifié

```
┌─────────────────────────────────────────────────────────────────────┐
│ SOURCES D'ENTRÉE                                                    │
│                                                                     │
│  💻 Desktop              📱 Mobile                                  │
│  Drag & drop PDF         Bouton "Photographier"                     │
│  Sélection fichier       Galerie photo                              │
└──────────────────┬──────────────────────┬───────────────────────────┘
                   │                      │
                   ▼                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND — Pre-processing (dans le navigateur, avant upload)        │
│                                                                     │
│  • Détection du type : PDF vs image                                 │
│  • Compression image → max 1 600 px / max 1 Mo (Canvas API)        │
│  • Conversion HEIC → JPEG (bibliothèque heic2any)                  │
│  • Correction rotation EXIF                                         │
│  • Aperçu du document avant envoi                                   │
│  • Indicateur de progression (crucial sur mobile 4G)               │
└──────────────────────────────┬──────────────────────────────────────┘
                               │  multipart/form-data
                               │  POST /api/purchases/import
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│ BACKEND — DocumentRouterService                                     │
│                                                                     │
│           ┌─────────────────────────────────┐                      │
│           │  Quel type de fichier ?          │                      │
│           └────────┬────────────┬────────────┘                      │
│                    │            │                                    │
│             PDF    │            │  Image (JPG/PNG/HEIC)             │
│                    ▼            │                                    │
│  ┌─────────────────────────┐   │                                    │
│  │  PDFBox                 │   │                                    │
│  │  extraction texte       │   │                                    │
│  └──────────┬──────────────┘   │                                    │
│             │                  │                                    │
│      texte  │  texte vide      │                                    │
│      trouvé │  (PDF scanné)    │                                    │
│             │        │         │                                    │
│             ▼        ▼         ▼                                    │
│  ┌──────────────────────────────────────────────┐                  │
│  │  ClaudeVisionService                         │                  │
│  │                                              │                  │
│  │  Mode TEXTE :   prompt + texte brut          │                  │
│  │  Mode VISION :  prompt + image base64        │                  │
│  │                                              │                  │
│  │  → JSON structuré normalisé                  │                  │
│  └──────────────────┬───────────────────────────┘                  │
│                     │                                               │
│                     ▼                                               │
│  ┌──────────────────────────────────────────────┐                  │
│  │  MatchingService                             │                  │
│  │  fuzzy match fournisseur + produits          │                  │
│  └──────────────────┬───────────────────────────┘                  │
│                     │                                               │
│                     ▼                                               │
│  ┌──────────────────────────────────────────────┐                  │
│  │  Sauvegarde purchase_import (statut PENDING) │                  │
│  └──────────────────┬───────────────────────────┘                  │
│                     │  PurchaseImportResultDTO                      │
└─────────────────────┼───────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND — Formulaire de confirmation                               │
│                                                                     │
│  Résultats affichés avec indicateurs de confiance                  │
│  Champs non résolus → dropdowns de sélection manuelle              │
│  Aperçu miniature du document original                             │
│                                                                     │
│  [Annuler]              [Confirmer et enregistrer]                 │
└──────────────────────────────────────────────────────────────────────┘
```

**Principe inchangé — "Human in the loop"** : l'IA propose, l'humain valide. La base n'est jamais modifiée directement.

---

## 4. Pré-traitement frontend — spécificités mobile

### 4.1 Capture mobile dans Angular

```html
<!-- Deux modes d'accès selon le device -->
<input
  #fileInput
  type="file"
  accept="image/*,application/pdf,.heic,.heif"
  [attr.capture]="isMobile ? 'environment' : null"
  hidden
  (change)="onFileSelected($event)"
/>

<!-- Desktop : drag & drop zone -->
<div class="upload-zone desktop-only" (dragover)="onDrag($event)" (drop)="onDrop($event)">
  <i class="bi bi-file-earmark-arrow-up"></i>
  <p>Glissez votre facture ici</p>
  <button (click)="fileInput.click()">Choisir un fichier</button>
</div>

<!-- Mobile : bouton simple + guide photo -->
<div class="mobile-upload mobile-only">
  <button class="btn-camera" (click)="fileInput.click()">
    <i class="bi bi-camera"></i> Photographier la facture
  </button>
  <button class="btn-gallery" (click)="openGallery()">
    <i class="bi bi-images"></i> Depuis la galerie
  </button>
  <div class="photo-tips">
    <p>📋 Conseils pour une bonne photo :</p>
    <ul>
      <li>Document posé à plat sur une surface sombre</li>
      <li>Bonne luminosité, évitez les reflets</li>
      <li>Tout le document visible dans le cadre</li>
    </ul>
  </div>
</div>
```

### 4.2 Compression et normalisation (avant upload)

```typescript
// purchase-import.service.ts
import heic2any from 'heic2any';
import imageCompression from 'browser-image-compression';

async prepareFileForUpload(file: File): Promise<File> {
  // 1. Conversion HEIC → JPEG (format iPhone)
  if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
    const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 });
    file = new File([blob as Blob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
  }

  // 2. Compression si image > 1 Mo (photo smartphone typique = 5–15 Mo)
  if (file.type.startsWith('image/') && file.size > 1_000_000) {
    file = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1600,  // résolution suffisante pour la lecture
      useWebWorker: true,
      exifOrientation: -1,     // correction automatique rotation EXIF
    });
  }

  return file;
}
```

> **Pourquoi compresser côté client ?**
> - Une photo iPhone 15 Pro brute = 12 Mo → 200K tokens Claude Vision = $0,60/image
> - Après compression à 1 Mo, même qualité de lecture → $0,05/image (×12 moins cher)
> - Réduit le temps d'upload sur réseau mobile 4G

### 4.3 Aperçu avant envoi

```typescript
// Afficher un aperçu du document AVANT d'envoyer à l'API
showPreview(file: File): void {
  if (file.type === 'application/pdf') {
    // Afficher la première page via PDF.js (optionnel)
    this.previewUrl = URL.createObjectURL(file);
  } else {
    const reader = new FileReader();
    reader.onload = e => this.previewUrl = e.target?.result as string;
    reader.readAsDataURL(file);
  }
}
```

L'utilisateur voit le document avant envoi → peut recadrer ou reprendre la photo si la qualité est mauvaise.

---

## 5. Backend — Pipeline de traitement

### 5.1 `DocumentRouterService` — détection et dispatch

```java
@Service
@RequiredArgsConstructor
public class DocumentRouterService {

    private final PdfTextExtractorService pdfExtractor;
    private final ClaudeVisionService claudeVision;

    public ExtractedPurchaseData process(MultipartFile file) throws IOException {
        String contentType = detectContentType(file);

        return switch (contentType) {
            case "application/pdf" -> processPdf(file);
            case "image/jpeg", "image/png", "image/webp" -> processImage(file);
            default -> throw new UnsupportedDocumentException(
                "Format non supporté : " + contentType + ". Formats acceptés : PDF, JPG, PNG."
            );
        };
    }

    private ExtractedPurchaseData processPdf(MultipartFile file) throws IOException {
        String text = pdfExtractor.extractText(file);

        if (text.isBlank()) {
            // PDF scanné → convertir la première page en image → Vision
            byte[] pageImage = pdfExtractor.renderFirstPageAsImage(file);
            return claudeVision.extractFromImage(pageImage, "image/png");
        }

        return claudeVision.extractFromText(text);
    }

    private ExtractedPurchaseData processImage(MultipartFile file) throws IOException {
        return claudeVision.extractFromImage(file.getBytes(), file.getContentType());
    }

    private String detectContentType(MultipartFile file) {
        // Ne pas faire confiance au Content-Type du client — détecter via les magic bytes
        byte[] header = Arrays.copyOf(file.getBytes(), 8);
        if (isPdf(header))  return "application/pdf";
        if (isJpeg(header)) return "image/jpeg";
        if (isPng(header))  return "image/png";
        throw new UnsupportedDocumentException("Format de fichier non reconnu.");
    }
}
```

### 5.2 `ClaudeVisionService` — prompt unifié texte + vision

```java
@Service
public class ClaudeVisionService {

    @Value("${claude.api.key}")
    private String apiKey;

    @Value("${claude.model:claude-haiku-4-5-20251001}")
    private String model;

    private static final String EXTRACTION_PROMPT = """
        Tu es un assistant spécialisé dans l'extraction de données de documents commerciaux.

        Analyse ce document (facture fournisseur, bon de commande, ou bon de livraison)
        et retourne UNIQUEMENT un JSON valide avec cette structure :

        {
          "documentType": "INVOICE" | "PURCHASE_ORDER" | "DELIVERY_NOTE" | "UNKNOWN",
          "invoiceNumber": "string ou null",
          "invoiceDate": "YYYY-MM-DD ou null",
          "supplierName": "string ou null",
          "supplierPhone": "string ou null",
          "currency": "string ou null",
          "lines": [
            {
              "productReference": "string ou null",
              "productDescription": "string",
              "quantity": nombre,
              "unitPrice": nombre,
              "totalLine": nombre ou null
            }
          ],
          "totalAmount": nombre ou null,
          "confidence": 0.0 à 1.0
        }

        Règles strictes :
        - Ne JAMAIS inventer de données. Si absent → null.
        - Si le document est une photo floue ou illisible → retourner confidence < 0.3
        - unitPrice = prix unitaire (HT ou TTC selon ce qui est indiqué)
        - productReference = référence numérique ou alphanumérique si présente
        - Retourner UNIQUEMENT le JSON, sans markdown, sans explication.
        """;

    // Mode 1 — texte (PDF numérique)
    public ExtractedPurchaseData extractFromText(String pdfText) {
        String payload = buildTextPayload(pdfText);
        String response = callClaude(payload);
        return parseResponse(response);
    }

    // Mode 2 — vision (photo mobile, PDF scanné, image)
    public ExtractedPurchaseData extractFromImage(byte[] imageBytes, String mimeType) {
        String base64 = Base64.getEncoder().encodeToString(imageBytes);
        String payload = buildVisionPayload(base64, mimeType);
        String response = callClaude(payload);
        return parseResponse(response);
    }

    private String buildVisionPayload(String base64, String mimeType) {
        return """
            {
              "model": "%s",
              "max_tokens": 1024,
              "messages": [{
                "role": "user",
                "content": [
                  {
                    "type": "image",
                    "source": {
                      "type": "base64",
                      "media_type": "%s",
                      "data": "%s"
                    }
                  },
                  {
                    "type": "text",
                    "text": "%s"
                  }
                ]
              }]
            }
            """.formatted(model, mimeType, base64, EXTRACTION_PROMPT);
    }
}
```

### 5.3 `PdfTextExtractorService` — rendu d'une page en image (PDF scanné)

```java
@Service
public class PdfTextExtractorService {

    public String extractText(MultipartFile file) throws IOException {
        try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
            return new PDFTextStripper().getText(doc);
        }
    }

    // Utilisé quand le PDF ne contient pas de texte (scanné)
    public byte[] renderFirstPageAsImage(MultipartFile file) throws IOException {
        try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
            PDFRenderer renderer = new PDFRenderer(doc);
            BufferedImage image = renderer.renderImageWithDPI(0, 150); // 150 DPI = bon équilibre qualité/taille
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            ImageIO.write(image, "PNG", out);
            return out.toByteArray();
        }
    }
}
```

### 5.4 `MatchingService` — inchangé, plus robuste

```java
@Service
@RequiredArgsConstructor
public class MatchingService {

    private final SupplierRepository supplierRepo;
    private final ProductRepository productRepo;

    private static final double MIN_SCORE = 0.75;

    public MatchResult<Supplier> matchSupplier(String extractedName) {
        if (extractedName == null) return MatchResult.notFound(null);

        return supplierRepo.findAll().stream()
            .map(s -> new ScoredMatch<>(s, similarity(extractedName, s.getName())))
            .filter(m -> m.score() >= MIN_SCORE)
            .max(Comparator.comparingDouble(ScoredMatch::score))
            .map(m -> MatchResult.found(m.entity(), m.score()))
            .orElse(MatchResult.notFound(extractedName));
    }

    public MatchResult<Product> matchProduct(String reference, String description) {
        // 1. Match exact sur la référence (fiabilité 100%)
        if (reference != null) {
            try {
                Long ref = Long.parseLong(reference.replaceAll("[^0-9]", ""));
                return productRepo.findByReference(ref)
                    .map(p -> MatchResult.found(p, 1.0))
                    .orElse(null);
            } catch (NumberFormatException ignored) {}
        }

        // 2. Fuzzy match Jaro-Winkler sur name + designation
        return productRepo.findAll().stream()
            .map(p -> new ScoredMatch<>(p,
                Math.max(similarity(description, p.getName()),
                         similarity(description, p.getDesignation()))))
            .filter(m -> m.score() >= MIN_SCORE)
            .max(Comparator.comparingDouble(ScoredMatch::score))
            .map(m -> MatchResult.found(m.entity(), m.score()))
            .orElse(MatchResult.notFound(description));
    }

    private double similarity(String a, String b) {
        if (a == null || b == null) return 0;
        String na = normalize(a), nb = normalize(b);
        return JaroWinklerSimilarity.apply(na, nb);
    }

    private String normalize(String s) {
        return s.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", " ").trim();
    }
}
```

---

## 6. Nouveaux endpoints

```
POST /api/purchases/import
     Content-Type: multipart/form-data
     file: (PDF / JPG / PNG / HEIC, max 10 Mo avant compression)
     → PurchaseImportResultDTO   (draft, non encore en base achat)

POST /api/purchases/import/{id}/confirm
     Body: PurchaseDTO (formulaire validé)
     → PurchaseDTO   (achat créé, import marqué CONFIRMED)

POST /api/purchases/import/{id}/reject
     → 204 No Content   (import marqué REJECTED)

GET  /api/purchases/import
     → Page<PurchaseImportSummaryDTO>   (historique, ADMIN only)
```

---

## 7. DTO de résultat — avec niveau de confiance par champ

```java
public record PurchaseImportResultDTO(
    Long importId,
    String documentType,       // INVOICE, PURCHASE_ORDER, DELIVERY_NOTE
    double globalConfidence,   // 0.0 à 1.0 (issu de Claude)

    FieldResult<String>      invoiceNumber,
    FieldResult<LocalDate>   invoiceDate,
    MatchResult<SupplierDTO> supplier,

    List<LineResult> lines,
    BigDecimal totalAmountExtracted  // pour vérification croisée
) {
    public record FieldResult<T>(T value, double confidence) {}

    public record MatchResult<T>(
        boolean matched,
        T entity,
        double score,      // score Jaro-Winkler (1.0 = exact)
        String rawValue    // valeur brute extraite du document
    ) {}

    public record LineResult(
        String rawDescription,
        MatchResult<ProductDTO> product,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal totalLine,
        boolean needsReview  // true si confidence < 0.75 ou produit non trouvé
    ) {}
}
```

---

## 8. Frontend — expérience mobile-first

### 8.1 États du composant

```
État 0 : IDLE
  └─ Zone upload (desktop) / Bouton caméra (mobile)

État 1 : PREVIEW
  └─ Aperçu du document capturé
  └─ "La photo est-elle lisible ?" → [Reprendre] ou [Analyser]

État 2 : PROCESSING (3–15 secondes)
  └─ Spinner + message contextuel
     - "Lecture du document…"     (PDFBox, 0–1s)
     - "Analyse par l'IA…"        (Claude, 2–15s)
     - "Correspondance produits…" (matching, 0–1s)

État 3 : REVIEW
  └─ Formulaire pré-rempli avec indicateurs visuels

État 4 : CONFIRMED / ERROR
```

### 8.2 Affichage des résultats (état REVIEW)

```html
<!-- Bandeau de confiance globale -->
<div class="confidence-banner"
     [class.high]="result.globalConfidence >= 0.85"
     [class.medium]="result.globalConfidence >= 0.60 && result.globalConfidence < 0.85"
     [class.low]="result.globalConfidence < 0.60">
  <i class="bi bi-stars"></i>
  Confiance IA : {{ result.globalConfidence | percent }}
  <span *ngIf="result.globalConfidence < 0.60" class="tip">
    ⚠️ Photo de faible qualité — vérifiez chaque champ attentivement
  </span>
</div>

<!-- Aperçu miniature du document original (cliquable pour agrandir) -->
<div class="doc-thumbnail" (click)="openDocViewer()">
  <img [src]="previewUrl" alt="Document original" />
  <span>Voir l'original</span>
</div>

<!-- Champs extraits -->
<div class="field" [class.field--warning]="!result.supplier.matched">
  <label>Fournisseur</label>
  <div class="match-indicator">
    <i class="bi" [class.bi-check-circle-fill]="result.supplier.matched"
                  [class.bi-exclamation-triangle-fill]="!result.supplier.matched"></i>
    <span *ngIf="result.supplier.matched">
      {{ result.supplier.entity.name }}
      <small class="score">{{ result.supplier.score | percent }}</small>
    </span>
    <div *ngIf="!result.supplier.matched" class="unresolved">
      <small class="raw">"{{ result.supplier.rawValue }}" non trouvé</small>
      <select [(ngModel)]="form.supplierId" class="field-input">
        <option value="">— Sélectionner —</option>
        <option *ngFor="let s of suppliers" [value]="s.id">{{ s.name }}</option>
      </select>
    </div>
  </div>
</div>

<!-- Lignes d'achat -->
<div *ngFor="let line of result.lines; let i = index"
     class="line-row" [class.line--needs-review]="line.needsReview">

  <div class="line-status">
    <i class="bi bi-check-circle-fill text-success" *ngIf="line.product.matched && !line.needsReview"></i>
    <i class="bi bi-exclamation-circle-fill text-warning" *ngIf="line.needsReview"></i>
  </div>

  <div class="line-product">
    <span *ngIf="line.product.matched">{{ line.product.entity.name }}</span>
    <div *ngIf="!line.product.matched">
      <small class="raw">"{{ line.rawDescription }}"</small>
      <!-- Searchable dropdown avec filtre -->
      <input type="text" [(ngModel)]="productSearch[i]" (input)="filterProducts(i)"
             placeholder="Rechercher un produit…" class="field-input" />
      <div class="product-results" *ngIf="filteredProducts[i]?.length">
        <div *ngFor="let p of filteredProducts[i]" (click)="selectProduct(i, p)" class="product-option">
          {{ p.name }} <small>{{ p.designation }}</small>
        </div>
      </div>
    </div>
  </div>

  <input type="number" [(ngModel)]="form.lines[i].quantity"
         class="field-input field-input--sm" min="1" />
  <input type="number" [(ngModel)]="form.lines[i].unitPriceTTC"
         class="field-input field-input--sm" step="0.001" />
  <span class="line-total">{{ form.lines[i].quantity * form.lines[i].unitPriceTTC | number:'1.3-3' }}</span>
</div>

<!-- Vérification totaux -->
<div class="total-check" [class.mismatch]="totalMismatch">
  <span>Total calculé : {{ computedTotal | number:'1.3-3' }}</span>
  <span *ngIf="result.totalAmountExtracted">
    Total document : {{ result.totalAmountExtracted | number:'1.3-3' }}
    <i class="bi" [class.bi-check-lg]="!totalMismatch" [class.bi-exclamation-lg]="totalMismatch"></i>
  </span>
</div>

<!-- Actions -->
<div class="form-actions">
  <button class="btn-cancel" (click)="reject()">Annuler</button>
  <button class="btn-primary" (click)="confirm()" [disabled]="!isFormValid()">
    <i class="bi bi-check-lg"></i> Confirmer et enregistrer
  </button>
</div>
```

---

## 9. Cas difficiles — photo mobile

| Cas | Détection | Comportement |
|-----|-----------|-------------|
| **Photo floue** | `confidence < 0.3` retourné par Claude | Message : "Photo trop floue — veuillez reprendre" + bouton retake |
| **Document partiel** (bord coupé) | Claude indique des lignes incomplètes | Avertissement sur les lignes concernées |
| **Format HEIC** (iPhone) | Extension `.heic` ou type MIME | Conversion heic2any côté client avant upload |
| **Rotation EXIF** (portrait/paysage) | EXIF metadata | Corrigé automatiquement par imageCompression |
| **Photo en contre-jour** | `confidence < 0.5` | Conseil éclairage + bouton reprendre |
| **Deux documents dans la photo** | Claude ne sait pas lequel extraire | Demande de sélection ou re-photo |
| **Facture manuscrite** | Claude Vision gère partiellement | `confidence` bas + champs à vérifier manuellement |
| **PDF scanné (double-face)** | Seule la page 1 est traitée | Avertissement si total ne correspond pas |
| **Timeout > 30s** | Spring `@Async` + polling | Statut PROCESSING dans la table, notification quand prêt |
| **API Claude down** | Catch exception | Basculement vers formulaire manuel classique + alerte admin |

---

## 10. Dépendances à ajouter

### Backend (`pom.xml`)

```xml
<!-- Extraction texte PDF -->
<dependency>
    <groupId>org.apache.pdfbox</groupId>
    <artifactId>pdfbox</artifactId>
    <version>3.0.2</version>
</dependency>

<!-- HTTP client pour appels Claude API (déjà inclus si Spring Web) -->
<!-- Pas de SDK officiel Java Anthropic → appel REST direct via RestClient -->
```

### Frontend (`package.json`)

```json
"browser-image-compression": "^2.0.2",  // compression côté client
"heic2any": "^0.0.4"                     // conversion HEIC → JPEG
```

---

## 11. Configuration

```properties
# application.properties
claude.api.key=${CLAUDE_API_KEY}
claude.model=claude-haiku-4-5-20251001
claude.max.tokens=1024
claude.timeout.seconds=30

purchase.import.max.file.size.mb=10
purchase.import.allowed.mime.types=application/pdf,image/jpeg,image/png,image/webp,image/heic
purchase.import.match.min.score=0.75
```

---

## 12. Coût opérationnel estimé

| Type de document | Tokens Claude | Coût Haiku | Coût Sonnet |
|-----------------|--------------|------------|-------------|
| PDF numérique (texte) | ~800 tokens | $0,0008 | $0,006 |
| Photo mobile compressée (1 Mo) | ~1 500 tokens | $0,002 | $0,015 |
| Photo mobile non compressée (10 Mo) | ~8 000 tokens | $0,010 | $0,080 |

→ **La compression client-side est critique** : divise le coût par 5 à 10 sur les photos mobiles.

| Volume | Coût mensuel (Haiku) |
|--------|---------------------|
| 50 imports/mois | ~$0,10 |
| 500 imports/mois | ~$1,00 |
| 5 000 imports/mois | ~$10,00 |

---

## 13. Estimation de l'effort

| Phase | Tâches | Jours |
|-------|--------|-------|
| **Phase 1** — Infrastructure backend | `DocumentRouterService`, `PdfTextExtractorService`, `ClaudeVisionService`, migration V22 | 2,5 j |
| **Phase 2** — Matching | `MatchingService` (Jaro-Winkler), `PurchaseImportResultDTO`, tests unitaires | 2 j |
| **Phase 3** — API | `PurchaseImportController` (4 endpoints), gestion async/timeout | 1,5 j |
| **Phase 4** — Frontend desktop | Drag & drop, compression PDF, affichage résultats | 2 j |
| **Phase 5** — Frontend mobile | Capture caméra, compression HEIC, guide photo, UI responsive | 2 j |
| **Phase 6** — Tests & robustesse | Cas limites, fallback Claude down, tests E2E | 1,5 j |
| **Total** | | **~11,5 jours** |

---

## 14. Décisions à prendre

| # | Question | Option A | Option B |
|---|----------|----------|----------|
| D1 | **Modèle Claude** | Haiku (rapide, $) | Sonnet (plus précis, $$) — switcher si qualité insuffisante |
| D2 | **Confidentialité** | API Claude cloud | Ollama local (LLaVA/Qwen-VL pour vision) |
| D3 | **PDF scanné** | Rendre en image (PDFBox → PNG → Vision) | Message d'erreur v1 |
| D4 | **Stockage du fichier original** | Filesystem `/uploads/imports/` | Ne pas stocker (audit uniquement via JSON) |
| D5 | **Seuil de matching** | 0.75 (recommandé) | Configurable par admin dans /settings |
| D6 | **Batch** | Un document = un achat (v1) | Multi-import (plusieurs factures en une fois) → v2 |

---

## 15. Récapitulatif

```
[✅ Déjà fait]  POST /api/purchases — endpoint de création
[✅ Déjà fait]  PurchaseDTO avec List<PurchaseLineDTO>
[✅ Déjà fait]  Formulaire "Nouvel Achat" dans Products page

[⬜ Phase 1]  DocumentRouterService — détection type + dispatch
[⬜ Phase 1]  PdfTextExtractorService — extraction texte + rendu image
[⬜ Phase 1]  ClaudeVisionService — modes texte ET vision
[⬜ Phase 1]  Migration V22 (purchase_import table)
[⬜ Phase 2]  MatchingService — fuzzy match fournisseur + produit
[⬜ Phase 3]  POST /api/purchases/import + /confirm + /reject
[⬜ Phase 4]  PurchaseImportComponent desktop (drag & drop + review)
[⬜ Phase 5]  PurchaseImportComponent mobile (caméra + HEIC + compression)
```
