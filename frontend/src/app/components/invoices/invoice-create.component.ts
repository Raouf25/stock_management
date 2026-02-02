import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

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
}

interface InvoiceLineItem {
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
  selector: 'app-invoice-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="invoice-create-page">
      <!-- Header -->
      <div class="page-header">
        <span class="header-icon">📄</span>
        <h1>Créer une Nouvelle Facture</h1>
      </div>

      <!-- Informations Générales -->
      <div class="section-card">
        <div class="section-header header-purple">
          <span class="section-icon">ℹ️</span>
          <span>Informations Générales</span>
        </div>
        <div class="section-body">
          <form [formGroup]="invoiceForm">
            <div class="form-grid">
              <div class="form-field">
                <label class="field-label">
                  <span class="label-icon">👤</span>
                  Client <span class="required">*</span>
                </label>
                <select formControlName="customerId" class="form-select">
                  <option value="">Sélectionner un client...</option>
                  <option *ngFor="let customer of customers" [value]="customer.customerId">
                    {{ customer.name }}
                  </option>
                </select>
              </div>
              <div class="form-field">
                <label class="field-label">
                  <span class="label-icon">📅</span>
                  Date de Facture <span class="required">*</span>
                </label>
                <input type="date" formControlName="billDate" class="form-input">
              </div>
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
            </div>
          </form>
        </div>
      </div>

      <!-- Catalogue & Produits Sélectionnés -->
      <div class="products-grid">
        <!-- Catalogue Produits -->
        <div class="section-card">
          <div class="section-header header-orange">
            <span class="section-icon">📦</span>
            <span>Catalogue Produits</span>
          </div>
          <div class="section-body-no-padding">
            <div class="search-wrapper">
              <div class="search-input-wrapper">
                <span class="search-icon">🔍</span>
                <input
                  type="text"
                  class="search-input"
                  placeholder="Rechercher un produit..."
                  [(ngModel)]="searchProductTerm"
                  (keyup)="filterProducts()"
                >
              </div>
            </div>
            <div class="product-list">
              <div *ngFor="let product of filteredProducts" class="product-item">
                <div class="product-image">
                  <img [src]="product.imageUrl || '/placeholder.svg'" [alt]="product.name">
                </div>
                <div class="product-info">
                  <p class="product-name">{{ product.name }}</p>
                  <p class="product-meta">
                    Ref: {{ product.reference }} | <span class="stock-info">Stock: {{ getAvailableStock(product) }}</span>
                  </p>
                  <p class="product-price">{{ product.unitPrice | number:'1.3-3' }} DNT</p>
                </div>
                <button class="btn-add-product" (click)="addLineItem(product)" type="button" [disabled]="getAvailableStock(product) <= 0">
                  ➕
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Produits Sélectionnés -->
        <div class="section-card">
          <div class="section-header header-purple">
            <span class="section-icon">🛒</span>
            <span>Produits Sélectionnés ({{ lineItems.length }})</span>
          </div>
          <div class="section-body-no-padding">
            <div *ngIf="lineItems.length === 0" class="empty-cart">
              <span class="empty-icon">🛒</span>
              <p>Cliquez sur un produit du catalogue pour l'ajouter.</p>
            </div>
            <div *ngIf="lineItems.length > 0" class="selected-products-list">
              <div *ngFor="let item of lineItems; let i = index" class="selected-product-item">
                <div class="selected-product-image">
                  <img [src]="getProductImage(item.productId)" [alt]="item.productName">
                </div>
                <div class="selected-product-content">
                  <div class="selected-product-header">
                    <div>
                      <p class="selected-product-name">{{ item.productName }}</p>
                      <p class="selected-product-unit-price">{{ item.unitPrice | number:'1.3-3' }} DNT/u</p>
                    </div>
                    <button class="btn-remove-product" (click)="removeLineItem(i)" type="button">
                      🗑️
                    </button>
                  </div>
                  
                  <!-- Quantité et Remise -->
                  <div class="product-controls">
                    <!-- Quantité -->
                    <div class="quantity-control">
                      <span class="control-label">Qté:</span>
                      <button class="btn-qty" (click)="updateLineItemQuantity(i, item.quantity - 1)" type="button">➖</button>
                      <span class="qty-value">{{ item.quantity }}</span>
                      <button class="btn-qty" (click)="updateLineItemQuantity(i, item.quantity + 1)" type="button">➕</button>
                    </div>
                    
