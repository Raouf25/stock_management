import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { StockAlertBannerComponent } from '../../shared/stock-alert-banner.component';
import { SkeletonCardsComponent } from '../../shared/skeleton.component';

Chart.register(...registerables);

// ── Transaction types ──────────────────────────────────────────────────────────

interface PurchaseLine {
  productId:     string;
  productSearch: string;
  productLabel:  string;
  quantity:      number;
  unitPriceTTC:  number;
  dropdownOpen:  boolean;
}

interface TxProduct {
  idProduct:             number;
  reference?:            number;
  designation:           string;
  name:                  string;
  unit:                  string;
  unitPriceSold?:        number;
  unitPriceBought?:      number;
  currentStockQuantity?: number;
  currentStockValue?:    number;
  cmp?:                  number;
}

interface ProductSummary {
  id:         number;
  reference?: number;
  name:       string;
  category?:  string;
  unit:       string;
  salePrice:  number;
  stock:      number;
}

interface Statistics {
  averagePurchasePrice: number;
  averageSalePrice:     number;
  balance:              number;
}

interface PurchaseItem {
  id:             number;
  date:           string;
  supplierName:   string;
  quantity:       number;
  unitPrice:      number;
  total:          number;
  invoiceNumber?: string;
}

interface SaleItem {
  id:                   number;
  date:                 string;
  customerName?:        string;
  quantity:             number;
  unitPrice:            number;
  total:                number;
  invoiceNumber?:       string;
  deliveryNoteNumber?:  string;
  paymentStatus:        string;
}

interface DashboardProduct {
  product:    ProductSummary;
  statistics: Statistics;
  purchases:  PurchaseItem[];
  sales:      SaleItem[];
}

