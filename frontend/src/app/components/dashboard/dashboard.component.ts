import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('stockChartCanvas') stockChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('salesChartCanvas') salesChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('topProductsChartCanvas') topProductsChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChartCanvas') categoryChartCanvas!: ElementRef<HTMLCanvasElement>;

  stockSummary: any[] = [];
  stockTotals: any = null;
  totalValue: number = 0;
  alerts: any[] = [];
  products: any[] = [];
  sales: any[] = [];
  purchases: any[] = [];
  loading = true;
  showTable = false;

  // Charts
  private stockChart: Chart | null = null;
  private salesChart: Chart | null = null;
  private topProductsChart: Chart | null = null;
  private categoryChart: Chart | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngAfterViewInit(): void {
    // Les charts seront créés après le chargement des données
  }

  loadDashboard(): void {
    this.loading = true;
    
    // Charger toutes les données
    this.apiService.getStockSummary().subscribe({
      next: (data) => {
        this.stockTotals = data.totals;
        this.stockSummary = data.products || [];
        this.createCharts();
      }
    });

    this.apiService.getStockTotalValue().subscribe({
      next: (data) => this.totalValue = data
    });

    this.apiService.getStockAlerts(20).subscribe({
      next: (data) => this.alerts = data
    });

    this.apiService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.createCharts();
      }
    });

    this.apiService.getSales().subscribe({
      next: (data) => {
        this.sales = data;
        this.loading = false;
        this.createCharts();
      }
    });

    this.apiService.getPurchases().subscribe({
      next: (data) => {
        this.purchases = data;
        this.createCharts();
      }
    });
  }

  getLowStockPercentage(): number {
    if (this.stockSummary.length === 0) return 0;
    const lowStock = this.stockSummary.filter(p => p.finalQuantity < 50).length;
    return Math.round((lowStock / this.stockSummary.length) * 100);
  }

  getTotalSales(): number {
    return this.sales.reduce((sum, sale) => sum + sale.totalSaleAmount, 0);
  }

  getTotalPurchases(): number {
    return this.purchases.reduce((sum, purchase) => sum + purchase.totalAmountTTC, 0);
  }

  createCharts(): void {
    // Attendre que toutes les données soient chargées
    if (this.stockSummary.length === 0 || this.sales.length === 0) {
      return;
    }

    setTimeout(() => {
      this.createStockValueChart();
      this.createSalesPurchasesChart();
      this.createTopProductsChart();
      this.createCategoryChart();
    }, 100);
  }

  createStockValueChart(): void {
    if (!this.stockChartCanvas?.nativeElement) return;

    const ctx = this.stockChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Détruire le chart existant
    if (this.stockChart) {
      this.stockChart.destroy();
    }

    // Top 10 produits par valeur de stock
    const topProducts = [...this.stockSummary]
      .sort((a, b) => b.finalStockValue - a.finalStockValue)
      .slice(0, 10);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: topProducts.map(p => p.productDesignation.substring(0, 20)),
        datasets: [{
          label: 'Valeur Stock (DNT)',
          data: topProducts.map(p => p.finalStockValue),
          backgroundColor: 'rgba(102, 126, 234, 0.8)',
          borderColor: 'rgba(102, 126, 234, 1)',
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
            text: 'Top 10 - Valeur du Stock par Produit'
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

    this.stockChart = new Chart(ctx, config);
  }

  createSalesPurchasesChart(): void {
    if (!this.salesChartCanvas?.nativeElement) return;

    const ctx = this.salesChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.salesChart) {
      this.salesChart.destroy();
    }

    // Grouper par mois
    const salesByMonth = this.groupByMonth(this.sales, 'dateSale', 'totalSaleAmount');
    const purchasesByMonth = this.groupByMonth(this.purchases, 'datePurchase', 'totalAmountTTC');

    const allMonths = [...new Set([...Object.keys(salesByMonth), ...Object.keys(purchasesByMonth)])].sort();

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: allMonths,
        datasets: [
          {
            label: 'Ventes (DNT)',
            data: allMonths.map(m => salesByMonth[m] || 0),
            borderColor: 'rgba(46, 204, 113, 1)',
            backgroundColor: 'rgba(46, 204, 113, 0.2)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Achats (DNT)',
            data: allMonths.map(m => purchasesByMonth[m] || 0),
            borderColor: 'rgba(231, 76, 60, 1)',
            backgroundColor: 'rgba(231, 76, 60, 0.2)',
            tension: 0.4,
            fill: true
          }
        ]
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
            text: 'Évolution des Ventes vs Achats'
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

    this.salesChart = new Chart(ctx, config);
  }

  createTopProductsChart(): void {
    if (!this.topProductsChartCanvas?.nativeElement) return;

    const ctx = this.topProductsChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.topProductsChart) {
      this.topProductsChart.destroy();
    }

    // Top 5 produits par quantité vendue
    const salesByProduct: { [key: string]: number } = {};
    this.sales.forEach(sale => {
      const product = sale.productDesignation;
      salesByProduct[product] = (salesByProduct[product] || 0) + sale.quantitySold;
    });

    const topSold = Object.entries(salesByProduct)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: topSold.map(p => p[0].substring(0, 25)),
        datasets: [{
          label: 'Quantité Vendue',
          data: topSold.map(p => p[1]),
          backgroundColor: [
            'rgba(102, 126, 234, 0.8)',
            'rgba(46, 204, 113, 0.8)',
            'rgba(231, 76, 60, 0.8)',
            'rgba(241, 196, 15, 0.8)',
            'rgba(155, 89, 182, 0.8)'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'right'
          },
          title: {
            display: true,
            text: 'Top 5 - Produits les Plus Vendus'
          }
        }
      }
    };

    this.topProductsChart = new Chart(ctx, config);
  }

  createCategoryChart(): void {
    if (!this.categoryChartCanvas?.nativeElement) return;

    const ctx = this.categoryChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.categoryChart) {
      this.categoryChart.destroy();
    }

    // Répartition par catégorie
    const categoryData: { [key: string]: number } = {};
    this.products.forEach(product => {
      const category = product.category || 'Non catégorisé';
      categoryData[category] = (categoryData[category] || 0) + 1;
    });

    const config: ChartConfiguration = {
      type: 'pie',
      data: {
        labels: Object.keys(categoryData),
        datasets: [{
          label: 'Nombre de Produits',
          data: Object.values(categoryData),
          backgroundColor: [
            'rgba(102, 126, 234, 0.8)',
            'rgba(46, 204, 113, 0.8)',
            'rgba(231, 76, 60, 0.8)',
            'rgba(241, 196, 15, 0.8)',
            'rgba(155, 89, 182, 0.8)',
            'rgba(52, 152, 219, 0.8)',
            'rgba(230, 126, 34, 0.8)'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'right'
          },
          title: {
            display: true,
            text: 'Répartition des Produits par Catégorie'
          }
        }
      }
    };

    this.categoryChart = new Chart(ctx, config);
  }

  groupByMonth(data: any[], dateField: string, amountField: string): { [key: string]: number } {
    const grouped: { [key: string]: number } = {};
    
    data.forEach(item => {
      const date = new Date(item[dateField]);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      grouped[monthKey] = (grouped[monthKey] || 0) + item[amountField];
    });

    return grouped;
  }

  toggleTable(): void {
    this.showTable = !this.showTable;
  }
}