                    <!-- Remise -->
                    <div class="discount-control">
                      <span class="discount-icon">💸</span>
                      <input
                        type="number"
                        [value]="item.discount"
                        (input)="updateLineItemDiscount(i, $any($event.target).value)"
                        class="discount-input"
                        min="0"
                        max="100"
                      >
                      <span class="control-label">%</span>
                    </div>
                  </div>

                  <!-- Total ligne -->
                  <div class="product-total">
                    <span *ngIf="item.discount > 0" class="discount-applied">
                      -{{ item.discount }}%
                    </span>
                    <span class="total-price">{{ item.totalPrice | number:'1.3-3' }} DNT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Acompte & Récapitulatif -->
      <div class="summary-grid">
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
            <input
              type="number"
              [ngModel]="invoiceForm.get('deposit')?.value"
              (ngModelChange)="updateDeposit($event)"
              class="form-input"
              min="0"
            >
          </div>
        </div>

        <!-- Récapitulatif Financier -->
        <div class="section-card">
          <div class="section-header header-purple">
            <span class="section-icon">🧾</span>
            <span>Récapitulatif Financier</span>
          </div>
          <div class="section-body">
            <div class="financial-summary">
              <div class="summary-row">
                <span class="summary-label">Total HT Brut :</span>
                <span class="summary-value">{{ getTotalHTBrut() | number:'1.3-3' }} DNT</span>
              </div>
              <div *ngIf="getTotalDiscount() > 0" class="summary-row discount-row">
                <span class="summary-label">Total Remises :</span>
                <span class="summary-value">-{{ getTotalDiscount() | number:'1.3-3' }} DNT</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Total HT Net :</span>
                <span class="summary-value">{{ totalHT | number:'1.3-3' }} DNT</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">TVA (19%) :</span>
                <span class="summary-value text-blue">{{ totalVAT | number:'1.3-3' }} DNT</span>
              </div>
              <div class="summary-row total-row">
                <span class="summary-label">Total TTC :</span>
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

      <!-- Messages -->
      <div *ngIf="error" class="alert alert-error">{{ error }}</div>
      <div *ngIf="success" class="alert alert-success">{{ success }}</div>

