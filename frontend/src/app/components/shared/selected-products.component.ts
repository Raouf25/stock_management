import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SelectedProduct {
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
  selector: 'app-selected-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="section-card">
      <div class="section-header" [ngClass]="headerClass">
        <span class="section-icon">{{ icon }}</span>
        <span>{{ title }} ({{ products.length }})</span>
      </div>
      <div class="section-body-no-padding">
        <div *ngIf="products.length === 0" class="empty-cart">
          <span class="empty-icon">{{ emptyIcon }}</span>
          <p>{{ emptyMessage }}</p>
        </div>
        <div *ngIf="products.length > 0" class="selected-products-list">
          <div *ngFor="let product of products; let i = index" class="selected-product-item">
            <div class="selected-product-image">
              <img [src]="getProductImage(product.productId)" [alt]="product.productName">
            </div>
            <div class="selected-product-content">
              <div class="selected-product-header">
                <div>
                  <p class="selected-product-name">{{ product.productName }}</p>
                  <p class="selected-product-unit-price">{{ product.unitPrice | number:'1.3-3' }} DNT/u</p>
                </div>
                <button class="btn-remove-product" (click)="onRemoveProduct(i)" type="button">
                  🗑️
                </button>
              </div>
              
              <!-- Quantité et Remise -->
              <div class="product-controls">
                <!-- Quantité -->
                <div class="quantity-control">
                  <span class="control-label">Qté:</span>
                  <button class="btn-qty" (click)="updateQuantity(i, product.quantity - 1)" type="button">➖</button>
                  <span class="qty-value">{{ product.quantity }}</span>
                  <button class="btn-qty" (click)="updateQuantity(i, product.quantity + 1)" type="button">➕</button>
                </div>
                
                <!-- Remise -->
                <div class="discount-control">
                  <span class="discount-icon">💸</span>
                  <input
                    type="number"
                    [value]="product.discount"
                    (input)="updateDiscount(i, $any($event.target).value)"
                    class="discount-input"
                    min="0"
                    max="100"
                  >
                  <span class="control-label">%</span>
                </div>
              </div>

              <!-- Total ligne -->
              <div class="product-total">
                <span *ngIf="product.discount > 0" class="discount-applied">
                  -{{ product.discount }}%
                </span>
                <span class="total-price">{{ product.totalPrice | number:'1.3-3' }} DNT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .section-card {
      background: var(--glass-bg);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--glass-shadow-sm);
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

    .header-green {
      background: linear-gradient(to right, rgb(34 197 94), rgb(22 163 74));
    }

    .section-icon {
      font-size: 1.125rem;
    }

    .section-body-no-padding {
      padding: 0;
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
      background: rgba(255,255,255,0.7);
      border: 1px solid rgba(15,23,42,0.1);
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
      background: rgba(255,255,255,0.7);
      border: 1px solid rgba(15,23,42,0.1);
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

    @media (min-width: 640px) {
      .selected-products-list {
        max-height: 400px;
      }
    }
  `]
})
export class SelectedProductsComponent {
  @Input() products: SelectedProduct[] = [];
  @Input() title: string = 'Produits Sélectionnés';
  @Input() icon: string = '🛒';
  @Input() emptyIcon: string = '🛒';
  @Input() emptyMessage: string = "Cliquez sur un produit du catalogue pour l'ajouter.";
  @Input() headerClass: string = 'header-purple';
  @Input() productImages: Map<number, string> = new Map();

  @Output() productRemoved = new EventEmitter<number>();
  @Output() quantityUpdated = new EventEmitter<{ index: number; quantity: number }>();
  @Output() discountUpdated = new EventEmitter<{ index: number; discount: number }>();

  getProductImage(productId: number): string {
    return this.productImages.get(productId) || '/placeholder.svg';
  }

  onRemoveProduct(index: number): void {
    this.productRemoved.emit(index);
  }

  updateQuantity(index: number, quantity: number): void {
    this.quantityUpdated.emit({ index, quantity });
  }

  updateDiscount(index: number, discount: number): void {
    const discountValue = Number(discount) || 0;
    this.discountUpdated.emit({ index, discount: discountValue });
  }
}
