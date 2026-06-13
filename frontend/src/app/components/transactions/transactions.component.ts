import {
  Component, OnInit, ViewChild, ElementRef,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// ── Types stricts calqués sur le Back-end ──────────────────────────────────────
interface PurchaseLine {
  productId:    string;
  productSearch: string;
  productLabel: string;
  quantity:     number;
  unitPriceTTC: number;
  dropdownOpen: boolean;
}

// Structure exacte du modèle Product Java (getProducts endpoint)
interface Product {
  idProduct:             number;
  reference?:            number;
  designation:           string;
  name:                  string;
  description?:          string;
  category?:             string;
  gamme?:                string;
  unit:                  string;
  unitPriceSold?:        number;
  unitPriceBought?:      number;
  imageUrl?:             string;
  initialStockQuantity?: number;
  initialUnitPrice?:     number;
  initialStockValue?:    number;
  currentStockQuantity?: number;
  currentStockValue?:    number;
  cmp?:                  number;
  supplier?:             any;
}

// L'objet produit contient désormais directement ses statistiques calculées par le BE
interface DashboardProduct {
  idProduct: number;
  product?: {
    idProduct?: number;
    id?: number;
    name: string;
    designation: string;
    unit: string;
  };
  name: string;
  designation: string;
  unit: string;
  // Statistiques directement fournies par le Back-end :
  stockVendu: number;
  stockEntrepot: number;
  purchasesCount: number;
  averagePurchasePrice: number;
  salesCount: number;
  averageSalePrice: number;
  bilan: number;
  // Listes associées si nécessaires pour le drawer :
  purchases?: any[];
  sales?: any[];
}

// ── Constantes ─────────────────────────────────────────────────────────────────
const EMPTY_PURCHASE = { supplierId: '', invoiceNumber: '', datePurchase: '' };

@Component({
  selector:    'app-transactions',
  standalone:  true,
  imports:     [CommonModule, FormsModule],
  templateUrl: './transactions.component.html',
  styleUrls:   ['./transactions.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush   // PERF: Optimal car les données sont immutables et calculées au tableau de bord
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
  selectedProductForDrawer: DashboardProduct | null = null;

  // ── Données brutes et agrégées reçues du Back-end ───────────────────────────
  products:            DashboardProduct[]    = [];
  productsInStock:     Product[]             = [];
  suppliers:           any[]                 = [];
  billsCache: Record<number, { paymentStatus: string; loading: boolean }> = {};

  // ── Formulaire ─────────────────────────────────────────────────────────────
  newPurchase  = { ...EMPTY_PURCHASE };
  purchaseLines: PurchaseLine[] = [];

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.initPurchaseForm();
    this.loadSuppliers();
    this.loadProducts();
    this.loadDashboardData();
  }

  // ── Drawer ──────────────────────────────────────────────────────────────────

  openProductDrawer(product: DashboardProduct): void {
    this.selectedProductForDrawer = product;
    this.isDrawerOpen = true;

    // Si le Back-end requiert un appel séparé pour enrichir les ventes/achats ou statuts du drawer :
    if (product.idProduct) {
      this.loadPaymentStatusesForProductSales(product.idProduct);
    }
    this.cdr.markForCheck();
  }

  closeDrawer(): void {
    this.isDrawerOpen = false;
    this.selectedProductForDrawer = null;
    this.cdr.markForCheck();
  }

  /* toggleShowAllProducts(): void {
     this.showAllProducts = !this.showAllProducts;
     this.cdr.markForCheck();
   }*/

  // ── filteredProducts ────────────────────────────────────────────────────────

  get filteredProducts(): DashboardProduct[] {
    // Si "showAllProducts" est faux, on filtre sur ceux qui ont du stock vendu ou des mouvements (géré par le BE via purchasesCount)
    let list = this.showAllProducts
        ? [...this.products]
        : this.products.filter(p => p.purchasesCount > 0 || p.salesCount > 0);

    const term = this.productSearch.trim().toLowerCase();
    if (term) {
      list = list.filter(p =>
          p.product?.name?.toLowerCase().includes(term) ||
          p.product?.designation?.toLowerCase().includes(term) ||
          p.name?.toLowerCase().includes(term)
      );
    }

    // Adapter aussi le tri alphabétique si nécessaire
    return list.sort((a, b) => {
      const nameA = a.product?.name || a.name || '';
      const nameB = b.product?.name || b.name || '';
      return nameA.toLowerCase().localeCompare(nameB.toLowerCase(), 'fr');
    });
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

  openLineDropdown(i: number): void {
    this.purchaseLines[i].dropdownOpen = true;
    this.cdr.markForCheck();
  }

  closeLineDropdown(i: number): void {
    setTimeout(() => { this.purchaseLines[i].dropdownOpen = false; this.cdr.markForCheck(); }, 220);
  }

  onLineSearchChange(i: number): void {
    this.purchaseLines[i].dropdownOpen = true;
    this.cdr.markForCheck();
  }

  getFilteredProductsForLine(line: PurchaseLine): Product[] {
    const term = line.productSearch.trim().toLowerCase();
    const list = term
        ? this.productsInStock.filter(p =>
            (p.name || '').toLowerCase().includes(term) ||
            (p.designation || '').toLowerCase().includes(term))
        : [...this.productsInStock];
    return list.sort((a, b) =>
        (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase(), 'fr'));
  }

  selectProductForLine(i: number, p: Product): void {
    const line = this.purchaseLines[i];
    line.productId     = p.idProduct != null ? String(p.idProduct) : '';
    line.productLabel  = `${p.name} - ${p.unit}`;
    line.productSearch = p.name;
    line.dropdownOpen  = false;
    this.cdr.markForCheck();
  }

  // ── Accesseurs directs (Plus aucun calcul ici, lecture directe des propriétés du BE) ──

  getStockVendu(product: DashboardProduct):        number { return product.stockVendu; }
  getStockEntrepot(product: DashboardProduct):     number { return product.stockEntrepot; }
  getAveragePurchasePrice(product: DashboardProduct): number { return product.averagePurchasePrice; }
  getAverageSalePrice(product: DashboardProduct):  number { return product.averageSalePrice; }
  getBilan(product: DashboardProduct):             number { return product.bilan; }

  // ── Statut paiement ─────────────────────────────────────────────────────────

  private loadPaymentStatusesForProductSales(productId: number): void {
    const product = this.products.find(p => p.idProduct === productId);
    if (!product || !product.sales) return;

    product.sales.forEach(sale => {
      const billId = sale.invoiceNumber;
      if (!billId || this.billsCache[billId]) return;

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

  getPaymentBadgeClass(status: string): string {
    switch ((status || '').toUpperCase()) {
      case 'PAID':            return 'badge-status paid';
      case 'PARTIALLY_PAID':  return 'badge-status partial';
      case 'UNPAID':          return 'badge-status unpaid';
      default:                return 'badge-status default';
    }
  }

  // ── Chargement API (Données pré-calculées par le Back-end) ──────────────────

  loadDashboardData(): void {
    this.loading = true;
    this.cdr.markForCheck();

    // On appelle l'endpoint du Back-end qui renvoie le tableau complet déjà calculé
    this.api.getDashboardProducts().subscribe({
      next: (dashboardData: DashboardProduct[]) => {
        this.products = dashboardData;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadProducts(): void {
    this.api.getProducts().subscribe({
      next: (data: Product[]) => {
        this.productsInStock = data;
        this.cdr.markForCheck();
      },
      error: () => { this.cdr.markForCheck(); }
    });
  }


  loadSuppliers(): void {
    this.api.getSuppliers().subscribe({
      next: (data) => { this.suppliers = data.map((item: any) => item.supplier); }
    });
  }

  createPurchase(): void {
    const { supplierId, datePurchase } = this.newPurchase;
    if (!supplierId || !datePurchase) return;

    const validLines = this.purchaseLines.filter(l => {
      const id = Number(l.productId);
      return !!l.productId && !isNaN(id) && id > 0 && Number(l.quantity) > 0 && Number(l.unitPriceTTC) >= 0;
    });
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
        // Une fois l'achat créé, on rafraîchit tout le dashboard.
        // Le Back-end recalculera instantanément les nouvelles lignes de stock, bilan, etc.
        this.loadDashboardData();
      }
    });
  }
}