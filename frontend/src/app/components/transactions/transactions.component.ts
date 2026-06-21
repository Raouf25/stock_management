import {
  Component, OnInit, OnDestroy, ViewChild, ElementRef,
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

// Interfaces calquées sur ProductDashboardResponseDTO du Back-end
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
  id:            number;
  date:          string;
  supplierName:  string;
  quantity:      number;
  unitPrice:     number;
  total:         number;
  invoiceNumber?: string;
}

interface SaleItem {
  id:                  number;
  date:                string;
  customerName?:       string;
  quantity:            number;
  unitPrice:           number;
  total:               number;
  invoiceNumber?:      string;
  deliveryNoteNumber?: string;
  paymentStatus:       string;
}

interface DashboardProduct {
  product:    ProductSummary;
  statistics: Statistics;
  purchases:  PurchaseItem[];
  sales:      SaleItem[];
}

// ── Constantes ─────────────────────────────────────────────────────────────────
const EMPTY_PURCHASE = { supplierId: '', invoiceNumber: '', datePurchase: '' };

@Component({
  selector:    'app-transactions',
  standalone:  true,
  imports:     [CommonModule, FormsModule],
  templateUrl: './transactions.component.html',
  styleUrls:   ['./transactions.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionsComponent implements OnInit, OnDestroy {
  @ViewChild('trendChart')    trendChart!:    ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') categoryChart!: ElementRef<HTMLCanvasElement>;

  // ── UI ─────────────────────────────────────────────────────────────────────
  loading         = true;
  showForm        = false;
  productSearch   = '';
  showAllProducts = false;
  isDrawerOpen    = false;
  selectedProductForDrawer: DashboardProduct | null = null;

  bilanSortState: 'none' | 'desc' | 'asc' = 'none';

  // ── Dropdown position (fixed positioning pour éviter le clipping) ───────────
  dropdownStyle: { top: string; left: string; width: string } = { top: '0px', left: '0px', width: '0px' };
  private activeDropdownIndex = -1;
  private activeDropdownInput: HTMLElement | null = null;
  private scrollHandler = () => this.repositionDropdown();

  private repositionDropdown(): void {
    if (this.activeDropdownInput && this.activeDropdownIndex >= 0) {
      const rect = this.activeDropdownInput.getBoundingClientRect();
      this.dropdownStyle = {
        top:   `${rect.bottom}px`,
        left:  `${rect.left}px`,
        width: `${rect.width}px`
      };
      this.cdr.markForCheck();
    }
  }

  products:        DashboardProduct[] = [];
  productsInStock: Product[]          = [];
  suppliers:       any[]              = [];

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

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.scrollHandler, true);
  }

  // ── Drawer ──────────────────────────────────────────────────────────────────

  openProductDrawer(product: DashboardProduct): void {
    this.selectedProductForDrawer = product;
    this.isDrawerOpen = true;
    this.cdr.markForCheck();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (this.showForm) {
      this.initPurchaseForm();
      if (this.productsInStock.length === 0) {
        this.loadProducts();
      }
    }
    this.cdr.markForCheck();
  }

  closeDrawer(): void {
    this.isDrawerOpen = false;
    this.selectedProductForDrawer = null;
    this.cdr.markForCheck();
  }

  // ── filteredProducts ────────────────────────────────────────────────────────

  get filteredProducts(): DashboardProduct[] {
    let list = this.showAllProducts
        ? [...this.products]
        : this.products.filter(p => (p.purchases?.length ?? 0) > 0 || (p.sales?.length ?? 0) > 0);

    const term = this.productSearch.trim().toLowerCase();
    if (term) {
      list = list.filter(p =>
          p.product?.name?.toLowerCase().includes(term) ||
          p.product?.category?.toLowerCase().includes(term)
      );
    }

    if (this.bilanSortState === 'none') {
      return list.sort((a, b) =>
          (a.product?.name ?? '').toLowerCase().localeCompare((b.product?.name ?? '').toLowerCase(), 'fr')
      );
    }

    return list.sort((a, b) => {
      const bilanA = this.getBilan(a);
      const bilanB = this.getBilan(b);
      return this.bilanSortState === 'asc' ? bilanA - bilanB : bilanB - bilanA;
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

  openLineDropdown(i: number, event?: Event): void {
    if (event) {
      const input = event.target as HTMLElement;
      this.activeDropdownInput = input;
      this.activeDropdownIndex = i;
      const rect = input.getBoundingClientRect();
      this.dropdownStyle = {
        top:   `${rect.bottom}px`,
        left:  `${rect.left}px`,
        width: `${rect.width}px`
      };
      window.addEventListener('scroll', this.scrollHandler, true);
    }
    this.purchaseLines[i].dropdownOpen = true;
    this.cdr.markForCheck();
  }

  closeLineDropdown(i: number): void {
    setTimeout(() => {
      this.purchaseLines[i].dropdownOpen = false;
      this.activeDropdownIndex = -1;
      this.activeDropdownInput = null;
      window.removeEventListener('scroll', this.scrollHandler, true);
      this.cdr.markForCheck();
    }, 220);
  }

  onLineSearchChange(i: number, event?: Event): void {
    if (event && !this.purchaseLines[i].dropdownOpen) {
      const input = event.target as HTMLElement;
      const rect = input.getBoundingClientRect();
      this.dropdownStyle = {
        top:   `${rect.bottom}px`,
        left:  `${rect.left}px`,
        width: `${rect.width}px`
      };
    }
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
    const seen = new Set<number>();
    return list
        .filter(p => { if (seen.has(p.idProduct)) return false; seen.add(p.idProduct); return true; })
        .sort((a, b) => (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase(), 'fr'));
  }

  selectProductForLine(i: number, p: Product): void {
    const line = this.purchaseLines[i];
    line.productId     = p.idProduct != null ? String(p.idProduct) : '';
    line.productLabel  = `${p.name} - ${p.unit}`;
    line.productSearch = p.name;
    line.dropdownOpen  = false;
    this.cdr.markForCheck();
  }

  // ── Accesseurs (lecture de la structure imbriquée du Back-end) ──────────────

  getStockVendu(prod: DashboardProduct):            number { return prod.sales?.reduce((acc, s) => acc + (s.quantity ?? 0), 0) ?? 0; }
  getStockEntrepot(prod: DashboardProduct):          number { return prod.product?.stock ?? 0; }
  getAveragePurchasePrice(prod: DashboardProduct):   number { return prod.statistics?.averagePurchasePrice ?? 0; }
  getAverageSalePrice(prod: DashboardProduct):       number { return prod.statistics?.averageSalePrice ?? 0; }
  getBilan(prod: DashboardProduct):                  number { return prod.statistics?.balance ?? 0; }

  getPaymentBadgeClass(status: string): string {
    switch ((status || '').toUpperCase()) {
      case 'PAID':            return 'badge-status paid';
      case 'PARTIALLY_PAID':  return 'badge-status partial';
      case 'UNPAID':          return 'badge-status unpaid';
      default:                return 'badge-status default';
    }
  }

  // ── Chargement API ──────────────────────────────────────────────────────────

  loadDashboardData(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.api.getDashboardProducts().subscribe({
      next: (data: DashboardProduct[]) => {
        this.products = data;
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
        const seen = new Set<number>();
        this.productsInStock = data.filter(p => {
          if (seen.has(p.idProduct)) return false;
          seen.add(p.idProduct);
          return true;
        });
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
        this.loadDashboardData();
      }
    });
  }

  toggleBilanSort(): void {
    if (this.bilanSortState === 'none') {
      this.bilanSortState = 'desc';
    } else if (this.bilanSortState === 'desc') {
      this.bilanSortState = 'asc';
    } else {
      this.bilanSortState = 'none';
    }
    this.cdr.markForCheck();
  }
}
