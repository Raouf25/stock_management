import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ProductCatalogComponent } from '../shared/product-catalog.component';
import { SelectedProductsComponent, SelectedProduct } from '../shared/selected-products.component';

interface Customer {
  customerId: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

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
}

interface DeliveryLineItem {
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
  selector: 'app-delivery-note-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductCatalogComponent, SelectedProductsComponent],
  template: `
    <div class="invoice-page-container">
      <!-- Header -->
      <div class="invoice-page-header">
        <span style="font-size: 2rem;">📦</span>
        <h1 class="invoice-page-title">Créer un Bon de Livraison</h1>
      </div>

      <!-- Informations Générales -->
      <div class="invoice-card" style="margin-bottom: 1rem;">
        <div class="invoice-card-header gradient-purple">
          <span style="font-size: 1rem;">ℹ️</span>
          <span class="invoice-card-header-title">Informations Générales</span>
        </div>
        <div style="padding: 1.5rem;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
            <div>
              <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                Client <span style="color: #ef4444;">*</span>
              </label>
              <select [(ngModel)]="selectedCustomerId" (change)="onCustomerChange()" 
                      style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem;">
                <option value="">Sélectionner un client...</option>
                <option *ngFor="let customer of customers" [value]="customer.customerId">
                  {{ customer.name }}
                </option>
              </select>
            </div>
            <div>
              <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                Date de Livraison <span style="color: #ef4444;">*</span>
              </label>
              <input type="date" [(ngModel)]="deliveryDate" 
                     style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem;">
            </div>
            <div>
              <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                Adresse de Livraison
              </label>
              <input type="text" [(ngModel)]="deliveryAddress" placeholder="Adresse..."
                     style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem;">
            </div>
          </div>
          <div style="margin-top: 1rem;">
            <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
              Notes
            </label>
            <textarea [(ngModel)]="notes" rows="3" placeholder="Notes supplémentaires..."
                      style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem; resize: vertical;"></textarea>
          </div>
          <div style="margin-top: 1rem;">
            <label class="tva-toggle-label">
              <span class="toggle-switch" [class.active]="applyTva">
                <input type="checkbox" [(ngModel)]="applyTva" (ngModelChange)="calculateTotal()" class="toggle-input">
                <span class="toggle-slider"></span>
              </span>
              <span class="toggle-text">
                <span class="toggle-title">Appliquer la TVA</span>
                <span class="toggle-rate" [class.active]="applyTva">19%</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      <!-- Catalogue & Produits Sélectionnés -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
        <!-- Catalogue -->
        <app-product-catalog 
          [products]="products"
          [reservedQuantities]="getReservedQuantities()"
          (productSelected)="addProductToDelivery($event)">
        </app-product-catalog>

        <!-- Produits Sélectionnés -->
        <app-selected-products
          [products]="deliveryItems"
          [title]="'Produits à Livrer'"
          [icon]="'✅'"
          [emptyIcon]="'📭'"
          [emptyMessage]="'Aucun produit sélectionné'"
          [headerClass]="'header-green'"
          [productImages]="getProductImagesMap()"
          (productRemoved)="removeItem($event)"
          (quantityUpdated)="updateQuantity($event.index, $event.quantity)"
          (discountUpdated)="updateDiscount($event.index, $event.discount)">
        </app-selected-products>
      </div>

      <!-- Résumé et Actions -->
      <div class="invoice-card">
        <div class="invoice-card-header gradient-blue">
          <span style="font-size: 1rem;">📊</span>
          <span class="invoice-card-header-title">Résumé</span>
        </div>
        <div style="padding: 1.5rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
            <div>
              <div style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280;">Sous-total:</span>
                <span style="font-weight: 600; color: #111827;">{{ getSubtotal() | number:'1.3-3' }} DNT</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280;">Remise globale (%):</span>
                <input type="number" [(ngModel)]="globalDiscount" (ngModelChange)="calculateTotal()" min="0" max="100" step="0.1"
                       style="width: 100px; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem;">
              </div>
              <div *ngIf="applyTva" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280;">Total HT:</span>
                <span style="font-weight: 600; color: #111827;">{{ getTotalHT() | number:'1.3-3' }} DNT</span>
              </div>
              <div *ngIf="applyTva" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280;">TVA (19%):</span>
                <span style="font-weight: 600; color: #3b82f6;">{{ getTVA() | number:'1.3-3' }} DNT</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 1rem 0; font-size: 1.25rem; font-weight: 700; color: #111827;">
                <span>{{ applyTva ? 'TOTAL TTC:' : 'TOTAL:' }}</span>
                <span style="color: #22c55e;">{{ getTotalAmount() | number:'1.3-3' }} DNT</span>
              </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 1rem; justify-content: center;">
              <button (click)="createDeliveryNote()" [disabled]="!canCreate()" 
                      [class.disabled]="!canCreate()"
                      style="padding: 1rem; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; font-size: 1rem; transition: all 0.3s;">
                ✅ Créer le Bon de Livraison
              </button>
              <a routerLink="/delivery-notes/list" 
                 style="padding: 1rem; background: #f3f4f6; color: #374151; border: none; border-radius: 0.5rem; font-weight: 600; text-align: center; text-decoration: none; transition: all 0.3s;">
                ← Annuler
              </a>
            </div>
          </div>
          
          <div *ngIf="errorMessage" style="margin-top: 1rem; padding: 1rem; background: #fee2e2; color: #dc2626; border-radius: 0.5rem; border-left: 4px solid #dc2626;">
            {{ errorMessage }}
          </div>
          <div *ngIf="successMessage" style="margin-top: 1rem; padding: 1rem; background: #d1fae5; color: #065f46; border-radius: 0.5rem; border-left: 4px solid #10b981;">
            {{ successMessage }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .disabled {
      opacity: 0.5;
      cursor: not-allowed !important;
    }
    
    .stock-error {
      border-color: #dc2626 !important;
      background: #fee2e2 !important;
    }

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
      width: fit-content;
    }

    .tva-toggle-label:hover {
      border-color: rgb(34 197 94);
      box-shadow: 0 2px 8px rgb(34 197 94 / 0.1);
    }

    .toggle-switch {
      position: relative;
      width: 3rem;
      height: 1.625rem;
      flex-shrink: 0;
    }

    .toggle-input {
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

    .toggle-switch.active .toggle-slider {
      background: linear-gradient(135deg, rgb(34 197 94), rgb(22 163 74));
    }

    .toggle-switch.active .toggle-slider::before {
      transform: translateX(1.375rem);
    }

    .toggle-text {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .toggle-title {
      font-size: 0.8125rem;
      font-weight: 500;
      color: rgb(55 65 81);
    }

    .toggle-rate {
      font-size: 0.75rem;
      font-weight: 700;
      color: rgb(156 163 175);
      transition: color 0.2s ease;
    }

    .toggle-rate.active {
      color: rgb(34 197 94);
    }
  `]
})
export class DeliveryNoteCreateComponent implements OnInit {
  customers: Customer[] = [];
  products: Product[] = [];
  deliveryItems: DeliveryLineItem[] = [];
  
