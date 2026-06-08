import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

type TransactionType = 'sales' | 'purchases' | 'movements';

const EMPTY_PURCHASE = {
  supplierId: '',
  invoiceNumber: '',
  datePurchase: ''
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

  // Cache de stockage pour les statuts de paiement par ID de facture
  billsCache: Record<number, { paymentStatus: string; loading: boolean }> = {};

  // Filtres mouvements
  selectedType   = '';
  selectedSource = '';

  // Formulaire achat multi-produits
  newPurchase = { ...EMPTY_PURCHASE };
  purchaseLines: any[] = [];

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
    this.initPurchaseForm();
    this.loadSuppliers();
    this.loadProducts();
  }

  // ── Navigation ───────────────────────────────────────────────────────────────

  switchType(type: TransactionType): void {
    this.type     = type;
    this.showForm = false;
    this.router.navigate([], { relativeTo: this.route, queryParams: { type }, queryParamsHandling: 'merge' });
    type === 'movements' ? this.loadMovements() : this.loadDataWithPurchasesFilter();
  }

  // ── Produits (accordion) ─────────────────────────────────────────────────────

  toggleProduct(id: number): void {
    const isOpen = this.isProductOpen(id);
    if (isOpen) {
      this.openProducts = this.openProducts.filter(pid => pid !== id);
    } else {
      this.openProducts = [...this.openProducts, id];
      // FIX : Déclenche l'appel vers l'API des factures à l'ouverture de l'accordéon
      this.loadPaymentStatusesForProductSales(id);
    }
  }

  isProductOpen(id: number): boolean {
    return this.openProducts.includes(id);
  }

  toggleShowAllProducts(): void {
    this.showAllProducts = !this.showAllProducts;

    if (this.showAllProducts) {
      const allProductIds = this.products.map(p => p.idProduct ?? p.productId ?? p.id);
      const missingIds = allProductIds.filter(id => id && this.purchasesByProduct[id] === undefined);

      if (missingIds.length > 0) {
        this.loadPurchasesForProducts(missingIds);
      }
    }
  }

  // ── Initialisation & Gestion dynamique des lignes d'achat ───────────────────

  initPurchaseForm(): void {
    this.newPurchase = { ...EMPTY_PURCHASE };
    this.purchaseLines = [this.createEmptyLine()];
  }

  createEmptyLine(): any {
    return {
      productId: '',
      productSearch: '',
      productLabel: '',
      quantity: 1,
      unitPriceTTC: 0,
      dropdownOpen: false
    };
  }

  addPurchaseLine(): void {
    this.purchaseLines.push(this.createEmptyLine());
  }

  removePurchaseLine(index: number): void {
    if (this.purchaseLines.length > 1) {
      this.purchaseLines.splice(index, 1);
    }
  }

  getPurchaseLinesTotal(): number {
    return this.purchaseLines.reduce((acc, line) => acc + ((line.quantity || 0) * (line.unitPriceTTC || 0)), 0);
  }

  // ── Autocomplete / Dropdown par ligne de produit ────────────────────────────

  openLineDropdown(index: number): void {
    this.purchaseLines[index].dropdownOpen = true;
  }

  closeLineDropdown(index: number): void {
    setTimeout(() => {
      this.purchaseLines[index].dropdownOpen = false;
    }, 220);
  }

  getFilteredProductsForLine(line: any): any[] {
    const term = (line.productSearch || '').trim().toLowerCase();
    if (!term) {
      return sortAlpha(this.products);
    }
    const list = this.products.filter(p =>
        p.name?.toLowerCase().includes(term) ||
        p.designation?.toLowerCase().includes(term)
    );
    return sortAlpha(list);
  }

  selectProductForLine(index: number, product: any): void {
    const line = this.purchaseLines[index];
    line.productId = product.idProduct ?? product.productId ?? product.id;
    line.productLabel = `${product.name} - ${product.unit}`;
    line.productSearch = product.name;
    line.dropdownOpen = false;
  }

  // ── Getters filtrés (Tableau Principal) ──────────────────────────────────────

  get filteredProducts(): any[] {
    let list = this.showAllProducts
        ? [...this.products]
        : this.products.filter(p => this.getPurchasesCount(p.idProduct ?? p.productId ?? p.id) > 0);

    const term = this.productSearch.trim().toLowerCase();
    if (term) {
      list = list.filter(p =>
          p.name?.toLowerCase().includes(term) ||
          p.designation?.toLowerCase().includes(term)
      );
    }
    return sortAlpha(list);
  }

  // ── Accès données produit ────────────────────────────────────────────────────

  getSalesByProduct(productId: number): any[] {
    return this.type === 'sales'
        ? this.transactions.filter(t => t.productId === productId || t.idProduct === productId)
        : [];
  }

  getPurchasesByProduct(productId: number): any[] {
    return this.purchasesByProduct[productId] ?? [];
  }

  getSalesCount(productId: number):    number { return this.getSalesByProduct(productId).length; }
  getPurchasesCount(productId: number): number { return this.getPurchasesByProduct(productId).length; }

  // ── Récupération et gestion du statut de paiement ──────────────────────────

  private loadPaymentStatusesForProductSales(productId: number): void {
    const sales = this.getSalesByProduct(productId);

    sales.forEach(sale => {
      // Extrait l'ID de facture via toutes les clés envisageables (idBill, billId, invoiceId, id)
      const billId = sale.invoiceNumber;

      if (billId && !this.billsCache[billId]) {
        // Met la clé en état "loading" pour éviter d'appeler l'API en boucle
        this.billsCache[billId] = { paymentStatus: '', loading: true };

        // Appel de l'API /api/bills/{id}
        this.api.getBillById(billId).subscribe({
          next: (billDto: any) => {
            this.billsCache[billId] = {
              paymentStatus: billDto.paymentStatus,
              loading: false
            };
          },
          error: () => {
            this.billsCache[billId] = {
              paymentStatus: 'ERREUR',
              loading: false
            };
          }
        });
      }
    });
  }

  getSalePaymentStatus(sale: any): string {
    const billId = sale.invoiceNumber;
    if (!billId) return 'SANS FACTURE';

    const cached = this.billsCache[billId];
    if (!cached) return 'CHARGEMENT';
    if (cached.loading) return '...';

    return cached.paymentStatus || 'INCONNU';
  }

  getPaymentBadgeClass(status: string): string {
    if (!status) return 'badge-status default';

    switch(status.toUpperCase()) {
      case 'PAID':
      case 'PAYE':
        return 'badge-status paid';
      case 'PARTIALLY_PAID':
      case 'PARTIEL':
        return 'badge-status partial';
      case 'UNPAID':
      case 'IMPAYE':
        return 'badge-status unpaid';
      default:
        return 'badge-status default';
    }
  }

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
    const totalQty = list.reduce((s, x) => s + (x[qtyKey] || 0), 0);
    const totalAmount = list.reduce((s, x) => s + ((x[priceKey] || 0) * (x[qtyKey] || 0)), 0);
    return totalQty ? totalAmount / totalQty : 0;
  }

  getBilan(productId: number): number {
    const ventes = this.getSalesByProduct(productId).reduce((s, v) => s + (v.totalSaleAmount  || 0), 0);
    const achats = this.getPurchasesByProduct(productId).reduce((s, a) => s + (a.totalAmountTTC || 0), 0);
    return ventes - achats;
  }

  // ── Chargement API robuste ───────────────────────────────────────────────────

  loadDataWithPurchasesFilter(): void {
    this.loading = true;

    this.api.getPurchases().subscribe({
      next: (purchasesData) => {
        if (this.type === 'purchases') {
          this.transactions = purchasesData;
        }

        const discoveredProductIds = new Set<number>();

        purchasesData.forEach((p: any) => {
          if (p.productId) discoveredProductIds.add(Number(p.productId));
          if (p.idProduct) discoveredProductIds.add(Number(p.idProduct));

          if (p.lines && Array.isArray(p.lines)) {
            p.lines.forEach((line: any) => {
              const prodId = line.productId ?? line.idProduct;
              if (prodId) {
                discoveredProductIds.add(Number(prodId));
              }
            });
          }
        });

        const activePurchaseIds = Array.from(discoveredProductIds);
        this.loadPurchasesForProducts(activePurchaseIds);

        if (this.type === 'sales') {
          this.api.getSales().subscribe({
            next: (salesData) => {
              this.transactions = salesData;
              this.loading = false;
              this.createCharts();
            },
            error: () => this.loading = false
          });
        } else {
          this.loading = false;
          this.createCharts();
        }
      },
      error: () => this.loading = false
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
      },
      error: () => this.loading = false
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.api.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.type === 'movements' ? this.loadMovements() : this.loadDataWithPurchasesFilter();
      },
      error: () => this.loading = false
    });
  }

  loadSuppliers(): void {
    this.api.getSuppliers().subscribe({
      next: (data) => { this.suppliers = data.map((item: any) => item.supplier); }
    });
  }

  loadPurchasesForProducts(ids: number[]): void {
    ids.forEach(id => {
      if (id && this.purchasesByProduct[id] === undefined) {
        this.api.getPurchasesByProduct(id).subscribe({
          next: (data) => { this.purchasesByProduct[id] = [...data].sort(sortByDate); },
          error: ()     => { this.purchasesByProduct[id] = []; }
        });
      }
    });
  }

  createPurchase(): void {
    const { supplierId, invoiceNumber, datePurchase } = this.newPurchase;

    if (!supplierId || !datePurchase || this.purchaseLines.length === 0) return;

    const isFormValid = this.purchaseLines.every(line => line.productId && line.quantity > 0 && line.unitPriceTTC >= 0);
    if (!isFormValid) return;

    const purchasePayload = {
      supplierId,
      invoiceNumber,
      datePurchase,
      lines: this.purchaseLines.map(line => ({
        productId: Number(line.productId),
        quantity: Number(line.quantity),
        unitPriceTTC: Number(line.unitPriceTTC)
      }))
    };

    this.api.createPurchase(purchasePayload).subscribe({
      next: () => {
        this.showForm = false;
        this.initPurchaseForm();
        this.loadDataWithPurchasesFilter();

        purchasePayload.lines.forEach(line => {
          const prodId = Number(line.productId);
          this.api.getPurchasesByProduct(prodId).subscribe({
            next: (data) => { this.purchasesByProduct[prodId] = [...data].sort(sortByDate); },
            error: ()     => { this.purchasesByProduct[prodId] = []; }
          });
        });
      }
    });
  }

  createCharts(): void {
    if (this.type !== 'sales' || !this.products.length || !this.transactions.length || !this.categoryChart) return;

    const salesByProduct: Record<string, number> = {};
    this.transactions.forEach(sale => {
      const id = sale.productId ?? sale.idProduct;
      salesByProduct[id] = (salesByProduct[id] ?? 0) + (sale.quantitySold || 0);
    });

    const top7 = Object.entries(salesByProduct).sort((a, b) => b[1] - a[1]).slice(0, 7);
    const labels = top7.map(([id]) => this.products.find(p => p.idProduct == id || p.productId == id || p.id == id)?.name ?? 'Produit ' + id);
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