import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  loading = true;
  searchText = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.apiService.getProducts().subscribe({
      next: (data) => {
        console.log('Produits reçus:', data?.length || 0, 'produits');
        console.log('Premier produit:', data?.[0]);
        this.products = data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des produits:', err);
        this.products = [];
        this.loading = false;
      }
    });
  }

  getFilteredProducts(): any[] {
    if (!this.searchText) {
      return this.products;
    }
    return this.products.filter(p =>
      p.designation && p.designation.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  getTotalStock(): number {
    return this.products.reduce((sum, p) => sum + (p.currentStockQuantity || 0), 0);
  }

  getTotalValue(): number {
    return this.products.reduce((sum, p) => sum + (p.currentStockValue || 0), 0);
  }
}
