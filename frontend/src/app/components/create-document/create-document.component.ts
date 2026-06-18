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
            <span class="badge-num">1</span> Sélection Catalogue
          </div>
          <div class="step-nav-item" [class.active]="currentStep === 2" [class.done]="currentStep > 2" (click)="changeStep(2)">
            <span class="badge-num">2</span> Quantités & Remises
          </div>
          <div class="step-nav-item" [class.active]="currentStep === 3" [class.done]="currentStep > 3" (click)="changeStep(3)">
            <span class="badge-num">3</span> Infos Générales
          </div>
          <div class="step-nav-item" [class.active]="currentStep === 4" [class.done]="currentStep > 4" (click)="changeStep(4)">
            <span class="badge-num">4</span> Finalisation
          </div>
        </div>

        <div *ngIf="error" class="banner-msg banner-danger">{{ error }}</div>
        <div *ngIf="success" class="banner-msg banner-success">{{ success }}</div>

        <div class="grid-card-box" *ngIf="currentStep === 1">
          <div class="section-title-bar">Catalogue des Articles Disponibles</div>
          
          <div class="filter-flex-row">
            <div class="search-input-with-icon">
              <span class="search-glass">🔍</span>
              <input type="text" [(ngModel)]="searchQuery" (input)="filterProducts()" placeholder="Rechercher par désignation ou référence...">
            </div>
            <select class="filter-select-input" [(ngModel)]="selectedCategory" (change)="filterProducts()">
              <option value="">Toutes les catégories</option>
              <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
            </select>
          </div>

          <div class="products-compact-grid">
            <div class="product-item-card" *ngFor="let p of filteredProducts">
              <div class="product-thumb-wrapper">
                <img [src]="p.imageUrl || 'assets/placeholder-product.png'" alt="Product image">
              </div>
              <div class="product-meta-details">
                <h3 class="product-title-text">{{ p.name }}</h3>
                <span class="product-subtext-ref">Réf: {{ p.reference }} | Stock: <strong>{{ p.stock }}</strong></span>
                <div class="action-footer-row">
                  <span class="product-price-tag">{{ p.unitPrice | number:'1.3-3' }} DNT</span>
                  
                  <button class="add-to-cart-btn" (click)="addItemToCart(p)">+ Ajouter</button>
                  <span *ngIf="getItemQtyInCart(p.productId) > 0" class="quantity-counter-badge">
                    {{ getItemQtyInCart(p.productId) }} sélectionné(s)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid-card-box" *ngIf="currentStep === 2">
          <div class="section-title-bar">Ajustement des Quantités et Remises</div>
          <div class="table-scroll-container">
            <table class="custom-data-table" *ngIf="lineItems.length > 0; else emptyCartTemp">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Désignation Article</th>
                  <th style="text-align: center;">Prix Unitaire</th>
                  <th style="text-align: center; width: 130px;">Quantité</th>
                  <th style="text-align: center; width: 90px;">Remise (%)</th>
                  <th style="text-align: right;">Total Net HT</th>
                  <th style="text-align: center;">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of lineItems; let idx = index">
                  <td><strong>{{ item.reference }}</strong></td>
                  <td>{{ item.productName }}</td>
                  <td style="text-align: center;">{{ item.unitPrice | number:'1.3-3' }} DNT</td>
                  <td style="text-align: center;">
                    <div class="inline-qty-stepper">
                      <button (click)="changeQtyInline(idx, -1)">-</button>
                      <input type="number" [(ngModel)]="item.quantity" (change)="validateAndRecalcLine(idx)" min="1">
                      <button (click)="changeQtyInline(idx, 1)">+</button>
                    </div>
                  </td>
                  <td style="text-align: center;">
                    <input type="number" class="table-discount-input" [(ngModel)]="item.discount" (change)="validateAndRecalcLine(idx)" min="0" max="100">
                  </td>
                  <td style="text-align: right; font-weight: 600;">{{ item.totalPrice | number:'1.3-3' }} DNT</td>
                  <td style="text-align: center;">
                    <button class="table-delete-row-btn" (click)="removeLineItem(idx)">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
            <ng-template #emptyCartTemp>
              <div style="padding: 3rem; text-align: center; color: #64748b;">
                Aucun article sélectionné pour le moment. Veuillez retourner à l'étape 1.
              </div>
            </ng-template>
          </div>
        </div>

        <div class="section-container" *ngIf="currentStep === 3">
          <div class="section-title-bar">
            {{ mode === 'facture' ? 'Paramètres d’Émission de la Facture' : 'Paramètres d’Expédition du Bon de Livraison' }}
          </div>
          <div class="inner-card-padding">
            
            <div class="center-pill-wrapper" style="margin-bottom: 2rem;">
              <div class="custom-toggle-pill">
                <button type="button" [class.selected]="mode === 'facture'" (click)="setMode('facture')">Mode Facture</button>
                <div class="switch-separator-dot"></div>
                <button type="button" [class.selected]="mode === 'bl'" (click)="setMode('bl')">Mode Bon de Livraison</button>
              </div>
            </div>

            <form [formGroup]="invoiceForm" *ngIf="mode === 'facture'" class="grid-form-system">
              <div class="form-double-column">
                <div class="custom-form-group">
                  <label>Client Bénéficiaire *</label>
                  <select class="custom-select-box" formControlName="customerId">
                    <option [ngValue]="null">Choisir un client professionnel...</option>
                    <option *ngFor="let c of customers" [value]="c.customerId">{{ c.name }}</option>
                  </select>
                </div>
                <div class="custom-form-group">
                  <label>Date de Facturation *</label>
                  <input type="date" class="custom-input-field" formControlName="billDate">
                </div>
              </div>

              <div class="form-double-column">
                <div class="custom-form-group">
                  <label>Échéance de Règlement *</label>
                  <select class="custom-select-box" formControlName="paymentTerms">
                    <option value="Immédiat">Paiement Immédiat</option>
                    <option value="15 jours">Sous 15 jours</option>
                    <option value="30 jours">Fin de mois (30 jours)</option>
                    <option value="60 jours">Traite à 60 jours</option>
                  </select>
                </div>
                <div class="custom-form-group">
                  <label>Acompte Versé (DNT)</label>
                  <input type="number" class="custom-input-field" formControlName="deposit" placeholder="0.000" min="0">
                </div>
              </div>

              <div class="tva-toggle-banner">
                <div class="tva-description-block">
                  <span class="tva-main-title">Soumettre à la TVA Réglementaire</span>
                  <span class="tva-sub-paragraph">Applique un taux légal standard tunisien de 19% sur le net global HT.</span>
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
                  <label>Client Destinataire *</label>
                  <select class="custom-select-box" [(ngModel)]="blModel.customerId" (change)="onBlCustomerSelect()">
                    <option value="">Sélectionner le destinataire...</option>
                    <option *ngFor="let c of customers" [value]="c.customerId">{{ c.name }}</option>
                  </select>
                </div>
                <div class="custom-form-group">
                  <label>Date Planifiée de Livraison *</label>
                  <input type="date" class="custom-input-field" [(ngModel)]="blModel.deliveryDate">
                </div>
              </div>

              <div class="custom-form-group">
                <label>Adresse Complète de Livraison</label>
                <input type="text" class="custom-input-field" [(ngModel)]="blModel.deliveryAddress" placeholder="Indiquer le lieu exact de déchargement...">
                <div class="form-subtext-address" *ngIf="getSelectedCustomerAddress()">
                  📍 Adresse enregistrée du client : <em>{{ getSelectedCustomerAddress() }}</em>
                </div>
              </div>

              <div class="tva-toggle-banner">
                <div class="tva-description-block">
                  <span class="tva-main-title">Faire figurer la TVA sur le bon</span>
                  <span class="tva-sub-paragraph">Calculer à titre informatif la taxe de 19% sur le document d'expédition.</span>
                </div>
                <label class="ios-switch-container">
                  <input type="checkbox" [(ngModel)]="blModel.applyTva" (change)="calculateAllTotals()">
                  <span class="ios-slider-circle"></span>
                </label>
              </div>
            </div>

          </div>
        </div>

        <div class="section-container" *ngIf="currentStep === 4">
          <div class="section-title-bar">Vérification Avant Validation Définitive</div>
          <div class="synthesis-sheet-paper">
            
            <div class="synthesis-sheet-header">
              <h3>{{ mode === 'facture' ? 'PROJET DE FACTURE PROFORMA' : 'PROJET DE BON DE TRANSPORT / LIVRAISON' }}</h3>
              <span class="synthesis-sheet-date">Date document : <strong>{{ mode === 'facture' ? invoiceForm.get('billDate')?.value : blModel.deliveryDate }}</strong></span>
            </div>

            <div class="synthesis-double-grid">
              <div class="synthesis-inner-card">
                <h4>Informations Tiers / Client</h4>
                <div class="synthesis-data-item">
                  <span>Nom / Raison Sociale :</span>
                  <strong>{{ getSummaryCustomerName() }}</strong>
                </div>
                <div class="synthesis-data-item" *ngIf="mode === 'facture'">
                  <span>Conditions de Règlement :</span>
                  <strong>{{ invoiceForm.get('paymentTerms')?.value }}</strong>
                </div>
                <div class="synthesis-data-item" *ngIf="mode === 'bl'">
                  <span>Lieu de Destination :</span>
                  <strong>{{ blModel.deliveryAddress || 'Non spécifié' }}</strong>
                </div>
              </div>

              <div class="synthesis-inner-card">
                <h4>Résumé Comptable</h4>
                <div class="synthesis-data-item">
                  <span>Total Net Commercial HT :</span>
                  <strong>{{ totalHT | number:'1.3-3' }} DNT</strong>
                </div>
                <div class="synthesis-data-item">
                  <span>Montant de la TVA (19%) :</span>
                  <strong>{{ totalVAT | number:'1.3-3' }} DNT</strong>
                </div>
                <div class="synthesis-data-item" style="border-top: 1px dashed #cbd5e1; margin-top: 5px; padding-top: 5px;">
                  <span style="color:#0f172a; font-weight:700;">VALEUR FINALE TTC :</span>
                  <strong style="color:#2563eb; font-size:1.05rem;">{{ totalTTC | number:'1.3-3' }} DNT</strong>
                </div>
              </div>
            </div>

            <div class="synthesis-items-block">
              <h4>Nomenclature des Articles Réduits</h4>
              <div class="synthesis-article-line" *ngFor="let i of lineItems">
                <span>{{ i.productName }} (x{{ i.quantity }})</span>
                <strong>{{ i.totalPrice | number:'1.3-3' }} DNT</strong>
              </div>
            </div>

          </div>
        </div>

      </div>

      <div class="right-contextual-sidebar">
        
        <div class="sidebar-scrollable-content">
          <div class="sidebar-brand-title">
            <span class="brand-icon-sheet">💼</span>
            <h2>Gestion Commande</h2>
          </div>

          <div class="sidebar-embedded-table-box" style="margin-bottom: 1.5rem;">
            <div class="embedded-table-title">PANIER DE VENTE EN COURS</div>
            
            <div *ngIf="lineItems.length === 0" class="empty-embedded-notice">
              Le panier ne contient aucune ligne d'article.
            </div>

            <div class="sidebar-table-scroll" *ngIf="lineItems.length > 0">
              <table class="sidebar-data-table">
                <thead>
                  <tr>
                    <th>Article</th>
                    <th style="text-align: center;">Qté</th>
                    <th style="text-align: right;">Net HT</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let l of lineItems; let i = index">
                    <td><span class="compact-name" [title]="l.productName">{{ l.productName }}</span></td>
                    <td style="text-align: center;">
                      <div class="sidebar-qty-actions">
                        <button (click)="changeQtyInline(i, -1)">-</button>
                        <span class="qty-num">{{ l.quantity }}</span>
                        <button (click)="changeQtyInline(i, 1)">+</button>
                      </div>
                    </td>
                    <td style="text-align: right;">{{ l.totalPrice | number:'1.0-0' }}</td>
                    <td style="text-align: center;">
                      <button class="sidebar-del-btn" (click)="removeLineItem(i)">×</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="sidebar-table-footer" *ngIf="lineItems.length > 0">
              <span style="font-size: 0.75rem; color:#64748b;">{{ lineItems.length }} article(s)</span>
              <button class="sidebar-clear-btn" (click)="clearEntireCart()">Vider</button>
            </div>
          </div>

          <div class="sidebar-rows-stack">
            <div class="meta-data-line">
              <span>Sous-total Brut</span>
              <span class="meta-value">{{ totalBrutHT | number:'1.3-3' }} DNT</span>
            </div>
            <div class="meta-data-line" *ngIf="totalRemise > 0" style="color: #ea580c;">
              <span>Total Remises Accordées</span>
              <span class="meta-value" style="color: #ea580c;">-{{ totalRemise | number:'1.3-3' }} DNT</span>
            </div>
            <div class="meta-data-line">
              <span>Assiette Soumise HT</span>
              <span class="meta-value font-bold-text">{{ totalHT | number:'1.3-3' }} DNT</span>
            </div>
            
            <div class="meta-data-line">
              <span class="display-tva-label">Taxe Valeur Ajoutée (19%)</span>
              <span class="meta-value text-highlight-blue">{{ totalVAT | number:'1.3-3' }} DNT</span>
            </div>

            <hr class="thin-hr-line">

            <div class="grand-total-container-box">
              <span class="grand-total-label">NET À PAYER :</span>
              <span class="grand-total-value-digits">{{ totalTTC | number:'1.3-3' }} <small style="font-size:0.8rem;">DNT</small></span>
            </div>

            <div class="meta-data-line" *ngIf="mode === 'facture' && invoiceForm.get('deposit')?.value > 0" style="margin-top: 0.5rem; background:#f0fdf4; padding:0.5rem; border-radius:6px;">
              <span style="color:#166534;">Moins Acompte versé :</span>
              <span class="meta-value font-bold-text" style="color:#166534;">-{{ invoiceForm.get('deposit')?.value | number:'1.3-3' }} DNT</span>
            </div>
          </div>
        </div>

        <div class="sidebar-action-buttons-group">
          <button 
            *ngIf="currentStep < 4" 
            class="primary-workflow-btn" 
            (click)="goToNextStep()"
            [disabled]="lineItems.length === 0">
            {{ currentStep === 3 ? 'Vérifier le Document ➔' : 'Continuer l\\'étape ➔' }}
          </button>

          <button 
            *ngIf="currentStep === 4" 
            class="success-workflow-btn" 
            (click)="executeFinalSubmission()"
            [disabled]="loading">
            {{ loading ? 'Transmission API...' : (mode === 'facture' ? '🔒 Émettre la Facture' : '📦 Enregistrer le BL') }}
          </button>

          <button *ngIf="currentStep > 1" class="secondary-neutral-btn" (click)="goToPreviousStep()">
            « Revenir à l'étape précédente
          </button>
          
          <button class="secondary-neutral-btn abort-btn" (click)="abortWorkflowAndLeave()" style="margin-top: 5px;">
            Annuler & Abandonner
          </button>
        </div>

      </div>

    </div>
  `,
  styles: [`
    /* STRUCTURE GLOBALE & PANNEAUX */
    .dashboard-container {
      display: flex;
      width: 100%;
      min-height: 100vh;
      background-color: #f6f8fb;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      box-sizing: border-box;
    }

    .workspace-area {
      flex: 1 1 auto;
      width: calc(100% - 380px);
      padding: 2rem;
      box-sizing: border-box;
    }

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

    .step-nav-item.active { color: #4f46e5; font-weight: 600; }
    .step-nav-item.done { color: #10b981; }

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

    .step-nav-item.active .badge-num { background: #4f46e5; color: #ffffff; }
    .step-nav-item.done .badge-num { background: #e6f4ea; color: #10b981; }

    /* CARDS STRUCTURES */
    .section-container, .grid-card-box {
      background: #ffffff;
      border-radius: 14px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
      border: 1px solid #e2e8f0;
      margin-bottom: 1.75rem;
      overflow: hidden;
      width: 100%;
    }

    .section-title-bar {
      background: #ffffff;
      padding: 1.25rem 1.75rem;
      font-size: 0.95rem;
      font-weight: 700;
      color: #1e293b;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #f1f5f9;
      text-transform: uppercase;
    }

    .inner-card-padding { padding: 2rem; }

    /* PILULE SWITCH MODE */
    .center-pill-wrapper { display: flex; justify-content: center; }
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
    .switch-separator-dot { width: 4px; height: 4px; background: #cbd5e1; border-radius: 50%; margin: 0 0.5rem; }

    /* GRILLE DE FORMULAIRE ET CHAMP DE SAISIE (ÉTAPE 3) */
    .grid-form-system {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-top: 0.5rem;
    }
    .form-double-column {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    .custom-form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .custom-form-group label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #334155;
    }
    .custom-input-field, .custom-select-box {
      height: 42px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 0 0.75rem;
      font-size: 0.9rem;
      background-color: #ffffff;
      color: #0f172a;
      outline: none;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }
    .custom-input-field:focus, .custom-select-box:focus { border-color: #4f46e5; }
    .form-subtext-address {
      font-size: 0.85rem;
      color: #475569;
      background: #f8fafc;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      border-left: 3px solid #cbd5e1;
    }

    /* BANDEAU INTERRUPTEUR DE TVA */
    .tva-toggle-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      padding: 1.25rem;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      margin-top: 0.5rem;
    }
    .tva-description-block { display: flex; flex-direction: column; gap: 0.25rem; }
    .tva-main-title { font-size: 0.95rem; font-weight: 700; color: #0f172a; }
    .tva-sub-paragraph { font-size: 0.8rem; color: #64748b; }
    
    /* IOS TOGGLE SWITCH SCRIPT */
    .ios-switch-container {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 28px;
    }
    .ios-switch-container input { opacity: 0; width: 0; height: 0; }
    .ios-slider-circle {
      position: absolute;
      cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: #cbd5e1;
      transition: .3s;
      border-radius: 34px;
    }
    .ios-slider-circle:before {
      position: absolute;
      content: "";
      height: 22px; width: 22px;
      left: 3px; bottom: 3px;
      background-color: white;
      transition: .3s;
      border-radius: 50%;
    }
    input:checked + .ios-slider-circle { background-color: #4f46e5; }
    input:checked + .ios-slider-circle:before { transform: translateX(22px); }

    /* FICHE DE SYNTHÈSE COMPTABLE (ÉTAPE 4) */
    .synthesis-sheet-paper {
      padding: 2rem;
      background: #ffffff;
    }
    .synthesis-sheet-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px dashed #e2e8f0;
      padding-bottom: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .synthesis-sheet-header h3 { margin: 0; font-size: 1.2rem; font-weight: 800; color: #4f46e5; letter-spacing: 0.5px; }
    .synthesis-sheet-date { font-size: 0.85rem; color: #64748b; font-weight: 500; }
    
    .synthesis-double-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .synthesis-inner-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.25rem;
    }
    .synthesis-inner-card h4, .synthesis-items-block h4 {
      margin: 0 0 1rem 0;
      font-size: 0.8rem;
      font-weight: 700;
      color: #475569;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .synthesis-data-item {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .synthesis-data-item:last-child { border-bottom: none; padding-bottom: 0; }
    .synthesis-data-item span { color: #64748b; }
    .synthesis-data-item strong { color: #0f172a; font-weight: 600; }

    .synthesis-items-block {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.25rem;
    }
    .synthesis-article-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      font-size: 0.9rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .synthesis-article-line:last-child { border-bottom: none; padding-bottom: 0; }
    .synthesis-article-line span { color: #334155; font-weight: 500; }
    .synthesis-article-line strong { color: #0f172a; font-weight: 700; }

    /* CATALOGUE COMPONENT (STEP 1) */
    .filter-flex-row { display: flex; padding: 1rem 1.25rem; gap: 0.75rem; background: #f8fafc; border-bottom: 1px solid #f1f5f9; }
    .search-input-with-icon { position: relative; flex: 1; }
    .search-input-with-icon input {
      width: 100%; height: 38px; padding-left: 2.25rem;
      border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box; font-size: 0.85rem;
    }
    .search-glass { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); font-size: 0.85rem; color: #94a3b8; }
    .filter-select-input { height: 38px; border: 1px solid #cbd5e1; border-radius: 8px; padding: 0 0.75rem; font-size: 0.85rem; background: #ffffff; }

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

    /* TABLEAUX CONFIG QUANTITÉS (STEP 2) */
    .table-scroll-container { overflow-x: auto; }
    .custom-data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    .custom-data-table th { background: #f8fafc; padding: 0.75rem 1rem; color: #64748b; border-bottom: 1px solid #e2e8f0; text-align: left; }
    .custom-data-table td { padding: 0.85rem 1rem; border-bottom: 1px solid #f1f5f9; }
    .inline-qty-stepper { display: inline-flex; align-items: center; border: 1px solid #cbd5e1; border-radius: 6px; background: #ffffff; overflow: hidden; }
    .inline-qty-stepper button { border: none; background: #f8fafc; width: 28px; height: 32px; cursor: pointer; font-weight: bold; }
    .inline-qty-stepper button:hover { background: #e2e8f0; }
    .inline-qty-stepper input { width: 45px; height: 32px; border: none; text-align: center; font-size: 0.85rem; font-weight: 600; outline: none; }
    .table-discount-input { width: 55px; height: 32px; border: 1px solid #cbd5e1; border-radius: 6px; text-align: center; font-size: 0.85rem; }
    .table-delete-row-btn { background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 1.1rem; }

    /* BANDEAU SIDEBAR COMPACTE DROITE */
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
    .sidebar-scrollable-content { flex: 1; overflow-y: auto; padding: 2.25rem 1.75rem 1rem 1.75rem; }
    .sidebar-action-buttons-group { padding: 1rem 1.75rem 2.25rem 1.75rem; background: #ffffff; border-top: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 0.75rem; }

    .sidebar-embedded-table-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0.75rem; box-sizing: border-box; }
    .embedded-table-title { font-size: 0.725rem; font-weight: 700; color: #475569; margin-bottom: 0.5rem; letter-spacing: 0.3px; }
    .empty-embedded-notice { font-size: 0.8rem; color: #94a3b8; text-align: center; padding: 0.85rem 0; }
    .sidebar-table-scroll { max-height: 180px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 6px; background: #ffffff; }
    .sidebar-data-table { width: 100%; border-collapse: collapse; font-size: 0.75rem; }
    .sidebar-data-table th { position: sticky; top: 0; background: #f1f5f9; padding: 0.5rem 0.4rem; color: #475569; text-align: left; font-size: 0.65rem; border-bottom: 1px solid #cbd5e1; z-index: 2; }
    .sidebar-data-table td { padding: 0.45rem 0.3rem; border-bottom: 1px solid #f1f5f9; }
    .compact-name { display: block; max-width: 95px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; color: #334155; }
    .sidebar-qty-actions { display: inline-flex; align-items: center; gap: 0.25rem; border: 1px solid #cbd5e1; border-radius: 4px; padding: 0.1rem; background: #fff; }
    .sidebar-qty-actions button { border: none; background: #f1f5f9; border-radius: 2px; width: 16px; height: 16px; cursor: pointer; font-size: 0.65rem; font-weight: bold; display: flex; align-items: center; justify-content: center; }
    .qty-num { font-size: 0.725rem; font-weight: 600; min-width: 14px; text-align: center; }
    .sidebar-del-btn { background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 0.95rem; padding: 0 0.25rem; }
    .sidebar-table-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 0.5rem; margin-top: 0.5rem; border-top: 1px dashed #cbd5e1; }
    .sidebar-clear-btn { background: #fff; border: 1px solid #fee2e2; color: #ef4444; font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 4px; cursor: pointer; font-weight: 500; }

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

    /* BOUTONS SYSTEME */
    .primary-workflow-btn { background: #4f46e5; color: #ffffff; border: none; height: 44px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.9rem; transition: background 0.2s; }
    .primary-workflow-btn:hover:not(:disabled) { background: #4338ca; }
    .primary-workflow-btn:disabled { background: #cbd5e1; cursor: not-allowed; }
    
    .success-workflow-btn { background: #10b981; color: #ffffff; border: none; height: 44px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.9rem; }
    .success-workflow-btn:hover { background: #059669; }
    
    .secondary-neutral-btn { background: #ffffff; color: #475569; border: 1px solid #cbd5e1; height: 40px; border-radius: 8px; font-weight: 500; cursor: pointer; font-size: 0.85rem; }
    .secondary-neutral-btn:hover { background: #f8fafc; }
    .abort-btn { border-color: #fca5a5; color: #ef4444; }
    .abort-btn:hover { background: #fef2f2; }

    /* ALERTES ET MESSAGES BLOCS */
    .banner-msg { padding: 0.85rem 1.25rem; border-radius: 8px; margin-bottom: 1.25rem; font-size: 0.85rem; }
    .banner-danger { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
    .banner-success { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
  `]
})
export class CreateDocumentComponent implements OnInit {

  currentStep: Step = 1;
  mode: DocumentMode = 'facture';

  /* Sources de données API */
  customers: Customer[] = [];
  products: Product[] = [];

  /* Tableaux de filtrage (Étape 1) */
  filteredProducts: Product[] = [];
  categories: string[] = [];
  searchQuery: string = '';
  selectedCategory: string = '';

  /* Lignes de commande (Panier global partagé) */
  lineItems: LineItem[] = [];

  /* Variables globales de calcul financier */
  totalBrutHT: number = 0;
  totalRemise: number = 0;
  totalHT: number = 0;
  totalVAT: number = 0;
  totalTTC: number = 0;

  /* Messages et verrous */
  loading: boolean = false;
  error: string = '';
  success: string = '';

  /* Formulaire Réactif pour Mode Facture */
  invoiceForm!: FormGroup;

  /* Modèle de formulaire natif pour Mode Bon de Livraison */
  blModel = {
    customerId: '' as string | number,
    deliveryDate: '',
    deliveryAddress: '',
    applyTva: false
  };

  constructor(
      private fb: FormBuilder,
      private apiService: ApiService,
      private router: Router,
      private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Lecture optionnelle du mode de départ depuis l'URL (?mode=bl)
    this.route.queryParamMap.subscribe(params => {
      const modeParam = params.get('mode');
      if (modeParam === 'bl') {
        this.mode = 'bl';
      } else {
        this.mode = 'facture';
      }
    });

    this.initInvoiceFormGroup();
    this.fetchCustomersData();
    this.fetchProductsInventory();

    // Initialisation des dates par défaut à Aujourd'hui
    const todayStr = new Date().toISOString().split('T')[0];
    this.blModel.deliveryDate = todayStr;
  }

  private initInvoiceFormGroup() {
    const todayStr = new Date().toISOString().split('T')[0];
    this.invoiceForm = this.fb.group({
      customerId: [null, Validators.required],
      billDate: [todayStr, Validators.required],
      paymentTerms: ['30 jours', Validators.required],
      deposit: [0, [Validators.min(0)]],
      applyTva: [true]
    });

    // Recalcul instantané des totaux financiers en cas de modification des variables d'entête
    this.invoiceForm.valueChanges.subscribe(() => {
      this.calculateAllTotals();
    });
  }

  /* ========================================== */
  /* GESTION ET NAVIGATION ENTRE LES ÉTAPES      */
  /* ========================================== */
  changeStep(target: number) {
    const stepTarget = target as Step;
    if (stepTarget === 2 || stepTarget === 3 || stepTarget === 4) {
      if (this.lineItems.length === 0) {
        this.error = "Opération impossible : Vous devez ajouter au moins 1 article à votre panier.";
        return;
      }
    }
    this.error = '';
    this.currentStep = stepTarget;
  }

  goToNextStep() {
    if (this.currentStep === 1 && this.lineItems.length === 0) {
      this.error = "Veuillez sélectionner au moins un article avant de poursuivre.";
      return;
    }
    if (this.currentStep === 3) {
      // Validation réglementaire des formulaires d'entête
      if (this.mode === 'facture' && this.invoiceForm.invalid) {
        this.error = "Formulaire incomplet. Veuillez sélectionner le client et vérifier les champs requis (*).";
        return;
      }
      if (this.mode === 'bl' && (!this.blModel.customerId || !this.blModel.deliveryDate)) {
        this.error = "Champs obligatoires manquants : Assurez-vous d'avoir choisi un client et une date de livraison.";
        return;
      }
    }

    this.error = '';
    if (this.currentStep < 4) {
      this.currentStep = (this.currentStep + 1) as Step;
    }
  }

  goToPreviousStep() {
    this.error = '';
    if (this.currentStep > 1) {
      this.currentStep = (this.currentStep - 1) as Step;
    }
  }

  setMode(newMode: DocumentMode) {
    this.mode = newMode;
    this.calculateAllTotals();
  }

  /* ========================================== */
  /* CHARGEMENT DES DONNÉES DEPUIS L'API MICRO-SERVICES */
  /* ========================================== */
  private fetchCustomersData() {
    this.apiService.getCustomers().subscribe({
      next: (res: any[]) => {
        this.customers = res.map(item => {
          const raw = item.customer || item;
          return {
            customerId: raw.customerId,
            name: raw.name,
            address: raw.address,
            phone: raw.phone,
            email: raw.email
          };
        });
      },
      error: () => { this.error = "Échec du rapatriement de la liste des clients."; }
    });
  }

  private fetchProductsInventory() {
    this.apiService.getProducts().subscribe({
      next: (res: any[]) => {
        this.products = res.map(p => ({
          productId: p.idProduct || p.id,
          reference: p.reference,
          name: p.name,
          unitPrice: p.unitPriceSold || p.unitPrice || 0,
          stock: p.currentStockQuantity !== undefined ? p.currentStockQuantity : (p.stock || 0),
          imageUrl: p.imageUrl,
          category: p.category || 'Général'
        }));

        this.filteredProducts = [...this.products];

        // Extraction des catégories uniques pour le composant filtre
        const allCats = this.products.map(p => p.category || 'Général');
        this.categories = Array.from(new Set(allCats));
      },
      error: () => { this.error = "Échec de connexion avec le stock de produits."; }
    });
  }

  /* ========================================== */
  /* ENGIN DE FILTRAGE DES PRODUITS (ÉTAPE 1)   */
  /* ========================================== */
  filterProducts() {
    this.filteredProducts = this.products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          p.reference.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchCat = this.selectedCategory === '' || p.category === this.selectedCategory;
      return matchSearch && matchCat;
    });
  }

  /* ========================================== */
  /* FONCTIONNALITÉS DU PANIER DE VENTE         */
  /* ========================================== */
  addItemToCart(product: Product) {
    this.error = '';
    const match = this.lineItems.find(i => i.productId === product.productId);

    if (match) {
      if (match.quantity >= product.stock) {
        this.error = `Alerte Stock : Quantité maximale disponible atteinte pour l'article [${product.name}].`;
        return;
      }
      match.quantity++;
      match.totalPrice = match.quantity * match.unitPrice * (1 - match.discount / 100);
    } else {
      if (product.stock <= 0) {
        this.error = `Alerte Stock : L'article [${product.name}] est actuellement en rupture complète.`;
        return;
      }
      this.lineItems.push({
        productId: product.productId,
        productName: product.name,
        reference: product.reference,
        unitPrice: product.unitPrice,
        quantity: 1,
        discount: 0,
        totalPrice: product.unitPrice,
        maxStock: product.stock
      });
    }
    this.calculateAllTotals();
  }

  changeQtyInline(index: number, offset: number) {
    this.error = '';
    const item = this.lineItems[index];
    const newQty = item.quantity + offset;

    if (newQty <= 0) {
      this.removeLineItem(index);
      return;
    }

    if (newQty > item.maxStock) {
      this.error = `Impossible d'affecter cette quantité. Le stock physique disponible est limité à ${item.maxStock} unités.`;
      return;
    }

    item.quantity = newQty;
    item.totalPrice = item.quantity * item.unitPrice * (1 - item.discount / 100);
    this.calculateAllTotals();
  }

  validateAndRecalcLine(index: number) {
    this.error = '';
    const item = this.lineItems[index];

    if (item.quantity <= 0) item.quantity = 1;
    if (item.quantity > item.maxStock) {
      this.error = `Quantité rabaissée à la limite maximale du stock disponible (${item.maxStock}).`;
      item.quantity = item.maxStock;
    }

    if (item.discount < 0) item.discount = 0;
    if (item.discount > 100) item.discount = 100;

    item.totalPrice = item.quantity * item.unitPrice * (1 - item.discount / 100);
    this.calculateAllTotals();
  }

  removeLineItem(index: number) {
    this.lineItems.splice(index, 1);
    this.calculateAllTotals();
    if (this.lineItems.length === 0 && this.currentStep > 1) {
      this.currentStep = 1;
    }
  }

  clearEntireCart() {
    this.lineItems = [];
    this.calculateAllTotals();
    this.currentStep = 1;
    this.error = '';
  }

  getItemQtyInCart(productId: number): number {
    const found = this.lineItems.find(i => i.productId === productId);
    return found ? found.quantity : 0;
  }

  /* ========================================== */
  /* ENGIN DE CALCUL DES TAXES ET TOTAUX        */
  /* ========================================== */
  calculateAllTotals() {
    this.totalBrutHT = this.lineItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    this.totalHT = this.lineItems.reduce((acc, item) => acc + item.totalPrice, 0);
    this.totalRemise = this.totalBrutHT - this.totalHT;

    let wantsTva = false;
    if (this.mode === 'facture') {
      wantsTva = this.invoiceForm ? this.invoiceForm.get('applyTva')?.value : true;
    } else {
      wantsTva = this.blModel.applyTva;
    }

    this.totalVAT = wantsTva ? (this.totalHT * 0.19) : 0;
    this.totalTTC = this.totalHT + this.totalVAT;
  }

  /* ========================================== */
  /* FONCTIONS RETOURS MÉTA-TEXTES SYNTHÈSE     */
  /* ========================================== */
  onBlCustomerSelect() {
    const cust = this.customers.find(c => c.customerId == this.blModel.customerId);
    if (cust && cust.address) {
      this.blModel.deliveryAddress = cust.address;
    }
  }

  getSelectedCustomerAddress(): string {
    if (this.mode === 'bl' && this.blModel.customerId) {
      const cust = this.customers.find(c => c.customerId == this.blModel.customerId);
      return cust?.address || '';
    }
    return '';
  }

  getSummaryCustomerName(): string {
    let id: string | number | null = null;
    if (this.mode === 'facture') {
      id = this.invoiceForm.get('customerId')?.value;
    } else {
      id = this.blModel.customerId;
    }
    if (!id) return 'Aucun client sélectionné';
    const clientObj = this.customers.find(c => c.customerId == id);
    return clientObj ? clientObj.name : 'Client Inconnu';
  }

  /* ========================================== */
  /* PERSISTANCE API ET TRANSMISSION FINALE     */
  /* ========================================== */
  executeFinalSubmission() {
    if (this.lineItems.length === 0) {
      this.error = "Opération rejetée : Le panier est vide.";
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    if (this.mode === 'facture') {
      const invoicePayload = {
        customerId: Number(this.invoiceForm.get('customerId')?.value),
        billDate: this.invoiceForm.get('billDate')?.value,
        paymentTerms: this.invoiceForm.get('paymentTerms')?.value,
        deposit: Number(this.invoiceForm.get('deposit')?.value) || 0,
        applyTva: this.invoiceForm.get('applyTva')?.value,
        products: this.lineItems.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          discount: i.discount
        }))
      };

      this.apiService.createInvoice(invoicePayload).subscribe({
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
      const deliveryPayload = {
        customerId: Number(this.blModel.customerId),
        dateDelivery: new Date(this.blModel.deliveryDate).toISOString(),
        deliveryAddress: this.blModel.deliveryAddress,
        products: this.lineItems.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          discount: i.discount
        }))
      };

      this.apiService.createDeliveryNote(deliveryPayload).subscribe({
        next: () => {
          this.success = 'Bon de livraison créé avec succès !';
          setTimeout(() => this.router.navigate(['/delivery-notes/list']), 1500);
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || "Erreur lors de la création du BL.";
        }
      });
    }
  }

  abortWorkflowAndLeave() {
    if (confirm("Êtes-vous sûr de vouloir abandonner la saisie en cours ? Tout le panier sera perdu.")) {
      this.router.navigate(['/invoices/list']);
    }
  }
}