# Étude — Configurateur de thème & White-label · Bhouri Stock

> **Date :** 2026-06-30  
> **Stack :** Angular 17 · Spring Boot 3.3.7 · PostgreSQL 15 · CSS Custom Properties

---

## 1. Périmètre de la feature

Permettre à un administrateur de personnaliser l'application **entièrement depuis l'interface**, sans toucher au code ni redéployer. Toute modification est appliquée en temps réel (live preview) et persistée en base.

### Catégories de personnalisation proposées

| # | Catégorie | Exemples |
|---|-----------|---------|
| 1 | **Identité** | Nom affiché, logo, favicon, slogan |
| 2 | **Palette de couleurs** | Couleur primaire, sidebar, fond, accents |
| 3 | **Typographie** | Police principale, taille de base |
| 4 | **Documents PDF** | Logo sur factures/BL, pied de page, couleur d'accentuation, mentions légales |
| 5 | **Régional & format** | Devise, TVA, format de date, séparateur décimal |
| 6 | **Comportement** | Pagination par défaut, seuil d'alerte stock, conditions de paiement par défaut |
| 7 | **Numérotation** | Préfixe facture, préfixe BL, prochain numéro |

---

## 2. État actuel — ce qui facilite l'implémentation

### CSS Custom Properties déjà en place

L'intégralité de l'UI utilise des variables CSS. Changer une variable en JavaScript suffit à repeindre toute l'application instantanément :

```css
/* styles.css — variables modifiables à runtime */
:root {
  --color-primary:       #6366f1;   ← couleur de tous les boutons, liens, focus
  --color-primary-hover: #4f46e5;
  --color-primary-light: #eef2ff;
  --color-primary-muted: rgba(99,102,241,0.12);
  --sidebar-bg:          #1a1e4e;   ← fond de la sidebar
  --sidebar-active-bg:   #4f46e5;   ← élément actif sidebar
  --font-sans:           'Inter';   ← police de tout le texte
}
```

→ **Modifier 5 variables CSS = changer l'identité visuelle complète de l'app.**

### Système `app_settings` déjà extensible

`SettingsService.update(Map<String,String>)` accepte n'importe quelle clé. Ajouter des paramètres de thème ne nécessite pas de modifier le schéma Java — uniquement des seeds SQL et le `ThemeService` frontend.

### Infrastructure email opérationnelle

Les templates PDF et email utilisent déjà `company_name`. Ajouter `logo_url` dans les mêmes templates est trivial.

---

## 3. Architecture technique

```
┌─────────────────────────────────────────────────────┐
│  FRONTEND                                           │
│                                                     │
│  AppInitializer (APP_INITIALIZER)                   │
│       └─► GET /api/settings                         │
│       └─► ThemeService.apply(settings)              │
│               └─► document.documentElement          │
│                   .style.setProperty(               │
│                     '--color-primary', '#e11d48'    │
│                   )                                 │
│                                                     │
│  SettingsComponent (page /settings)                 │
│       └─► ColorPickerComponent                      │
│       └─► FontSelectorComponent                     │
│       └─► LogoUploaderComponent                     │
│       └─► LivePreviewFrame                          │
│               └─► ThemeService.preview(settings)   │
│                   (sans sauvegarder)                │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  BACKEND                                            │
│                                                     │
│  GET  /api/settings        → Map<String, String>    │
│  PUT  /api/settings        → Map<String, String>    │
│  POST /api/settings/logo   → upload → URL retournée │
│                                                     │
│  app_settings table        → stockage clé/valeur    │
│  /uploads/logos/           → fichiers logo          │
└─────────────────────────────────────────────────────┘
```

---

## 4. Catalogue complet des paramètres

### 4.1 Identité

| Clé | Valeur par défaut | UI |
|-----|------------------|----|
| `company_name` | `Bhouri Stock` | Input texte *(existant)* |
| `app_display_name` | `Bhouri Stock` | Input texte — nom dans la sidebar et l'onglet browser |
| `company_logo_url` | *(vide)* | Upload d'image ou URL externe |
| `company_favicon_url` | *(vide)* | Upload `.ico` / `.png` 32×32 |
| `company_tagline` | *(vide)* | Slogan affiché sous le nom dans la sidebar |
| `company_website` | *(vide)* | Lien cliquable depuis la sidebar |