      <!-- Submit Button -->
      <div class="action-buttons">
        <button class="btn-submit" (click)="submitForm()" [disabled]="loading" type="button">
          <span>📄</span>
          {{ loading ? 'Enregistrement...' : 'Enregistrer la Facture' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .invoice-create-page {
      min-height: 100vh;
      background: rgb(248 250 252);
      padding: 1rem;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .header-icon {
      font-size: 1.5rem;
    }

    .page-header h1 {
      font-size: 1.25rem;
      font-weight: 700;
      color: rgb(17 24 39);
      margin: 0;
    }

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

    .header-purple {
      background: linear-gradient(to right, rgb(99 102 241), rgb(139 92 246));
    }

    .header-orange {
      background: linear-gradient(to right, rgb(249 115 22), rgb(251 146 60));
    }

    .section-icon {
      font-size: 1.125rem;
    }

    .section-body {
      padding: 1rem;
    }

    .section-body-no-padding {
      padding: 0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 1rem;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

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

    .label-icon {
      font-size: 0.875rem;
    }

    .required {
      color: rgb(239 68 68);
    }

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

    .search-wrapper {
      border-bottom: 1px solid rgb(229 231 235);
      padding: 0.75rem;
    }

    .search-input-wrapper {
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: 0.625rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1rem;
      color: rgb(156 163 175);
    }

    .search-input {
      height: 2.25rem;
      width: 100%;
      background: white;
      border: 1px solid rgb(209 213 219);
      border-radius: 0.375rem;
      padding-left: 2.25rem;
      padding-right: 0.75rem;
      font-size: 0.875rem;
    }

    .search-input:focus {
      outline: none;
      border-color: rgb(99 102 241);
      box-shadow: 0 0 0 3px rgb(99 102 241 / 0.1);
    }

    .product-list {
      max-height: 280px;
      overflow-y: auto;
    }

    .product-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-bottom: 1px solid rgb(243 244 246);
      transition: background-color 0.15s ease;
    }

    .product-item:hover {
      background: rgb(249 250 251);
    }

    .product-image {
      width: 2.5rem;
      height: 2.5rem;
      flex-shrink: 0;
      border-radius: 0.375rem;
      background: rgb(243 244 246);
      overflow: hidden;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-info {
      flex: 1;
      min-width: 0;
    }

    .product-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: rgb(17 24 39);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .product-meta {
      font-size: 0.75rem;
      color: rgb(107 114 128);
      margin: 0.125rem 0 0;
    }

    .stock-info {
      color: rgb(34 197 94);
    }

    .product-price {
      font-size: 0.875rem;
      font-weight: 700;
      color: rgb(37 99 235);
      margin: 0.125rem 0 0;
    }

    .btn-add-product {
      flex-shrink: 0;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: rgb(37 99 235);
      border-radius: 0.375rem;
      cursor: pointer;
      font-size: 1.125rem;
      transition: all 0.15s ease;
    }

    .btn-add-product:hover {
      background: rgb(239 246 255);
      color: rgb(29 78 216);
    }

    .btn-add-product:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      color: rgb(156 163 175);
    }

    .btn-add-product:disabled:hover {
      background: transparent;
      color: rgb(156 163 175);
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .empty-cart {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1rem;
      color: rgb(156 163 175);
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 0.75rem;
    }

    .empty-cart p {
      text-align: center;
      font-size: 0.875rem;
      margin: 0;
    }

    .selected-products-list {
      max-height: 280px;
      overflow-y: auto;
    }

    .selected-product-item {
      display: flex;
      gap: 0.75rem;
      padding: 0.75rem;
      border-bottom: 1px solid rgb(243 244 246);
    }

    .selected-product-image {
      width: 2.5rem;
      height: 2.5rem;
      flex-shrink: 0;
      border-radius: 0.375rem;
      background: rgb(243 244 246);
      overflow: hidden;
    }

    .selected-product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .selected-product-content {
      flex: 1;
      min-width: 0;
    }

    .selected-product-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .selected-product-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: rgb(17 24 39);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .selected-product-unit-price {
      font-size: 0.75rem;
      color: rgb(107 114 128);
      margin: 0.125rem 0 0;
    }

    .btn-remove-product {
      width: 1.75rem;
      height: 1.75rem;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: rgb(239 68 68);
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 0.15s ease;
      font-size: 1rem;
    }

    .btn-remove-product:hover {
      background: rgb(254 242 242);
      color: rgb(220 38 38);
    }

    .product-controls {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }

    .quantity-control {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .control-label {
      font-size: 0.75rem;
      color: rgb(107 114 128);
    }

    .btn-qty {
      width: 1.5rem;
      height: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border: 1px solid rgb(209 213 219);
      border-radius: 0.25rem;
      cursor: pointer;
      transition: all 0.15s ease;
      font-size: 0.75rem;
    }

    .btn-qty:hover {
      background: rgb(243 244 246);
    }

    .qty-value {
      width: 1.5rem;
      text-align: center;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .discount-control {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .discount-icon {
      font-size: 0.75rem;
      color: rgb(245 158 11);
    }

    .discount-input {
      width: 3.5rem;
      height: 1.5rem;
      background: white;
      border: 1px solid rgb(209 213 219);
      border-radius: 0.25rem;
      padding: 0 0.25rem;
      text-align: center;
      font-size: 0.75rem;
    }

    .discount-input:focus {
      outline: none;
      border-color: rgb(99 102 241);
    }

    .product-total {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 0.5rem;
    }

    .discount-applied {
      font-size: 0.75rem;
      color: rgb(245 158 11);
    }

    .total-price {
      font-size: 0.875rem;
      font-weight: 700;
      color: rgb(37 99 235);
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .financial-summary {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .summary-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .summary-label {
      color: rgb(107 114 128);
    }

    .summary-value {
      font-weight: 500;
      color: rgb(17 24 39);
    }

    .discount-row .summary-label,
    .discount-row .summary-value {
      color: rgb(245 158 11);
    }

    .text-blue {
      color: rgb(37 99 235);
    }

    .total-row {
      border-top: 1px solid rgb(229 231 235);
      padding-top: 0.5rem;
    }

    .deposit-row .summary-label,
    .deposit-row .summary-value {
      color: rgb(34 197 94);
    }

    .due-row {
      background: rgb(254 242 242);
      padding: 0.5rem;
      border-radius: 0.5rem;
    }

    .due-row .summary-label {
      color: rgb(107 114 128);
    }

    .due-row .summary-value {
      color: rgb(220 38 38);
    }

    .font-bold {
      font-weight: 700;
    }

    .alert {
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }

    .alert-error {
      background: rgb(254 242 242);
      color: rgb(153 27 27);
      border: 1px solid rgb(254 226 226);
    }

    .alert-success {
      background: rgb(240 253 244);
      color: rgb(22 101 52);
      border: 1px solid rgb(187 247 208);
    }

    .action-buttons {
      display: flex;
      justify-content: flex-end;
    }

    .btn-submit {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      height: 2.75rem;
      padding: 0 2rem;
      background: linear-gradient(to right, rgb(34 197 94), rgb(22 163 74));
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-submit:hover:not(:disabled) {
      background: linear-gradient(to right, rgb(22 163 74), rgb(21 128 61));
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-submit span {
      font-size: 1rem;
    }

    @media (min-width: 640px) {
      .invoice-create-page {
        padding: 1.5rem;
      }

      .page-header h1 {
        font-size: 1.5rem;
      }

      .form-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .product-list,
      .selected-products-list {
        max-height: 400px;
      }
    }

    @media (min-width: 1024px) {
      .invoice-create-page {
        padding: 2rem;
      }

      .page-header h1 {
        font-size: 1.875rem;
      }

      .products-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class InvoiceCreateComponent implements OnInit {
  invoiceForm!: FormGroup;
  customers: Customer[] = [];
  products: Product[] = [];
  lineItems: InvoiceLineItem[] = [];
  
  loading: boolean = false;
  error: string = '';
  success: string = '';
  showProductSearch: boolean = false;
  filteredProducts: Product[] = [];
  searchProductTerm: string = '';
  
  // Calculation properties
  totalHT: number = 0;
  totalVAT: number = 0;
  totalTTC: number = 0;
  deposit: number = 0;
  netAmountDue: number = 0;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadCustomers();
    this.loadProducts();
  }

  initializeForm() {
    this.invoiceForm = this.formBuilder.group({
      customerId: [null, [Validators.required]],
      billDate: [this.getToday(), [Validators.required]],
      paymentTerms: ['30 jours', [Validators.required]],
      deposit: [0, [Validators.min(0)]]
    });
  }

  getToday(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  loadCustomers() {
    this.apiService.getCustomers().subscribe({
      next: (data) => {
        this.customers = data.map((c: any) => ({
          customerId: c.customerId,
          name: c.name,
          address: c.address,
          phone: c.phone,
          email: c.email
        }));
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.error = 'Erreur lors du chargement des clients';
      }
    });
  }

  loadProducts() {
    const defaultImage = 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=100&h=100&fit=crop';

    this.apiService.getProducts().subscribe({
      next: (data) => {
        this.products = data.map((p: any) => ({
          productId: p.idProduct ?? p.id,
          reference: p.reference,
          name: p.name,
          unitPrice: p.unitPriceSold ?? p.unitPrice ?? 0,
          stock: p.currentStockQuantity ?? p.stock ?? 0,
          imageUrl: p.imageUrl || defaultImage
        }));
        this.filteredProducts = this.products;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.error = 'Erreur lors du chargement des produits';
      }
    });
  }

  filterProducts() {
    if (this.searchProductTerm.trim() === '') {
      this.filteredProducts = this.products;
    } else {
      const term = this.searchProductTerm.toLowerCase();
      this.filteredProducts = this.products.filter(p =>
        p.name.toLowerCase().includes(term) ||
        String(p.reference).toLowerCase().includes(term)
      );
    }
  }

  addLineItem(product: Product) {
    // Check if product already exists in line items
    const existingItem = this.lineItems.find(item => item.productId === product.productId);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        existingItem.quantity += 1;
        existingItem.stockError = false;
        const subtotal = existingItem.quantity * existingItem.unitPrice;
        const discountAmount = (subtotal * existingItem.discount) / 100;
        existingItem.totalPrice = subtotal - discountAmount;
      } else {
        existingItem.stockError = true;
      }
    } else {
      this.lineItems.push({
        productId: product.productId,
        productName: product.name,
        reference: product.reference,
        unitPrice: product.unitPrice,
        quantity: 1,
        discount: 0,
        totalPrice: product.unitPrice,
        maxStock: product.stock,
        stockError: false
      });
    }
    this.calculateTotals();
  }

  // Vérifie si un produit est déjà dans le panier
  isProductInCart(productId: number): boolean {
    return this.lineItems.some(item => item.productId === productId);
  }

  // Retourne la quantité d'un produit dans le panier
  getProductQuantityInCart(productId: number): number {
    const item = this.lineItems.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  }

  // Retourne le stock disponible (stock initial - quantité dans le panier)
  getAvailableStock(product: Product): number {
    const quantityInCart = this.getProductQuantityInCart(product.productId);
    return product.stock - quantityInCart;
  }

  updateLineItemQuantity(index: number, quantity: number) {
    const quantityValue = isNaN(quantity) ? 1 : Math.max(1, Math.floor(quantity));
    const maxStock = this.lineItems[index].maxStock ?? 999999;
    if (quantityValue <= 0) {
      this.removeLineItem(index);
    } else if (quantityValue > maxStock) {
      this.lineItems[index].quantity = maxStock;
      this.lineItems[index].stockError = true;
      const subtotal = maxStock * this.lineItems[index].unitPrice;
      const discountAmount = (subtotal * (this.lineItems[index].discount || 0)) / 100;
      this.lineItems[index].totalPrice = subtotal - discountAmount;
      this.calculateTotals();
    } else {
      this.lineItems[index].stockError = false;
      this.lineItems[index].quantity = quantityValue;
      const subtotal = quantityValue * this.lineItems[index].unitPrice;
      const discountAmount = (subtotal * (this.lineItems[index].discount || 0)) / 100;
      this.lineItems[index].totalPrice = subtotal - discountAmount;
      this.calculateTotals();
    }
  }

  updateLineItemDiscount(index: number, discount: number) {
    const discountValue = isNaN(discount) ? 0 : Math.max(0, Math.min(100, discount));
    this.lineItems[index].discount = discountValue;
    const subtotal = this.lineItems[index].quantity * this.lineItems[index].unitPrice;
    const discountAmount = (subtotal * discountValue) / 100;
    this.lineItems[index].totalPrice = subtotal - discountAmount;
    this.calculateTotals();
  }

  removeLineItem(index: number) {
    this.lineItems.splice(index, 1);
    this.calculateTotals();
  }

  calculateTotals() {
    // Calculate total HT (already includes per-item discounts)
    this.totalHT = this.lineItems.reduce((sum, item) => sum + item.totalPrice, 0);

    // Calculate VAT (19%)
    const VAT_RATE = 0.19;
    this.totalVAT = this.totalHT * VAT_RATE;

    // Calculate total TTC (total with tax)
    this.totalTTC = this.totalHT + this.totalVAT;

    // Get deposit
    this.deposit = this.invoiceForm.get('deposit')?.value || 0;

    // Calculate net amount due
    this.netAmountDue = this.totalTTC - this.deposit;
  }

  onDepositChange() {
    this.calculateTotals();
  }

  updateDeposit(value: number) {
    this.invoiceForm.patchValue({ deposit: value || 0 });
    this.calculateTotals();
  }

  submitForm() {
    if (this.invoiceForm.invalid) {
      this.error = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    if (this.lineItems.length === 0) {
      this.error = 'Veuillez ajouter au moins un produit';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const customerId = this.invoiceForm.get('customerId')?.value;
    const deposit = this.invoiceForm.get('deposit')?.value || 0;

    const invoiceData = {
      customerId: customerId ? Number(customerId) : null,
      billDate: this.invoiceForm.get('billDate')?.value,
      paymentTerms: this.invoiceForm.get('paymentTerms')?.value,
      deposit: Number(deposit) || 0,
      products: this.lineItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0
      }))
    };

    this.apiService.createInvoice(invoiceData).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = 'Facture créée avec succès!';
        // Navigate back to invoices list after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/invoices']);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error creating invoice:', error);
        this.error = error.error?.message || 'Erreur lors de la création de la facture';
      }
    });
  }

  cancel() {
    this.router.navigate(['/invoices']);
  }

  getTotalDiscount(): number {
    const totalHTBrut = this.lineItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    return totalHTBrut - this.totalHT;
  }

  getTotalHTBrut(): number {
    return this.lineItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  }

  getProductImage(productId: number): string {
    const product = this.products.find(p => p.productId === productId);
    return product?.imageUrl || '/placeholder.svg';
  }
}
