import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

type TransactionType = 'sales' | 'purchases' | 'movements';

const EMPTY_PURCHASE = {
  supplierId: '', productId: '', quantity: '',
  unitPriceTTC: '', invoiceNumber: '', datePurchase: ''
};

const sortByDate = (a: any, b: any) =>
    new Date(a.datePurchase).getTime() - new Date(b.datePurchase).getTime();

const sortAlpha = (list: any[]) =>
    [...list].sort((a, b) => (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase(), 'fr'));

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  @ViewChild('trendChart')    trendChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') categoryChart!: ElementRef<HTMLCanvasElement>;

  // UI
  type: TransactionType = 'sales';
  loading       = true;
  showForm      = false;
  productSearch = '';
  openProducts: number[] = [];
  showAllProducts = false;

  // Données
  transactions: any[] = [];
  purchasesByProduct: Record<number, any[]> = {};
  movements:  any[] = [];
  products:   any[] = [];
  suppliers:  any[] = [];

  // Filtres mouvements
  selectedType   = '';
  selectedSource = '';
  readonly typeOptions   = ['ENTREE', 'SORTIE'];
  readonly sourceOptions = ['ACHAT', 'VENTE', 'AJUSTEMENT'];

  // Formulaire achat
  newPurchase = { ...EMPTY_PURCHASE };
  productSearchForm    = '';
  productDropdownOpen  = false;
  selectedProductLabel = '';

  // Chart instance
  private categoryChartInstance?: Chart;

  constructor(
      private api: ApiService,
      private route: ActivatedRoute,
      private router: Router
  ) {}

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.route.queryParams.subscribe(({ type }) => {
      if (type === 'movements' || type === 'sales' || type === 'purchases') {
        this.type = type;
      }
    });
    this.loadProducts();
    this.loadSuppliers();
    this.type === 'movements' ? this.loadMovements() : this.loadTransactions();
  }

  // ── Navigation ───────────────────────────────────────────────────────────────

  switchType(type: TransactionType): void {
    this.type     = type;
    this.showForm = false;
    this.router.navigate([], { relativeTo: this.route, queryParams: { type }, queryParamsHandling: 'merge' });
    type === 'movements' ? this.loadMovements() : this.loadTransactions();
  }

  // ── Produits (accordion) ─────────────────────────────────────────────────────

  toggleProduct(id: number): void {
    this.openProducts = this.isProductOpen(id)
        ? this.openProducts.filter(pid => pid !== id)
        : [...this.openProducts, id];
  }

  isProductOpen(id: number): boolean {
    return this.openProducts.includes(id);
  }

  openPurchaseForm(prod: any): void {
    this.type     = 'purchases';
    this.showForm = true;
    this.newPurchase = { ...this.newPurchase, productId: prod.idProduct ?? prod.id };
  }

  // ── Getters filtrés ──────────────────────────────────────────────────────────

  get filteredProducts(): any[] {
    let list = this.showAllProducts
        ? [...this.products]
        : this.products.filter(p => this.getPurchasesCount(p.idProduct) > 0);

    const term = this.productSearch.trim().toLowerCase();
    if (term) {
      list = list.filter(p =>
          p.name?.toLowerCase().includes(term) ||
          p.designation?.toLowerCase().includes(term)
      );
    }
    return sortAlpha(list);
  }

  get filteredProductsForm(): any[] {
    const term = this.productSearchForm.trim().toLowerCase();
    const list = term
        ? this.products.filter(p =>
            p.name?.toLowerCase().includes(term) ||
            p.designation?.toLowerCase().includes(term)
        )
        : [...this.products];
    return sortAlpha(list);
  }

  // ── Sélection produit (formulaire) ───────────────────────────────────────────

  selectProduct(p: any): void {
    this.newPurchase.productId   = p.idProduct;
    this.selectedProductLabel    = `${p.name} - ${p.unit} - ${p.designation}`;
    this.productDropdownOpen     = false;
    this.productSearchForm       = '';
  }

  closeProductDropdown(): void {
    setTimeout(() => { this.productDropdownOpen = false; }, 200);
  }

  // ── Accès données produit ────────────────────────────────────────────────────

  getSalesByProduct(productId: number): any[] {
    return this.transactions.filter(t => t.productId === productId || t.idProduct === productId);
  }

  getPurchasesByProduct(productId: number): any[] {
    return this.purchasesByProduct[productId] ?? [];
  }

  getSalesCount(productId: number):    number { return this.getSalesByProduct(productId).length; }
  getPurchasesCount(productId: number): number { return this.getPurchasesByProduct(productId).length; }

  // ── Calculs stock & prix ─────────────────────────────────────────────────────

  getCurrentStock(productId: number): number {
    const achats  = this.getPurchasesByProduct(productId).reduce((s, a) => s + (a.quantity    || 0), 0);
    const ventes  = this.getSalesByProduct(productId)
        .filter(t => t.quantitySold !== undefined || t.quantity !== undefined)
        .reduce((s, v) => s + (v.quantitySold || 0), 0);
    return Math.max(0, achats - ventes);
  }

  getAveragePurchasePrice(productId: number): number {
    return this.weightedAvg(this.getPurchasesByProduct(productId), 'unitPriceTTC', 'quantity');
  }

  getAverageSalePrice(productId: number): number {
    return this.weightedAvg(this.getSalesByProduct(productId), 'unitSalePrice', 'quantitySold');
  }

  private weightedAvg(list: any[], priceKey: string, qtyKey: string): number {
    const totalQty    = list.reduce((s, x) => s + (x[qtyKey]   || 0), 0);
    const totalAmount = list.reduce((s, x) => s + ((x[priceKey] || 0) * (x[qtyKey] || 0)), 0);
    return totalQty ? totalAmount / totalQty : 0;
  }

  getBilan(productId: number): number {
    const ventes = this.getSalesByProduct(productId).reduce((s, v) => s + (v.totalSaleAmount  || 0), 0);
    const achats = this.getPurchasesByProduct(productId).reduce((s, a) => s + (a.totalAmountTTC || 0), 0);
    return ventes - achats;
  }

  // ── KPIs globaux ─────────────────────────────────────────────────────────────

  getTotalAmount(): number {
    return this.type === 'sales'
        ? this.transactions.reduce((s, t) => s + (t.totalSaleAmount  || 0), 0)
        : this.transactions.reduce((s, t) => s + (t.totalAmountTTC   || 0), 0);
  }

  getTotalQuantity(): number {
    return this.type === 'sales'
        ? this.transactions.reduce((s, t) => s + (t.quantitySold || 0), 0)
        : this.transactions.reduce((s, t) => s + (t.quantity     || 0), 0);
  }

  getAveragePrice(): number {
    if (!this.transactions.length) return 0;
    const key = this.type === 'sales' ? 'unitSalePrice' : 'unitPriceTTC';
    return this.transactions.reduce((s, t) => s + (t[key] || 0), 0) / this.transactions.length;
  }

  getTotalMovementQuantity(type: string): number {
    return this.movements.filter(m => m.type === type).reduce((s, m) => s + (m.quantity || 0), 0);
  }

  getMovementIcon(type: string): string {
    return type === 'ENTREE' ? '📥' : '📤';
  }

  // ── Chargement API ───────────────────────────────────────────────────────────

  loadTransactions(): void {
    this.loading = true;
    const obs$ = this.type === 'sales' ? this.api.getSales() : this.api.getPurchases();
    obs$.subscribe({
      next: (data) => {
        this.transactions = data;
        if (this.type === 'purchases') {
          const ids = [...new Set(data.map((p: any) => p.productId ?? p.idProduct))] as number[];
          this.loadPurchasesForProducts(ids);
        }
        this.loading = false;
        this.createCharts();
      }
    });
  }

  loadMovements(): void {
    this.loading = true;
    this.api.getStockMovements().subscribe({
      next: (data) => {
        this.movements = data.filter((m: any) => {
          return (!this.selectedType   || m.type   === this.selectedType)
              && (!this.selectedSource || m.source === this.selectedSource);
        });
        this.loading = false;
      }
    });
  }

  loadProducts(): void {
    this.api.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        const ids = [...new Set(data.map((p: any) => p.idProduct ?? p.productId))] as number[];
        this.loadPurchasesForProducts(ids);
      }
    });
  }

  loadSuppliers(): void {
    this.api.getSuppliers().subscribe({
      next: (data) => { this.suppliers = data.map((item: any) => item.supplier); }
    });
  }

  loadPurchasesForProducts(ids: number[]): void {
    ids.forEach(id => {
      this.api.getPurchasesByProduct(id).subscribe({
        next: (data) => { this.purchasesByProduct[id] = [...data].sort(sortByDate); },
        error: ()     => { this.purchasesByProduct[id] = []; }
      });
    });
  }

  onFilterChange(): void { this.loadMovements(); }

  // ── Création achat ───────────────────────────────────────────────────────────

  createPurchase(): void {
    const { supplierId, productId, quantity, unitPriceTTC, datePurchase } = this.newPurchase;
    if (!supplierId || !productId || !quantity || !unitPriceTTC || !datePurchase) return;

    const prodId = Number(productId);
    this.api.createPurchase(this.newPurchase).subscribe({
      next: () => {
        this.showForm            = false;
        this.selectedProductLabel = '';
        this.productSearchForm   = '';
        this.newPurchase         = { ...EMPTY_PURCHASE };
        this.loadTransactions();
        if (prodId) {
          this.api.getPurchasesByProduct(prodId).subscribe({
            next: (data) => { this.purchasesByProduct[prodId] = [...data].sort(sortByDate); },
            error: ()     => { this.purchasesByProduct[prodId] = []; }
          });
        }
      }
    });
  }

  // ── Graphiques ───────────────────────────────────────────────────────────────

  createCharts(): void {
    if (this.type !== 'sales' || !this.products.length || !this.transactions.length || !this.categoryChart) return;

    const salesByProduct: Record<string, number> = {};
    this.transactions.forEach(sale => {
      const id = sale.productId ?? sale.idProduct;
      salesByProduct[id] = (salesByProduct[id] ?? 0) + (sale.quantitySold || 0);
    });

    const top7 = Object.entries(salesByProduct).sort((a, b) => b[1] - a[1]).slice(0, 7);
    const labels = top7.map(([id]) => this.products.find(p => p.idProduct == id || p.productId == id)?.name ?? 'Produit ' + id);
    const data   = top7.map(([, qty]) => qty);

    this.categoryChartInstance?.destroy();
    const ctx = this.categoryChart.nativeElement.getContext('2d');
    if (!ctx) return;

    this.categoryChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Quantité vendue', data, backgroundColor: '#6366f1', borderRadius: 6, maxBarThickness: 38 }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false }, title: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, grid: { color: '#e5e7eb' } }
        }
      }
    });
  }
}