### 4.2 Palette de couleurs

| Clé | Valeur par défaut | Description |
|-----|-----------------|-------------|
| `color_primary` | `#6366f1` | Boutons, liens, focus ring, badges actifs |
| `color_primary_hover` | `#4f46e5` | Hover sur les boutons primaires |
| `color_sidebar_bg` | `#1a1e4e` | Fond de la barre latérale |
| `color_sidebar_active` | `#4f46e5` | Élément de menu sélectionné |
| `color_danger` | `#ef4444` | Boutons de suppression, alertes |
| `color_success` | `#10b981` | Badges "payé", alertes succès |
| `color_warning` | `#f59e0b` | Alertes, badges "partiel" |

> **Note** : `color_primary_hover` peut être calculé automatiquement (assombrir `color_primary` de 10%) — l'utilisateur n'a qu'une seule couleur à choisir.

### 4.3 Typographie

| Clé | Valeur par défaut | Options |
|-----|-----------------|---------|
| `font_family` | `Inter` | Inter, Roboto, Poppins, Lato, Open Sans, Nunito, IBM Plex Sans |
| `font_size_base` | `14` | 13 / 14 / 15 / 16 px |
| `border_radius` | `medium` | `none` (0px) / `small` (4px) / `medium` (8px) / `large` (16px) |

### 4.4 Documents PDF (factures & bons de livraison)

| Clé | Valeur par défaut | Description |
|-----|-----------------|-------------|
| `pdf_logo_url` | *(hérite de logo_url)* | Logo spécifique aux documents (fond blanc recommandé) |
| `pdf_primary_color` | *(hérite de color_primary)* | Couleur d'en-tête des PDFs |
| `pdf_footer_text` | *(vide)* | Pied de page : "Merci de votre confiance" |
| `company_rib` | *(vide)* | RIB/IBAN affiché sur les factures |
| `company_legal_mention` | *(vide)* | Numéro MF, RC, AI, etc. |
| `company_bank_name` | *(vide)* | Nom de la banque |
| `invoice_prefix` | `FAC` | Préfixe facture *(existant)* |
| `delivery_note_prefix` | `BL` | Préfixe bon de livraison |
| `invoice_next_number` | `1` | Prochain numéro (pour réinitialiser) |

### 4.5 Régional & Format

| Clé | Valeur par défaut | Description |
|-----|-----------------|-------------|
| `currency` | `DNT` | Devise *(existant)* |
| `currency_symbol` | `د.ت` | Symbole affiché |
| `currency_position` | `after` | `before` / `after` (ex: `$100` vs `100 DNT`) |
| `tax_rate` | `19` | Taux TVA *(existant)* |
| `date_format` | `dd/MM/yyyy` | `dd/MM/yyyy` / `MM/dd/yyyy` / `yyyy-MM-dd` |
| `number_decimal_separator` | `,` | Virgule (fr) ou point (en) |
| `number_thousands_separator` | ` ` | Espace, point ou virgule |

### 4.6 Comportement applicatif

| Clé | Valeur par défaut | Description |
|-----|-----------------|-------------|
| `items_per_page` | `20` | Taille de pagination par défaut |
| `low_stock_threshold` | `5` | Seuil d'alerte stock faible (nb unités) |
| `default_payment_terms` | *(vide)* | Conditions de paiement pré-remplies sur les factures |
| `default_delivery_address` | *(vide)* | Adresse de livraison pré-remplie sur les BL |
| `email_notifications_enabled` | `true` | Notifications email *(existant)* |
| `invoice_apply_tva_default` | `false` | TVA cochée par défaut à la création |

---

## 5. Plan d'implémentation

### 5.1 Backend

