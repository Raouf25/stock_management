import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit, AfterViewInit {
  // --- Propriétés UI et état ---
  @ViewChild('trendChart') trendChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') categoryChart!: ElementRef<HTMLCanvasElement>;
  type: 'sales' | 'purchases' | 'movements' = 'sales';
  loading = true;
  showForm = false;
  productSearch = '';
  openProducts: number[] = [];

  // --- Données ---
  transactions: any[] = [];
  purchasesByProduct: { [productId: number]: any[] } = {};
  movements: any[] = [];
  products: any[] = [];
  suppliers: any[] = [];

  // --- Filtres mouvements ---
  selectedType = '';
  selectedSource = '';
  typeOptions = ['ENTREE', 'SORTIE'];
  sourceOptions = ['ACHAT', 'VENTE', 'AJUSTEMENT'];

  // --- Formulaire ---
  newPurchase = {
    supplierId: '',
    productId: '',
    quantity: '',
    unitPriceTTC: '',
    invoiceNumber: '',
    datePurchase: ''
  };

  constructor(private apiService: ApiService, private route: ActivatedRoute, private router: Router) {}

  // --- Hooks Angular ---
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const t = params['type'];
      if (t === 'movements' || t === 'sales' || t === 'purchases') {
        this.type = t;
      }
    });
    this.loadProducts();
    this.loadSuppliers();
    if (this.type === 'movements') {
      this.loadMovements();
    } else {
      this.loadTransactions();
    }
  }

  ngAfterViewInit(): void {}

  // Ouvre le formulaire d'achat pour un produit donné
  openPurchaseForm(prod: any) {
    this.type = 'purchases';
    this.showForm = true;
    this.newPurchase = {
      ...this.newPurchase,
      productId: prod.idProduct || prod.id
    };
  }
  // --- Méthodes UI ---
  switchType(type: 'sales' | 'purchases' | 'movements') {
    this.type = type;
    this.showForm = false;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { type },
      queryParamsHandling: 'merge',
    });
    if (type === 'movements') {
      this.loadMovements();
    } else {
      this.loadTransactions();
    }
  }

  toggleProduct(id: number) {
    if (this.isProductOpen(id)) {
      this.openProducts = this.openProducts.filter(pid => pid !== id);
    } else {
      this.openProducts.push(id);
    }
  }

  isProductOpen(id: number) {
    return this.openProducts.includes(id);
  }

  // --- Produits triés alphabétiquement (pour le select du formulaire) ---
  get sortedProducts() {
    return [...this.products].sort((a, b) =>
        (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase(), 'fr')
    );
  }

  // --- Recherche et regroupement produits ---
  get filteredProducts() {
    const sortAlpha = (list: any[]) =>
        [...list].sort((a, b) => (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase(), 'fr'));

    if (!this.productSearch?.trim()) return sortAlpha(this.products);

    const search = this.productSearch.trim().toLowerCase();
    const filtered = this.products.filter(p =>
        (p.name && p.name.toLowerCase().includes(search)) ||
        (p.designation && p.designation.toLowerCase().includes(search))
    );
    return sortAlpha(filtered);
  }

  getSalesByProduct(productId: number) {
    return this.transactions.filter(t => t.productId === productId || t.idProduct === productId);
  }

  async loadPurchasesForProducts(productIds: number[]) {
    for (const id of productIds) {
      this.apiService.getPurchasesByProduct(id).subscribe({
        next: (data) => {
          // Tri du plus vieux au plus récent
          const sorted = [...data].sort((a, b) => {
            const dateA = new Date(a.datePurchase);
            const dateB = new Date(b.datePurchase);
            return dateA.getTime() - dateB.getTime();
          });
          this.purchasesByProduct[id] = sorted;
        },
        error: () => {
          this.purchasesByProduct[id] = [];
        }
      });
    }
  }

  getPurchasesByProduct(productId: number) {
    return this.purchasesByProduct[productId] || [];
  }

  // CORRIGÉ : Calcul du stock = Achats - Ventes (sans stock initial)
  getCurrentStock(productId: number): number {
    // Somme des achats pour ce produit
    const purchases = this.getPurchasesByProduct(productId);
    const achats = purchases.reduce((sum, a) => sum + (a.quantity || 0), 0);

    // Somme des ventes pour ce produit
    const sales = this.transactions.filter(t =>
        (t.productId === productId || t.idProduct === productId) &&
        (t.quantitySold !== undefined || t.quantity !== undefined)
    );
    const ventes = sales.reduce((sum, v) => sum + (v.quantitySold || 0), 0);

    // Calcul final : Achats - Ventes
    const stockFinal = achats - ventes;

    return Math.max(0, stockFinal); // Garantir que le stock ne soit jamais négatif
  }

  getSalesCount(productId: number) {
    return this.getSalesByProduct(productId).length;
  }

  getPurchasesCount(productId: number) {
    return this.getPurchasesByProduct(productId).length;
  }

  // --- Prix moyen par produit ---
  getAveragePurchasePrice(productId: number): number {
    const purchases = this.getPurchasesByProduct(productId);
    if (!purchases || purchases.length === 0) return 0;
    // Prix d'achat moyen par pièce = somme (prix unitaire * quantité) / somme (quantité)
    const totalAmount = purchases.reduce((sum: number, p: any) => sum + ((p.unitPriceTTC || 0) * (p.quantity || 0)), 0);
    const totalQuantity = purchases.reduce((sum: number, p: any) => sum + (p.quantity || 0), 0);
    if (totalQuantity === 0) return 0;
    return totalAmount / totalQuantity;
  }

  getAverageSalePrice(productId: number): number {
    const sales = this.getSalesByProduct(productId);
    if (!sales || sales.length === 0) return 0;
    // Prix de vente moyen par pièce = somme (prix unitaire * quantité vendue) / somme (quantité vendue)
    const totalAmount = sales.reduce((sum: number, s: any) => sum + ((s.unitSalePrice || 0) * (s.quantitySold || 0)), 0);
    const totalQuantity = sales.reduce((sum: number, s: any) => sum + (s.quantitySold || 0), 0);
    if (totalQuantity === 0) return 0;
    return totalAmount / totalQuantity;
  }

  // --- Chargement des données (API) ---
  loadTransactions(): void {
    this.loading = true;
    if (this.type === 'sales') {
      this.apiService.getSales().subscribe({
        next: (data) => {
          this.transactions = data;
          this.loading = false;
          this.createCharts();
        }
      });
    } else if (this.type === 'purchases') {
      this.apiService.getPurchases().subscribe({
        next: (data) => {
          this.transactions = data;
          // Charger les achats par produit pour tous les produits affichés
          const productIds = Array.from(new Set(data.map((p: any) => p.productId || p.idProduct)));
          this.loadPurchasesForProducts(productIds);
          this.loading = false;
          this.createCharts();
        }
      });
    }
  }

  loadMovements(): void {
    this.loading = true;
    this.apiService.getStockMovements().subscribe({
      next: (data) => {
        this.movements = this.filterMovements(data);
        this.loading = false;
      }
    });
  }

  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        // Charger les achats pour tous les produits dès que la liste est disponible
        const productIds = Array.from(new Set(data.map((p: any) => p.idProduct || p.productId)));
        this.loadPurchasesForProducts(productIds);
      }
    });
  }

  loadSuppliers(): void {
    this.apiService.getSuppliers().subscribe({
      next: (data) => this.suppliers = data.map(item => item.supplier)
    });
  }

  // --- Filtres mouvements ---
  filterMovements(data: any[]): any[] {
    return data.filter(m => {
      const typeMatch = !this.selectedType || m.type === this.selectedType;
      const sourceMatch = !this.selectedSource || m.source === this.selectedSource;
      return typeMatch && sourceMatch;
    });
  }

  onFilterChange(): void {
    this.loadMovements();
  }

  getMovementIcon(type: string): string {
    return type === 'ENTREE' ? '📥' : '📤';
  }

  // --- Calculs/KPIs ---
  getTotalAmount(): number {
    if (this.type === 'sales') {
      return this.transactions.reduce((sum, s) => sum + (s.totalSaleAmount || 0), 0);
    } else if (this.type === 'purchases') {
      return this.transactions.reduce((sum, p) => sum + (p.totalAmountTTC || 0), 0);
    }
    return 0;
  }

  getTotalQuantity(): number {
    if (this.type === 'sales') {
      return this.transactions.reduce((sum, s) => sum + (s.quantitySold || 0), 0);
    } else if (this.type === 'purchases') {
      return this.transactions.reduce((sum, p) => sum + (p.quantity || 0), 0);
    }
    return 0;
  }

  getAveragePrice(): number {
    if (this.type === 'sales' && this.transactions.length > 0) {
      return this.transactions.reduce((sum, s) => sum + (s.unitSalePrice || 0), 0) / this.transactions.length;
    } else if (this.type === 'purchases' && this.transactions.length > 0) {
      return this.transactions.reduce((sum, p) => sum + (p.unitPriceTTC || 0), 0) / this.transactions.length;
    }
    return 0;
  }

  getTotalMovementQuantity(type: string): number {
    return this.movements.filter(m => m.type === type).reduce((sum, m) => sum + (m.quantity || 0), 0);
  }

  // --- Création (achats) ---
  createPurchase(): void {
    if (!this.newPurchase.supplierId || !this.newPurchase.productId || !this.newPurchase.quantity || !this.newPurchase.unitPriceTTC || !this.newPurchase.datePurchase) return;
    const prodId = Number(this.newPurchase.productId); // Récupérer AVANT reset
    this.apiService.createPurchase(this.newPurchase).subscribe({
      next: () => {
        this.showForm = false;
        this.newPurchase = {
          supplierId: '',
          productId: '',
          quantity: '',
          unitPriceTTC: '',
          invoiceNumber: '',
          datePurchase: ''
        };
        this.loadTransactions();
        // Mettre à jour le tableau Achats pour le produit concerné
        if (prodId) {
          this.apiService.getPurchasesByProduct(prodId).subscribe({
            next: (data) => {
              // Tri du plus vieux au plus récent
              const sorted = [...data].sort((a, b) => {
                const dateA = new Date(a.datePurchase);
                const dateB = new Date(b.datePurchase);
                return dateA.getTime() - dateB.getTime();
              });
              this.purchasesByProduct[prodId] = sorted;
            },
            error: () => {
              this.purchasesByProduct[prodId] = [];
            }
          });
        }
      }
    });
  }

  // --- Calcul du bilan (ventes - achats) ---
  getBilan(productId: number): number {
    const ventes = this.getSalesByProduct(productId).reduce((sum, s) => sum + (s.totalSaleAmount || 0), 0);
    const achats = this.getPurchasesByProduct(productId).reduce((sum, p) => sum + (p.totalAmountTTC || 0), 0);
    return ventes - achats;
  }

  // --- Graphiques (placeholder) ---
  createCharts(): void {
    // Graphique Top Produits (par quantité vendue)
    if (this.type === 'sales' && this.products.length > 0 && this.transactions.length > 0 && this.categoryChart) {
      // Regrouper les ventes par produit
      const salesByProduct: { [key: string]: number } = {};
      this.transactions.forEach(sale => {
        const prodId = sale.productId || sale.idProduct;
        if (!salesByProduct[prodId]) salesByProduct[prodId] = 0;
        salesByProduct[prodId] += sale.quantitySold || 0;
      });

      // Trier les produits par quantité vendue (descendant)
      const sorted = Object.entries(salesByProduct)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 7); // Top 7 produits

      const labels = sorted.map(([prodId]) => {
        const prod = this.products.find(p => p.idProduct == prodId || p.productId == prodId);
        return prod ? prod.name : 'Produit ' + prodId;
      });
      const data = sorted.map(([, qty]) => qty);

      // Détruire l'ancien graphique si besoin
      if ((this as any)._categoryChartInstance) {
        (this as any)._categoryChartInstance.destroy();
      }

      const ctx = this.categoryChart.nativeElement.getContext('2d');
      if (ctx) {
        (this as any)._categoryChartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Quantité vendue',
              data,
              backgroundColor: '#6366f1',
              borderRadius: 6,
              maxBarThickness: 38
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false },
              title: { display: false }
            },
            scales: {
              x: { grid: { display: false } },
              y: { beginAtZero: true, grid: { color: '#e5e7eb' } }
            }
          }
        });
      }
    }
  }
}