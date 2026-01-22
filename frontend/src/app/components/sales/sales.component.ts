import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css']
})
export class SalesComponent implements OnInit, AfterViewInit {
  @ViewChild('salesTrendChart') salesTrendChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('topProductsChart') topProductsChart!: ElementRef<HTMLCanvasElement>;
  
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
  
  // Charts
  private trendChart: Chart | null = null;
  private productsChart: Chart | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadSales();
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    // Charts will be created after data loads
  }

  loadSales(): void {
    this.apiService.getSales().subscribe({
      next: (data) => {
        this.sales = data;
        this.loading = false;
        this.createCharts();
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
  getTotalQuantity(): number {
    return this.sales.reduce((sum, sale) => sum + sale.quantitySold, 0);
  }

  getAveragePrice(): number {
    if (this.sales.length === 0) return 0;
    const total = this.sales.reduce((sum, sale) => sum + sale.unitSalePrice, 0);
    return total / this.sales.length;
  }

  createCharts(): void {
    if (this.sales.length === 0) return;

    setTimeout(() => {
      this.createSalesTrendChart();
      this.createTopProductsChart();
    }, 100);
  }

  createSalesTrendChart(): void {
    if (!this.salesTrendChart?.nativeElement) return;

    const ctx = this.salesTrendChart.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.trendChart) {
      this.trendChart.destroy();
    }

    // Group sales by month
    const salesByMonth: { [key: string]: { amount: number, quantity: number } } = {};
    
    this.sales.forEach(sale => {
      const date = new Date(sale.dateSale);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!salesByMonth[monthKey]) {
        salesByMonth[monthKey] = { amount: 0, quantity: 0 };
      }
      
      salesByMonth[monthKey].amount += sale.totalSaleAmount;
      salesByMonth[monthKey].quantity += sale.quantitySold;
    });

    const months = Object.keys(salesByMonth).sort();

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Montant (DNT)',
            data: months.map(m => salesByMonth[m].amount),
            borderColor: 'rgba(46, 204, 113, 1)',
            backgroundColor: 'rgba(46, 204, 113, 0.2)',
            yAxisID: 'y',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Quantité Vendue',
            data: months.map(m => salesByMonth[m].quantity),
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
            text: 'Évolution des Ventes Mensuelles'
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

  createTopProductsChart(): void {
    if (!this.topProductsChart?.nativeElement) return;

    const ctx = this.topProductsChart.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.productsChart) {
      this.productsChart.destroy();
    }

    // Group by product
    const salesByProduct: { [key: string]: { amount: number, quantity: number } } = {};
    
    this.sales.forEach(sale => {
      const product = sale.productDesignation;
      if (!salesByProduct[product]) {
        salesByProduct[product] = { amount: 0, quantity: 0 };
      }
      salesByProduct[product].amount += sale.totalSaleAmount;
      salesByProduct[product].quantity += sale.quantitySold;
    });

    const topProducts = Object.entries(salesByProduct)
      .sort((a, b) => b[1].amount - a[1].amount)
      .slice(0, 10);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: topProducts.map(p => p[0].substring(0, 20)),
        datasets: [{
          label: 'Montant des Ventes (DNT)',
          data: topProducts.map(p => p[1].amount),
          backgroundColor: 'rgba(46, 204, 113, 0.8)',
          borderColor: 'rgba(46, 204, 113, 1)',
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
            text: 'Top 10 - Produits les Plus Vendus (Montant)'
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

    this.productsChart = new Chart(ctx, config);
  }}
