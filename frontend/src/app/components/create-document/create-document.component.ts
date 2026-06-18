import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
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
  productId: number;
  productName: string;
  reference: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  totalPrice: number;
  maxStock: number;
}

@Component({
  selector: 'app-create-document',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="dashboard-container">

      <div class="workspace-area">

        <div class="stepper-navbar">
          <div class="step-nav-item" [class.active]="currentStep === 1" [class.done]="currentStep > 1" (click)="changeStep(1)">
            <span class="badge-num">1</span>
            <span class="label-txt">Catalogue Produits</span>
          </div>
          <div class="step-nav-item" [class.active]="currentStep === 2" [class.done]="currentStep > 2" (click)="changeStep(2)">
            <span class="badge-num">2</span>
            <span class="label-txt">Panier Actif</span>
          </div>
          <div class="step-nav-item" [class.active]="currentStep === 3" [class.done]="currentStep > 3" (click)="changeStep(3)">
            <span class="badge-num">3</span>
            <span class="label-txt">Facturation / Client</span>
          </div>
          <div class="step-nav-item" [class.active]="currentStep === 4" [class.done]="currentStep > 4" (click)="changeStep(4)">
            <span class="badge-num">4</span>
            <span class="label-txt">Revue finale</span>
          </div>
        </div>

        <div *ngIf="error" class="banner-msg banner-danger">{{ error }}</div>
        <div *ngIf="success" class="banner-msg banner-success">{{ success }}</div>

        <div class="grid-card-box" *ngIf="currentStep === 1">
          <div class="section-title-bar">PRODUCT CATALOGUE</div>

          <div class="filter-flex-row">
            <div class="search-input-with-icon">
              <span class="search-glass">🔍</span>
              <input type="text" [(ngModel)]="searchQuery" (input)="filterProducts()" placeholder="VAL">
            </div>
            <select [(ngModel)]="selectedCategory" (change)="filterProducts()" class="filter-select-input">
              <option value="">Peinture & Enduit</option>
            </select>
            <select class="filter-select-input">
              <option value="in-stock">En Stock</option>
            </select>
          </div>

          <div class="products-compact-grid">
            <div class="product-item-card" *ngFor="let item of filteredProducts">
              <div class="product-thumb-wrapper">
                <img [src]="item.imageUrl" alt="Product thumbnail">
              </div>
              <div class="product-meta-details">
                <h4 class="product-title-text">{{ item.name }}</h4>
                <div class="product-subtext-ref">Réf: {{ item.reference }} | Stock: {{ item.stock }}</div>
                <div class="product-price-tag">{{ item.unitPrice | number:'1.3-3' }} DNT</div>

                <div class="action-footer-row">
                  <button class="add-to-cart-btn" (click)="addItemToCart(item)">+ Ajouter</button>
                  <div class="quantity-counter-badge" *ngIf="getCartQuantity(item.productId) > 0">
                    {{ getCartQuantity(item.productId) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="section-container" *ngIf="currentStep === 2">
          <div class="section-title-bar">VOTRE PANIER ACTIF</div>
          <div class="table-scroll-container" style="padding:1.5rem;">
            <table class="custom-data-table">
              <thead>
              <tr>
                <th>PRODUIT</th>
                <th style="text-align: center;">QUANTITÉ</th>
                <th style="text-align: right;">PRIX UNITAIRE</th>
                <th style="text-align: center;">REMISE (%)</th>
                <th style="text-align: right;">TOTAL LIGNE</th>
                <th></th>
              </tr>
              </thead>
              <tbody>
              <tr *ngFor="let item of lineItems; let idx = index">
                <td><strong>{{ item.productName }}</strong><br><small>Réf: {{item.reference}}</small></td>
                <td style="text-align: center;">
                  <div class="inline-qty-stepper" style="margin: 0 auto;">
                    <button (click)="modifyItemQty(idx, item.quantity - 1)">-</button>
                    <input type="number" [value]="item.quantity" (change)="onQtyInputChange($event, idx)">
                    <button (click)="modifyItemQty(idx, item.quantity + 1)">+</button>
                  </div>
                </td>
                <td style="text-align: right;" class="font-numeric">{{ item.unitPrice | number:'1.3-3' }} DNT</td>
                <td style="text-align: center;">
                  <input type="number" class="table-discount-input" [value]="item.discount" (change)="onDiscountInputChange($event, idx)">
                </td>
                <td style="text-align: right;" class="font-numeric text-highlight-blue">{{ item.totalPrice | number:'1.3-3' }} DNT</td>
                <td style="text-align: center;">
                  <button class="table-delete-row-btn" (click)="removeItemFromCart(idx)">🗑️</button>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="section-container" *ngIf="currentStep === 3">
          <div class="section-title-bar">DOCUMENT TYPE SWITCHER & INFORMATIONS GÉNÉRALES</div>

          <div class="inner-card-padding">
            <div class="center-pill-wrapper" style="padding-top: 0; padding-bottom: 2rem;">
              <div class="custom-toggle-pill">
                <button [class.selected]="mode === 'facture'" (click)="toggleDocumentMode('facture')">
                  📄 Facture
                </button>
                <div class="switch-separator-dot"></div>
                <button [class.selected]="mode === 'bl'" (click)="toggleDocumentMode('bl')">
                  🚚 Bon de Livraison
                </button>
              </div>
            </div>

            <form [formGroup]="invoiceForm" *ngIf="mode === 'facture'" class="grid-form-system">
              <div class="form-double-column">
                <div class="custom-form-group">
                  <label>Client *</label>
                  <select formControlName="customerId" class="custom-select-box" (change)="onCustomerSelected()">
                    <option [ngValue]="null">Sélectionner un client...</option>
                    <option *ngFor="let c of customers" [ngValue]="c.customerId">{{ c.name }}</option>
                  </select>
                </div>
                <div class="custom-form-group">
                  <label>Date de Facturation *</label>
                  <input type="date" formControlName="billDate" class="custom-input-field">
                </div>
              </div>

              <div class="form-subtext-address" *ngIf="invoiceForm.get('customerId')?.value">
                Adresse Industrielle de la Charguia II, Tunis
              </div>

              <div class="form-double-column">
                <div class="custom-form-group">
                  <label>Conditions de Paiement *</label>
                  <select formControlName="paymentTerms" class="custom-select-box">
                    <option value="30 jours">30 jours</option>
                    <option value="60 jours">60 jours</option>
                    <option value="Immédiat">Immédiat</option>
                  </select>
                </div>
                <div class="custom-form-group">
                  <label>Représentant de Vente</label>
                  <input type="text" formControlName="salesRep" class="custom-input-field" placeholder="Raouf">
                </div>
              </div>

              <div class="tva-toggle-banner">
                <div class="tva-description-block">
                  <span class="tva-main-title">TVA 19%</span>
                  <span class="tva-sub-paragraph">Calculer les taxes légales obligatoires pour ce client tunisien</span>
                </div>
                <label class="ios-switch-container">
                  <input type="checkbox" formControlName="applyTva">
                  <span class="ios-slider-circle"></span>
                </label>
              </div>
            </form>

            <div *ngIf="mode === 'bl'" class="grid-form-system">
              <div class="form-double-column">
                <div class="custom-form-group">
                  <label>Client Destination *</label>
                  <select [(ngModel)]="blModel.customerId" class="custom-select-box" (change)="onBlCustomerSelected()">
                    <option value="">Sélectionner un client...</option>
                    <option *ngFor="let c of customers" [value]="c.customerId">{{ c.name }}</option>
                  </select>
                </div>
                <div class="custom-form-group">
                  <label>Date de Livraison Prévue *</label>
                  <input type="date" [(ngModel)]="blModel.deliveryDate" class="custom-input-field">
                </div>
              </div>
              <div class="custom-form-group" style="margin-top:1rem;">
                <label>Adresse de Livraison Réelle</label>
                <input type="text" [(ngModel)]="blModel.deliveryAddress" class="custom-input-field" placeholder="Zone Industrielle...">
              </div>
            </div>
          </div>
        </div>

        <div class="section-container" *ngIf="currentStep === 4">
          <div class="section-title-bar">SUMMARY PAGE</div>

          <div class="synthesis-sheet-paper">
            <div class="synthesis-sheet-header">
              <h3>FICHE DE SYNTHÈSE</h3>
              <div class="synthesis-sheet-date">Facture Pro-Forma générée le {{ getCurrentDateFormatted() }}</div>
            </div>

            <div class="synthesis-double-grid">
              <div class="synthesis-inner-card">
                <h4>INFORMATIONS GÉNÉRALES</h4>
                <div class="synthesis-data-item"><span>Type</span><strong>{{ mode === 'facture' ? 'Facture de Vente' : 'Livraison Client' }}</strong></div>
                <div class="synthesis-data-item"><span>Client</span><strong>{{ getSelectedCustomerName() }}</strong></div>
                <div class="synthesis-data-item" *ngIf="mode === 'facture'"><span>Commercial</span><strong>{{ invoiceForm.get('salesRep')?.value }}</strong></div>
                <div class="synthesis-data-item"><span>Échéance</span><strong>Sous {{ mode === 'facture' ? invoiceForm.get('paymentTerms')?.value : 'Immédiat' }}</strong></div>
              </div>

              <div class="synthesis-inner-card">
                <h4>DESTINATIONS OBLIGATOIRES</h4>
                <div class="synthesis-data-item"><span>Adresse Livraison</span><strong>Zone Industrielle de la Charguia II</strong></div>
                <div class="synthesis-data-item"><span>Adresse Facturation</span><strong>Zone Industrielle de la Charguia II</strong></div>
                <div class="synthesis-data-item"><span>TVA Appliquée</span><strong>{{ isTvaCheckboxChecked() ? 'Oui (19.00%)' : 'Non' }}</strong></div>
              </div>
            </div>

            <div class="synthesis-items-block">
              <h4>LIGNES D'ARTICLES APPROUVÉES</h4>
              <div class="synthesis-article-line" *ngFor="let item of lineItems">
                <span>{{ item.quantity }}x {{ item.productName }}</span>
                <strong>{{ item.totalPrice | number:'1.3-3' }} DNT</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="right-contextual-sidebar">
        <div class="sidebar-scrollable-content">
          <div class="sidebar-brand-title">
            <span class="brand-icon-sheet">📋</span>
            <h2>Nouveau Document</h2>
          </div>

          <div class="sidebar-rows-stack">
            <div class="meta-data-line">
              <span class="meta-label">Type de document</span>
              <span class="meta-value font-bold-text">{{ mode === 'facture' ? 'Facture' : 'Bon de Livraison' }}</span>
            </div>
            <div class="meta-data-line">
              <span class="meta-label">Client sélectionné</span>
              <span class="meta-value color-purple-text font-bold-text">{{ getSelectedCustomerName() }}</span>
            </div>
            <div class="meta-data-line">
              <span class="meta-label">Articles ajoutés</span>
              <span class="meta-value font-bold-text">{{ getTotalItemsQuantity() }} {{ getTotalItemsQuantity() > 1 ? 'unités' : 'unité' }}</span>
            </div>

            <hr class="thin-hr-line">

            <div class="sidebar-embedded-table-box" *ngIf="currentStep === 1">
              <div class="embedded-table-title">SELECTED PRODUCTS TABLE</div>

              <div class="empty-embedded-notice" *ngIf="lineItems.length === 0">
                Aucun article dans le panier.
              </div>

              <div class="sidebar-table-scroll" *ngIf="lineItems.length > 0">
                <table class="sidebar-data-table">
                  <thead>
                  <tr>
                    <th>PRODUIT</th>
                    <th style="text-align: center;">QTÉ</th>
                    <th style="text-align: right;">TOTAL</th>
                    <th></th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr *ngFor="let item of lineItems; let idx = index">
                    <td><span class="compact-name">{{ item.productName }}</span></td>
                    <td style="text-align: center;">
                      <div class="sidebar-qty-actions">
                        <button (click)="modifyItemQty(idx, item.quantity - 1)">-</button>
                        <span class="qty-num">{{ item.quantity }}</span>
                        <button (click)="modifyItemQty(idx, item.quantity + 1)">+</button>
                      </div>
                    </td>
                    <td style="text-align: right;" class="text-highlight-blue">{{ item.totalPrice | number:'1.1-1' }}</td>
                    <td style="text-align: center;">
                      <button class="sidebar-del-btn" (click)="removeItemFromCart(idx)">×</button>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>

              <div class="sidebar-table-footer" *ngIf="lineItems.length > 0">
                <button class="sidebar-clear-btn" (click)="clearEntireCart()">Vider</button>
                <span class="footnote">{{ lineItems.length }} distincts</span>
              </div>
            </div>

            <hr class="thin-hr-line" *ngIf="currentStep === 1">

            <div class="meta-data-line">
              <span class="meta-label">Sous-total</span>
              <span class="meta-value">{{ calculateRawSubTotal() | number:'1.3-3' }} DNT</span>
            </div>
            <div class="meta-data-line color-green-text" *ngIf="calculateTotalDiscounts() > 0">
              <span class="meta-label">Remise commerciale</span>
              <span class="meta-value">-{{ calculateTotalDiscounts() | number:'1.3-3' }} DNT</span>
            </div>
            <div class="meta-data-line">
              <span class="meta-label">TVA 19%</span>
              <span class="meta-value">{{ computedTaxAmount | number:'1.3-3' }} DNT</span>
            </div>

            <hr class="thin-hr-line">

            <div class="grand-total-container-box">
              <span class="grand-total-label">Total TTC (DNT)</span>
              <span class="grand-total-value-digits">{{ computedGrandTotal | number:'1.3-3' }}</span>
            </div>

            <div class="client-solde-warning-box" *ngIf="isCustomerActiveSelected()">
              <span class="warning-icon-badge">⚠️</span>
              <div class="warning-text-stack">
                <span class="warning-header-title">Solde Client en cours</span>
                <span class="warning-numerical-subtitle">1,500,000 DNT d'encours</span>
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar-action-buttons-group">
          <button class="primary-workflow-btn" (click)="moveToNextStep()" *ngIf="currentStep < 4">
            {{ currentStep === 3 ? 'Vérifier le Document →' : 'Continuer l\\'étape →' }}
          </button>

          <button class="success-workflow-btn" (click)="finalizeDocumentEmission()" *ngIf="currentStep === 4" [disabled]="loading">
            {{ loading ? 'Émission en cours...' : 'Émettre le Document 💾' }}
          </button>

          <button class="secondary-neutral-btn" (click)="openPdfPreviewDialog()">
            📄 Aperçu PDF
          </button>

          <button class="secondary-neutral-btn abort-btn" (click)="abortWorkflowAndLeave()">
            ← Quitter le processus
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* STRUCTURE GLOBALE */
    .dashboard-container {
      display: flex;
      width: 100%;
      min-height: 100vh;
      background-color: #f6f8fb;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      box-sizing: border-box;
    }

    /* FIX : La zone principale prend 100% de la largeur disponible restante */
    .workspace-area {
      flex: 1 1 auto;
      width: calc(100% - 380px);
      padding: 2rem;
      box-sizing: border-box;
    }

    /* BARRE DE SÉLECTION DU STEPPER GRAPHIQUE */
    .stepper-navbar {
      display: flex;
      background: #ffffff;
      padding: 1.15rem 1.5rem;
      border-radius: 14px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
      margin-bottom: 2rem;
      justify-content: space-between;
      border: 1px solid #eaedf3;
    }

    .step-nav-item {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      cursor: pointer;
      color: #94a3b8;
      font-weight: 500;
      transition: all 0.25s ease;
    }

    .step-nav-item.active {
      color: #4f46e5;
      font-weight: 600;
    }

    .step-nav-item.done {
      color: #10b981;
    }

    .badge-num {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #f1f5f9;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: bold;
    }

    .step-nav-item.active .badge-num {
      background: #4f46e5;
      color: #ffffff;
    }

    .step-nav-item.done .badge-num {
      background: #e6f4ea;
      color: #10b981;
    }

    /* CARDS */
    .section-container {
      background: #ffffff;
      border-radius: 14px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
      border: 1px solid #e2e8f0;
      margin-bottom: 1.75rem;
      overflow: hidden;
    }

    .section-title-bar {
      background: #ffffff;
      padding: 1rem 1.5rem;
      font-size: 0.95rem;
      font-weight: 700;
      color: #1e293b;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #f1f5f9;
      text-transform: uppercase;
    }

    .inner-card-padding { padding: 1.75rem; }

    /* PILULE SWITCH MODE */
    .center-pill-wrapper {
      display: flex;
      justify-content: center;
    }

    .custom-toggle-pill {
      display: flex;
      align-items: center;
      background: #f1f5f9;
      padding: 0.35rem;
      border-radius: 40px;
      border: 1px solid #e2e8f0;
    }

    .custom-toggle-pill button {
      border: none;
      background: transparent;
      padding: 0.65rem 1.75rem;
      font-weight: 600;
      font-size: 0.9rem;
      border-radius: 30px;
      cursor: pointer;
      color: #64748b;
      transition: all 0.2s ease;
    }

    .custom-toggle-pill button.selected {
      background: #4f46e5;
      color: #ffffff;
      box-shadow: 0 4px 10px rgba(79, 70, 229, 0.25);
    }

    .switch-separator-dot {
      width: 4px;
      height: 4px;
      background: #cbd5e1;
      border-radius: 50%;
      margin: 0 0.5rem;
    }

    /* CATALOGUE COMPONENT */
    .grid-card-box {
      background: #ffffff;
      border-radius: 14px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.01);
      overflow: hidden;
      width: 100%;
    }

    .filter-flex-row {
      display: flex;
      padding: 1rem 1.25rem;
      gap: 0.75rem;
      background: #f8fafc;
      border-bottom: 1px solid #f1f5f9;
    }

    .search-input-with-icon { position: relative; flex: 1; }
    .search-input-with-icon input {
      width: 100%; height: 38px; padding-left: 2.25rem;
      border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box; font-size: 0.85rem;
    }
    .search-glass { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); font-size: 0.85rem; color: #94a3b8; }
    .filter-select-input { height: 38px; border: 1px solid #cbd5e1; border-radius: 8px; padding: 0 0.75rem; font-size: 0.85rem; background: #ffffff; }

    /* FIX: Remplacement de '1fr 1fr' par auto-fill pour s'adapter dynamiquement à l'étirement global */
    .products-compact-grid {
      padding: 1.25rem;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1rem;
      overflow-y: auto;
      max-height: 560px;
    }

    .product-item-card { display: flex; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0.75rem; gap: 0.75rem; background: #ffffff; }
    .product-thumb-wrapper { width: 64px; height: 64px; border-radius: 8px; overflow: hidden; background: #f1f5f9; flex-shrink: 0; }
    .product-thumb-wrapper img { width: 100%; height: 100%; object-fit: cover; }
    .product-meta-details { flex: 1; display: flex; flex-direction: column; }
    .product-title-text { margin: 0 0 0.25rem 0; font-size: 0.85rem; font-weight: 700; color: #1e293b; }
    .product-subtext-ref { font-size: 0.75rem; color: #64748b; margin-bottom: 0.25rem; }
    .product-price-tag { font-size: 0.9rem; font-weight: 700; color: #4f46e5; }
    .action-footer-row { display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; }
    .add-to-cart-btn { background: #f1f5f9; color: #4f46e5; border: none; padding: 0.35rem 0.75rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; }
    .quantity-counter-badge { background: #e0e7ff; color: #4f46e5; font-size: 0.75rem; font-weight: 700; padding: 0.15rem 0.4rem; border-radius: 20px; }

    /* STRUCTURES TABLEAUX (STEP 2) */
    .table-scroll-container { overflow-x: auto; }
    .custom-data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    .custom-data-table th { background: #f8fafc; padding: 0.75rem 1rem; color: #64748b; border-bottom: 1px solid #e2e8f0; }
    .custom-data-table td { padding: 0.85rem 1rem; border-bottom: 1px solid #f1f5f9; }

    .inline-qty-stepper { display: inline-flex; align-items: center; border: 1px solid #cbd5e1; border-radius: 6px; background: #ffffff; }
    .inline-qty-stepper button { border: none; background: #f8fafc; width: 24px; height: 28px; cursor: pointer; }
    .inline-qty-stepper input { width: 32px; height: 28px; border: none; text-align: center; font-size: 0.8rem; font-weight: 600; }
    .table-discount-input { width: 45px; height: 28px; border: 1px solid #cbd5e1; border-radius: 6px; text-align: center; }
    .table-delete-row-btn { background: transparent; border: none; color: #ef4444; cursor: pointer; }

    /* PANNEAU LATÉRAL FIXE */
    .right-contextual-sidebar {
      width: 380px;
      flex: 0 0 380px;
      background: #ffffff;
      border-left: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      height: 100vh;
      box-sizing: border-box;
    }

    .sidebar-scrollable-content {
      flex: 1;
      overflow-y: auto;
      padding: 2.25rem 1.75rem 1rem 1.75rem;
    }

    .sidebar-action-buttons-group {
      padding: 1rem 1.75rem 2.25rem 1.75rem;
      background: #ffffff;
      border-top: 1px solid #f1f5f9;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    /* EMBEDDED TABLE BOX */
    .sidebar-embedded-table-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 0.75rem;
      box-sizing: border-box;
    }
    .embedded-table-title {
      font-size: 0.725rem;
      font-weight: 700;
      color: #475569;
      margin-bottom: 0.5rem;
      letter-spacing: 0.3px;
    }
    .empty-embedded-notice {
      font-size: 0.8rem;
      color: #94a3b8;
      text-align: center;
      padding: 0.85rem 0;
    }
    .sidebar-table-scroll {
      max-height: 180px;
      overflow-y: auto;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background: #ffffff;
    }
    .sidebar-data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.75rem;
    }
    .sidebar-data-table th {
      position: sticky;
      top: 0;
      background: #f1f5f9;
      padding: 0.5rem 0.4rem;
      color: #475569;
      text-align: left;
      font-size: 0.65rem;
      border-bottom: 1px solid #cbd5e1;
      z-index: 2;
    }
    .sidebar-data-table td {
      padding: 0.45rem 0.3rem;
      border-bottom: 1px solid #f1f5f9;
    }
    .compact-name {
      display: block;
      max-width: 95px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: 600;
      color: #334155;
    }
    .sidebar-qty-actions {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 0.1rem;
      background: #fff;
    }
    .sidebar-qty-actions button {
      border: none;
      background: #f1f5f9;
      border-radius: 2px;
      width: 16px;
      height: 16px;
      cursor: pointer;
      font-size: 0.65rem;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qty-num {
      font-size: 0.725rem;
      font-weight: 600;
      min-width: 14px;
      text-align: center;
    }
    .sidebar-del-btn {
      background: transparent;
      border: none;
      color: #ef4444;
      cursor: pointer;
      font-size: 0.95rem;
      padding: 0 0.25rem;
    }
    .sidebar-table-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.5rem;
      margin-top: 0.5rem;
      border-top: 1px dashed #cbd5e1;
    }
    .sidebar-clear-btn {
      background: #fff;
      border: 1px solid #fee2e2;
      color: #ef4444;
      font-size: 0.7rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }

    /* LABELS ET META DATA */
    .sidebar-brand-title { display: flex; gap: 0.75rem; align-items: center; margin-bottom: 1.5rem; }
    .brand-icon-sheet { font-size: 1.4rem; }
    .sidebar-brand-title h2 { font-size: 1.25rem; color: #0f172a; margin: 0; font-weight: 700; }
    .sidebar-rows-stack { display: flex; flex-direction: column; gap: 0.85rem; }
    .meta-data-line { display: flex; justify-content: space-between; font-size: 0.85rem; color: #475569; }
    .meta-data-line .meta-value { color: #0f172a; }

    .color-purple-text { color: #4f46e5 !important; }
    .color-green-text { color: #10b981 !important; }
    .text-highlight-blue { color: #2563eb !important; font-weight: 600; }
    .font-bold-text { font-weight: 700; }
    .thin-hr-line { border: 0; border-top: 1px solid #f1f5f9; margin: 0.25rem 0; }

    .grand-total-container-box { display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem; }
    .grand-total-label { font-weight: 700; color: #0f172a; font-size: 1rem; }
    .grand-total-value-digits { font-weight: 800; color: #2563eb; font-size: 1.6rem; }

    .client-solde-warning-box {
      display: flex; gap: 0.75rem; background: #fffbeb; border: 1px solid #fef3c7; padding: 0.75rem; border-radius: 10px; margin-top: 0.5rem; align-items: center;
    }
    .warning-icon-badge { font-size: 1.1rem; }
    .warning-text-stack { display: flex; flex-direction: column; }
    .warning-header-title { font-size: 0.8rem; font-weight: 700; color: #b45309; }
    .warning-numerical-subtitle { font-size: 0.85rem; font-weight: 600; color: #78350f; }

    .primary-workflow-btn { background: #4f46e5; color: #ffffff; border: none; height: 44px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .success-workflow-btn { background: #10b981; color: #ffffff; border: none; height: 44px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .secondary-neutral-btn { background: #ffffff; color: #475569; border: 1px solid #cbd5e1; height: 40px; border-radius: 8px; font-weight: 500; cursor: pointer; }
    .abort-btn { border-color: #fca5a5; color: #ef4444; }

    .banner-msg { padding: 0.85rem 1.25rem; border-radius: 8px; margin-bottom: 1.25rem; font-size: 0.85rem; }
    .banner-danger { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
    .banner-success { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
  `],
})
export class CreateDocumentComponent implements OnInit {
  mode: DocumentMode = 'facture';
  currentStep: Step = 1;

  searchQuery = '';
  selectedCategory = '';

  customers: Customer[] = [];
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  lineItems: LineItem[] = [];

  loading = false;
  error = '';
  success = '';

  invoiceForm!: FormGroup;

  blModel = {
    customerId: '' as string | number,
    deliveryDate: '',
    deliveryAddress: '',
  };

  computedTaxAmount = 0;
  computedGrandTotal = 0;

  constructor(
      private fb: FormBuilder,
      private apiService: ApiService,
      private router: Router,
      private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const queryMode = params.get('mode');
      this.mode = queryMode === 'bl' ? 'bl' : 'facture';
    });

    this.setupLocalForms();
    this.fetchSystemCustomers();
    this.fetchSystemProducts();
    this.blModel.deliveryDate = this.getIsoDateString();
  }

  private setupLocalForms() {
    this.invoiceForm = this.fb.group({
      customerId:      [null, Validators.required],
      billDate:        [this.getIsoDateString(), Validators.required],
      paymentTerms:    ['30 jours', Validators.required],
      salesRep:        ['Raouf'],
      applyTva:        [true],
    });

    this.invoiceForm.get('applyTva')?.valueChanges.subscribe(() => {
      this.runFinancialCalculations();
    });
  }

  private getIsoDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  getCurrentDateFormatted(): string {
    return new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  changeStep(targetStep: number) {
    if (targetStep === 2 && this.lineItems.length === 0) {
      this.error = 'Veuillez insérer un produit avant d\'accéder au panier actif.';
      return;
    }
    this.error = '';
    this.currentStep = targetStep as Step;
  }

  moveToNextStep() {
    this.error = '';
    if (this.currentStep === 1 && this.lineItems.length === 0) {
      this.error = 'Le panier actif est vide. Veuillez ajouter un produit du catalogue.';
      return;
    }
    if (this.currentStep === 3) {
      if (this.mode === 'facture' && this.invoiceForm.invalid) {
        this.error = 'Veuillez renseigner le client mandataire obligatoire.';
        return;
      }
      if (this.mode === 'bl' && !this.blModel.customerId) {
        this.error = 'Veuillez renseigner le client destinataire pour le Bon de livraison.';
        return;
      }
    }
    this.currentStep = (this.currentStep + 1) as Step;
  }

  private fetchSystemCustomers() {
    this.apiService.getCustomers().subscribe({
      next: (res: any[]) => {
        this.customers = res.map((c) => c.customer || c);
      },
      error: () => { this.error = 'Échec du chargement du répertoire client.'; }
    });
  }

  private fetchSystemProducts() {
    const fallbackImage = 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=120';
    this.apiService.getProducts().subscribe({
      next: (res: any[]) => {
        this.allProducts = res.map((p) => ({
          productId: p.idProduct ?? p.id ?? Math.random(),
          reference: p.reference || 'REF-GEN',
          name: p.name || 'Produit Inconnu',
          unitPrice: p.unitPriceSold ?? p.unitPrice ?? 0,
          stock: p.currentStockQuantity ?? p.stock ?? 10,
          imageUrl: p.imageUrl || fallbackImage
        }));
        this.filteredProducts = [...this.allProducts];
      },
      error: () => {
        this.error = 'Erreur API lors de la récupération des articles.';
      }
    });
  }

  filterProducts() {
    if (!this.searchQuery) {
      this.filteredProducts = [...this.allProducts];
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredProducts = this.allProducts.filter(p =>
          p.name.toLowerCase().includes(q) || p.reference.toLowerCase().includes(q)
      );
    }
  }

  addItemToCart(prod: Product) {
    const existingIndex = this.lineItems.findIndex(item => item.productId === prod.productId);
    if (existingIndex > -1) {
      this.modifyItemQty(existingIndex, this.lineItems[existingIndex].quantity + 1);
    } else {
      this.lineItems.push({
        productId: prod.productId,
        productName: prod.name,
        reference: prod.reference,
        unitPrice: prod.unitPrice,
        quantity: 1,
        discount: 0,
        totalPrice: prod.unitPrice,
        maxStock: prod.stock
      });
      this.runFinancialCalculations();
    }
  }

  modifyItemQty(index: number, newQty: number) {
    if (newQty < 1) return;
    this.lineItems[index].quantity = newQty;
    this.recalculateLineTotal(index);
  }

  onQtyInputChange(event: any, index: number) {
    const val = parseInt(event.target.value, 10);
    this.modifyItemQty(index, isNaN(val) ? 1 : val);
  }

  onDiscountInputChange(event: any, index: number) {
    const val = parseFloat(event.target.value);
    this.lineItems[index].discount = isNaN(val) ? 0 : Math.max(0, Math.min(100, val));
    this.recalculateLineTotal(index);
  }

  private recalculateLineTotal(index: number) {
    const item = this.lineItems[index];
    const gross = item.quantity * item.unitPrice;
    item.totalPrice = gross * (1 - item.discount / 100);
    this.runFinancialCalculations();
  }

  removeItemFromCart(index: number) {
    this.lineItems.splice(index, 1);
    this.runFinancialCalculations();
  }

  clearEntireCart() {
    this.lineItems = [];
    this.runFinancialCalculations();
    this.currentStep = 1;
  }

  getCartQuantity(productId: number): number {
    const found = this.lineItems.find(i => i.productId === productId);
    return found ? found.quantity : 0;
  }

  toggleDocumentMode(targetMode: DocumentMode) {
    this.mode = targetMode;
    this.runFinancialCalculations();
  }

  getTotalItemsQuantity(): number {
    return this.lineItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  calculateRawSubTotal(): number {
    return this.lineItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  }

  calculateTotalDiscounts(): number {
    const raw = this.calculateRawSubTotal();
    const net = this.lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
    return raw - net;
  }

  isTvaCheckboxChecked(): boolean {
    if (this.mode === 'facture') {
      return this.invoiceForm?.get('applyTva')?.value ?? false;
    }
    return true;
  }

  runFinancialCalculations() {
    const netHT = this.lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
    if (this.isTvaCheckboxChecked()) {
      this.computedTaxAmount = netHT * 0.19;
    } else {
      this.computedTaxAmount = 0;
    }
    this.computedGrandTotal = netHT + this.computedTaxAmount;
  }

  onCustomerSelected() {}

  onBlCustomerSelected() {
    const client = this.customers.find(c => c.customerId == this.blModel.customerId);
    if (client?.address) {
      this.blModel.deliveryAddress = client.address;
    }
  }

  getSelectedCustomerName(): string {
    const id = this.mode === 'facture' ? this.invoiceForm?.get('customerId')?.value : this.blModel.customerId;
    if (!id) return 'Bhouri Stock';
    const client = this.customers.find(c => c.customerId == id);
    return client ? client.name : 'Chargement...';
  }

  isCustomerActiveSelected(): boolean {
    const id = this.mode === 'facture' ? this.invoiceForm?.get('customerId')?.value : this.blModel.customerId;
    return !!id;
  }

  openPdfPreviewDialog() {
    alert("Génération de l'aperçu PDF...");
  }

  finalizeDocumentEmission() {
    this.loading = true;
    this.error = '';

    if (this.mode === 'facture') {
      const invoicePayload = {
        customerId: Number(this.invoiceForm.get('customerId')?.value),
        billDate: this.invoiceForm.get('billDate')?.value,
        paymentTerms: this.invoiceForm.get('paymentTerms')?.value,
        applyTva: this.invoiceForm.get('applyTva')?.value,
        products: this.lineItems.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice, discount: i.discount }))
      };

      this.apiService.createInvoice(invoicePayload).subscribe({
        next: () => {
          this.success = 'Facture émise avec succès !';
          setTimeout(() => this.router.navigate(['/invoices/list']), 1500);
        },
        error: (err) => { this.loading = false; this.error = err.error?.message || 'Erreur lors de l\'émission.'; }
        });
    } else {
        const deliveryPayload = {
          customerId: Number(this.blModel.customerId),
          dateDelivery: new Date(this.blModel.deliveryDate).toISOString(),
          deliveryAddress: this.blModel.deliveryAddress,
          products: this.lineItems.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice, discount: i.discount }))
        };

        this.apiService.createDeliveryNote(deliveryPayload).subscribe({
          next: () => {
            this.success = 'Bon de livraison créé avec succès !';
            setTimeout(() => this.router.navigate(['/delivery-notes/list']), 1500);
          },
          error: (err) => { this.loading = false; this.error = err.error?.message || 'Erreur de création du BL.'; }
        });
      }
    }

    abortWorkflowAndLeave() {
      this.router.navigate([this.mode === 'facture' ? '/invoices/list' : '/delivery-notes/list']);
    }
  }