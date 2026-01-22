import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css']
})
export class SalesComponent implements OnInit {
  sales: any[] = [];
  loading = true;
  showForm = false;

  newSale = {
    productId: '',
    quantitySold: '',
    unitSalePrice: '',
    dateSale: ''
  };

  products: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadSales();
    this.loadProducts();
  }

  loadSales(): void {
    this.apiService.getSales().subscribe({
      next: (data) => {
        this.sales = data;
        this.loading = false;
      }
    });
  }

  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (data) => this.products = data
    });
  }

  createSale(): void {
    if (!this.newSale.productId || !this.newSale.quantitySold || !this.newSale.unitSalePrice) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    this.apiService.createSale(this.newSale).subscribe({
      next: () => {
        this.showForm = false;
        this.loadSales();
        this.resetForm();
      },
      error: (err) => alert('Erreur: ' + err.message)
    });
  }

  resetForm(): void {
    this.newSale = {
      productId: '',
      quantitySold: '',
      unitSalePrice: '',
      dateSale: ''
    };
  }

  getTotalAmount(): number {
    return this.sales.reduce((sum, s) => sum + (s.totalSaleAmount || 0), 0);
  }
}