  selectedCustomerId: any = '';
  deliveryDate: string = '';
  deliveryAddress: string = '';
  notes: string = '';
  globalDiscount: number = 0;
  applyTva: boolean = false;
  
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
    this.loadProducts();
    this.deliveryDate = new Date().toISOString().split('T')[0];
  }

  loadCustomers(): void {
    this.apiService.getCustomers().subscribe({
      next: (data: any[]) => {
        // L'API retourne CustomerWithStatsDTO: {customer: {...}, totalCA, unpaidAmount}
        this.customers = data.map((item: any) => item.customer || item);
      },
      error: (error: any) => {
        console.error('Error loading customers:', error);
        this.errorMessage = 'Erreur lors du chargement des clients';
      }
    });
  }

  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (data: any[]) => {
        // Map API response to local Product interface
        this.products = data.map(p => ({
          idProduct: p.idProduct,
          reference: p.reference,
          name: p.name,
          unitPriceSold: p.unitPriceSold,
          quantity: p.currentStockQuantity, // Map currentStockQuantity to quantity
          imageUrl: p.imageUrl
        }));
      },
      error: (error: any) => {
        console.error('Error loading products:', error);
        this.errorMessage = 'Erreur lors du chargement des produits';
      }
    });
  }

  onCustomerChange(): void {
    const customer = this.customers.find(c => c.customerId == this.selectedCustomerId);
    if (customer && customer.address) {
      this.deliveryAddress = customer.address;
    }
  }

  getReservedQuantities(): Map<number, number> {
    const reserved = new Map<number, number>();
    this.deliveryItems.forEach(item => {
      reserved.set(item.productId, item.quantity);
    });
    return reserved;
  }

  addProductToDelivery(product: Product): void {
    const productId = product.idProduct ?? product.productId ?? 0;
    const unitPrice = product.unitPriceSold ?? product.unitPrice ?? 0;
    const quantity = product.quantity ?? product.stock ?? 0;
    
    const existing = this.deliveryItems.find(item => item.productId === productId);
    if (existing) {
      if (existing.quantity < quantity) {
        existing.quantity++;
        this.calculateItemTotal(existing);
      }
    } else {
      const newItem: DeliveryLineItem = {
        productId: productId,
        productName: product.name,
        reference: product.reference,
        unitPrice: unitPrice,
        quantity: 1,
        discount: 0,
        totalPrice: unitPrice,
        maxStock: quantity
      };
      this.deliveryItems.push(newItem);
    }
  }

  removeItem(index: number): void {
    this.deliveryItems.splice(index, 1);
  }

  updateQuantity(index: number, quantity: number): void {
    const quantityValue = isNaN(quantity) ? 1 : Math.max(1, Math.floor(quantity));
    const maxStock = this.deliveryItems[index].maxStock ?? 999999;
    
    if (quantityValue <= 0) {
      this.removeItem(index);
    } else if (quantityValue > maxStock) {
      this.deliveryItems[index].quantity = maxStock;
      this.calculateItemTotal(this.deliveryItems[index]);
    } else {
      this.deliveryItems[index].quantity = quantityValue;
      this.calculateItemTotal(this.deliveryItems[index]);
    }
  }

  updateDiscount(index: number, discount: number): void {
    const discountValue = isNaN(discount) ? 0 : Math.max(0, Math.min(100, discount));
    this.deliveryItems[index].discount = discountValue;
    this.calculateItemTotal(this.deliveryItems[index]);
  }

  getProductImagesMap(): Map<number, string> {
    const imagesMap = new Map<number, string>();
    this.products.forEach(product => {
      const productId = product.idProduct ?? product.productId ?? 0;
      imagesMap.set(productId, product.imageUrl || '/placeholder.svg');
    });
    return imagesMap;
  }

  calculateItemTotal(item: DeliveryLineItem): void {
    let total = item.unitPrice * item.quantity;
    if (item.discount > 0) {
      total = total * (1 - item.discount / 100);
    }
    item.totalPrice = total;
  }

  getSubtotal(): number {
    return this.deliveryItems.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  calculateTotal(): void {
    // Trigger recalculation
  }

  getTotalHT(): number {
    let total = this.getSubtotal();
    if (this.globalDiscount > 0) {
      total = total * (1 - this.globalDiscount / 100);
    }
    return total;
  }

  getTVA(): number {
    return this.applyTva ? this.getTotalHT() * 0.19 : 0;
  }

  getTotalAmount(): number {
    return this.getTotalHT() + this.getTVA();
  }

  canCreate(): boolean {
    return this.selectedCustomerId && 
           this.deliveryDate && 
           this.deliveryItems.length > 0 &&
           !this.deliveryItems.some(item => item.quantity > (item.maxStock ?? 0));
  }

  createDeliveryNote(): void {
    if (!this.canCreate()) {
      return;
    }

    // Convert date to ISO string without timezone for LocalDateTime
    const deliveryDateTime = new Date(this.deliveryDate);
    const isoDate = deliveryDateTime.toISOString().slice(0, 19); // Remove timezone part

    const deliveryNoteData = {
      customerId: Number(this.selectedCustomerId),
      dateDelivery: isoDate,
      deliveryAddress: this.deliveryAddress,
      notes: this.notes,
      discount: this.globalDiscount,
      applyTva: this.applyTva,
      products: this.deliveryItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount
      }))
    };

    console.log('Sending delivery note data:', deliveryNoteData);

    this.apiService.createDeliveryNote(deliveryNoteData).subscribe({
      next: (response: any) => {
        this.successMessage = 'Bon de livraison créé avec succès!';
        setTimeout(() => {
          this.router.navigate(['/delivery-notes/list']);
        }, 1500);
      },
      error: (error: any) => {
        console.error('Error creating delivery note:', error);
        console.error('Error details:', error.error);
        this.errorMessage = error.error?.message || 'Erreur lors de la création du bon de livraison';
      }
    });
  }
}
