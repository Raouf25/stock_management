import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-purchases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.css']
})
export class PurchasesComponent implements OnInit, AfterViewInit {
  @ViewChild('purchasesTrendChart') purchasesTrendChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('supplierChart') supplierChart!: ElementRef<HTMLCanvasElement>;
  
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
  
  // Charts
  private trendChart: Chart | null = null;
  private supplChart: Chart | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadPurchases();
    this.loadSuppliers();
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    // Charts will be created after data loads
  }

  loadPurchases(): void {
    this.apiService.getPurchases().subscribe({
      next: (data) => {
        this.purchases = data;
        this.loading = false;
        this.createCharts();
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
    this.filteredProducts = [...this.products];
  }

  getTotalAmount(): number {
    return this.purchases.reduce((sum, p) => sum + (p.totalAmountTTC || 0), 0);
  }

  getTotalQuantity(): number {
    return this.purchases.reduce((sum, p) => sum + (p.quantity || 0), 0);
  }

  getAveragePrice(): number {
    if (this.purchases.length === 0) return 0;
    const total = this.purchases.reduce((sum, p) => sum + (p.unitPriceTTC || 0), 0);
    return total / this.purchases.length;
  }

  createCharts(): void {
    if (this.purchases.length === 0) return;

    setTimeout(() => {
      this.createPurchasesTrendChart();
      this.createSupplierChart();
    }, 100);
  }

  createPurchasesTrendChart(): void {
    if (!this.purchasesTrendChart?.nativeElement) return;

    const ctx = this.purchasesTrendChart.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.trendChart) {
      this.trendChart.destroy();
    }

    // Group purchases by month
    const purchasesByMonth: { [key: string]: { amount: number, quantity: number } } = {};
    
    this.purchases.forEach(purchase => {
      const date = new Date(purchase.datePurchase);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!purchasesByMonth[monthKey]) {
        purchasesByMonth[monthKey] = { amount: 0, quantity: 0 };
      }
      
      purchasesByMonth[monthKey].amount += purchase.totalAmountTTC || 0;
      purchasesByMonth[monthKey].quantity += purchase.quantity || 0;
    });

    const months = Object.keys(purchasesByMonth).sort();

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Montant (DNT)',
            data: months.map(m => purchasesByMonth[m].amount),
            borderColor: 'rgba(231, 76, 60, 1)',
            backgroundColor: 'rgba(231, 76, 60, 0.2)',
            yAxisID: 'y',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Quantité Achetée',
            data: months.map(m => purchasesByMonth[m].quantity),
            borderColor: 'rgba(52, 152, 219, 1)',
            backgroundColor: 'rgba(52, 152, 219, 0.2)',
            yAxisID: 'y1',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          title: {
            display: true,
            text: 'Évolution des Achats Mensuels'
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            ticks: {
              callback: function(value) {
                return value.toLocaleString() + ' DNT';
              }
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
              drawOnChartArea: false,
            },
          },
        }
      }
    };

    this.trendChart = new Chart(ctx, config);
  }

  createSupplierChart(): void {
    if (!this.supplierChart?.nativeElement) return;

    const ctx = this.supplierChart.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.supplChart) {
      this.supplChart.destroy();
    }

    // Group by supplier
    const purchasesBySupplier: { [key: string]: number } = {};
    
    this.purchases.forEach(purchase => {
      const supplier = purchase.supplierName;
      purchasesBySupplier[supplier] = (purchasesBySupplier[supplier] || 0) + (purchase.totalAmountTTC || 0);
    });

    const topSuppliers = Object.entries(purchasesBySupplier)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: topSuppliers.map(s => s[0]),
        datasets: [{
          label: 'Montant des Achats (DNT)',
          data: topSuppliers.map(s => s[1]),
          backgroundColor: 'rgba(231, 76, 60, 0.8)',
          borderColor: 'rgba(231, 76, 60, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          title: {
            display: true,
            text: 'Top 10 - Achats par Fournisseur'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value.toLocaleString() + ' DNT';
              }
            }
          }
        }
      }
    };

    this.supplChart = new Chart(ctx, config);
  }
}