#### Migration V21 — Seed des nouveaux paramètres
```sql
INSERT INTO app_settings (setting_key, setting_value) VALUES
  ('app_display_name',            'Bhouri Stock'),
  ('company_logo_url',            ''),
  ('company_favicon_url',         ''),
  ('company_tagline',             ''),
  ('color_primary',               '#6366f1'),
  ('color_primary_hover',         '#4f46e5'),
  ('color_sidebar_bg',            '#1a1e4e'),
  ('color_sidebar_active',        '#4f46e5'),
  ('color_danger',                '#ef4444'),
  ('color_success',               '#10b981'),
  ('color_warning',               '#f59e0b'),
  ('font_family',                 'Inter'),
  ('font_size_base',              '14'),
  ('border_radius',               'medium'),
  ('pdf_primary_color',           ''),
  ('pdf_footer_text',             ''),
  ('company_rib',                 ''),
  ('company_legal_mention',       ''),
  ('company_bank_name',           ''),
  ('delivery_note_prefix',        'BL'),
  ('currency_symbol',             'د.ت'),
  ('currency_position',           'after'),
  ('date_format',                 'dd/MM/yyyy'),
  ('number_decimal_separator',    ','),
  ('number_thousands_separator',  ' '),
  ('items_per_page',              '20'),
  ('low_stock_threshold',         '5'),
  ('default_payment_terms',       ''),
  ('invoice_apply_tva_default',   'false')
ON CONFLICT (setting_key) DO NOTHING;
```

#### Upload de logo — `LogoController.java`
```java
@PostMapping(value = "/api/settings/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<Map<String,String>> uploadLogo(
        @RequestParam("file") MultipartFile file) {
    // Validation : image, max 2 Mo, format jpg/png/svg/webp
    // Sauvegarde dans /uploads/logos/{uuid}.{ext}
    // Retourne l'URL publique : /uploads/logos/{uuid}.{ext}
    String url = logoStorageService.store(file);
    settingsService.update(Map.of("company_logo_url", url));
    return ResponseEntity.ok(Map.of("url", url));
}
```

`LogoStorageService` : sauvegarde sur le filesystem local (dev) ou un bucket S3/Cloudflare R2 (prod).

#### Endpoint public des paramètres de thème
Créer `GET /api/public/theme` (sans auth) pour que l'app charge le thème même sur la page de login :
```java
@GetMapping("/api/public/theme")
public ResponseEntity<Map<String,String>> publicTheme() {
    // Retourne uniquement les clés de thème (pas les données sensibles)
    List<String> themeKeys = List.of(
        "app_display_name", "company_logo_url", "company_favicon_url",
        "color_primary", "color_primary_hover", "color_sidebar_bg",
        "color_sidebar_active", "font_family", "font_size_base", "border_radius"
    );
    return ResponseEntity.ok(settingsService.getByKeys(themeKeys));
}
```

---

### 5.2 Frontend — ThemeService

