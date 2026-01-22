import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-purchases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.css']
})
export class PurchasesComponent implements OnInit {
  purchases: any[] = [];
  loading = true;
  showForm = false;

  newPurchase = {
    supplierId: '',
    productId: '',
    quantity: '',
    unitPriceTTC: '',
    invoiceNumber: '',
    datePurchase: ''
  };

  suppliers: any[] = [];
  products: any[] = [];
  filteredProducts: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadPurchases();
    this.loadSuppliers();
    this.loadProducts();
  }

  loadPurchases(): void {
    this.apiService.getPurchases().subscribe({
      next: (data) => {
        this.purchases = data;
        this.loading = false;
      }
    });
  }

  loadSuppliers(): void {
    this.apiService.getSuppliers().subscribe({
      next: (data) => this.suppliers = data
    });
  }

  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = data; // Initialize with all products
      }
    });
  }

  onSupplierChange(): void {
    const supplierId = Number(this.newPurchase.supplierId);
    if (!supplierId) {
      this.filteredProducts = [...this.products]; // Show all products if no supplier selected
      this.newPurchase.productId = ''; // Reset product selection
      return;
    }

    this.apiService.getProductsBySupplier(supplierId).subscribe({
      next: (data) => {
        this.filteredProducts = data;
        this.newPurchase.productId = ''; // Reset product selection when supplier changes
      },
      error: () => {
        this.filteredProducts = [];
      }
    });
  }

  createPurchase(): void {
    if (!this.newPurchase.supplierId || !this.newPurchase.productId) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    this.apiService.createPurchase(this.newPurchase).subscribe({
      next: () => {
        alert('Achat créé avec succès');
        this.showForm = false;
        this.loadPurchases();
        this.resetForm();
      },
      error: (err) => alert('Erreur: ' + err.message)
    });
  }

  resetForm(): void {
    this.newPurchase = {
      supplierId: '',
      productId: '',
      quantity: '',
      unitPriceTTC: '',
      invoiceNumber: '',
      datePurchase: ''
    };
  }

  getTotalAmount(): number {
    return this.purchases.reduce((sum, p) => sum + (p.totalAmountTTC || 0), 0);
  }
}
