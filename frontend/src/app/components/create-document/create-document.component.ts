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
import { ProductCatalogComponent } from '../shared/product-catalog.component';
import { SelectedProductsComponent } from '../shared/selected-products.component';

type DocumentMode = 'facture' | 'bl';

interface Customer {
  customerId: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface Product {
  productId?: number;
  idProduct?: number;
  reference: string;
  name: string;
  unitPrice?: number;
  unitPriceSold?: number;
  stock?: number;
  quantity?: number;
  imageUrl?: string;
}

interface LineItem {
  productId: number;
  productName: string;
  reference: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  totalPrice: number;
  maxStock?: number;
  stockError?: boolean;
}

@Component({
  selector: 'app-create-document',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ProductCatalogComponent,
    SelectedProductsComponent,
  ],
  template: `
    <div class="create-doc-page">

      <!-- ══════════════════════════════════════
           MODE TOGGLE
      ══════════════════════════════════════ -->
      <div class="mode-toggle-bar">
        <button
          class="mode-btn"
          [class.mode-btn--active-facture]="mode === 'facture'"
          (click)="switchMode('facture')"
          type="button">
          <span class="mode-btn__icon">📄</span>
          <span class="mode-btn__label">Facture</span>
        </button>

        <!-- Toggle pill -->
        <div class="toggle-pill" (click)="toggleMode()">
          <div class="toggle-pill__track" [class.is-bl]="mode === 'bl'">
            <div class="toggle-pill__thumb"></div>
          </div>
        </div>

        <button
          class="mode-btn"
          [class.mode-btn--active-bl]="mode === 'bl'"
          (click)="switchMode('bl')"
          type="button">
          <span class="mode-btn__icon">📦</span>
          <span class="mode-btn__label">Bon de Livraison</span>
        </button>
      </div>

      <!-- Page title (dynamic) -->
      <div class="page-header">
        <span class="header-icon">{{ mode === 'facture' ? '📄' : '📦' }}</span>
        <h1>{{ mode === 'facture' ? 'Créer une Nouvelle Facture' : 'Créer un Bon de Livraison' }}</h1>
      </div>

      <!-- ══════════════════════════════════════
           INFORMATIONS GÉNÉRALES — FACTURE
      ══════════════════════════════════════ -->
      <div class="section-card" *ngIf="mode === 'facture'">
        <div class="section-header header-purple">
          <span class="section-icon">ℹ️</span>
          <span>Informations Générales</span>
        </div>
        <div class="section-body">
          <form [formGroup]="invoiceForm">
            <div class="form-grid">
              <!-- Client -->
              <div class="form-field">
                <label class="field-label">
                  <span class="label-icon">👤</span>
                  Client <span class="required">*</span>
                </label>
                <select formControlName="customerId" class="form-select">
                  <option value="">Sélectionner un client...</option>
                  <option *ngFor="let c of customers" [value]="c.customerId">{{ c.name }}</option>
                </select>
              </div>
              <!-- Date -->
              <div class="form-field">
                <label class="field-label">
                  <span class="label-icon">📅</span>
                  Date de Facture <span class="required">*</span>
                </label>
                <input type="date" formControlName="billDate" class="form-input">
              </div>
              <!-- Conditions paiement -->
              <div class="form-field">
                <label class="field-label">
                  <span class="label-icon">💳</span>
                  Conditions de Paiement <span class="required">*</span>
                </label>
                <select formControlName="paymentTerms" class="form-select">
                  <option value="Immédiat">Immédiat</option>
                  <option value="15 jours">15 jours</option>
                  <option value="30 jours">30 jours</option>
                  <option value="60 jours">60 jours</option>
                </select>
              </div>
              <!-- TVA toggle -->
              <div class="form-field tva-toggle-field">
                <label class="tva-toggle-label">
                  <span class="toggle-switch" [class.active]="invoiceForm.get('applyTva')?.value">
                    <input type="checkbox" formControlName="applyTva" class="toggle-input">
                    <span class="toggle-slider"></span>
                  </span>
                  <span class="toggle-text">
                    <span class="toggle-title">Appliquer la TVA</span>
                    <span class="toggle-rate" [class.active]="invoiceForm.get('applyTva')?.value">19%</span>
                  </span>
                </label>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- ══════════════════════════════════════
           INFORMATIONS GÉNÉRALES — BL
      ══════════════════════════════════════ -->
      <div class="section-card" *ngIf="mode === 'bl'">
        <div class="section-header header-green">
          <span class="section-icon">ℹ️</span>
          <span>Informations Générales</span>
        </div>
        <div class="section-body">
          <div class="form-grid form-grid--3">
            <!-- Client -->
            <div class="form-field">
              <label class="field-label">
                <span class="label-icon">👤</span>
                Client <span class="required">*</span>
              </label>
              <select [(ngModel)]="bl.customerId" (change)="onBlCustomerChange()" class="form-select">
                <option value="">Sélectionner un client...</option>
                <option *ngFor="let c of customers" [value]="c.customerId">{{ c.name }}</option>
              </select>
            </div>
            <!-- Date livraison -->
            <div class="form-field">
              <label class="field-label">
                <span class="label-icon">📅</span>
                Date de Livraison <span class="required">*</span>
              </label>
              <input type="date" [(ngModel)]="bl.deliveryDate" class="form-input">
            </div>
            <!-- Adresse -->
            <div class="form-field">
              <label class="field-label">
                <span class="label-icon">📍</span>
                Adresse de Livraison
              </label>
              <input type="text" [(ngModel)]="bl.deliveryAddress" placeholder="Adresse..." class="form-input">
            </div>
          </div>
          <!-- Notes -->
          <div class="form-field" style="margin-top: 1rem;">
            <label class="field-label">
              <span class="label-icon">📝</span>
              Notes
            </label>
            <textarea [(ngModel)]="bl.notes" rows="3" placeholder="Notes supplémentaires..." class="form-textarea"></textarea>
          </div>
          <!-- TVA toggle -->
          <div style="margin-top: 1rem;">
            <label class="tva-toggle-label tva-toggle-label--green">
              <span class="toggle-switch" [class.active-green]="bl.applyTva">
                <input type="checkbox" [(ngModel)]="bl.applyTva" class="toggle-input">
                <span class="toggle-slider"></span>
              </span>
              <span class="toggle-text">
                <span class="toggle-title">Appliquer la TVA</span>
                <span class="toggle-rate" [class.active-green]="bl.applyTva">19%</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════
           CATALOGUE + PRODUITS SÉLECTIONNÉS
           (commun aux deux modes)
      ══════════════════════════════════════ -->
      <div class="products-grid">
        <app-product-catalog
          [products]="products"
          [reservedQuantities]="getReservedQuantities()"
          (productSelected)="addProduct($event)">
        </app-product-catalog>

        <app-selected-products
          [products]="lineItems"
          [title]="mode === 'facture' ? 'Produits Sélectionnés' : 'Produits à Livrer'"
          [icon]="mode === 'facture' ? '🛒' : '✅'"
          [emptyIcon]="mode === 'facture' ? '🛒' : '📭'"
          [emptyMessage]="selectedProductsEmptyMessage"
          [headerClass]="mode === 'facture' ? 'header-purple' : 'header-green'"
          [productImages]="getProductImagesMap()"
          (productRemoved)="removeProduct($event)"
          (quantityUpdated)="updateQuantity($event.index, $event.quantity)"
          (discountUpdated)="updateDiscount($event.index, $event.discount)">
        </app-selected-products>
      </div>

      <!-- ══════════════════════════════════════
           RÉCAPITULATIF — FACTURE
      ══════════════════════════════════════ -->
      <div class="summary-grid" *ngIf="mode === 'facture'">
        <!-- Acompte -->
        <div class="section-card">
          <div class="section-header header-purple">
            <span class="section-icon">💰</span>
            <span>Acompte</span>
          </div>
          <div class="section-body">
            <label class="field-label">
              <span class="label-icon">💰</span>
              Acompte Versé (DNT)
            </label>
            <input type="number"
              [ngModel]="invoiceForm.get('deposit')?.value"
              (ngModelChange)="updateDeposit($event)"
              class="form-input" min="0">
          </div>
        </div>
        <!-- Financial summary -->
        <div class="section-card">
          <div class="section-header header-purple">
            <span class="section-icon">🧾</span>
            <span>Récapitulatif Financier</span>
          </div>
          <div class="section-body">
            <div class="financial-summary">
              <div class="summary-row" *ngIf="invoiceForm.get('applyTva')?.value">
                <span class="summary-label">Total HT Brut :</span>
                <span class="summary-value">{{ getTotalHTBrut() | number:'1.3-3' }} DNT</span>
              </div>
              <div *ngIf="getTotalDiscount() > 0 && invoiceForm.get('applyTva')?.value" class="summary-row discount-row">
                <span class="summary-label">Total Remises :</span>
                <span class="summary-value">-{{ getTotalDiscount() | number:'1.3-3' }} DNT</span>
              </div>
              <div class="summary-row" *ngIf="invoiceForm.get('applyTva')?.value">
                <span class="summary-label">Total HT Net :</span>
                <span class="summary-value">{{ totalHT | number:'1.3-3' }} DNT</span>
              </div>
              <div class="summary-row" *ngIf="invoiceForm.get('applyTva')?.value">
                <span class="summary-label">TVA (19%) :</span>
                <span class="summary-value text-blue">{{ totalVAT | number:'1.3-3' }} DNT</span>
              </div>
              <div class="summary-row total-row">
                <span class="summary-label">{{ invoiceForm.get('applyTva')?.value ? 'Total TTC' : 'Total' }} :</span>
                <span class="summary-value font-bold">{{ totalTTC | number:'1.3-3' }} DNT</span>
              </div>
              <div *ngIf="deposit > 0" class="summary-row deposit-row">
                <span class="summary-label">Acompte :</span>
                <span class="summary-value">-{{ deposit | number:'1.3-3' }} DNT</span>
              </div>
              <div class="summary-row due-row">
                <span class="summary-label">Reste à Payer :</span>
                <span class="summary-value font-bold">{{ netAmountDue | number:'1.3-3' }} DNT</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════
           RÉCAPITULATIF — BL
      ══════════════════════════════════════ -->
      <div class="section-card" *ngIf="mode === 'bl'">
        <div class="section-header header-blue">
          <span class="section-icon">📊</span>
          <span>Résumé</span>
        </div>
        <div class="section-body">
          <div class="summary-grid-bl">
            <div class="financial-summary">
              <div class="summary-row">
                <span class="summary-label">Sous-total :</span>
                <span class="summary-value">{{ getBlSubtotal() | number:'1.3-3' }} DNT</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Remise globale (%) :</span>
                <input type="number" [(ngModel)]="bl.globalDiscount" min="0" max="100" step="0.1" class="discount-input">
              </div>
              <div class="summary-row" *ngIf="bl.applyTva">
                <span class="summary-label">Total HT :</span>
                <span class="summary-value">{{ getBlTotalHT() | number:'1.3-3' }} DNT</span>
              </div>
              <div class="summary-row" *ngIf="bl.applyTva">
                <span class="summary-label">TVA (19%) :</span>
                <span class="summary-value text-blue">{{ getBlTVA() | number:'1.3-3' }} DNT</span>
              </div>
              <div class="summary-row total-row" style="font-size:1.1rem;">
                <span class="summary-label font-bold">{{ bl.applyTva ? 'TOTAL TTC :' : 'TOTAL :' }}</span>
                <span class="summary-value font-bold text-green">{{ getBlTotal() | number:'1.3-3' }} DNT</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════
           MESSAGES & ACTIONS
      ══════════════════════════════════════ -->
      <div *ngIf="error" class="alert alert-error">{{ error }}</div>
      <div *ngIf="success" class="alert alert-success">{{ success }}</div>

      <div class="action-buttons">
        <button class="btn-cancel" (click)="cancel()" type="button">← Annuler</button>
        <button
          class="btn-submit"
          [class.btn-submit--green]="mode === 'bl'"
          (click)="submit()"
          [disabled]="loading"
          type="button">
          <span>{{ mode === 'facture' ? '📄' : '✅' }}</span>
          {{ loading ? 'Enregistrement...' : (mode === 'facture' ? 'Enregistrer la Facture' : 'Créer le Bon de Livraison') }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* ─── Page wrapper ─── */
    .create-doc-page {
      min-height: 100vh;
      background: rgb(248 250 252);
      padding: 1rem;
    }

    /* ─── Mode toggle bar ─── */
    .mode-toggle-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.25rem;
      margin-bottom: 1.5rem;
      padding: 1rem 1.5rem;
      background: white;
      border-radius: 1rem;
      box-shadow: 0 2px 8px rgb(0 0 0 / 0.08);
    }

    .mode-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.4rem;
      background: transparent;
      border: 2px solid rgb(229 231 235);
      border-radius: 0.625rem;
      font-size: 0.9rem;
      font-weight: 600;
      color: rgb(107 114 128);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .mode-btn:hover { border-color: rgb(99 102 241); color: rgb(99 102 241); }
    .mode-btn--active-facture {
      background: linear-gradient(135deg, rgb(99 102 241), rgb(139 92 246));
      border-color: transparent;
      color: white;
      box-shadow: 0 4px 12px rgb(99 102 241 / 0.35);
    }
    .mode-btn--active-bl {
      background: linear-gradient(135deg, rgb(34 197 94), rgb(22 163 74));
      border-color: transparent;
      color: white;
      box-shadow: 0 4px 12px rgb(34 197 94 / 0.35);
    }
    .mode-btn__icon { font-size: 1.1rem; }

    /* Toggle pill */
    .toggle-pill { cursor: pointer; }
    .toggle-pill__track {
      position: relative;
      width: 3.5rem;
      height: 1.875rem;
      background: linear-gradient(135deg, rgb(99 102 241), rgb(139 92 246));
      border-radius: 1rem;
      transition: background 0.3s ease;
    }
    .toggle-pill__track.is-bl {
      background: linear-gradient(135deg, rgb(34 197 94), rgb(22 163 74));
    }
    .toggle-pill__thumb {
      position: absolute;
      top: 0.1875rem;
      left: 0.1875rem;
      width: 1.5rem;
      height: 1.5rem;
      background: white;
      border-radius: 50%;
      transition: transform 0.3s ease;
      box-shadow: 0 2px 4px rgb(0 0 0 / 0.2);
    }
    .toggle-pill__track.is-bl .toggle-pill__thumb {
      transform: translateX(1.625rem);
    }

    /* ─── Page header ─── */
    .page-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .header-icon { font-size: 1.5rem; }
    .page-header h1 {
      font-size: 1.25rem;
      font-weight: 700;
      color: rgb(17 24 39);
      margin: 0;
    }

    /* ─── Cards ─── */
    .section-card {
      background: white;
      border-radius: 0.5rem;
      overflow: hidden;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      margin-bottom: 1rem;
    }
    .section-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      font-weight: 500;
      font-size: 0.875rem;
      color: white;
    }
    .header-purple  { background: linear-gradient(to right, rgb(99 102 241), rgb(139 92 246)); }
    .header-green   { background: linear-gradient(to right, rgb(34 197 94), rgb(22 163 74)); }
    .header-blue    { background: linear-gradient(to right, rgb(59 130 246), rgb(37 99 235)); }
    .header-orange  { background: linear-gradient(to right, rgb(249 115 22), rgb(251 146 60)); }
    .section-icon { font-size: 1.125rem; }
    .section-body { padding: 1rem; }

    /* ─── Forms ─── */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 1rem;
    }
    .form-grid--3 { grid-template-columns: repeat(1, 1fr); }
    .form-field { display: flex; flex-direction: column; gap: 0.375rem; }
    .field-label {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: rgb(107 114 128);
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }
    .label-icon { font-size: 0.875rem; }
    .required { color: rgb(239 68 68); }
    .form-select, .form-input {
      height: 2.25rem;
      width: 100%;
      background: white;
      border: 1px solid rgb(209 213 219);
      border-radius: 0.375rem;
      padding: 0 0.75rem;
      font-size: 0.875rem;
      transition: all 0.15s ease;
    }
    .form-select:focus, .form-input:focus {
      outline: none;
      border-color: rgb(99 102 241);
      box-shadow: 0 0 0 3px rgb(99 102 241 / 0.1);
    }
    .form-textarea {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid rgb(209 213 219);
      border-radius: 0.375rem;
      font-size: 0.875rem;
      resize: vertical;
      font-family: inherit;
    }
    .form-textarea:focus {
      outline: none;
      border-color: rgb(34 197 94);
      box-shadow: 0 0 0 3px rgb(34 197 94 / 0.1);
    }

    /* ─── TVA toggle ─── */
    .tva-toggle-field { display: flex; align-items: center; }
    .tva-toggle-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      padding: 0.625rem 1rem;
      background: linear-gradient(135deg, rgb(249 250 251), rgb(243 244 246));
      border: 1px solid rgb(229 231 235);
      border-radius: 0.75rem;
      transition: all 0.2s ease;
    }
    .tva-toggle-label:hover { border-color: rgb(99 102 241); box-shadow: 0 2px 8px rgb(99 102 241 / 0.1); }
    .tva-toggle-label--green:hover { border-color: rgb(34 197 94); box-shadow: 0 2px 8px rgb(34 197 94 / 0.1); }
    .toggle-switch {
      position: relative;
      width: 3rem;
      height: 1.625rem;
      flex-shrink: 0;
    }
    .toggle-input { opacity: 0; width: 0; height: 0; position: absolute; }
    .toggle-slider {
      position: absolute;
      cursor: pointer;
      inset: 0;
      background: rgb(209 213 219);
      border-radius: 1rem;
      transition: all 0.3s ease;
    }
    .toggle-slider::before {
      position: absolute;
      content: "";
      height: 1.25rem;
      width: 1.25rem;
      left: 0.1875rem;
      bottom: 0.1875rem;
      background: white;
      border-radius: 50%;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgb(0 0 0 / 0.15);
    }
    .toggle-switch.active .toggle-slider { background: linear-gradient(135deg, rgb(99 102 241), rgb(79 70 229)); }
    .toggle-switch.active .toggle-slider::before { transform: translateX(1.375rem); }
    .toggle-switch.active-green .toggle-slider { background: linear-gradient(135deg, rgb(34 197 94), rgb(22 163 74)); }
    .toggle-switch.active-green .toggle-slider::before { transform: translateX(1.375rem); }
    .toggle-text { display: flex; flex-direction: column; gap: 0.125rem; }
    .toggle-title { font-size: 0.8125rem; font-weight: 500; color: rgb(55 65 81); }
    .toggle-rate { font-size: 0.75rem; font-weight: 700; color: rgb(156 163 175); transition: color 0.2s ease; }
    .toggle-rate.active { color: rgb(99 102 241); }
    .toggle-rate.active-green { color: rgb(34 197 94); }

    /* ─── Products grid ─── */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 1rem;
      margin-bottom: 1rem;
    }

    /* ─── Financial summary ─── */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .summary-grid-bl { max-width: 480px; }
    .financial-summary { display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.875rem; }
    .summary-row { display: flex; align-items: center; justify-content: space-between; }
    .summary-label { color: rgb(107 114 128); }
    .summary-value { font-weight: 500; color: rgb(17 24 39); }
    .discount-row .summary-label, .discount-row .summary-value { color: rgb(245 158 11); }
    .text-blue { color: rgb(37 99 235); }
    .text-green { color: rgb(22 163 74); }
    .total-row { border-top: 1px solid rgb(229 231 235); padding-top: 0.5rem; }
    .deposit-row .summary-label, .deposit-row .summary-value { color: rgb(34 197 94); }
    .due-row { background: rgb(254 242 242); padding: 0.5rem; border-radius: 0.5rem; }
    .due-row .summary-value { color: rgb(220 38 38); }
    .font-bold { font-weight: 700; }

    .discount-input {
      width: 100px;
      padding: 0.3rem 0.5rem;
      border: 1px solid rgb(209 213 219);
      border-radius: 0.375rem;
      font-size: 0.875rem;
      text-align: right;
    }

    /* ─── Alerts ─── */
    .alert { padding: 0.75rem 1rem; border-radius: 0.5rem; margin-bottom: 1rem; font-size: 0.875rem; }
    .alert-error  { background: rgb(254 242 242); color: rgb(153 27 27);  border: 1px solid rgb(254 226 226); }
    .alert-success{ background: rgb(240 253 244); color: rgb(22 101 52);  border: 1px solid rgb(187 247 208); }

    /* ─── Action buttons ─── */
    .action-buttons { display: flex; justify-content: flex-end; gap: 0.75rem; }
    .btn-cancel {
      display: inline-flex;
      align-items: center;
      height: 2.75rem;
      padding: 0 1.5rem;
      background: rgb(243 244 246);
      color: rgb(55 65 81);
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-cancel:hover { background: rgb(229 231 235); }
    .btn-submit {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      height: 2.75rem;
      padding: 0 2rem;
      background: linear-gradient(to right, rgb(99 102 241), rgb(139 92 246));
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-submit--green { background: linear-gradient(to right, rgb(34 197 94), rgb(22 163 74)); }
    .btn-submit:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

    /* ─── Responsive ─── */
    @media (min-width: 640px) {
      .create-doc-page { padding: 1.5rem; }
      .page-header h1 { font-size: 1.5rem; }
      .form-grid { grid-template-columns: repeat(2, 1fr); }
      .form-grid--3 { grid-template-columns: repeat(2, 1fr); }
    }
    @media (min-width: 1024px) {
      .create-doc-page { padding: 2rem; }
      .page-header h1 { font-size: 1.875rem; }
      .form-grid--3 { grid-template-columns: repeat(3, 1fr); }
      .products-grid { grid-template-columns: repeat(2, 1fr); }
      .summary-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `],
})
export class CreateDocumentComponent implements OnInit {
  mode: DocumentMode = 'facture';