const EMPTY_PURCHASE = { supplierId: '', invoiceNumber: '', datePurchase: '' };

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StockAlertBannerComponent, SkeletonCardsComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('salesChartCanvas')       salesChartCanvas!:       ElementRef<HTMLCanvasElement>;
  @ViewChild('paymentChartCanvas')     paymentChartCanvas!:     ElementRef<HTMLCanvasElement>;
  @ViewChild('topProductsChartCanvas') topProductsChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChartCanvas')    categoryChartCanvas!:    ElementRef<HTMLCanvasElement>;

  // ── Dashboard KPI state ────────────────────────────────────────────────────
  totalValue         = 0;
  alerts:            any[] = [];
  products:          any[] = [];
  sales:             any[] = [];
  purchases:         any[] = [];
  invoiceKPIs:       any   = {};
  deliveryNoteKPIs:  any   = {};
  loading                  = true;
  trends: Record<string, { pct: number; dir: 'up' | 'down' | 'neutral'; label: string }> = {};

  private salesChart:       Chart | null = null;
  private paymentChart:     Chart | null = null;
  private topProductsChart: Chart | null = null;
  private categoryChart:    Chart | null = null;
  private ready = { sales: false, purchases: false, products: false, kpis: false };

  // ── Transactions table state ───────────────────────────────────────────────
  txLoading                              = true;
  txProducts:         DashboardProduct[] = [];
  productsForForm:    TxProduct[]        = [];
  suppliers:          any[]              = [];
  txSearch                               = '';
  txBilanSort: 'none' | 'desc' | 'asc'  = 'none';
  isDrawerOpen                           = false;
  selectedProduct:    DashboardProduct | null = null;

  showPurchaseForm = false;
  newPurchase      = { ...EMPTY_PURCHASE };
  purchaseLines:   PurchaseLine[] = [];
  formError        = '';

  dropdownStyle: { top: string; left: string; width: string } = { top: '0px', left: '0px', width: '0px' };
  private activeDropdownIndex = -1;
  private activeDropdownInput: HTMLElement | null = null;
  private scrollHandler = () => this.repositionDropdown();

  constructor(private apiService: ApiService) {}

  ngOnInit():        void { this.loadDashboard(); this.loadTransactions(); this.loadSuppliers(); }
  ngAfterViewInit(): void {}
  ngOnDestroy():     void { window.removeEventListener('scroll', this.scrollHandler, true); }

  // ── Dashboard loading ──────────────────────────────────────────────────────

  loadDashboard(): void {
    this.loading = true;

    this.apiService.getStockTotalValue().subscribe({
      next: (d) => { this.totalValue = typeof d === 'number' ? d : (d?.totalStockValue || 0); }
    });

    this.apiService.getStockAlerts(20).subscribe({
      next: (d) => { this.alerts = d; }
    });

    this.apiService.getProducts().subscribe({
      next: (d) => {
        this.products = d;
        this.ready.products = true;
        this.buildProductsForForm(d);
        this.tryCharts();
      }
    });

    this.apiService.getCombinedSales().subscribe({
      next: (d) => {
        this.sales = d;
        this.loading = false;
        this.ready.sales = true;
        this.computeTrends();
        this.tryCharts();
      }
    });

    this.apiService.getPurchases().subscribe({
      next: (d: any) => {
        this.purchases = Array.isArray(d) ? d : (d?.content ?? []);
        this.ready.purchases = true;
        this.computeTrends();
        this.tryCharts();
      }
    });

    this.apiService.getInvoiceKPIs().subscribe({
      next: (d) => {
        this.invoiceKPIs = {
          totalInvoicedAmount: typeof d?.totalInvoicedAmount === 'number' ? d.totalInvoicedAmount : 0,
          totalAmountDue:      typeof d?.totalAmountDue      === 'number' ? d.totalAmountDue      : 0,
          ...d
        };
        this.ready.kpis = true;
        this.tryCharts();
      }
    });

    this.apiService.getDeliveryNoteKPIs().subscribe({
      next: (d) => { this.deliveryNoteKPIs = d || {}; },
      error: ()  => { this.deliveryNoteKPIs = {}; }
    });
  }

  // ── Transactions loading ───────────────────────────────────────────────────

  loadTransactions(): void {
    this.txLoading = true;
    this.apiService.getDashboardProducts().subscribe({
      next: (data: DashboardProduct[]) => { this.txProducts = data; this.txLoading = false; },
      error: () => { this.txLoading = false; }
    });
  }

  loadSuppliers(): void {
    this.apiService.getSuppliers().subscribe({
      next: (data) => { this.suppliers = data.map((item: any) => item.supplier); }
    });
  }

  private buildProductsForForm(data: any[]): void {
    const seen = new Set<number>();
    this.productsForForm = data.filter((p: any) => {
      if (seen.has(p.idProduct)) return false;
      seen.add(p.idProduct);
      return true;
    });
  }

  // ── Transactions: drawer ───────────────────────────────────────────────────

  openProductDrawer(product: DashboardProduct): void {
    this.selectedProduct = product;
    this.isDrawerOpen = true;
  }

  closeDrawer(): void {
    this.isDrawerOpen = false;
    this.selectedProduct = null;
  }

  // ── Transactions: purchase form ────────────────────────────────────────────

  togglePurchaseForm(): void {
    this.showPurchaseForm = !this.showPurchaseForm;
    if (this.showPurchaseForm) this.initPurchaseForm();
  }

  initPurchaseForm(): void {
    this.newPurchase   = { ...EMPTY_PURCHASE };
    this.purchaseLines = [this.emptyLine()];
    this.formError     = '';
  }

  private emptyLine(): PurchaseLine {
    return { productId: '', productSearch: '', productLabel: '', quantity: 1, unitPriceTTC: 0, dropdownOpen: false };
  }

  addPurchaseLine():             void { this.purchaseLines.push(this.emptyLine()); }
  removePurchaseLine(i: number): void { if (this.purchaseLines.length > 1) this.purchaseLines.splice(i, 1); }

  getPurchaseLinesTotal(): number {
    return this.purchaseLines.reduce((acc, l) => acc + (l.quantity * l.unitPriceTTC), 0);
  }

  private repositionDropdown(): void {
    if (this.activeDropdownInput && this.activeDropdownIndex >= 0) {
      const rect = this.activeDropdownInput.getBoundingClientRect();
      this.dropdownStyle = { top: `${rect.bottom}px`, left: `${rect.left}px`, width: `${rect.width}px` };
    }
  }

  openLineDropdown(i: number, event?: Event): void {
    if (event) {
      const input = event.target as HTMLElement;
      this.activeDropdownInput = input;
      this.activeDropdownIndex = i;
      const rect = input.getBoundingClientRect();
      this.dropdownStyle = { top: `${rect.bottom}px`, left: `${rect.left}px`, width: `${rect.width}px` };
      window.addEventListener('scroll', this.scrollHandler, true);
    }
    this.purchaseLines[i].dropdownOpen = true;
  }

  closeLineDropdown(i: number): void {
    setTimeout(() => {
      this.purchaseLines[i].dropdownOpen = false;
      this.activeDropdownIndex = -1;
      this.activeDropdownInput = null;
      window.removeEventListener('scroll', this.scrollHandler, true);
    }, 220);
  }

  onLineSearchChange(i: number, event?: Event): void {
    if (event && !this.purchaseLines[i].dropdownOpen) {
      const input = event.target as HTMLElement;
      const rect = input.getBoundingClientRect();
      this.dropdownStyle = { top: `${rect.bottom}px`, left: `${rect.left}px`, width: `${rect.width}px` };
    }
    this.purchaseLines[i].dropdownOpen = true;
  }

  getFilteredProductsForLine(line: PurchaseLine): TxProduct[] {
    const term = line.productSearch.trim().toLowerCase();
    const list = term
      ? this.productsForForm.filter(p =>
          (p.name || '').toLowerCase().includes(term) ||
          (p.designation || '').toLowerCase().includes(term))
      : [...this.productsForForm];
    return list.sort((a, b) => (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase(), 'fr'));
  }

  selectProductForLine(i: number, p: TxProduct): void {
    const line = this.purchaseLines[i];
    line.productId     = p.idProduct != null ? String(p.idProduct) : '';
    line.productLabel  = `${p.name} - ${p.unit}`;
    line.productSearch = p.name;
    line.dropdownOpen  = false;
  }

  createPurchase(): void {
    this.formError = '';
    const { supplierId, datePurchase } = this.newPurchase;
    if (!supplierId || !datePurchase) {
      this.formError = 'Veuillez sélectionner un fournisseur et une date.';
      return;
    }
    const invalidPrice = this.purchaseLines.some(l => !!l.productId && Number(l.unitPriceTTC) <= 0);
    if (invalidPrice) {
      this.formError = 'Le prix unitaire doit être supérieur à 0 pour chaque produit.';
      return;
    }
    const validLines = this.purchaseLines.filter(l => {
      const id = Number(l.productId);
      return !!l.productId && !isNaN(id) && id > 0 && Number(l.quantity) > 0 && Number(l.unitPriceTTC) > 0;
    });
    if (!validLines.length) {
      this.formError = 'Ajoutez au moins une ligne produit valide.';
      return;
    }
    const payload = {
      ...this.newPurchase,
      lines: validLines.map(l => ({
        productId:    Number(l.productId),
        quantity:     Number(l.quantity),
        unitPriceTTC: Number(l.unitPriceTTC)
      }))
    };
    this.apiService.createPurchase(payload).subscribe({
      next: () => {
        this.showPurchaseForm = false;
        this.initPurchaseForm();
        this.loadTransactions();
      },
      error: () => { this.formError = 'Erreur lors de la création de l\'achat. Veuillez réessayer.'; }
    });
  }

  // ── Transactions: table helpers ────────────────────────────────────────────

  get filteredTxProducts(): DashboardProduct[] {
    let list = this.txProducts.filter(p => (p.purchases?.length ?? 0) > 0 || (p.sales?.length ?? 0) > 0);

    const term = this.txSearch.trim().toLowerCase();
    if (term) {
      list = list.filter(p =>
        p.product?.name?.toLowerCase().includes(term) ||
        p.product?.category?.toLowerCase().includes(term)
      );
    }

    if (this.txBilanSort === 'none') {
      return list.sort((a, b) =>
        (a.product?.name ?? '').toLowerCase().localeCompare((b.product?.name ?? '').toLowerCase(), 'fr')
      );
    }
    return list.sort((a, b) => {
      const ba = this.getBilan(a), bb = this.getBilan(b);
      return this.txBilanSort === 'asc' ? ba - bb : bb - ba;
    });
  }

  toggleBilanSort(): void {
    if (this.txBilanSort === 'none')      this.txBilanSort = 'desc';
    else if (this.txBilanSort === 'desc') this.txBilanSort = 'asc';
    else                                  this.txBilanSort = 'none';
  }

  getStockVendu(p: DashboardProduct):          number { return p.sales?.reduce((a, s) => a + (s.quantity ?? 0), 0) ?? 0; }
  getStockEntrepot(p: DashboardProduct):        number { return p.product?.stock ?? 0; }
  getAveragePurchasePrice(p: DashboardProduct): number { return p.statistics?.averagePurchasePrice ?? 0; }
  getAverageSalePrice(p: DashboardProduct):     number { return p.statistics?.averageSalePrice ?? 0; }
  getBilan(p: DashboardProduct):                number { return p.statistics?.balance ?? 0; }

  getPaymentBadgeClass(status: string): string {
    switch ((status || '').toUpperCase()) {
      case 'PAID':           return 'badge-status paid';
      case 'PARTIALLY_PAID': return 'badge-status partial';
      case 'UNPAID':         return 'badge-status unpaid';
      default:               return 'badge-status default';
    }
  }

  // ── Charts ─────────────────────────────────────────────────────────────────

  private computeTrends(): void {
    const now   = new Date();
    const curM  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevD = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevM = `${prevD.getFullYear()}-${String(prevD.getMonth() + 1).padStart(2, '0')}`;

    const sumMonth = (rows: any[], dateField: string, amtField: string, month: string): number =>
      rows.filter(r => (r[dateField] || '').startsWith(month))
          .reduce((acc, r) => acc + (Number(r[amtField]) || 0), 0);

    const pct = (cur: number, prev: number): number =>
      prev === 0 ? (cur > 0 ? 100 : 0) : Math.round(((cur - prev) / prev) * 100);

    const dir = (p: number): 'up' | 'down' | 'neutral' =>
      p > 0 ? 'up' : p < 0 ? 'down' : 'neutral';

    const curSales  = sumMonth(this.sales,     'dateSale',     'totalSaleAmount', curM);
    const prevSales = sumMonth(this.sales,     'dateSale',     'totalSaleAmount', prevM);
    const salesPct  = pct(curSales, prevSales);

    const curPurch  = sumMonth(this.purchases, 'datePurchase', 'totalAmountTTC', curM);
    const prevPurch = sumMonth(this.purchases, 'datePurchase', 'totalAmountTTC', prevM);
    const purchPct  = pct(curPurch, prevPurch);

    const curInv  = this.sales.filter(r => (r['dateSale'] || '').startsWith(curM)).length;
    const prevInv = this.sales.filter(r => (r['dateSale'] || '').startsWith(prevM)).length;
    const invPct  = pct(curInv, prevInv);

    this.trends = {
      revenue:   { pct: Math.abs(salesPct),  dir: dir(salesPct),  label: `${salesPct > 0 ? '+' : ''}${salesPct}% vs mois préc.` },
      purchases: { pct: Math.abs(purchPct),  dir: dir(purchPct),  label: `${purchPct > 0 ? '+' : ''}${purchPct}% vs mois préc.` },
      invoices:  { pct: Math.abs(invPct),    dir: dir(invPct),    label: `${invPct > 0 ? '+' : ''}${invPct}% vs mois préc.` },
    };
  }

  private tryCharts(): void {
    if (!this.ready.sales || !this.ready.products) return;
    setTimeout(() => {
      this.createSalesChart();
      this.createTopProductsChart();
      this.createCategoryChart();
      if (this.ready.kpis) this.createPaymentChart();
    }, 150);
  }

  private createSalesChart(): void {
    const canvas = this.salesChartCanvas?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.salesChart?.destroy();

    const salesByMonth     = this.groupByMonth(this.sales,     'dateSale',     'totalSaleAmount');
    const purchasesByMonth = this.groupByMonth(this.purchases, 'datePurchase', 'totalAmountTTC');
    const months = [...new Set([...Object.keys(salesByMonth), ...Object.keys(purchasesByMonth)])].sort();

    this.salesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months.map(m => {
          const [y, mo] = m.split('-');
          return `${['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'][+mo - 1]} ${y}`;
        }),
        datasets: [
          {
            label: 'Achats',
            data: months.map(m => purchasesByMonth[m] || 0),
            borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,.08)',
            tension: 0.4, fill: true, borderWidth: 2.5,
            pointRadius: 4, pointHoverRadius: 6,
            pointBackgroundColor: '#ef4444', pointBorderColor: '#fff', pointBorderWidth: 2
          },
          {
            label: 'Ventes',
            data: months.map(m => salesByMonth[m] || 0),
            borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.08)',
            tension: 0.4, fill: true, borderWidth: 2.5,
            pointRadius: 4, pointHoverRadius: 6,
            pointBackgroundColor: '#10b981', pointBorderColor: '#fff', pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index' as const, intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#94a3b8',
            bodyColor: '#f1f5f9',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: (ctx) => {
                const v = Number(ctx.parsed.y).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                return ` ${ctx.dataset.label}: ${v} DNT`;
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#64748b' } },
          y: {
            beginAtZero: true, grid: { color: 'rgba(0,0,0,.04)' },
            ticks: { font: { size: 11 }, color: '#64748b', callback: (v) => `${Number(v).toLocaleString('fr-FR')} DNT` }
          }
        }
      }
    } as ChartConfiguration);
  }

  private createPaymentChart(): void {
    const canvas = this.paymentChartCanvas?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.paymentChart?.destroy();

    const dist    = this.invoiceKPIs.paymentStatusDistribution || {};
    const paid    = dist.PAID           || 0;
    const partial = dist.PARTIALLY_PAID || 0;
    const unpaid  = dist.UNPAID         || 0;
    const total   = paid + partial + unpaid;
    if (total === 0) return;

    this.paymentChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Payé', 'Partiel', 'Impayé'],
        datasets: [{ data: [paid, partial, unpaid], backgroundColor: ['#10b981','#f59e0b','#ef4444'], borderWidth: 3, borderColor: '#fff' }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => {
                const pct = total > 0 ? Math.round((item.parsed / total) * 100) : 0;
                return ` ${item.label}: ${item.parsed} facture(s) — ${pct}%`;
              }
            }
          }
        }
      }
    } as ChartConfiguration);
  }

  private createTopProductsChart(): void {
    const canvas = this.topProductsChartCanvas?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.topProductsChart?.destroy();

    const byProduct: { [k: string]: number } = {};
    this.sales.forEach(s => {
      const name = s.productDesignation || 'Inconnu';
      if (s.totalSaleAmount) byProduct[name] = (byProduct[name] || 0) + s.totalSaleAmount;
    });

    const top5 = Object.entries(byProduct).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (!top5.length) return;

    const barLabelPlugin = {
      id: 'barValueLabels',
      afterDatasetsDraw(chart: any) {
        const { ctx: c } = chart;
        const meta = chart.getDatasetMeta(0);
        if (meta.hidden) return;
        meta.data.forEach((bar: any, idx: number) => {
          const val = (chart.data.datasets[0].data[idx] as number) || 0;
          const formatted = val >= 1000
            ? `${(val / 1000).toFixed(1)} K DNT`
            : `${Math.round(val)} DNT`;
          const barWidth = bar.x - chart.scales.x.left;
          c.save();
          c.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
          if (barWidth > 90) {
            c.fillStyle = '#fff';
            c.textAlign = 'right';
            c.textBaseline = 'middle';
            c.fillText(formatted, bar.x - 8, bar.y);
          } else {
            c.fillStyle = '#4338ca';
            c.textAlign = 'left';
            c.textBaseline = 'middle';
            c.fillText(formatted, bar.x + 6, bar.y);
          }
          c.restore();
        });
      }
    };

    this.topProductsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: top5.map(([name]) => name.length > 22 ? name.slice(0, 22) + '…' : name),
        datasets: [{
          label: 'Ventes (DNT)',
          data: top5.map(([, v]) => v),
          backgroundColor: '#6366f1',
          borderRadius: 6, borderWidth: 0
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, indexAxis: 'y' as const,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item: any) => {
                const v = Number(item.parsed.x).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                return ` Ventes: ${v} DNT`;
              }
            }
          }
        },
        scales: {
          x: { display: false, beginAtZero: true, grid: { display: false } },
          y: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#334155' } }
        }
      },
      plugins: [barLabelPlugin]
    } as any);
  }

  private createCategoryChart(): void {
    const canvas = this.categoryChartCanvas?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.categoryChart?.destroy();

    const cats: { [k: string]: number } = {};
    this.products.forEach(p => {
      const c = (p.category || 'Autre').toUpperCase();
      cats[c] = (cats[c] || 0) + 1;
    });
    if (!Object.keys(cats).length) return;

    const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]);
    const top4   = sorted.slice(0, 4);
    const others = sorted.slice(4);
    const othersSum = others.reduce((sum, [, n]) => sum + n, 0);
    const entries: [string, number][] = othersSum > 0 ? [...top4, ['Autres', othersSum]] : top4;

    this.categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: entries.map(([k]) => k),
        datasets: [{ data: entries.map(([, v]) => v), backgroundColor: ['#4f46e5','#10b981','#f59e0b','#ef4444','#8b5cf6'], borderWidth: 3, borderColor: '#fff' }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '55%',
        plugins: {
          legend: {
            position: 'right' as const,
            labels: {
              font: { size: 9 }, boxWidth: 8, padding: 8, color: '#334155',
              generateLabels: (chart: Chart) => {
                const base = (Chart as any).defaults.plugins.legend.labels.generateLabels(chart);
                return base.map((item: any) => ({
                  ...item,
                  text: item.text.length > 16 ? item.text.slice(0, 14) + '…' : item.text
                }));
              }
            }
          }
        }
      }
    } as ChartConfiguration);
  }

  // ── Utilitaires ────────────────────────────────────────────────────────────

  private groupByMonth(data: any[], dateField: string, amountField: string): { [k: string]: number } {
    const grouped: { [k: string]: number } = {};
    data.forEach(item => {
      const d = new Date(item[dateField]);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      grouped[key] = (grouped[key] || 0) + (item[amountField] || 0);
    });
    return grouped;
  }

  getAverageBasket(): number {
    const total = this.invoiceKPIs.totalInvoicedAmount || 0;
    const count = this.invoiceKPIs.totalInvoices       || 1;
    return total / count;
  }

  getPaymentTotal(): number {
    const dist = this.invoiceKPIs.paymentStatusDistribution || {};
    return (dist.PAID || 0) + (dist.PARTIALLY_PAID || 0) + (dist.UNPAID || 0);
  }
}
