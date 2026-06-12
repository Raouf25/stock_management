import {
  Component, OnInit, ViewChild, ElementRef,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// ── Types ──────────────────────────────────────────────────────────────────────
interface PurchaseLine {
  productId:    string;
  productSearch: string;
  productLabel: string;
  quantity:     number;
  unitPriceTTC: number;
  dropdownOpen: boolean;
}

interface ProductStats {
  itemsSold:        number;
  itemsInWarehouse: number;
  purchasesCount:   number;
  avgPurchasePrice: number;
  salesCount:       number;
  avgSalePrice:     number;
  balance:          number;
}

// ── Constantes ─────────────────────────────────────────────────────────────────
const EMPTY_PURCHASE = { supplierId: '', invoiceNumber: '', datePurchase: '' };

const sortByDate = (a: any, b: any) =>
    new Date(a.datePurchase).getTime() - new Date(b.datePurchase).getTime();

const sortAlpha = (list: any[]) =>
    [...list].sort((a, b) =>
        (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase(), 'fr'));

@Component({
  selector:    'app-transactions',
  standalone:  true,
  imports:     [CommonModule, FormsModule],
  templateUrl: './transactions.component.html',
  styleUrls:   ['./transactions.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush   // PERF: évite les CD inutiles
})
export class TransactionsComponent implements OnInit {
  @ViewChild('trendChart')    trendChart!:    ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') categoryChart!: ElementRef<HTMLCanvasElement>;

  // ── UI ─────────────────────────────────────────────────────────────────────
  loading         = true;
  showForm        = false;
  productSearch   = '';
  showAllProducts = false;
  isDrawerOpen    = false;
  selectedProductForDrawer: any = null;

  // ── Données brutes ─────────────────────────────────────────────────────────
  transactions:        any[]                 = [];
  purchasesByProduct:  Record<number, any[]> = {};
  products:            any[]                 = [];
  suppliers:           any[]                 = [];

  billsCache: Record<number, { paymentStatus: string; loading: boolean }> = {};

  // ── Formulaire ─────────────────────────────────────────────────────────────
  newPurchase  = { ...EMPTY_PURCHASE };
  purchaseLines: PurchaseLine[] = [];

  // ── Caches calculés (invalidés manuellement) ───────────────────────────────
  /** Résultats pré-calculés par produit, mis à jour quand les données changent */
  private _statsCache:    Map<number, ProductStats> = new Map();
  private _filteredCache: any[] | null = null;
  private _filterKey     = '';   // clé de cache pour filteredProducts

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.initPurchaseForm();
    this.loadSuppliers();
    this.loadProducts();
  }

  // ── Drawer ──────────────────────────────────────────────────────────────────

  openProductDrawer(product: any): void {
    this.selectedProductForDrawer = product;
    this._drawerStats = null;   // invalide le cache drawer
    this.isDrawerOpen = true;
    this.loadPaymentStatusesForProductSales(product.idProduct);
    this.cdr.markForCheck();
  }

  closeDrawer(): void {
    this.isDrawerOpen = false;
    this.selectedProductForDrawer = null;
    this.cdr.markForCheck();
  }

  toggleShowAllProducts(): void {
    this.showAllProducts = !this.showAllProducts;
    this._filteredCache = null;   // invalide le cache

    if (this.showAllProducts) {
      const missing = this.products
          .map(p => p.idProduct ?? p.productId ?? p.id)
          .filter((id: number) => id && this.purchasesByProduct[id] === undefined);
      if (missing.length) this.loadPurchasesForProducts(missing);
    }
    this.cdr.markForCheck();
  }

  // ── Stats drawer (mémoïsé) ──────────────────────────────────────────────────

  private _drawerStats: ProductStats | null = null;

  get drawerProductStats(): ProductStats | null {
    if (!this.selectedProductForDrawer) return null;

    // Retourne le cache si toujours valide
    if (this._drawerStats) return this._drawerStats;

    const pId = this.selectedProductForDrawer.idProduct
        ?? this.selectedProductForDrawer.productId
        ?? this.selectedProductForDrawer.id;

    this._drawerStats = this._computeStats(pId);
    return this._drawerStats;
  }

  // ── filteredProducts (mémoïsé) ──────────────────────────────────────────────

  get filteredProducts(): any[] {
    const key = `${this.showAllProducts}|${this.productSearch}`;
    if (this._filteredCache && this._filterKey === key) return this._filteredCache;

    let list = this.showAllProducts
        ? [...this.products]
        : this.products.filter(p => this.getPurchasesCount(p.idProduct ?? p.productId ?? p.id) > 0);

    const term = this.productSearch.trim().toLowerCase();
    if (term) {
      list = list.filter(p =>
          p.name?.toLowerCase().includes(term) ||
          p.designation?.toLowerCase().includes(term));
    }

    this._filteredCache = sortAlpha(list);
    this._filterKey     = key;
    return this._filteredCache;
  }

  // ── Formulaire achat ────────────────────────────────────────────────────────

  initPurchaseForm(): void {
    this.newPurchase  = { ...EMPTY_PURCHASE };
    this.purchaseLines = [this._emptyLine()];
  }

  private _emptyLine(): PurchaseLine {
    return { productId: '', productSearch: '', productLabel: '', quantity: 1, unitPriceTTC: 0, dropdownOpen: false };
  }

  addPurchaseLine():             void { this.purchaseLines.push(this._emptyLine()); }
  removePurchaseLine(i: number): void { if (this.purchaseLines.length > 1) this.purchaseLines.splice(i, 1); }

  getPurchaseLinesTotal(): number {
    return this.purchaseLines.reduce((acc, l) => acc + (l.quantity * l.unitPriceTTC), 0);
  }

  openLineDropdown(i: number):  void { this.purchaseLines[i].dropdownOpen = true; }
  closeLineDropdown(i: number): void {
    setTimeout(() => { this.purchaseLines[i].dropdownOpen = false; this.cdr.markForCheck(); }, 220);
  }

  getFilteredProductsForLine(line: PurchaseLine): any[] {
    const term = line.productSearch.trim().toLowerCase();
    return sortAlpha(term
        ? this.products.filter(p => p.name?.toLowerCase().includes(term) || p.designation?.toLowerCase().includes(term))
        : this.products);
  }

  selectProductForLine(i: number, p: any): void {
    const line = this.purchaseLines[i];
    line.productId    = p.idProduct ?? p.productId ?? p.id;
    line.productLabel = `${p.name} - ${p.unit}`;
    line.productSearch = p.name;
    line.dropdownOpen  = false;
  }

  // ── Accès données ───────────────────────────────────────────────────────────

  getSalesByProduct(productId: number): any[] {
    return this.transactions.filter(t => t.productId === productId || t.idProduct === productId);
  }

  getPurchasesByProduct(productId: number): any[] { return this.purchasesByProduct[productId] ?? []; }

  getSalesCount(productId: number):     number { return this.getSalesByProduct(productId).length; }
  getPurchasesCount(productId: number): number { return this.getPurchasesByProduct(productId).length; }

  // ── Calculs mémoïsés ────────────────────────────────────────────────────────

  /** Récupère les stats depuis le cache ou les calcule */
  private _computeStats(productId: number): ProductStats {
    if (this._statsCache.has(productId)) return this._statsCache.get(productId)!;

    const sales     = this.getSalesByProduct(productId);
    const purchases = this.getPurchasesByProduct(productId);

    const itemsSold       = sales.reduce((s, v) => s + (v.quantitySold || 0), 0);
    const totalPurchaseQty = purchases.reduce((s, p) => s + (p.quantity ?? p.quantityOrdered ?? 0), 0);
    const totalPurchaseCost = purchases.reduce((s, p) => s + ((p.quantity ?? p.quantityOrdered ?? 0) * (p.unitPriceTTC ?? p.unitPrice ?? 0)), 0);
    const totalSalesRevenue = sales.reduce((s, v) => s + ((v.quantitySold || 0) * (v.unitSalePrice || 0)), 0);

    const stats: ProductStats = {
      itemsSold,
      itemsInWarehouse: Math.max(0, totalPurchaseQty - itemsSold),
      purchasesCount:   purchases.length,
      avgPurchasePrice: totalPurchaseQty > 0 ? totalPurchaseCost / totalPurchaseQty : 0,
      salesCount:       sales.length,
      avgSalePrice:     itemsSold > 0 ? totalSalesRevenue / itemsSold : 0,
      balance:          totalSalesRevenue - totalPurchaseCost,
    };

    this._statsCache.set(productId, stats);
    return stats;
  }

  /** Invalide le cache stats pour un produit (appeler après maj données) */
  private _invalidateStats(productId?: number): void {
    if (productId !== undefined) {
      this._statsCache.delete(productId);
    } else {
      this._statsCache.clear();
    }
    this._filteredCache = null;
    this._drawerStats   = null;
  }

  // Méthodes publiques qui délèguent au cache
  getStockVendu(productId: number):        number { return this._computeStats(productId).itemsSold; }
  getStockEntrepot(productId: number):     number { return this._computeStats(productId).itemsInWarehouse; }
  getAveragePurchasePrice(productId: number): number { return this._computeStats(productId).avgPurchasePrice; }
  getAverageSalePrice(productId: number):  number { return this._computeStats(productId).avgSalePrice; }

  getBilan(productId: number): number {
    const v = this.getSalesByProduct(productId).reduce((s, x) => s + (x.totalSaleAmount  || 0), 0);
    const a = this.getPurchasesByProduct(productId).reduce((s, x) => s + (x.totalAmountTTC || 0), 0);
    return v - a;
  }

  // ── Statut paiement ─────────────────────────────────────────────────────────

  private loadPaymentStatusesForProductSales(productId: number): void {
    this.getSalesByProduct(productId).forEach(sale => {
      const billId = sale.invoiceNumber;
      if (!billId || this.billsCache[billId]) return;

      // Spread → nouvel objet → Angular OnPush détecte le changement
      this.billsCache = { ...this.billsCache, [billId]: { paymentStatus: '', loading: true } };

      this.api.getBillById(billId).subscribe({
        next: (dto: any) => {
          this.billsCache = { ...this.billsCache, [billId]: { paymentStatus: dto.paymentStatus ?? '', loading: false } };
          this.cdr.markForCheck();
        },
        error: () => {
          this.billsCache = { ...this.billsCache, [billId]: { paymentStatus: 'ERREUR', loading: false } };
          this.cdr.markForCheck();
        }
      });
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
    switch ((status || '').toUpperCase()) {
      case 'PAID':            return 'badge-status paid';
      case 'PARTIALLY_PAID':  return 'badge-status partial';
      case 'UNPAID':          return 'badge-status unpaid';
      default:                return 'badge-status default';
    }
  }

  // ── Chargement API ──────────────────────────────────────────────────────────

  loadDataWithPurchasesFilter(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.api.getPurchases().subscribe({
      next: (purchasesData) => {
        const ids = new Set<number>();
        purchasesData.forEach((p: any) => {
          if (p.productId) ids.add(Number(p.productId));
          if (p.idProduct) ids.add(Number(p.idProduct));
          (p.lines || []).forEach((l: any) => {
            const id = l.productId ?? l.idProduct;
            if (id) ids.add(Number(id));
          });
        });

        this.loadPurchasesForProducts(Array.from(ids));

        this.api.getSales().subscribe({
          next: (salesData) => {
            this.transactions = salesData;
            this._invalidateStats();   // données MAJ → cache stats périmé
            this.loading = false;
            this.cdr.markForCheck();
          },
          error: () => { this.loading = false; this.cdr.markForCheck(); }
        });
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.api.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this._filteredCache = null;
        this.loadDataWithPurchasesFilter();
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  loadSuppliers(): void {
    this.api.getSuppliers().subscribe({
      next: (data) => { this.suppliers = data.map((item: any) => item.supplier); }
    });
  }

  loadPurchasesForProducts(ids: number[]): void {
    // Dédoublonner + filtrer les IDs déjà chargés
    const toLoad = [...new Set(ids)].filter(id => id && this.purchasesByProduct[id] === undefined);

    toLoad.forEach(id => {
      this.purchasesByProduct[id] = []; // marque "en cours" pour éviter les doubles appels

      this.api.getPurchasesByProduct(id).subscribe({
        next: (data) => {
          this.purchasesByProduct[id] = [...data].sort(sortByDate);
          this._invalidateStats(id);
          this.cdr.markForCheck();
        },
        error: () => { this.purchasesByProduct[id] = []; this.cdr.markForCheck(); }
      });
    });
  }

  createPurchase(): void {
    const { supplierId, datePurchase } = this.newPurchase;
    if (!supplierId || !datePurchase) return;

    const validLines = this.purchaseLines.filter(l => l.productId && l.quantity > 0 && l.unitPriceTTC >= 0);
    if (!validLines.length) return;

    const payload = {
      ...this.newPurchase,
      lines: validLines.map(l => ({
        productId:    Number(l.productId),
        quantity:     Number(l.quantity),
        unitPriceTTC: Number(l.unitPriceTTC)
      }))
    };

    this.api.createPurchase(payload).subscribe({
      next: () => {
        this.showForm = false;
        this.initPurchaseForm();
        this.loadDataWithPurchasesFilter();

        // Rafraîchit les achats des produits concernés
        const ids = validLines.map(l => Number(l.productId));
        ids.forEach(id => {
          delete this.purchasesByProduct[id]; // force le rechargement
        });
        this.loadPurchasesForProducts(ids);
        this.cdr.markForCheck();
      }
    });
  }
}