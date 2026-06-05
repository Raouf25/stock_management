import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  idProduct?: number;
  productId?: number;
  reference: string;
  name: string;
  unitPriceSold?: number;
  unitPrice?: number;
  quantity?: number;
  stock?: number;
  imageUrl?: string;
  [key: string]: any; // Allow additional properties
}

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="invoice-card">
      <div class="invoice-card-header gradient-orange">
        <span style="font-size: 1rem;">📦</span>
        <span class="invoice-card-header-title">Catalogue Produits</span>
      </div>
      <div style="padding: 0;">
        <div style="padding: 0.75rem 1rem; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; gap: 0.75rem;">
          <!-- Search input -->
          <div style="position: relative; flex: 1;">
            <span style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); font-size: 1rem;">🔍</span>
            <input type="text"
                   [(ngModel)]="searchTerm"
                   (keyup)="onSearchChange()"
                   placeholder="Rechercher un produit..."
                   style="width: 100%; padding: 0.625rem 0.75rem 0.625rem 2.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem; box-sizing: border-box;">
          </div>

          <!-- En stock toggle -->
          <div style="display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;">
            <label class="toggle-switch">
              <input type="checkbox" [(ngModel)]="showInStockOnly" (change)="onStockFilterChange()">
              <span class="toggle-slider"></span>
            </label>
            <span style="font-size: 0.8rem; color: #374151; white-space: nowrap; font-weight: 500;">En stock</span>
          </div>
        </div>

        <div style="max-height: 450px; overflow-y: auto; padding: 0.5rem;">
          <div *ngFor="let product of filteredProducts"
               (click)="selectProduct(product)"
               style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; margin-bottom: 0.5rem; background: #f9fafb; border-radius: 0.375rem; cursor: pointer; transition: all 0.2s; border: 1px solid transparent;"
               [style.opacity]="getAvailableStock(product) <= 0 ? '0.6' : '1'"
               [style.cursor]="getAvailableStock(product) <= 0 ? 'not-allowed' : 'pointer'"
               onmouseover="if(this.style.opacity !== '0.6') { this.style.background='#e5e7eb'; this.style.borderColor='#d1d5db' }"
               onmouseout="if(this.style.opacity !== '0.6') { this.style.background='#f9fafb'; this.style.borderColor='transparent' }">
            <div style="width: 3rem; height: 3rem; background: white; border-radius: 0.375rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid #e5e7eb;">
              <img [src]="product.imageUrl || '/placeholder.svg'" [alt]="product.name"
                   style="max-width: 100%; max-height: 100%; object-fit: contain;">
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="font-weight: 600; color: #111827; font-size: 0.875rem; margin-bottom: 0.125rem;">{{ product.name }}</div>
              <div style="font-size: 0.75rem; color: #6b7280; margin-bottom: 0.125rem;">
                Réf: {{ product.reference }} | <span [style.color]="getAvailableStock(product) > 0 ? '#10b981' : '#ef4444'">Stock: {{ getAvailableStock(product) }}</span>
              </div>
              <div style="font-weight: 600; color: #f59e0b; font-size: 0.875rem;">{{ getProductPrice(product) | number:'1.3-3' }} DNT</div>
            </div>
            <button type="button"
                    style="width: 2rem; height: 2rem; background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 600; flex-shrink: 0; display: flex; align-items: center; justify-content: center;"
                    [disabled]="getAvailableStock(product) <= 0"
                    [style.opacity]="getAvailableStock(product) <= 0 ? '0.5' : '1'"
                    [style.cursor]="getAvailableStock(product) <= 0 ? 'not-allowed' : 'pointer'">
              ➕
            </button>
          </div>
          <div *ngIf="filteredProducts.length === 0" style="text-align: center; padding: 3rem; color: #9ca3af;">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📭</div>
            <p style="margin: 0; font-size: 0.875rem;">Aucun produit trouvé</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 2.5rem;
      height: 1.375rem;
      flex-shrink: 0;
    }

    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
      position: absolute;
    }

    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #d1d5db;
      border-radius: 999px;
      transition: background-color 0.25s ease;
    }

    .toggle-slider::before {
      content: '';
      position: absolute;
      height: 1rem;
      width: 1rem;
      left: 3px;
      bottom: 3px;
      background-color: white;
      border-radius: 50%;
      transition: transform 0.25s ease;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }

    .toggle-switch input:checked + .toggle-slider {
      background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
    }

    .toggle-switch input:checked + .toggle-slider::before {
      transform: translateX(1.125rem);
    }
  `]
})
export class ProductCatalogComponent implements OnInit, OnChanges {
  @Input() products: Product[] = [];
  @Input() reservedQuantities: Map<number, number> = new Map();
  @Output() productSelected = new EventEmitter<Product>();

  searchTerm: string = '';
  showInStockOnly: boolean = false;
  filteredProducts: Product[] = [];

  ngOnInit(): void {
    this.filterProducts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['products']) {
      this.filterProducts();
    }
  }

  onSearchChange(): void {
    this.filterProducts();
  }

  onStockFilterChange(): void {
    this.filterProducts();
  }

  private filterProducts(): void {
    let result = [...this.products];

    // Filter by stock if toggle is on
    if (this.showInStockOnly) {
      result = result.filter(p => this.getAvailableStock(p) > 0);
    }

    // Filter by search term
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(p => {
        const name = (p.name || '').toString().toLowerCase();
        const reference = String(p.reference || '').toLowerCase();
        return name.includes(term) || reference.includes(term);
      });
    }

    this.filteredProducts = result;
  }

  selectProduct(product: Product): void {
    if (this.getAvailableStock(product) > 0) {
      const normalizedProduct = {
        ...product,
        productId: product.productId ?? product.idProduct,
        idProduct: product.idProduct ?? product.productId
      };
      this.productSelected.emit(normalizedProduct as any);
    }
  }

  getAvailableStock(product: Product): number {
    const productId = product.idProduct || product.productId || 0;
    const totalStock = product.quantity ?? product.stock ?? 0;
    const reserved = this.reservedQuantities.get(productId) || 0;
    return totalStock - reserved;
  }

  getProductPrice(product: Product): number {
    return product.unitPriceSold ?? product.unitPrice ?? 0;
  }
}