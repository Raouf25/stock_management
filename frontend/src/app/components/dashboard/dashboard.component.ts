import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-full bg-slate-50">
      <div class="p-4 sm:p-6 lg:p-8">
        <!-- Header -->
        <div class="mb-6">
          <h1 class="flex items-center gap-2 text-2xl font-bold text-gray-800 sm:text-3xl">
            <span class="text-2xl">📊</span>
            <span class="dashboard-gradient-text">Dashboard Facturation</span>
          </h1>
        </div>

        <!-- Stats Cards - Compact -->
        <div class="mb-6 grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
          <!-- Total Factures -->
          <div class="stat-card border-t-blue">
            <div class="stat-content">
              <div class="stat-icon-wrapper bg-gray-100 hidden sm:flex">
                <svg class="stat-icon text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <p class="stat-value">{{ invoiceKPIs.totalInvoices || 0 }}</p>
              <p class="stat-label">TOTAL FACTURES</p>
            </div>
          </div>

          <!-- Chiffre d'Affaires -->
          <div class="stat-card border-t-green">
            <div class="stat-content">
              <div class="stat-icon-wrapper bg-amber-100 hidden sm:flex">
                <svg class="stat-icon text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <p class="stat-value">{{ invoiceKPIs.totalInvoicedAmount || 0 | number: '1.0-0' }}</p>
              <p class="stat-label">CHIFFRE D'AFFAIRES (DNT)</p>
            </div>
          </div>

          <!-- Factures Impayées -->
          <div class="stat-card border-t-red">
            <div class="stat-content">
              <div class="stat-icon-wrapper bg-amber-100 hidden sm:flex">
                <svg class="stat-icon text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <p class="stat-value">{{ invoiceKPIs.unpaidInvoices || 0 }}</p>
              <p class="stat-label">FACTURES IMPAYEES</p>
            </div>
          </div>

          <!-- Ce Mois -->
          <div class="stat-card border-t-purple">
            <div class="stat-content">
              <div class="stat-icon-wrapper bg-red-100 hidden sm:flex">
                <svg class="stat-icon text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <p class="stat-value">{{ invoiceKPIs.thisMonthInvoices || 0 }}</p>
              <p class="stat-label">CE MOIS</p>
            </div>
          </div>
        </div>

        <!-- Statuts & Resume -->
        <div class="grid gap-4 lg:grid-cols-2">
          <!-- Statuts de Paiement -->
          <div class="card-container">
            <div class="card-header gradient-purple">
              <svg class="card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              <span class="card-title">Statuts de Paiement</span>
            </div>
            <div class="card-body">
              <div class="status-list">
                <div class="status-item">
                  <span class="status-badge bg-amber-500">Partiellement Payé</span>
                  <span class="status-count">{{ invoiceKPIs.partiallyPaidInvoices || 0 }}</span>
                </div>
                <div class="status-item">
                  <span class="status-badge bg-emerald-500">Payé</span>
                  <span class="status-count">{{ invoiceKPIs.paidInvoices || 0 }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Resume Financier -->
          <div class="card-container">
            <div class="card-header gradient-green">
              <svg class="card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
              <span class="card-title">Résumé Financier</span>
            </div>
            <div class="card-body p-3 sm:p-4">
              <div class="grid grid-cols-2 gap-3 sm:gap-4">
                <div class="text-center">
                  <p class="financial-value">{{ invoiceKPIs.thisMonthAmount || 0 | number: '1.0-0' }}</p>
                  <p class="financial-label">CA ce Mois (DNT)</p>
                </div>
                <div class="text-center">
                  <p class="financial-value text-red-500">{{ invoiceKPIs.totalAmountDue || 0 | number: '1.0-0' }}</p>
                  <p class="financial-label">Total Dû (DNT)</p>
                </div>
              </div>
              <div class="financial-separator">
                <p class="financial-average">{{ getAverageBasket() | number: '1.0-0' }}</p>
                <p class="financial-average-label">Panier Moyen (DNT)</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section (old dashboard) -->
        <div class="mt-8 grid gap-4 lg:grid-cols-2">
          <!-- Stock Chart -->
          <div class="card-container">
            <div class="card-header gradient-blue">
              <svg class="card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              <span class="card-title">Valeur du Stock</span>
            </div>
            <div class="card-body">
              <div class="chart-wrapper">
                <canvas #stockChartCanvas></canvas>
              </div>
            </div>
          </div>

          <!-- Sales Chart -->
          <div class="card-container">
            <div class="card-header gradient-purple">
              <svg class="card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
              </svg>
              <span class="card-title">Ventes vs Achats</span>
            </div>
            <div class="card-body">
              <div class="chart-wrapper">
                <canvas #salesChartCanvas></canvas>
              </div>
            </div>
          </div>

          <!-- Top Products Chart -->
          <div class="card-container">
            <div class="card-header gradient-green">
              <svg class="card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/>
              </svg>
              <span class="card-title">Top 5 Produits</span>
            </div>
            <div class="card-body">
              <div class="chart-wrapper">
                <canvas #topProductsChartCanvas></canvas>
              </div>
            </div>
          </div>

          <!-- Category Chart -->
          <div class="card-container">
            <div class="card-header gradient-orange">
              <svg class="card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
              </svg>
              <span class="card-title">Catégories</span>
            </div>
            <div class="card-body">
              <div class="chart-wrapper">
                <canvas #categoryChartCanvas></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .min-h-full {
      min-height: 100vh;
    }

    .bg-slate-50 {
      background-color: rgb(248 250 252);
    }

    .p-4 { padding: 1rem; }
    .p-3 { padding: 0.75rem; }
    .sm\\:p-4 { padding: 1rem; }
    .sm\\:p-6 { padding: 1.5rem; }
    .lg\\:p-8 { padding: 2rem; }

    .mb-6 { margin-bottom: 1.5rem; }
    .mt-8 { margin-top: 2rem; }

    .flex { display: flex; }
    .items-center { align-items: center; }
    .gap-2 { gap: 0.5rem; }
    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }

    .text-2xl { font-size: 1.5rem; line-height: 2rem; }
    .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
    .font-bold { font-weight: 700; }
    .text-gray-800 { color: rgb(31 41 55); }

    .dashboard-gradient-text {
      background: linear-gradient(to right, rgb(79 70 229), rgb(124 58 237));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Grid System */
    .grid { display: grid; }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }

    /* Stats Cards */
    .stat-card {
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      border-top: 3px solid;
    }

    .border-t-blue { border-top-color: rgb(96 165 250); }
    .border-t-green { border-top-color: rgb(74 222 128); }
    .border-t-red { border-top-color: rgb(248 113 113); }
    .border-t-purple { border-top-color: rgb(192 132 252); }

    .stat-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.75rem;
    }

    .stat-icon-wrapper {
      margin-bottom: 0.5rem;
      border-radius: 9999px;
      padding: 0.5rem;
      display: none;
    }

    .bg-gray-100 { background-color: rgb(243 244 246); }
    .bg-amber-100 { background-color: rgb(254 243 199); }
    .bg-red-100 { background-color: rgb(254 226 226); }

    .stat-icon {
      width: 1.25rem;
      height: 1.25rem;
    }

    .text-gray-600 { color: rgb(75 85 99); }
    .text-amber-600 { color: rgb(217 119 6); }
    .text-red-600 { color: rgb(220 38 38); }

    .stat-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: rgb(17 24 39);
      margin: 0;
    }

    .stat-label {
      text-align: center;
      font-size: 0.563rem;
      font-weight: 500;
      color: rgb(107 114 128);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0;
    }

    /* Card Containers */
    .card-container {
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      border: none;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
    }

    .gradient-purple {
      background: linear-gradient(to right, rgb(99 102 241), rgb(139 92 246));
    }

    .gradient-green {
      background: linear-gradient(to right, rgb(34 197 94), rgb(74 222 128));
    }

    .gradient-blue {
      background: linear-gradient(to right, rgb(59 130 246), rgb(96 165 250));
    }

    .gradient-orange {
      background: linear-gradient(to right, rgb(249 115 22), rgb(251 146 60));
    }

    .card-icon {
      width: 1rem;
      height: 1rem;
      color: white;
    }

    .card-title {
      font-size: 0.875rem;
      font-weight: 500;
      color: white;
    }

    .card-body {
      padding: 0;
    }

    /* Status List */
    .status-list {
      border-top: 1px solid rgb(229 231 235);
    }

    .status-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem;
      border-bottom: 1px solid rgb(229 231 235);
    }

    .status-item:last-child {
      border-bottom: none;
    }

    .status-badge {
      color: white;
      font-size: 0.75rem;
      padding: 0.25rem 0.75rem;
      border-radius: 0.25rem;
    }

    .bg-amber-500 { background-color: rgb(245 158 11); }
    .bg-emerald-500 { background-color: rgb(16 185 129); }

    .status-count {
      font-size: 1.125rem;
      font-weight: 600;
      color: rgb(55 65 81);
    }

    /* Financial Summary */
    .financial-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: rgb(17 24 39);
      margin: 0;
    }

    .financial-label {
      font-size: 0.625rem;
      color: rgb(107 114 128);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0.25rem 0 0;
    }

    .financial-separator {
      margin-top: 1rem;
      border-top: 1px solid rgb(229 231 235);
      padding-top: 1rem;
      text-align: center;
    }

    .financial-average {
      font-size: 1.5rem;
      font-weight: 700;
      color: rgb(16 185 129);
      margin: 0;
    }

    .financial-average-label {
      font-size: 0.75rem;
      color: rgb(107 114 128);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0.25rem 0 0;
    }

    .text-center { text-align: center; }
    .text-red-500 { color: rgb(239 68 68); }

    /* Chart Wrapper */
    .chart-wrapper {
      padding: 1rem;
      height: 300px;
      position: relative;
    }

    /* Responsive */
    @media (min-width: 640px) {
      .sm\\:p-4 { padding: 1rem; }
      .sm\\:p-6 { padding: 1.5rem; }
      .sm\\:gap-4 { gap: 1rem; }
      .sm\\:text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
      .sm\\:flex { display: flex; }
      
      .stat-icon-wrapper.hidden.sm\\:flex {
        display: flex;
      }

      .stat-value {
        font-size: 1.5rem;
      }

      .stat-label {
        font-size: 0.75rem;
      }

      .card-header {
        padding: 0.75rem 1rem;
      }

      .card-icon {
        width: 1.25rem;
        height: 1.25rem;
      }

      .card-title {
        font-size: 1rem;
      }

      .status-item {
        padding: 1rem;
      }

      .status-badge {
        font-size: 0.875rem;
      }

      .status-count {
        font-size: 1.25rem;
      }

      .financial-value {
        font-size: 1.5rem;
      }

      .financial-label {
        font-size: 0.75rem;
      }

      .financial-average {
        font-size: 1.875rem;
      }

      .financial-average-label {
        font-size: 0.875rem;
      }
    }

    @media (min-width: 1024px) {
      .lg\\:p-8 { padding: 2rem; }
      .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .lg\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
  `]
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
  invoiceKPIs: any = {};
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
      next: (data) => {
        // L'API retourne un objet avec une propriété totalValue
        this.totalValue = typeof data === 'number' ? data : (data?.totalValue || 0);
      }
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

    this.apiService.getInvoiceKPIs().subscribe({
      next: (data) => {
        // S'assurer que les valeurs numériques sont des nombres
        this.invoiceKPIs = {
          totalInvoicedAmount: typeof data?.totalInvoicedAmount === 'number' ? data.totalInvoicedAmount : 0,
          totalAmountDue: typeof data?.totalAmountDue === 'number' ? data.totalAmountDue : 0,
          ...data
        };
      }
    });
  }

  getLowStockPercentage(): number {
    if (this.stockSummary.length === 0) return 0;
    const lowStock = this.stockSummary.filter(p => p.finalQuantity < 50).length;
    return Math.round((lowStock / this.stockSummary.length) * 100);
  }

  getTotalSales(): number {
    if (!Array.isArray(this.sales)) return 0;
    return this.sales.reduce((sum, sale) => {
      const amount = sale?.totalSaleAmount || 0;
      return sum + (typeof amount === 'number' ? amount : 0);
    }, 0);
  }

  getTotalPurchases(): number {
    if (!Array.isArray(this.purchases)) return 0;
    return this.purchases.reduce((sum, purchase) => {
      const amount = purchase?.totalAmountTTC || 0;
      return sum + (typeof amount === 'number' ? amount : 0);
    }, 0);
  }

  createCharts(): void {
    // Attendre que toutes les données soient chargées
    if (this.stockSummary.length === 0 || this.sales.length === 0 || this.products.length === 0) {
      console.log('Données incomplètes pour créer les graphiques:', {
        stockSummary: this.stockSummary.length,
        sales: this.sales.length,
        products: this.products.length
      });
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

    // Vérifier si des ventes existent
    if (!this.sales || this.sales.length === 0) {
      console.log('Aucune vente disponible pour le graphique Top 5');
      return;
    }

    // Top 5 produits par montant des ventes (revenus)
    const salesByProduct: { [key: string]: { quantity: number, amount: number } } = {};
    this.sales.forEach(sale => {
      const product = sale.productDesignation || 'Produit Inconnu';
      if (product && sale.quantitySold && sale.totalSaleAmount) {
        if (!salesByProduct[product]) {
          salesByProduct[product] = { quantity: 0, amount: 0 };
        }
        salesByProduct[product].quantity += sale.quantitySold;
        salesByProduct[product].amount += sale.totalSaleAmount;
      }
    });

    const topSold = Object.entries(salesByProduct)
      .sort((a, b) => b[1].amount - a[1].amount)
      .slice(0, 5);

    // Vérifier s'il y a des données
    if (topSold.length === 0) {
      console.log('Aucun produit vendu trouvé');
      return;
    }

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: topSold.map(p => p[0].substring(0, 25)),
        datasets: [{
          label: 'Montant des Ventes (DNT)',
          data: topSold.map(p => p[1].amount),
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
            text: 'Top 5 - Produits les Plus Vendus (par Revenus)'
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

  getAverageBasket(): number {
    const total = this.invoiceKPIs.totalInvoicedAmount || 0;
    const count = this.invoiceKPIs.totalInvoices || 1;
    return total / count;
  }

  toggleTable(): void {
    this.showTable = !this.showTable;
  }
}
