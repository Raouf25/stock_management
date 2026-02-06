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
    <div class="invoice-page-container">
      
      <!-- Header - Responsive -->
      <div class="invoice-page-header">
        <span style="font-size: 2rem;">📊</span>
        <h1 class="invoice-page-title">Dashboard Facturation</h1>
      </div>

        <!-- Stats Cards - Compact 2 cols mobile, 4 cols desktop -->
        <div class="invoice-stats-grid">
          <!-- Total Factures -->
          <div class="invoice-stat-card border-blue">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <div class="stat-icon-desktop" style="display: none; width: 2.5rem; height: 2.5rem; background: #f3f4f6; border-radius: 9999px; padding: 0.5rem; align-items: center; justify-content: center;">
                <svg style="width: 1.25rem; height: 1.25rem; color: #4b5563;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div style="flex: 1; min-width: 0; text-align: center;" class="stat-text">
                <p style="font-size: 1.125rem; font-weight: 700; color: #111827; margin: 0; line-height: 1.2;">{{ invoiceKPIs.totalInvoices || 0 }}</p>
                <p style="font-size: 0.625rem; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0.125rem 0 0; letter-spacing: 0.025em;">Total Factures</p>
              </div>
            </div>
          </div>

          <!-- Chiffre d'Affaires -->
          <div class="invoice-stat-card border-green">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <div class="stat-icon-desktop" style="display: none; width: 2.5rem; height: 2.5rem; background: #fef3c7; border-radius: 9999px; padding: 0.5rem; align-items: center; justify-content: center;">
                <svg style="width: 1.25rem; height: 1.25rem; color: #d97706;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div style="flex: 1; min-width: 0; text-align: center;" class="stat-text">
                <p style="font-size: 1.125rem; font-weight: 700; color: #111827; margin: 0; line-height: 1.2;">{{ invoiceKPIs.totalInvoicedAmount || 0 | number: '1.0-0' }}</p>
                <p style="font-size: 0.625rem; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0.125rem 0 0; letter-spacing: 0.025em;">CA Total (DNT)</p>
              </div>
            </div>
          </div>

          <!-- Factures Impayées -->
          <div class="invoice-stat-card border-red">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <div class="stat-icon-desktop" style="display: none; width: 2.5rem; height: 2.5rem; background: #fef3c7; border-radius: 9999px; padding: 0.5rem; align-items: center; justify-content: center;">
                <svg style="width: 1.25rem; height: 1.25rem; color: #d97706;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <div style="flex: 1; min-width: 0; text-align: center;" class="stat-text">
                <p style="font-size: 1.125rem; font-weight: 700; color: #111827; margin: 0; line-height: 1.2;">{{ invoiceKPIs.unpaidInvoices || 0 }}</p>
                <p style="font-size: 0.625rem; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0.125rem 0 0; letter-spacing: 0.025em;">Impayées</p>
              </div>
            </div>
          </div>

          <!-- Ce Mois -->
          <div class="invoice-stat-card border-orange">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <div class="stat-icon-desktop" style="display: none; width: 2.5rem; height: 2.5rem; background: #fee2e2; border-radius: 9999px; padding: 0.5rem; align-items: center; justify-content: center;">
                <svg style="width: 1.25rem; height: 1.25rem; color: #dc2626;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <div style="flex: 1; min-width: 0; text-align: center;" class="stat-text">
                <p style="font-size: 1.125rem; font-weight: 700; color: #111827; margin: 0; line-height: 1.2;">{{ invoiceKPIs.invoicesThisMonth || 0 }}</p>
                <p style="font-size: 0.625rem; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0.125rem 0 0; letter-spacing: 0.025em;">Ce Mois</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Statuts & Resume - 1 col mobile, 2 cols desktop -->
        <div class="invoice-info-grid">
          <!-- Statuts de Paiement -->
          <div class="invoice-card">
            <div class="invoice-card-header gradient-purple">
              <svg class="invoice-card-header-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              <span class="invoice-card-header-title">Statuts de Paiement</span>
            </div>
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border-bottom: 1px solid #e5e7eb;">
                <span style="color: white; font-size: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 0.25rem; background: #f59e0b;">Partiellement Payé</span>
                <span style="font-size: 1.125rem; font-weight: 600; color: #374151;">{{ invoiceKPIs.paymentStatusDistribution?.PARTIALLY_PAID || 0 }}</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border-bottom: 1px solid #e5e7eb;">
                <span style="color: white; font-size: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 0.25rem; background: #10b981;">Payé</span>
                <span style="font-size: 1.125rem; font-weight: 600; color: #374151;">{{ invoiceKPIs.paymentStatusDistribution?.PAID || 0 }}</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem;">
                <span style="color: white; font-size: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 0.25rem; background: #ef4444;">Impayé</span>
                <span style="font-size: 1.125rem; font-weight: 600; color: #374151;">{{ invoiceKPIs.paymentStatusDistribution?.UNPAID || 0 }}</span>
              </div>
            </div>
          </div>

          <!-- Resume Financier -->
          <div class="invoice-card">
            <div class="invoice-card-header gradient-green">
              <svg class="invoice-card-header-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
              <span class="invoice-card-header-title">Résumé Financier</span>
            </div>
            <div style="padding: 0.75rem 1rem;">
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-bottom: 0.75rem;">
                <div style="text-align: center;">
                  <p style="font-size: 1.25rem; font-weight: 700; color: #111827; margin: 0;">{{ invoiceKPIs.revenueThisMonth || 0 | number: '1.0-0' }}</p>
                  <p style="font-size: 0.625rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.025em; margin: 0.25rem 0 0;">CA ce Mois (DNT)</p>
                </div>
                <div style="text-align: center;">
                  <p style="font-size: 1.25rem; font-weight: 700; color: #ef4444; margin: 0;">{{ invoiceKPIs.totalAmountDue || 0 | number: '1.0-0' }}</p>
                  <p style="font-size: 0.625rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.025em; margin: 0.25rem 0 0;">Total Dû (DNT)</p>
                </div>
              </div>
              <div style="border-top: 1px solid #e5e7eb; padding-top: 0.75rem; text-align: center;">
                <p style="font-size: 1.5rem; font-weight: 700; color: #10b981; margin: 0;">{{ getAverageBasket() | number: '1.0-0' }}</p>
                <p style="font-size: 0.75rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.025em; margin: 0.25rem 0 0;">Panier Moyen (DNT)</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section - 1 col mobile, 2 cols desktop -->
        <div class="invoice-charts-grid">
          <!-- Stock Chart -->
          <div class="invoice-card">
            <div class="invoice-card-header gradient-blue">
              <svg class="invoice-card-header-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              <span class="invoice-card-header-title">Valeur du Stock</span>
            </div>
            <div style="padding: 1rem; height: 300px; position: relative;">
              <canvas #stockChartCanvas></canvas>
            </div>
          </div>

          <!-- Sales Chart -->
          <div class="invoice-card">
            <div class="invoice-card-header gradient-indigo">
              <svg class="invoice-card-header-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
              </svg>
              <span class="invoice-card-header-title">Ventes vs Achats</span>
            </div>
            <div style="padding: 1rem; height: 300px; position: relative;">
              <canvas #salesChartCanvas></canvas>
            </div>
          </div>

          <!-- Top Products Chart -->
          <div class="invoice-card">
            <div class="invoice-card-header gradient-green">
              <svg class="invoice-card-header-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/>
              </svg>
              <span class="invoice-card-header-title">Top 5 Produits</span>
            </div>
            <div style="padding: 1rem; height: 300px; position: relative;">
              <canvas #topProductsChartCanvas></canvas>
            </div>
          </div>

          <!-- Category Chart -->
          <div class="invoice-card">
            <div class="invoice-card-header gradient-orange">
              <svg class="invoice-card-header-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
              </svg>
              <span class="invoice-card-header-title">Catégories</span>
            </div>
            <div style="padding: 1rem; height: 300px; position: relative;">
              <canvas #categoryChartCanvas></canvas>
            </div>
          </div>
        </div>
    </div>
  `
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
