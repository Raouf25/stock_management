import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

type DocumentMode = 'facture' | 'bl';
type Step = 1 | 2 | 3 | 4;

interface Customer {
  customerId: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface Product {
  productId: number;
  reference: string;
  name: string;
  unitPrice: number;
  stock: number;
  imageUrl?: string;
  category?: string;
}

interface LineItem {
  productId:   number;
  productName: string;
  reference:   string;
  unitPrice:   number;
  quantity:    number;
  discount:    number;
  totalPrice:  number;
  maxStock:    number;
  imageUrl?:   string;
}

@Component({
  selector:   'app-create-document',
  standalone: true,
  imports:    [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
<div class="doc-layout">

  <!-- ═══════════════════════════════════════════════ ZONE PRINCIPALE ═══ -->
  <div class="doc-main">

    <!-- ── Stepper ── -->
    <nav class="stepper">
      <div class="step" [class.active]="currentStep===1" [class.done]="currentStep>1" (click)="changeStep(1)">
        <span class="step-num">{{ currentStep > 1 ? '✓' : '1' }}</span>
        <span class="step-label">Catalogue Produits</span>
      </div>
      <div class="step-connector" [class.filled]="currentStep > 1"></div>
      <div class="step" [class.active]="currentStep===2" [class.done]="currentStep>2" (click)="changeStep(2)">
        <span class="step-num">{{ currentStep > 2 ? '✓' : '2' }}</span>
        <span class="step-label">Panier Actif</span>
      </div>
      <div class="step-connector" [class.filled]="currentStep > 2"></div>
      <div class="step" [class.active]="currentStep===3" [class.done]="currentStep>3" (click)="changeStep(3)">
        <span class="step-num">{{ currentStep > 3 ? '✓' : '3' }}</span>
        <span class="step-label">Facturation / Client</span>
      </div>
      <div class="step-connector" [class.filled]="currentStep > 3"></div>
      <div class="step" [class.active]="currentStep===4" (click)="changeStep(4)">
        <span class="step-num">4</span>
        <span class="step-label">Revue finale</span>
      </div>
    </nav>

    <!-- ── Alertes ── -->
    <div *ngIf="error"   class="banner banner-err">{{ error }}</div>
    <div *ngIf="success" class="banner banner-ok">{{ success }}</div>

    <!-- ══════════════════ ÉTAPE 1 : CATALOGUE ══════════════════ -->
    <div class="step-panel" *ngIf="currentStep === 1">
      <div class="panel-header">Catalogue des Articles Disponibles</div>

      <div class="filter-bar">
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input type="text" [(ngModel)]="searchQuery" (input)="filterProducts()"
                 placeholder="Rechercher par désignation ou référence...">
        </div>
        <select [(ngModel)]="selectedCategory" (change)="filterProducts()">
          <option value="">Toutes les catégories</option>
          <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
        </select>
        <select [(ngModel)]="stockFilter" (change)="filterProducts()">
          <option value="">Tous les stocks</option>
          <option value="instock">En Stock</option>
          <option value="low">Stock Faible</option>
        </select>
      </div>

      <div class="products-grid">
        <div class="product-card" *ngFor="let p of filteredProducts"
             [class.card-rupture]="p.stock === 0">
          <div class="product-img">
            <img [src]="p.imageUrl || 'assets/placeholder-product.png'" alt="product">
          </div>
          <div class="product-body">
            <span class="stock-badge" [ngClass]="getStockBadgeClass(p)">{{ getStockLabel(p) }}</span>
            <h3 class="product-name">{{ p.name }}</h3>
            <p class="product-ref">Réf: {{ p.reference }} | Stock: <strong>{{ p.stock }}</strong></p>
            <div class="product-footer">
              <span class="product-price">{{ p.unitPrice | number:'1.3-3' }} DNT</span>
              <div class="product-actions" *ngIf="p.stock > 0">
                <button class="btn-add" (click)="addItemToCart(p)">+ Ajouter</button>
                <div class="qty-ctrl">
                  <button (click)="changeQtyForProduct(p, -1)">−</button>
                  <span>{{ getItemQtyInCart(p.productId) }}</span>
                  <button (click)="changeQtyForProduct(p, 1)">+</button>
                </div>
              </div>
              <button class="btn-rupture" *ngIf="p.stock === 0" disabled>Rupture</button>
            </div>
          </div>
        </div>

        <div *ngIf="filteredProducts.length === 0" class="empty-state">
          Aucun article ne correspond à vos critères de recherche.
        </div>
      </div>
    </div>

    <!-- ══════════════════ ÉTAPE 2 : PANIER ══════════════════ -->
    <div class="step-panel" *ngIf="currentStep === 2">
      <div class="panel-header">Panier Actif</div>

      <div class="cart-wrap" *ngIf="lineItems.length > 0; else emptyCart">
        <table class="cart-table">
          <thead>
            <tr>
              <th>PRODUIT</th>
              <th style="text-align:center;">QUANTITÉ</th>
              <th style="text-align:center;">PRIX UNITAIRE</th>
              <th style="text-align:center;">REMISE (%)</th>
              <th style="text-align:right;">TOTAL LIGNE</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of lineItems; let i = index">
              <td class="td-product">
                <img [src]="item.imageUrl || 'assets/placeholder-product.png'" class="cart-thumb" alt="">
                <div>
                  <strong>{{ item.productName }}</strong>
                  <small>SKU: {{ item.reference }}</small>
                </div>
              </td>
              <td style="text-align:center;">
                <div class="qty-stepper">
                  <button (click)="changeQtyInline(i, -1)">−</button>
                  <input type="number" [(ngModel)]="item.quantity"
                         (change)="validateAndRecalcLine(i)" min="1">
                  <button (click)="changeQtyInline(i, 1)">+</button>
                </div>
              </td>
              <td style="text-align:center;">{{ item.unitPrice | number:'1.3-3' }} DNT</td>
              <td style="text-align:center;">
                <input type="number" class="discount-input"
                       [(ngModel)]="item.discount"
                       (change)="validateAndRecalcLine(i)"
                       min="0" max="100">
              </td>
              <td class="td-total" [class.discounted]="item.discount > 0">
                {{ item.totalPrice | number:'1.3-3' }} DNT
              </td>
              <td style="text-align:center;">
                <button class="btn-remove" (click)="removeLineItem(i)" title="Supprimer">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="cart-footer">
          <button class="btn-clear" (click)="clearEntireCart()">🗑 Vider le panier</button>
          <span class="cart-count">{{ lineItems.length }} type(s) de produits distincts insérés.</span>
        </div>
      </div>

      <ng-template #emptyCart>
        <div class="empty-state">
          Aucun article dans le panier. Retournez à l'étape 1 pour ajouter des produits.
        </div>
      </ng-template>
    </div>

    <!-- ══════════════════ ÉTAPE 3 : FACTURATION / CLIENT ══════════════════ -->
    <div class="step-panel" *ngIf="currentStep === 3">
      <div class="panel-header">Facturation / Client</div>
      <div class="panel-body">

        <div class="mode-toggle">
          <button [class.active]="mode === 'facture'" (click)="setMode('facture')">
            🧾 Facture
          </button>
          <button [class.active]="mode === 'bl'" (click)="setMode('bl')">
            📦 Bon de Livraison
          </button>
        </div>

        <!-- Formulaire Facture -->
        <form [formGroup]="invoiceForm" *ngIf="mode === 'facture'" class="doc-form">
          <div class="form-row">
            <div class="form-group">
              <label>Client *</label>
              <select class="form-ctrl" formControlName="customerId"
                      (change)="onInvoiceCustomerSelect()">
                <option [ngValue]="null">Sélectionner le client...</option>
                <option *ngFor="let c of customers" [value]="c.customerId">{{ c.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Date de Facturation *</label>
              <input type="date" class="form-ctrl" formControlName="billDate">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Conditions de Paiement *</label>
              <select class="form-ctrl" formControlName="paymentTerms">
                <option value="Immédiat">Paiement Immédiat</option>
                <option value="15 jours">Sous 15 jours</option>
                <option value="30 jours">Sous 30 jours</option>
                <option value="60 jours">Traite à 60 jours</option>
              </select>
            </div>
            <div class="form-group">
              <label>Représentant de Vente</label>
              <input type="text" class="form-ctrl"
                     [(ngModel)]="salesRep" [ngModelOptions]="{standalone:true}"
                     placeholder="Nom du commercial">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Adresse de Livraison</label>
              <input type="text" class="form-ctrl" formControlName="deliveryAddress"
                     placeholder="Adresse de livraison...">
            </div>
            <div class="form-group">
              <label>Adresse de Facturation</label>
              <input type="text" class="form-ctrl" formControlName="billingAddress"
                     placeholder="Adresse de facturation...">
            </div>
          </div>

          <div class="tva-banner">
            <div class="tva-text">
              <span class="tva-title">Appliquer la TVA de 19%</span>
              <span class="tva-sub">Calculer les taxes légales obligatoires pour ce client tunisien</span>
            </div>
            <label class="ios-toggle">
              <input type="checkbox" formControlName="applyTva">
              <span class="ios-knob"></span>
            </label>
          </div>
        </form>

        <!-- Formulaire BL -->
        <div *ngIf="mode === 'bl'" class="doc-form">
          <div class="form-row">
            <div class="form-group">
              <label>Client Destinataire *</label>
              <select class="form-ctrl" [(ngModel)]="blModel.customerId"
                      (change)="onBlCustomerSelect()">
                <option value="">Sélectionner le destinataire...</option>
                <option *ngFor="let c of customers" [value]="c.customerId">{{ c.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Date Planifiée de Livraison *</label>
              <input type="date" class="form-ctrl" [(ngModel)]="blModel.deliveryDate">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Représentant de Vente</label>
              <input type="text" class="form-ctrl" [(ngModel)]="salesRep"
                     placeholder="Nom du commercial">
            </div>
            <div class="form-group">
              <label>Adresse de Livraison</label>
              <input type="text" class="form-ctrl" [(ngModel)]="blModel.deliveryAddress"
                     placeholder="Adresse de livraison...">
              <small *ngIf="getSelectedCustomerAddress()" class="addr-hint">
                📍 {{ getSelectedCustomerAddress() }}
              </small>
            </div>
          </div>

          <div class="tva-banner">
            <div class="tva-text">
              <span class="tva-title">Faire figurer la TVA sur le bon</span>
              <span class="tva-sub">Calculer à titre informatif la taxe de 19% sur le document.</span>
            </div>
            <label class="ios-toggle">
              <input type="checkbox" [(ngModel)]="blModel.applyTva" (change)="calculateAllTotals()">
              <span class="ios-knob"></span>
            </label>
          </div>
        </div>

      </div>
    </div>

    <!-- ══════════════════ ÉTAPE 4 : REVUE FINALE ══════════════════ -->
    <div class="step-panel" *ngIf="currentStep === 4">
      <div class="panel-header">Revue & Checkout</div>
      <div class="synthesis">
        <div class="synthesis-head">
          <h3>FICHE DE SYNTHÈSE</h3>
          <p>{{ mode === 'facture' ? 'Facture Pro-Forma' : 'Bon de Livraison' }} générée le {{ today | date:'d/MM/yyyy' }}</p>
        </div>

        <div class="synthesis-grid">
          <div class="synthesis-col">
            <h4>INFORMATIONS GÉNÉRALES</h4>
            <div class="synth-row">
              <span>Type</span>
              <strong>{{ mode === 'facture' ? 'Facture de Vente' : 'Bon de Livraison' }}</strong>
            </div>
            <div class="synth-row">
              <span>Client</span>
              <strong>{{ getSummaryCustomerName() }}</strong>
            </div>
            <div class="synth-row">
              <span>Commercial</span>
              <strong>{{ salesRep || '—' }}</strong>
            </div>
            <div class="synth-row" *ngIf="mode === 'facture'">
              <span>Échéance</span>
              <strong>{{ invoiceForm.get('paymentTerms')?.value }}</strong>
            </div>
            <div class="synth-row" *ngIf="mode === 'bl'">
              <span>Date Livraison</span>
              <strong>{{ blModel.deliveryDate | date:'dd/MM/yyyy' }}</strong>
            </div>
          </div>

          <div class="synthesis-col">
            <h4>DESTINATIONS OBLIGATOIRES</h4>
            <div class="synth-row">
              <span>Adresse Livraison</span>
              <strong>{{ (mode === 'facture' ? invoiceForm.get('deliveryAddress')?.value : blModel.deliveryAddress) || '—' }}</strong>
            </div>
            <div class="synth-row" *ngIf="mode === 'facture'">
              <span>Adresse Facturation</span>
              <strong>{{ invoiceForm.get('billingAddress')?.value || '—' }}</strong>
            </div>
            <div class="synth-row">
              <span>TVA Appliquée</span>
              <strong>{{ (mode === 'facture' ? invoiceForm.get('applyTva')?.value : blModel.applyTva) ? 'Oui (19.00%)' : 'Non' }}</strong>
            </div>
          </div>
        </div>

        <div class="synthesis-articles">
          <h4>LIGNES D'ARTICLES APPROUVÉES</h4>
          <div class="article-row" *ngFor="let item of lineItems">
            <span>
              {{ item.quantity }}x {{ item.productName }}
              <em *ngIf="item.discount > 0" style="color:#64748b;">(Remise {{ item.discount }}%)</em>
            </span>
            <strong>{{ item.totalPrice | number:'1.3-3' }} DNT</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Bouton Retour (étapes 2 et 3) ── -->
    <div class="back-nav" *ngIf="currentStep > 1 && currentStep < 4">
      <button class="btn-back" (click)="goToPreviousStep()">← Étape précédente</button>
    </div>

  </div>
  <!-- fin doc-main -->

  <!-- ═══════════════════════════════════════════════ PANNEAU DROIT ═══ -->
  <aside class="doc-aside">

    <!-- ── Étapes 1-3 : Résumé document ── -->
    <ng-container *ngIf="currentStep < 4">
      <div class="aside-top">
        <div class="aside-title">
          <span class="aside-icon">📋</span>
          <h3>Nouveau Document</h3>
        </div>

        <div class="aside-meta-rows">
          <div class="aside-meta-row">
            <span>Type de document</span>
            <div class="doc-type-pills">
              <button [class.pill-active]="mode==='facture'" (click)="setMode('facture')">Facture</button>
              <button [class.pill-active]="mode==='bl'"      (click)="setMode('bl')">BL</button>
            </div>
          </div>
          <div class="aside-meta-row">
            <span>Client sélectionné</span>
            <strong class="client-name">{{ getSummaryCustomerName() }}</strong>
          </div>
          <div class="aside-meta-row">
            <span>Articles ajoutés</span>
            <strong>{{ lineItems.length > 0 ? lineItems.length + ' article(s)' : '0 article' }}</strong>
          </div>

          <ng-container *ngIf="lineItems.length > 0">
            <hr class="aside-divider">
            <div class="aside-meta-row" *ngIf="totalRemise > 0">
              <span>Sous-total</span>
              <strong>{{ totalBrutHT | number:'1.3-3' }} DNT</strong>
            </div>
            <div class="aside-meta-row discount-line" *ngIf="totalRemise > 0">
              <span>Remise commerciale</span>
              <strong>−{{ totalRemise | number:'1.3-3' }} DNT</strong>
            </div>
            <div class="aside-meta-row" *ngIf="currentStep >= 3 && totalVAT > 0">
              <span>TVA (19%)</span>
              <strong>{{ totalVAT | number:'1.3-3' }} DNT</strong>
            </div>
          </ng-container>
        </div>
      </div>

      <div class="aside-total">
        <span>{{ currentStep >= 3 ? 'Total TTC (DNT)' : 'Total (DNT)' }}</span>
        <span class="aside-total-val">{{ (currentStep >= 3 ? totalTTC : totalHT) | number:'1.3-3' }}</span>
      </div>

      <div class="aside-actions">
        <button class="btn-continue"
                (click)="goToNextStep()"
                [disabled]="lineItems.length === 0">
          {{ currentStep === 3 ? 'Vérifier le Document →' : 'Continuer →' }}
        </button>
        <button class="btn-pdf" disabled>📄 Aperçu PDF</button>
        <button class="btn-abort" (click)="abortWorkflowAndLeave()">Annuler & Quitter</button>
      </div>
    </ng-container>

    <!-- ── Étape 4 : Génération ── -->
    <ng-container *ngIf="currentStep === 4">
      <div class="aside-top">
        <div class="aside-title">
          <span class="aside-icon">📋</span>
          <h3>Générer {{ mode === 'facture' ? 'Facture' : 'Bon de Livraison' }}</h3>
        </div>

        <div class="aside-meta-rows">
          <div class="aside-meta-row">
            <span>Total Brut H.T.</span>
            <strong>{{ totalBrutHT | number:'1.3-3' }} DNT</strong>
          </div>
          <div class="aside-meta-row discount-line" *ngIf="totalRemise > 0">
            <span>Remise</span>
            <strong>−{{ totalRemise | number:'1.3-3' }} DNT</strong>
          </div>
          <div class="aside-meta-row">
            <span>TVA (19%)</span>
            <strong>{{ totalVAT | number:'1.3-3' }} DNT</strong>
          </div>
        </div>
      </div>

      <div class="aside-total">
        <span>Net à Payer (TTC)</span>
        <span class="aside-total-val">{{ totalTTC | number:'1.3-3' }}</span>
      </div>

      <div class="aside-actions">
        <button class="btn-submit" (click)="executeFinalSubmission()" [disabled]="loading">
          {{ loading ? 'Transmission...' : (mode === 'facture' ? '🔒 Émettre la Facture' : '📦 Enregistrer le BL') }}
        </button>
        <button class="btn-pdf" disabled>📄 Télécharger PDF</button>
        <button class="btn-secondary" disabled>📧 Envoyer au Client</button>
        <button class="btn-back" (click)="goToPreviousStep()">← Revenir</button>
        <button class="btn-abort" (click)="abortWorkflowAndLeave()">Annuler & Quitter</button>
      </div>
    </ng-container>

  </aside>

</div>
  `,
  styles: [`
    /* ═══════════════════════════ LAYOUT ═══════════════════════════ */
    :host { display: block; height: 100%; }

    .doc-layout {
      display: flex;
      min-height: 100vh;
      background: #f0f2f8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .doc-main {
      flex: 1;
      min-width: 0;
      padding: 1.75rem 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* ═══════════════════════════ STEPPER ═══════════════════════════ */
    .stepper {
      display: flex;
      align-items: center;
      background: #fff;
      border-radius: 12px;
      padding: 1rem 1.5rem;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 4px rgba(0,0,0,.04);
    }

    .step {
      display: flex;
      align-items: center;
      gap: .6rem;
      cursor: pointer;
      color: #94a3b8;
      font-size: .85rem;
      font-weight: 500;
      white-space: nowrap;
    }
    .step.active  { color: #4f46e5; font-weight: 600; }
    .step.done    { color: #10b981; }

    .step-num {
      width: 28px; height: 28px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: .8rem; font-weight: 700;
      background: #f1f5f9; color: #64748b;
      flex-shrink: 0;
    }
    .step.active .step-num { background: #4f46e5; color: #fff; }
    .step.done   .step-num { background: #d1fae5; color: #10b981; }

    .step-connector {
      flex: 1; height: 2px;
      background: #e2e8f0;
      margin: 0 .75rem;
      border-radius: 2px;
    }
    .step-connector.filled { background: #10b981; }

    /* ═══════════════════════════ BANNERS ═══════════════════════════ */
    .banner {
      padding: .75rem 1.25rem;
      border-radius: 8px;
      font-size: .875rem;
    }
    .banner-err { background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5; }
    .banner-ok  { background: #f0fdf4; color: #166534; border: 1px solid #86efac; }

    /* ═══════════════════════════ STEP PANEL ═══════════════════════════ */
    .step-panel {
      background: #fff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 4px rgba(0,0,0,.04);
      overflow: hidden;
      flex: 1;
    }

    .panel-header {
      padding: 1rem 1.5rem;
      font-size: .8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .6px;
      color: #475569;
      border-bottom: 1px solid #f1f5f9;
      background: #fff;
    }

    .panel-body { padding: 1.75rem; }

    .empty-state {
      padding: 3rem;
      text-align: center;
      color: #94a3b8;
      font-size: .9rem;
    }

    /* ═══════════════════════════ STEP 1 — CATALOGUE ═══════════════════════════ */
    .filter-bar {
      display: flex;
      gap: .75rem;
      padding: 1rem 1.25rem;
      background: #f8fafc;
      border-bottom: 1px solid #f1f5f9;
    }
    .search-wrap {
      position: relative;
      flex: 1;
    }
    .search-wrap input {
      width: 100%; height: 38px;
      padding-left: 2.25rem;
      border: 1px solid #cbd5e1; border-radius: 8px;
      font-size: .85rem; box-sizing: border-box;
      outline: none; color: #0f172a;
    }
    .search-wrap input:focus { border-color: #4f46e5; }
    .search-icon {
      position: absolute; left: .75rem; top: 50%;
      transform: translateY(-50%); font-size: .85rem; color: #94a3b8;
    }
    .filter-bar select {
      height: 38px;
      border: 1px solid #cbd5e1; border-radius: 8px;
      padding: 0 .75rem;
      font-size: .85rem;
      background: #fff; color: #0f172a;
      outline: none; cursor: pointer;
    }
    .filter-bar select:focus { border-color: #4f46e5; }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
      padding: 1.25rem;
      max-height: calc(100vh - 280px);
      overflow-y: auto;
    }

    .product-card {
      display: flex;
      gap: .75rem;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: .875rem;
      background: #fff;
      transition: box-shadow .15s;
    }
    .product-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.08); }
    .product-card.card-rupture { opacity: .65; }

    .product-img {
      width: 72px; height: 72px;
      border-radius: 8px; overflow: hidden;
      background: #f1f5f9; flex-shrink: 0;
    }
    .product-img img { width: 100%; height: 100%; object-fit: cover; }

    .product-body { flex: 1; display: flex; flex-direction: column; gap: .25rem; min-width: 0; }

    .stock-badge {
      display: inline-block;
      padding: .15rem .5rem;
      border-radius: 4px;
      font-size: .65rem;
      font-weight: 700;
      letter-spacing: .4px;
      align-self: flex-start;
    }
    .badge-dispo  { background: #dcfce7; color: #166534; }
    .badge-faible { background: #fef3c7; color: #92400e; }
    .badge-rupture { background: #fee2e2; color: #991b1b; }

    .product-name {
      margin: 0; font-size: .875rem; font-weight: 700; color: #1e293b;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .product-ref { margin: 0; font-size: .75rem; color: #64748b; }

    .product-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: .5rem;
      margin-top: auto;
      flex-wrap: wrap;
    }
    .product-price {
      font-size: .9rem; font-weight: 700; color: #4f46e5;
      white-space: nowrap;
    }
    .product-actions { display: flex; align-items: center; gap: .5rem; }

    .btn-add {
      background: #ede9fe; color: #4f46e5;
      border: none; padding: .3rem .7rem;
      border-radius: 6px; font-size: .75rem; font-weight: 600;
      cursor: pointer; white-space: nowrap;
      transition: background .12s;
    }
    .btn-add:hover { background: #ddd6fe; }

    .btn-rupture {
      background: #f1f5f9; color: #94a3b8;
      border: none; padding: .3rem .75rem;
      border-radius: 6px; font-size: .75rem; font-weight: 600;
      cursor: not-allowed;
    }

    .qty-ctrl {
      display: inline-flex; align-items: center;
      border: 1px solid #e2e8f0; border-radius: 6px;
      overflow: hidden; background: #fff;
    }
    .qty-ctrl button {
      border: none; background: #f8fafc;
      width: 26px; height: 26px;
      cursor: pointer; font-size: .85rem; font-weight: bold;
      color: #475569; display: flex; align-items: center; justify-content: center;
    }
    .qty-ctrl button:hover { background: #e2e8f0; }
    .qty-ctrl span {
      width: 28px; text-align: center;
      font-size: .8rem; font-weight: 600; color: #1e293b;
    }

    /* ═══════════════════════════ STEP 2 — PANIER ═══════════════════════════ */
    .cart-wrap { overflow-x: auto; }

    .cart-table {
      width: 100%; border-collapse: collapse;
      font-size: .85rem;
    }
    .cart-table th {
      background: #f8fafc; padding: .75rem 1rem;
      color: #64748b; border-bottom: 1px solid #e2e8f0;
      text-align: left; font-size: .75rem; font-weight: 700;
      letter-spacing: .4px;
    }
    .cart-table td { padding: .85rem 1rem; border-bottom: 1px solid #f1f5f9; }
    .cart-table tbody tr:hover { background: #fafbff; }

    .td-product {
      display: flex; align-items: center; gap: .75rem;
    }
    .td-product div { display: flex; flex-direction: column; gap: .1rem; }
    .td-product strong { color: #1e293b; }
    .td-product small { color: #64748b; }

    .cart-thumb {
      width: 44px; height: 44px;
      border-radius: 6px; object-fit: cover;
      border: 1px solid #e2e8f0; flex-shrink: 0;
    }

    .qty-stepper {
      display: inline-flex; align-items: center;
      border: 1px solid #cbd5e1; border-radius: 6px;
      overflow: hidden; background: #fff;
    }
    .qty-stepper button {
      border: none; background: #f8fafc;
      width: 30px; height: 34px;
      cursor: pointer; font-weight: bold; color: #475569;
    }
    .qty-stepper button:hover { background: #e2e8f0; }
    .qty-stepper input {
      width: 48px; height: 34px; border: none;
      text-align: center; font-size: .85rem; font-weight: 600;
      color: #0f172a; outline: none;
    }

    .discount-input {
      width: 60px; height: 34px;
      border: 1px solid #cbd5e1; border-radius: 6px;
      text-align: center; font-size: .85rem; outline: none;
    }
    .discount-input:focus { border-color: #4f46e5; }

    .td-total { text-align: right; font-weight: 600; color: #1e293b; }
    .td-total.discounted { color: #10b981; }

    .btn-remove {
      background: transparent; border: none;
      color: #ef4444; cursor: pointer; font-size: 1rem;
      padding: .25rem;
    }

    .cart-footer {
      display: flex; justify-content: space-between; align-items: center;
      padding: .875rem 1rem;
      border-top: 1px solid #f1f5f9;
    }
    .btn-clear {
      background: transparent; border: 1px solid #fca5a5;
      color: #ef4444; padding: .35rem .875rem;
      border-radius: 6px; font-size: .8rem; font-weight: 500;
      cursor: pointer;
    }
    .btn-clear:hover { background: #fef2f2; }
    .cart-count { font-size: .8rem; color: #64748b; }

    /* ═══════════════════════════ STEP 3 — FACTURATION ═══════════════════════════ */
    .mode-toggle {
      display: flex;
      border: 1px solid #e2e8f0;
      border-radius: 10px; overflow: hidden;
      width: fit-content;
      margin-bottom: 1.75rem;
    }
    .mode-toggle button {
      border: none; background: #f8fafc;
      padding: .65rem 1.5rem;
      font-size: .875rem; font-weight: 600;
      color: #64748b; cursor: pointer;
      transition: all .18s;
    }
    .mode-toggle button:first-child { border-right: 1px solid #e2e8f0; }
    .mode-toggle button.active {
      background: #4f46e5; color: #fff;
    }

    .doc-form { display: flex; flex-direction: column; gap: 1.25rem; }

    .form-row {
      display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;
    }
    .form-group { display: flex; flex-direction: column; gap: .45rem; }
    .form-group label {
      font-size: .8rem; font-weight: 600; color: #334155;
    }
    .form-ctrl {
      height: 42px;
      border: 1px solid #cbd5e1; border-radius: 8px;
      padding: 0 .875rem; font-size: .875rem;
      background: #fff; color: #0f172a;
      outline: none; transition: border-color .18s;
      box-sizing: border-box; width: 100%;
    }
    .form-ctrl:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,.08); }

    .addr-hint {
      display: block; margin-top: .35rem;
      font-size: .78rem; color: #475569;
      background: #f8fafc; padding: .5rem .75rem;
      border-radius: 6px; border-left: 3px solid #cbd5e1;
    }

    .tva-banner {
      display: flex; justify-content: space-between; align-items: center;
      background: #f8fafc; padding: 1.1rem 1.25rem;
      border-radius: 10px; border: 1px solid #e2e8f0;
      margin-top: .5rem;
    }
    .tva-text { display: flex; flex-direction: column; gap: .2rem; }
    .tva-title { font-size: .9rem; font-weight: 700; color: #0f172a; }
    .tva-sub   { font-size: .78rem; color: #64748b; }

    .ios-toggle { position: relative; display: inline-block; width: 48px; height: 26px; }
    .ios-toggle input { opacity: 0; width: 0; height: 0; }
    .ios-knob {
      position: absolute; cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background: #cbd5e1; border-radius: 34px;
      transition: .25s;
    }
    .ios-knob:before {
      content: ""; position: absolute;
      height: 20px; width: 20px;
      left: 3px; bottom: 3px;
      background: #fff; border-radius: 50%;
      transition: .25s;
      box-shadow: 0 1px 3px rgba(0,0,0,.2);
    }
    .ios-toggle input:checked + .ios-knob { background: #4f46e5; }
    .ios-toggle input:checked + .ios-knob:before { transform: translateX(22px); }

    /* ═══════════════════════════ STEP 4 — SYNTHÈSE ═══════════════════════════ */
    .synthesis { padding: 1.75rem; }

    .synthesis-head {
      display: flex; justify-content: space-between; align-items: flex-start;
      padding-bottom: 1.25rem;
      border-bottom: 2px dashed #e2e8f0;
      margin-bottom: 1.5rem;
    }
    .synthesis-head h3 {
      margin: 0; font-size: 1.15rem; font-weight: 800;
      color: #4f46e5; letter-spacing: .5px;
    }
    .synthesis-head p { margin: .3rem 0 0; font-size: .8rem; color: #64748b; }

    .synthesis-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .synthesis-col {
      background: #f8fafc; border: 1px solid #e2e8f0;
      border-radius: 10px; padding: 1.1rem 1.25rem;
    }
    .synthesis-col h4, .synthesis-articles h4 {
      margin: 0 0 .875rem; font-size: .7rem;
      font-weight: 700; text-transform: uppercase;
      letter-spacing: .5px; color: #475569;
    }
    .synth-row {
      display: flex; justify-content: space-between; align-items: baseline;
      font-size: .875rem; padding: .45rem 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .synth-row:last-child { border-bottom: none; }
    .synth-row span { color: #64748b; }
    .synth-row strong { color: #0f172a; font-weight: 600; text-align: right; max-width: 55%; }

    .synthesis-articles {
      background: #f8fafc; border: 1px solid #e2e8f0;
      border-radius: 10px; padding: 1.1rem 1.25rem;
    }
    .article-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: .65rem 0; font-size: .875rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .article-row:last-child { border-bottom: none; padding-bottom: 0; }
    .article-row span { color: #334155; font-weight: 500; }
    .article-row strong { color: #0f172a; font-weight: 700; }

    /* ═══════════════════════════ BACK NAV ═══════════════════════════ */
    .back-nav { display: flex; }
    .btn-back {
      background: transparent; border: 1px solid #e2e8f0;
      color: #475569; padding: .55rem 1.1rem;
      border-radius: 8px; font-size: .85rem; font-weight: 500;
      cursor: pointer; transition: all .15s;
    }
    .btn-back:hover { background: #f8fafc; border-color: #cbd5e1; }

    /* ═══════════════════════════ PANNEAU DROIT ═══════════════════════════ */
    .doc-aside {
      width: 320px; flex: 0 0 320px;
      background: #fff; border-left: 1px solid #e2e8f0;
      position: sticky; top: 0; height: 100vh;
      display: flex; flex-direction: column;
      box-sizing: border-box; overflow-y: auto;
    }

    .aside-top {
      flex: 1; padding: 1.75rem 1.5rem 1rem;
    }

    .aside-title {
      display: flex; align-items: center; gap: .6rem;
      margin-bottom: 1.5rem;
    }
    .aside-icon { font-size: 1.2rem; }
    .aside-title h3 {
      margin: 0; font-size: 1rem; font-weight: 700; color: #0f172a;
    }

    .aside-meta-rows { display: flex; flex-direction: column; gap: .75rem; }

    .aside-meta-row {
      display: flex; justify-content: space-between; align-items: center;
      font-size: .82rem; color: #475569;
    }
    .aside-meta-row strong { color: #0f172a; font-weight: 600; text-align: right; max-width: 55%; }

    .client-name { color: #4f46e5 !important; }

    .discount-line strong { color: #ea580c !important; }

    .aside-divider {
      border: none; border-top: 1px dashed #e2e8f0; margin: .5rem 0;
    }

    .doc-type-pills {
      display: flex; gap: .35rem;
    }
    .doc-type-pills button {
      border: 1px solid #e2e8f0;
      background: #f8fafc; color: #64748b;
      padding: .2rem .6rem; border-radius: 20px;
      font-size: .72rem; font-weight: 600; cursor: pointer;
    }
    .doc-type-pills button.pill-active {
      background: #4f46e5; color: #fff; border-color: #4f46e5;
    }

    .aside-total {
      padding: 1rem 1.5rem;
      border-top: 1px solid #f1f5f9;
      border-bottom: 1px solid #f1f5f9;
      display: flex; justify-content: space-between; align-items: baseline;
    }
    .aside-total > span:first-child {
      font-size: .8rem; font-weight: 600; color: #475569;
    }
    .aside-total-val {
      font-size: 1.8rem; font-weight: 800; color: #4f46e5;
      letter-spacing: -.5px;
    }

    .aside-actions {
      padding: 1rem 1.5rem 1.75rem;
      display: flex; flex-direction: column; gap: .6rem;
    }

    .btn-continue {
      background: #4f46e5; color: #fff;
      border: none; height: 44px; border-radius: 10px;
      font-size: .9rem; font-weight: 600; cursor: pointer;
      transition: background .18s;
    }
    .btn-continue:hover:not(:disabled) { background: #4338ca; }
    .btn-continue:disabled { background: #cbd5e1; cursor: not-allowed; }

    .btn-submit {
      background: #10b981; color: #fff;
      border: none; height: 44px; border-radius: 10px;
      font-size: .9rem; font-weight: 600; cursor: pointer;
      transition: background .18s;
    }
    .btn-submit:hover:not(:disabled) { background: #059669; }
    .btn-submit:disabled { background: #cbd5e1; cursor: not-allowed; }

    .btn-pdf, .btn-secondary {
      background: #fff; color: #475569;
      border: 1px solid #e2e8f0; height: 40px; border-radius: 10px;
      font-size: .85rem; font-weight: 500; cursor: pointer;
    }
    .btn-pdf:hover:not(:disabled), .btn-secondary:hover:not(:disabled) { background: #f8fafc; }
    .btn-pdf:disabled, .btn-secondary:disabled { opacity: .5; cursor: not-allowed; }

    .btn-abort {
      background: transparent; border: 1px solid #fca5a5;
      color: #ef4444; height: 36px; border-radius: 8px;
      font-size: .8rem; font-weight: 500; cursor: pointer;
    }
    .btn-abort:hover { background: #fef2f2; }

    /* ═══════════════════════════ RESPONSIVE ═══════════════════════════ */
    @media (max-width: 900px) {
      .doc-layout { flex-direction: column; }
      .doc-aside { width: 100%; flex: none; height: auto; position: static; }
      .form-row { grid-template-columns: 1fr; }
      .synthesis-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class CreateDocumentComponent implements OnInit {

  currentStep: Step = 1;
  mode: DocumentMode = 'facture';
  today: Date = new Date();

  customers:        Customer[] = [];
  products:         Product[]  = [];
  filteredProducts: Product[]  = [];
  categories:       string[]   = [];

  searchQuery:      string = '';
  selectedCategory: string = '';
  stockFilter:      string = '';
  salesRep:         string = '';

  lineItems: LineItem[] = [];

  totalBrutHT: number = 0;
  totalRemise: number = 0;
  totalHT:     number = 0;
  totalVAT:    number = 0;
  totalTTC:    number = 0;

  loading: boolean = false;
  error:   string  = '';
  success: string  = '';

  invoiceForm!: FormGroup;

  blModel = {
    customerId:      '' as string | number,
    deliveryDate:    '',
    deliveryAddress: '',
    applyTva:        false
  };

  constructor(
    private fb:         FormBuilder,
    private apiService: ApiService,
    private router:     Router,
    private route:      ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.mode = params.get('mode') === 'bl' ? 'bl' : 'facture';
    });

    this.initInvoiceFormGroup();
    this.fetchCustomersData();
    this.fetchProductsInventory();

    const todayStr = new Date().toISOString().split('T')[0];
    this.blModel.deliveryDate = todayStr;
  }

  private initInvoiceFormGroup(): void {
    const todayStr = new Date().toISOString().split('T')[0];
    this.invoiceForm = this.fb.group({
      customerId:      [null, Validators.required],
      billDate:        [todayStr, Validators.required],
      paymentTerms:    ['30 jours', Validators.required],
      deposit:         [0, [Validators.min(0)]],
      applyTva:        [true],
      deliveryAddress: [''],
      billingAddress:  ['']
    });
    this.invoiceForm.valueChanges.subscribe(() => this.calculateAllTotals());
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  changeStep(target: number): void {
    const step = target as Step;
    if ((step === 2 || step === 3 || step === 4) && this.lineItems.length === 0) {
      this.error = 'Ajoutez au moins un article avant de continuer.';
      return;
    }
    this.error = '';
    this.currentStep = step;
  }

  goToNextStep(): void {
    if (this.currentStep === 1 && this.lineItems.length === 0) {
      this.error = 'Veuillez sélectionner au moins un article.';
      return;
    }
    if (this.currentStep === 3) {
      if (this.mode === 'facture' && this.invoiceForm.invalid) {
        this.error = 'Formulaire incomplet — vérifiez les champs obligatoires (*).';
        return;
      }
      if (this.mode === 'bl' && (!this.blModel.customerId || !this.blModel.deliveryDate)) {
        this.error = 'Client et date de livraison obligatoires.';
        return;
      }
    }
    this.error = '';
    if (this.currentStep < 4) {
      this.currentStep = (this.currentStep + 1) as Step;
    }
  }

  goToPreviousStep(): void {
    this.error = '';
    if (this.currentStep > 1) {
      this.currentStep = (this.currentStep - 1) as Step;
    }
  }

  setMode(newMode: DocumentMode): void {
    this.mode = newMode;
    this.calculateAllTotals();
  }

  // ── Chargement API ──────────────────────────────────────────────────────────

  private fetchCustomersData(): void {
    this.apiService.getCustomers().subscribe({
      next: (res: any[]) => {
        this.customers = res.map(item => {
          const raw = item.customer || item;
          return {
            customerId: raw.customerId,
            name:       raw.name,
            address:    raw.address,
            phone:      raw.phone,
            email:      raw.email
          };
        });
      },
      error: () => { this.error = 'Erreur lors du chargement des clients.'; }
    });
  }

  private fetchProductsInventory(): void {
    this.apiService.getProducts().subscribe({
      next: (res: any[]) => {
        this.products = res.map(p => ({
          productId: p.idProduct || p.id,
          reference: String(p.reference ?? ''),
          name:      p.name,
          unitPrice: p.unitPriceSold || p.unitPrice || 0,
          stock:     p.currentStockQuantity ?? p.stock ?? 0,
          imageUrl:  p.imageUrl,
          category:  p.category || 'Général'
        }));
        this.filteredProducts = [...this.products];
        const allCats = this.products.map(p => p.category ?? 'Général');
        this.categories = Array.from(new Set(allCats)).sort();
      },
      error: () => { this.error = 'Erreur lors du chargement des produits.'; }
    });
  }

  // ── Catalogue & Filtrage ────────────────────────────────────────────────────

  filterProducts(): void {
    const term = this.searchQuery.toLowerCase();
    this.filteredProducts = this.products.filter(p => {
      const matchSearch = !term ||
          p.name.toLowerCase().includes(term) ||
          p.reference.toLowerCase().includes(term);
      const matchCat = !this.selectedCategory || p.category === this.selectedCategory;
      const matchStock = !this.stockFilter ||
          (this.stockFilter === 'instock' && p.stock > 0) ||
          (this.stockFilter === 'low'     && p.stock > 0 && p.stock <= 5);
      return matchSearch && matchCat && matchStock;
    });
  }

  getStockBadgeClass(p: Product): string {
    if (p.stock <= 0)  return 'badge-rupture';
    if (p.stock <= 5)  return 'badge-faible';
    return 'badge-dispo';
  }

  getStockLabel(p: Product): string {
    if (p.stock <= 0) return 'RUPTURE';
    if (p.stock <= 5) return 'STOCK FAIBLE';
    return 'DISPONIBLE';
  }

  // ── Panier ──────────────────────────────────────────────────────────────────

  addItemToCart(product: Product): void {
    this.error = '';
    const match = this.lineItems.find(i => i.productId === product.productId);
    if (match) {
      if (match.quantity >= product.stock) {
        this.error = `Stock limité à ${product.stock} unité(s) pour « ${product.name} ».`;
        return;
      }
      match.quantity++;
      match.totalPrice = match.quantity * match.unitPrice * (1 - match.discount / 100);
    } else {
      if (product.stock <= 0) {
        this.error = `« ${product.name} » est en rupture de stock.`;
        return;
      }
      this.lineItems.push({
        productId:   product.productId,
        productName: product.name,
        reference:   product.reference,
        unitPrice:   product.unitPrice,
        quantity:    1,
        discount:    0,
        totalPrice:  product.unitPrice,
        maxStock:    product.stock,
        imageUrl:    product.imageUrl
      });
    }
    this.calculateAllTotals();
  }

  changeQtyForProduct(p: Product, delta: number): void {
    const idx = this.lineItems.findIndex(i => i.productId === p.productId);
    if (idx === -1) {
      if (delta > 0) this.addItemToCart(p);
      return;
    }
    this.changeQtyInline(idx, delta);
  }

  changeQtyInline(index: number, offset: number): void {
    this.error = '';
    const item = this.lineItems[index];
    const newQty = item.quantity + offset;
    if (newQty <= 0) { this.removeLineItem(index); return; }
    if (newQty > item.maxStock) {
      this.error = `Stock limité à ${item.maxStock} unité(s).`;
      return;
    }
    item.quantity  = newQty;
    item.totalPrice = item.quantity * item.unitPrice * (1 - item.discount / 100);
    this.calculateAllTotals();
  }

  validateAndRecalcLine(index: number): void {
    this.error = '';
    const item = this.lineItems[index];
    if (item.quantity < 1) item.quantity = 1;
    if (item.quantity > item.maxStock) { item.quantity = item.maxStock; }
    if (item.discount < 0)   item.discount = 0;
    if (item.discount > 100) item.discount = 100;
    item.totalPrice = item.quantity * item.unitPrice * (1 - item.discount / 100);
    this.calculateAllTotals();
  }

  removeLineItem(index: number): void {
    this.lineItems.splice(index, 1);
    this.calculateAllTotals();
    if (this.lineItems.length === 0 && this.currentStep > 1) {
      this.currentStep = 1;
    }
  }

  clearEntireCart(): void {
    this.lineItems = [];
    this.calculateAllTotals();
    this.currentStep = 1;
    this.error = '';
  }

  getItemQtyInCart(productId: number): number {
    return this.lineItems.find(i => i.productId === productId)?.quantity ?? 0;
  }

  // ── Calculs financiers ──────────────────────────────────────────────────────

  calculateAllTotals(): void {
    this.totalBrutHT = this.lineItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    this.totalHT     = this.lineItems.reduce((s, i) => s + i.totalPrice, 0);
    this.totalRemise = this.totalBrutHT - this.totalHT;

    const wantsTva = this.mode === 'facture'
      ? (this.invoiceForm?.get('applyTva')?.value ?? true)
      : this.blModel.applyTva;

    this.totalVAT = wantsTva ? this.totalHT * 0.19 : 0;
    this.totalTTC = this.totalHT + this.totalVAT;
  }

  // ── Helpers formulaire Étape 3 ──────────────────────────────────────────────

  onInvoiceCustomerSelect(): void {
    const id  = this.invoiceForm.get('customerId')?.value;
    const cust = this.customers.find(c => c.customerId == id);
    if (cust?.address) {
      this.invoiceForm.patchValue({
        deliveryAddress: cust.address,
        billingAddress:  cust.address
      });
    }
    this.calculateAllTotals();
  }

  onBlCustomerSelect(): void {
    const cust = this.customers.find(c => c.customerId == this.blModel.customerId);
    if (cust?.address) {
      this.blModel.deliveryAddress = cust.address;
    }
  }

  getSelectedCustomerAddress(): string {
    if (this.mode === 'bl' && this.blModel.customerId) {
      return this.customers.find(c => c.customerId == this.blModel.customerId)?.address ?? '';
    }
    return '';
  }

  getSummaryCustomerName(): string {
    const id = this.mode === 'facture'
      ? this.invoiceForm?.get('customerId')?.value
      : this.blModel.customerId;
    if (!id) return 'Bhouri Stock';
    return this.customers.find(c => c.customerId == id)?.name ?? 'Client inconnu';
  }

  // ── Soumission API ──────────────────────────────────────────────────────────

  executeFinalSubmission(): void {
    if (this.lineItems.length === 0) {
      this.error = 'Le panier est vide.';
      return;
    }
    this.loading = true;
    this.error   = '';
    this.success = '';

    if (this.mode === 'facture') {
      const payload = {
        customerId:   Number(this.invoiceForm.get('customerId')?.value),
        billDate:     this.invoiceForm.get('billDate')?.value,
        paymentTerms: this.invoiceForm.get('paymentTerms')?.value,
        deposit:      Number(this.invoiceForm.get('deposit')?.value) || 0,
        applyTva:     this.invoiceForm.get('applyTva')?.value,
        products: this.lineItems.map(i => ({
          productId: i.productId,
          quantity:  i.quantity,
          unitPrice: i.unitPrice,
          discount:  i.discount
        }))
      };
      this.apiService.createInvoice(payload).subscribe({
        next: () => {
          this.success = 'Facture émise avec succès !';
          setTimeout(() => this.router.navigate(['/invoices/list']), 1500);
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || "Erreur lors de l'émission de la facture.";
        }
      });
    } else {
      const payload = {
        customerId:      Number(this.blModel.customerId),
        dateDelivery:    new Date(this.blModel.deliveryDate).toISOString(),
        deliveryAddress: this.blModel.deliveryAddress,
        products: this.lineItems.map(i => ({
          productId: i.productId,
          quantity:  i.quantity,
          unitPrice: i.unitPrice,
          discount:  i.discount
        }))
      };
      this.apiService.createDeliveryNote(payload).subscribe({
        next: () => {
          this.success = 'Bon de livraison créé avec succès !';
          setTimeout(() => this.router.navigate(['/delivery-notes/list']), 1500);
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Erreur lors de la création du BL.';
        }
      });
    }
  }

  abortWorkflowAndLeave(): void {
    if (confirm('Abandonner la saisie en cours ? Le panier sera perdu.')) {
      this.router.navigate(['/invoices/list']);
    }
  }
}