```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly root = document.documentElement;

  // Mapping clé settings → variable CSS
  private readonly CSS_MAP: Record<string, string> = {
    color_primary:        '--color-primary',
    color_primary_hover:  '--color-primary-hover',
    color_sidebar_bg:     '--sidebar-bg',
    color_sidebar_active: '--sidebar-active-bg',
    color_danger:         '--color-danger',
    color_success:        '--color-success',
    color_warning:        '--color-warning',
    font_size_base:       '--font-size-base',
  };

  apply(settings: Record<string, string>): void {
    // 1. CSS variables
    for (const [key, cssVar] of Object.entries(this.CSS_MAP)) {
      if (settings[key]) this.root.style.setProperty(cssVar, settings[key]);
    }

    // 2. Police → charger via Google Fonts si nécessaire
    if (settings['font_family']) this.applyFont(settings['font_family']);

    // 3. Border radius
    if (settings['border_radius']) this.applyRadius(settings['border_radius']);

    // 4. Favicon
    if (settings['company_favicon_url']) this.applyFavicon(settings['company_favicon_url']);

    // 5. Titre de l'onglet
    if (settings['app_display_name']) document.title = settings['app_display_name'];
  }

  preview(partial: Partial<Record<string, string>>): void {
    this.apply(partial as Record<string, string>);
    // Pas de sauvegarde — juste l'application visuelle
  }

  reset(): void {
    for (const cssVar of Object.values(this.CSS_MAP)) {
      this.root.style.removeProperty(cssVar);
    }
  }

  private applyFont(family: string): void {
    const GOOGLE_FONTS: Record<string, string> = {
      'Inter':         'Inter:wght@400;500;600;700',
      'Roboto':        'Roboto:wght@400;500;700',
      'Poppins':       'Poppins:wght@400;500;600;700',
      'Lato':          'Lato:wght@400;700',
      'Open Sans':     'Open+Sans:wght@400;600;700',
      'Nunito':        'Nunito:wght@400;600;700',
      'IBM Plex Sans': 'IBM+Plex+Sans:wght@400;500;600',
    };
    if (GOOGLE_FONTS[family] && family !== 'Inter') { // Inter déjà chargé
      const link = document.createElement('link');
      link.rel  = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${GOOGLE_FONTS[family]}&display=swap`;
      document.head.appendChild(link);
    }
    this.root.style.setProperty('--font-sans', `'${family}', system-ui, sans-serif`);
  }

  private applyRadius(level: string): void {
    const MAP: Record<string, string> = {
      'none':   '0px',
      'small':  '4px',
      'medium': '8px',
      'large':  '16px',
    };
    const val = MAP[level] ?? '8px';
    this.root.style.setProperty('--radius-sm', val);
    this.root.style.setProperty('--radius-md', `calc(${val} + 2px)`);
    this.root.style.setProperty('--radius-lg', `calc(${val} + 6px)`);
  }

  private applyFavicon(url: string): void {
    let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
    link.href = url;
  }
}
```

#### Initialisation au démarrage (`APP_INITIALIZER`)

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: (http: HttpClient, theme: ThemeService) => () =>
        http.get<Record<string,string>>('/api/public/theme').pipe(
          tap(settings => theme.apply(settings)),
          catchError(() => of({}))   // silencieux si le backend est down
        ),
      deps: [HttpClient, ThemeService],
      multi: true
    }
  ]
};
```

→ Le thème est appliqué **avant** le premier rendu, même sur la page de login. Aucun flash de couleur par défaut.

---

### 5.3 Frontend — Page Paramètres enrichie

Réorganiser la page `/settings` en onglets :

```
[ Entreprise ] [ Apparence ] [ Documents ] [ Régional ] [ Comportement ]
```

#### Onglet "Apparence" — composants UI

**Sélecteur de couleur (`ColorPickerComponent`)**
```html
<div class="color-field">
  <label>Couleur principale</label>
  <div class="color-preview" [style.background]="form.color_primary"></div>
  <input type="color" [(ngModel)]="form.color_primary"
         (ngModelChange)="themeService.preview({ color_primary: $event })" />
  <span class="hex-code">{{ form.color_primary }}</span>
</div>
```

**Sélecteur de police (`FontSelectorComponent`)**
```html
<div class="font-selector">
  <label>Police</label>
  <div class="font-grid">
    <button *ngFor="let font of fonts"
            [class.selected]="form.font_family === font"
            [style.font-family]="font"
            (click)="selectFont(font)">
      Aa — {{ font }}
    </button>
  </div>
</div>
```

**Upload logo (`LogoUploaderComponent`)**
```html
<div class="logo-uploader">
  <img *ngIf="form.company_logo_url" [src]="form.company_logo_url" class="logo-preview" />
  <div *ngIf="!form.company_logo_url" class="logo-placeholder">Aucun logo</div>
  <input type="file" accept="image/*" (change)="onFileSelect($event)" hidden #fileInput />
  <button (click)="fileInput.click()">Choisir un fichier</button>
  <span class="or-separator">ou</span>
  <input type="url" placeholder="URL du logo" [(ngModel)]="form.company_logo_url" />
</div>
```

**Rayon des bords (`BorderRadiusSelector`)**
```html
<div class="radius-selector">
  <button *ngFor="let opt of ['none','small','medium','large']"
          [class.selected]="form.border_radius === opt"
          [class]="'radius-demo radius-' + opt"
          (click)="selectRadius(opt)">
    {{ opt | titlecase }}
  </button>
</div>
```

#### Live preview intégré