  customers: Customer[] = [];
  products: Product[] = [];
  lineItems: LineItem[] = [];

  loading = false;
  error = '';
  success = '';

  /* ── Facture reactive form ── */
  invoiceForm!: FormGroup;
  totalHT = 0;
  totalVAT = 0;
  totalTTC = 0;
  deposit = 0;
  netAmountDue = 0;

  /* ── BL plain model ── */
  bl = {
    customerId: '' as string | number,
    deliveryDate: '',
    deliveryAddress: '',
    notes: '',
    globalDiscount: 0,
    applyTva: false,
  };

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    /* Read ?mode= query param to preset the toggle */
    this.route.queryParamMap.subscribe((params) => {
      const m = params.get('mode');
      if (m === 'bl') this.mode = 'bl';
      else this.mode = 'facture';
    });

    this.initInvoiceForm();
    this.loadCustomers();
    this.loadProducts();
    this.bl.deliveryDate = this.today();
  }

  /* ════════════════════════════════════════════
     MODE SWITCHING
  ════════════════════════════════════════════ */
  get selectedProductsEmptyMessage(): string {
    return this.mode === 'facture'
      ? "Cliquez sur un produit du catalogue pour l'ajouter."
      : 'Aucun produit sélectionné';
  }

  switchMode(m: DocumentMode) {
    if (this.mode === m) return;
    this.mode = m;
    this.lineItems = [];
    this.error = '';
    this.success = '';
    this.calculateInvoiceTotals();
  }

  toggleMode() {
    this.switchMode(this.mode === 'facture' ? 'bl' : 'facture');
  }

  /* ════════════════════════════════════════════
     INIT
  ════════════════════════════════════════════ */
  private initInvoiceForm() {
    this.invoiceForm = this.fb.group({
      customerId:   [null, Validators.required],
      billDate:     [this.today(), Validators.required],
      paymentTerms: ['30 jours', Validators.required],
      deposit:      [0, Validators.min(0)],
      applyTva:     [false],
    });
    this.invoiceForm.get('applyTva')?.valueChanges.subscribe(() => this.calculateInvoiceTotals());
  }

  private today(): string {
    return new Date().toISOString().split('T')[0];
  }

  /* ════════════════════════════════════════════
     DATA LOADING
  ════════════════════════════════════════════ */
  loadCustomers() {
    this.apiService.getCustomers().subscribe({
      next: (data: any[]) => {
        this.customers = data.map((item) => {
          const c = item.customer || item;
          return { customerId: c.customerId, name: c.name, address: c.address, phone: c.phone, email: c.email };
        });
      },
      error: () => { this.error = 'Erreur lors du chargement des clients'; },
    });
  }

  loadProducts() {
    const defaultImg = 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=100&h=100&fit=crop';
    this.apiService.getProducts().subscribe({
      next: (data: any[]) => {
        this.products = data.map((p) => ({
          productId: p.idProduct ?? p.id,
          idProduct: p.idProduct ?? p.id,
          reference: p.reference,
          name: p.name,
          unitPrice: p.unitPriceSold ?? p.unitPrice ?? 0,
          unitPriceSold: p.unitPriceSold ?? p.unitPrice ?? 0,
          stock: p.currentStockQuantity ?? p.stock ?? 0,
          quantity: p.currentStockQuantity ?? p.stock ?? 0,
          imageUrl: p.imageUrl || defaultImg,
        }));
      },
      error: () => { this.error = 'Erreur lors du chargement des produits'; },
    });
  }

  /* ════════════════════════════════════════════
     PRODUCT CATALOGUE (shared)
  ════════════════════════════════════════════ */
  addProduct(product: Product) {
    const productId = product.productId ?? product.idProduct ?? 0;
    const unitPrice = product.unitPrice ?? product.unitPriceSold ?? 0;
    const stock = product.stock ?? product.quantity ?? 0;

    const existing = this.lineItems.find((i) => i.productId === productId);
    if (existing) {
      if (existing.quantity < stock) {
        existing.quantity++;
        existing.stockError = false;
        const sub = existing.quantity * existing.unitPrice;
        existing.totalPrice = sub * (1 - existing.discount / 100);
      } else {
        existing.stockError = true;
      }
    } else {
      this.lineItems.push({
        productId,
        productName: product.name,
        reference: product.reference,
        unitPrice,
        quantity: 1,
        discount: 0,
        totalPrice: unitPrice,
        maxStock: stock,
        stockError: false,
      });
    }
    this.calculateInvoiceTotals();
  }

  removeProduct(index: number) {
    this.lineItems.splice(index, 1);
    this.calculateInvoiceTotals();
  }

  updateQuantity(index: number, quantity: number) {
    const qty = isNaN(quantity) ? 1 : Math.max(1, Math.floor(quantity));
    const maxStock = this.lineItems[index].maxStock ?? 999999;
    if (qty <= 0) { this.removeProduct(index); return; }
    this.lineItems[index].quantity = Math.min(qty, maxStock);
    this.lineItems[index].stockError = qty > maxStock;
    const sub = this.lineItems[index].quantity * this.lineItems[index].unitPrice;
    this.lineItems[index].totalPrice = sub * (1 - (this.lineItems[index].discount || 0) / 100);
    this.calculateInvoiceTotals();
  }

  updateDiscount(index: number, discount: number) {
    const d = isNaN(discount) ? 0 : Math.max(0, Math.min(100, discount));
    this.lineItems[index].discount = d;
    const sub = this.lineItems[index].quantity * this.lineItems[index].unitPrice;
    this.lineItems[index].totalPrice = sub * (1 - d / 100);
    this.calculateInvoiceTotals();
  }

  getReservedQuantities(): Map<number, number> {
    const m = new Map<number, number>();
    this.lineItems.forEach((i) => m.set(i.productId, i.quantity));
    return m;
  }

  getProductImagesMap(): Map<number, string> {
    const m = new Map<number, string>();
    this.products.forEach((p) => {
      const id = p.productId ?? p.idProduct ?? 0;
      m.set(id, p.imageUrl || '/placeholder.svg');
    });
    return m;
  }

  /* ════════════════════════════════════════════
     FACTURE CALCULATIONS
  ════════════════════════════════════════════ */
  calculateInvoiceTotals() {
    this.totalHT = this.lineItems.reduce((s, i) => s + i.totalPrice, 0);
    const applyTva = this.invoiceForm?.get('applyTva')?.value ?? false;
    this.totalVAT = applyTva ? this.totalHT * 0.19 : 0;
    this.totalTTC = this.totalHT + this.totalVAT;
    this.deposit = this.invoiceForm?.get('deposit')?.value || 0;
    this.netAmountDue = this.totalTTC - this.deposit;
  }

  updateDeposit(value: number) {
    this.invoiceForm.patchValue({ deposit: value || 0 });
    this.calculateInvoiceTotals();
  }

  getTotalHTBrut(): number {
    return this.lineItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  }

  getTotalDiscount(): number {
    return this.getTotalHTBrut() - this.totalHT;
  }

  /* ════════════════════════════════════════════
     BL CALCULATIONS
  ════════════════════════════════════════════ */
  getBlSubtotal(): number {
    return this.lineItems.reduce((s, i) => s + i.totalPrice, 0);
  }

  getBlTotalHT(): number {
    const sub = this.getBlSubtotal();
    return this.bl.globalDiscount > 0 ? sub * (1 - this.bl.globalDiscount / 100) : sub;
  }

  getBlTVA(): number {
    return this.bl.applyTva ? this.getBlTotalHT() * 0.19 : 0;
  }

  getBlTotal(): number {
    return this.getBlTotalHT() + this.getBlTVA();
  }

  /* ════════════════════════════════════════════
     BL: auto-fill address on customer change
  ════════════════════════════════════════════ */
  onBlCustomerChange() {
    const customer = this.customers.find((c) => c.customerId == this.bl.customerId);
    if (customer?.address) this.bl.deliveryAddress = customer.address;
  }

  /* ════════════════════════════════════════════
     SUBMIT
  ════════════════════════════════════════════ */
  submit() {
    this.mode === 'facture' ? this.submitInvoice() : this.submitBL();
  }

  private submitInvoice() {
    if (this.invoiceForm.invalid) { this.error = 'Veuillez remplir tous les champs obligatoires'; return; }
    if (this.lineItems.length === 0) { this.error = 'Veuillez ajouter au moins un produit'; return; }

    this.loading = true; this.error = ''; this.success = '';

    const data = {
      customerId:   Number(this.invoiceForm.get('customerId')?.value),
      billDate:     this.invoiceForm.get('billDate')?.value,
      paymentTerms: this.invoiceForm.get('paymentTerms')?.value,
      deposit:      Number(this.invoiceForm.get('deposit')?.value) || 0,
      applyTva:     this.invoiceForm.get('applyTva')?.value ?? false,
      products: this.lineItems.map((i) => ({
        productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice, discount: i.discount || 0,
      })),
    };

    this.apiService.createInvoice(data).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Facture créée avec succès !';
        setTimeout(() => this.router.navigate(['/invoices/list']), 1800);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Erreur lors de la création de la facture';
      },
    });
  }

  private submitBL() {
    if (!this.bl.customerId || !this.bl.deliveryDate) { this.error = 'Veuillez remplir tous les champs obligatoires'; return; }
    if (this.lineItems.length === 0) { this.error = 'Veuillez ajouter au moins un produit'; return; }
    if (this.lineItems.some((i) => i.quantity > (i.maxStock ?? 0))) { this.error = 'Quantité dépassant le stock disponible'; return; }

    this.loading = true; this.error = ''; this.success = '';

    const isoDate = new Date(this.bl.deliveryDate).toISOString().slice(0, 19);

    const data = {
      customerId:      Number(this.bl.customerId),
      dateDelivery:    isoDate,
      deliveryAddress: this.bl.deliveryAddress,
      notes:           this.bl.notes,
      discount:        this.bl.globalDiscount,
      applyTva:        this.bl.applyTva,
      products: this.lineItems.map((i) => ({
        productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice, discount: i.discount,
      })),
    };

    this.apiService.createDeliveryNote(data).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Bon de livraison créé avec succès !';
        setTimeout(() => this.router.navigate(['/delivery-notes/list']), 1800);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Erreur lors de la création du bon de livraison';
      },
    });
  }

  cancel() {
    this.mode === 'facture'
      ? this.router.navigate(['/invoices/list'])
      : this.router.navigate(['/delivery-notes/list']);
  }
}