Un aperçu miniature de la sidebar + une card + un bouton s'affiche en temps réel à droite du formulaire, reflétant tous les changements avant de sauvegarder :

```html
<div class="live-preview">
  <div class="preview-sidebar" [style.background]="form.color_sidebar_bg">
    <img [src]="form.company_logo_url || 'assets/placeholder-logo.svg'" />
    <span [style.color]="'white'">{{ form.app_display_name }}</span>
    <div class="preview-nav-item" [style.background]="form.color_sidebar_active">Dashboard</div>
  </div>
  <div class="preview-content">
    <button [style.background]="form.color_primary"
            [style.font-family]="form.font_family">
      Enregistrer
    </button>
    <div class="preview-card">
      <span [style.color]="form.color_primary">Titre</span>
      <span>Contenu de la carte</span>
    </div>
  </div>
</div>
```

---

## 6. Impact sur les PDFs

Les templates Thymeleaf des factures et BL utilisent déjà `company_name`. Il faut :

1. Injecter `logo_url`, `pdf_primary_color`, `company_legal_mention`, `company_rib`, `pdf_footer_text` dans `InvoicePdfDataService` et `DeliveryNotePdfDataService`
2. Mettre à jour les templates HTML des PDFs pour afficher le logo et les mentions

```java
// InvoicePdfDataService.java
Map<String, String> settings = settingsService.getAll();
context.setVariable("logoUrl",        settings.getOrDefault("pdf_logo_url", settings.get("company_logo_url")));
context.setVariable("primaryColor",   settings.getOrDefault("pdf_primary_color", settings.get("color_primary")));
context.setVariable("footerText",     settings.getOrDefault("pdf_footer_text", ""));
context.setVariable("legalMention",   settings.getOrDefault("company_legal_mention", ""));
context.setVariable("rib",            settings.getOrDefault("company_rib", ""));
```

---

## 7. Estimation de l'effort

| Phase | Tâches | Jours |
|-------|--------|-------|
| **Phase 1** — Backend | Migration V21, `GET /api/public/theme`, `POST /api/settings/logo`, `LogoStorageService` | 1,5 j |
| **Phase 2** — ThemeService | `ThemeService`, `APP_INITIALIZER`, `sidebar` dynamique | 1 j |
| **Phase 3** — UI Apparence | `ColorPickerComponent`, `FontSelectorComponent`, `LogoUploaderComponent`, `BorderRadiusSelector`, live preview | 3 j |
| **Phase 4** — Autres onglets | Formulaires régional, comportement, numérotation | 1,5 j |
| **Phase 5** — PDFs | Injecter les variables dans les 2 templates PDF | 1 j |
| **Total** | | **~8 jours** |

---

## 8. Décisions à prendre

| # | Question | Option A | Option B |
|---|----------|----------|----------|
| D1 | **Stockage des logos** | Filesystem local + URL relative | S3 / Cloudflare R2 (recommandé prod) |
| D2 | **Calcul color_primary_hover** | Automatique (darkened 10%) | Manuel (2 color pickers) |
| D3 | **Polices** | Google Fonts (CDN externe) | Self-hosted (confidentialité RGPD) |
| D4 | **Portée du thème** | Uniquement l'interface web | Interface web + PDFs (recommandé) |
| D5 | **Thème par utilisateur** | Non (thème global) | Oui (override par user, très complexe) |

---

## 9. Ce que ça donne visuellement — exemples

| Palette | `color_primary` | `color_sidebar_bg` | Rendu |
|---------|----------------|-------------------|-------|
| Défaut (Indigo) | `#6366f1` | `#1a1e4e` | Interface actuelle |
| Émeraude | `#10b981` | `#064e3b` | Thème vert professionnel |
| Rose/Luxe | `#e11d48` | `#1c0a13` | Thème premium |
| Ardoise | `#475569` | `#0f172a` | Thème sobre/corporate |
| Azur | `#0ea5e9` | `#0c2340` | Thème tech |

Avec uniquement 2 couleurs personnalisées (`color_primary` + `color_sidebar_bg`), l'app prend une identité complètement différente — sans aucune ligne de CSS à modifier.
