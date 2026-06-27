import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

// ── Types ──────────────────────────────────────────────────────────────────────
interface PurchaseLine {
  productId:     string;
  productSearch: string;
  productLabel:  string;
  quantity:      number;
  unitPriceTTC:  number;
  dropdownOpen:  boolean;
}

interface Product {
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
  selector:    'app-transactions',
  standalone:  true,
  imports:     [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="page">

  <!-- ══ EN-TÊTE ═══════════════════════════════════════════════════════════ -->
  <div class="page-header">
    <h1 class="page-title">Transactions</h1>
    <button class="btn-create" (click)="toggleForm()">
      {{ showForm ? '✕ Fermer le formulaire' : '+ Nouvel Achat' }}
    </button>
  </div>

  <!-- ══ FORMULAIRE ACHAT ═══════════════════════════════════════════════════ -->
  <div *ngIf="showForm" class="main-card" style="margin-bottom:1.5rem;">
    <div class="form-header">
      <span class="form-header-title">➕ Nouvel Achat</span>
    </div>
    <div class="form-body">

      <!-- Ligne 1 : Fournisseur / N° Facture / Date -->
      <div class="form-row">
        <div class="form-group fg-wide">
          <label class="form-lbl">Fournisseur</label>
          <select class="form-ctrl" [(ngModel)]="newPurchase.supplierId" name="supplierId">
            <option value="">Sélectionnez un fournisseur…</option>
            <option *ngFor="let s of suppliers" [value]="s.id">{{ s.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-lbl">N° Facture</label>
          <input type="text" class="form-ctrl" [(ngModel)]="newPurchase.invoiceNumber"
                 name="invoiceNumber" placeholder="Ex : FAC-2026-001">
        </div>
        <div class="form-group">
          <label class="form-lbl">Date d'Achat</label>
          <input type="date" class="form-ctrl" [(ngModel)]="newPurchase.datePurchase"
                 name="datePurchase">
        </div>
      </div>

      <!-- Lignes produits -->
      <div class="lines-toolbar">
        <span class="lines-label">Produits ({{ purchaseLines.length }})</span>
        <button type="button" class="btn-add-line" (click)="addPurchaseLine()">＋ Ajouter</button>
      </div>

      <div class="lines-table-wrap">
        <div class="lines-table-head">
          <span class="lth-product">Produit</span>
          <span class="lth-qty">Quantité</span>
          <span class="lth-price">Prix U. TTC (DT)</span>
          <span class="lth-del"></span>
        </div>

        <div *ngFor="let line of purchaseLines; let i = index"
             class="lines-table-row" [class.row-alt]="i % 2 !== 0">

          <!-- Recherche produit avec dropdown -->
          <div class="line-cell cell-product" style="position:relative;">
            <input type="text" class="form-ctrl"
                   [placeholder]="line.productLabel || 'Rechercher…'"
                   [(ngModel)]="line.productSearch" [name]="'productSearch_' + i"
                   (focus)="openLineDropdown(i, $event)"
                   (input)="onLineSearchChange(i, $event)"
                   (blur)="closeLineDropdown(i)" autocomplete="off">
            <div *ngIf="line.dropdownOpen" class="product-dropdown"
                 [style.top]="dropdownStyle.top"
                 [style.left]="dropdownStyle.left"
                 [style.width]="dropdownStyle.width">
              <div *ngIf="getFilteredProductsForLine(line).length === 0"
                   class="dropdown-empty">Aucun produit trouvé</div>
              <div *ngFor="let p of getFilteredProductsForLine(line)"
                   (mousedown)="$event.preventDefault(); selectProductForLine(i, p)"
                   class="dropdown-item">
                {{ p.name }} <span class="dropdown-unit">— {{ p.unit }}</span>
              </div>
            </div>
          </div>

          <div class="line-cell cell-qty">
            <input type="number" class="form-ctrl" [(ngModel)]="line.quantity"
                   [name]="'qty_' + i" min="1" placeholder="Ex: 100">
          </div>

          <div class="line-cell cell-price">
            <input type="number" step="0.001" min="0.001" class="form-ctrl"
                   [(ngModel)]="line.unitPriceTTC" [name]="'price_' + i"
                   placeholder="Ex: 50.000"
                   [class.input-error]="!!line.productId && line.unitPriceTTC <= 0">
          </div>

          <div class="line-cell cell-del">
            <button type="button" *ngIf="purchaseLines.length > 1"
                    class="btn-del-line" (click)="removePurchaseLine(i)"
                    title="Supprimer cette ligne">✕</button>
          </div>
        </div>
      </div>

      <!-- Total + Submit -->
      <p *ngIf="formError" class="form-error-msg">⚠ {{ formError }}</p>
      <div class="form-footer">
        <span class="form-total">
          Total TTC :
          <strong>{{ getPurchaseLinesTotal() | number:'1.3-3' }} DT</strong>
        </span>
        <button type="button" class="btn-submit" (click)="createPurchase()">
          ✓ Créer l'Achat
        </button>
      </div>

    </div>
  </div>

  <!-- ══ CARTE PRINCIPALE (tableau produits) ═══════════════════════════════ -->
  <div class="main-card">

    <div class="filter-bar">
      <div class="filter-group fg-wide">
        <label class="filter-lbl">Recherche</label>
        <input type="text" class="filter-ctrl" [(ngModel)]="productSearch"
               placeholder="Nom ou catégorie de produit…">
      </div>
      <button *ngIf="productSearch" class="btn-reset" (click)="productSearch=''">
        ✕ Réinitialiser
      </button>
    </div>

    <!-- Loading -->
    <div *ngIf="loading" class="empty-state">
      <div class="empty-icon">⏳</div>
      <p>Chargement…</p>
    </div>

    <!-- Desktop table -->
    <div class="desktop-table" *ngIf="!loading">
      <table class="data-table">
        <thead>
          <tr>
            <th>PRODUIT</th>
            <th class="ta-r">STOCK VENDU</th>
            <th class="ta-r">STOCK ENTREPÔT</th>
            <th class="ta-r">ACHATS</th>
            <th class="ta-r">PRIX MOY. ACHAT</th>
            <th class="ta-r">VENTES</th>
            <th class="ta-r">PRIX MOY. VENTE</th>
            <th class="ta-r sort-col" (click)="toggleBilanSort()">
              BILAN
              <span class="sort-icon">
                <ng-container *ngIf="bilanSortState === 'none'">↕</ng-container>
                <ng-container *ngIf="bilanSortState === 'desc'">▼</ng-container>
                <ng-container *ngIf="bilanSortState === 'asc'">▲</ng-container>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let prod of filteredProducts"
              class="data-row"
              [class.bilan-pos]="getBilan(prod) > 0"
              [class.bilan-neg]="getBilan(prod) < 0"
              (click)="openProductDrawer(prod)">
            <td>
              <span class="client-name">{{ prod.product.name }}</span>
              <span class="td-muted" style="margin-left:.25rem;font-size:.8rem;">— {{ prod.product.unit }}</span>
              <span class="loupe" (click)="$event.stopPropagation(); openProductDrawer(prod)">🔍</span>
            </td>
            <td class="ta-r">{{ getStockVendu(prod) }}</td>
            <td class="ta-r">{{ getStockEntrepot(prod) }}</td>
            <td class="ta-r">
              <span class="id-badge">{{ prod.purchases.length }}</span>
            </td>
            <td class="ta-r td-muted">{{ getAveragePurchasePrice(prod) | number:'1.3-3' }}</td>
            <td class="ta-r">
              <span class="id-badge">{{ prod.sales.length }}</span>
            </td>
            <td class="ta-r td-muted">{{ getAverageSalePrice(prod) | number:'1.3-3' }}</td>
            <td class="ta-r fw-700"
                [class.c-green]="getBilan(prod) > 0"
                [class.c-red]="getBilan(prod) < 0">
              {{ getBilan(prod) | number:'1.3-3' }}
            </td>
          </tr>
          <tr *ngIf="filteredProducts.length === 0">
            <td colspan="8" class="empty-state">
              <div class="empty-icon">📭</div>
              <p>Aucun produit trouvé</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile : scroll horizontal -->
    <div class="mobile-scroll" *ngIf="!loading">
      <table class="data-table">
        <thead>
          <tr>
            <th>PRODUIT</th>
            <th class="ta-r">VENDU</th>
            <th class="ta-r">STOCK</th>
            <th class="ta-r sort-col" (click)="toggleBilanSort()">
              BILAN <span class="sort-icon">
                <ng-container *ngIf="bilanSortState === 'none'">↕</ng-container>
                <ng-container *ngIf="bilanSortState === 'desc'">▼</ng-container>
                <ng-container *ngIf="bilanSortState === 'asc'">▲</ng-container>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let prod of filteredProducts"
              class="data-row"
              [class.bilan-pos]="getBilan(prod) > 0"
              [class.bilan-neg]="getBilan(prod) < 0"
              (click)="openProductDrawer(prod)">
            <td>
              <div class="client-name" style="font-size:.82rem;">{{ prod.product.name }}</div>
              <div class="td-muted" style="font-size:.75rem;">{{ prod.product.unit }}</div>
            </td>
            <td class="ta-r">{{ getStockVendu(prod) }}</td>
            <td class="ta-r">{{ getStockEntrepot(prod) }}</td>
            <td class="ta-r fw-700"
                [class.c-green]="getBilan(prod) > 0"
                [class.c-red]="getBilan(prod) < 0"
                style="font-size:.82rem;">
              {{ getBilan(prod) | number:'1.0-0' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div><!-- /main-card -->

</div><!-- /page -->

<!-- ══ DRAWER BACKDROP ════════════════════════════════════════════════════════ -->
<div class="drawer-backdrop" *ngIf="isDrawerOpen" (click)="closeDrawer()"></div>

<!-- ══ SIDE DRAWER ═══════════════════════════════════════════════════════════ -->
<div class="side-drawer" [class.open]="isDrawerOpen">
  <div *ngIf="selectedProductForDrawer" style="display:flex;flex-direction:column;height:100%;">

    <div class="drawer-header">
      <div>
        <h3 class="drawer-title">{{ selectedProductForDrawer.product.name }} — {{ selectedProductForDrawer.product.unit }}</h3>
        <span *ngIf="selectedProductForDrawer.product.category" class="drawer-sub">
          {{ selectedProductForDrawer.product.category }}
        </span>
      </div>
      <button class="btn-close-drawer" (click)="closeDrawer()">✕</button>
    </div>

    <div class="drawer-body">

      <!-- Stats grid -->
      <div class="drawer-stats-grid">
        <div class="drawer-stat-box">
          <span class="dstat-lbl">Article vendu</span>
          <span class="dstat-val">{{ getStockVendu(selectedProductForDrawer) }}</span>
        </div>
        <div class="drawer-stat-box">
          <span class="dstat-lbl">Article en entrepôt</span>
          <span class="dstat-val">{{ getStockEntrepot(selectedProductForDrawer) }}</span>
        </div>
        <div class="drawer-stat-box">
          <span class="dstat-lbl">Nombre d'achats</span>
          <span class="dstat-val">{{ selectedProductForDrawer.purchases.length }}</span>
        </div>
        <div class="drawer-stat-box">
          <span class="dstat-lbl">Prix d'achat moyen</span>
          <span class="dstat-val">{{ getAveragePurchasePrice(selectedProductForDrawer) | number:'1.3-3' }} DT</span>
        </div>
        <div class="drawer-stat-box">
          <span class="dstat-lbl">Nombre de ventes</span>
          <span class="dstat-val">{{ selectedProductForDrawer.sales.length }}</span>
        </div>
        <div class="drawer-stat-box">
          <span class="dstat-lbl">Prix de vente moyen</span>
          <span class="dstat-val">{{ getAverageSalePrice(selectedProductForDrawer) | number:'1.3-3' }} DT</span>
        </div>
        <div class="drawer-stat-box full-width"
             [class.bilan-pos-box]="getBilan(selectedProductForDrawer) >= 0"
             [class.bilan-neg-box]="getBilan(selectedProductForDrawer) < 0">
          <span class="dstat-lbl fw-700">Bilan financier global</span>
          <span class="dstat-val" style="font-size:1.35rem;">
            {{ getBilan(selectedProductForDrawer) | number:'1.3-3' }} DT
          </span>
        </div>
      </div>

      <!-- Historique achats -->
      <div class="drawer-section-title" style="color:#ea580c;">🛒 Historique des Achats</div>
      <div class="drawer-table-wrap">
        <table class="drawer-table">
          <thead>
            <tr class="thead-orange">
              <th>Date</th>
              <th>Fournisseur</th>
              <th class="ta-r">Qté</th>
              <th class="ta-r">P.U TTC</th>
              <th class="ta-r">Total TTC</th>
              <th>Facture</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of selectedProductForDrawer.purchases" class="drawer-row">
              <td>{{ p.date | date:'dd/MM/yyyy' }}</td>
              <td class="fw-500">{{ p.supplierName || '—' }}</td>
              <td class="ta-r">{{ p.quantity }}</td>
              <td class="ta-r td-muted">{{ p.unitPrice | number:'1.3-3' }}</td>
              <td class="ta-r fw-600">{{ p.total | number:'1.3-3' }}</td>
              <td class="td-muted">{{ p.invoiceNumber || '—' }}</td>
            </tr>
            <tr *ngIf="selectedProductForDrawer.purchases?.length === 0">
              <td colspan="6" class="drawer-empty">Aucun achat enregistré</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Historique ventes -->
      <div class="drawer-section-title" style="color:#4f46e5;margin-top:2rem;">📈 Historique des Ventes</div>
      <div class="drawer-table-wrap">
        <table class="drawer-table">
          <thead>
            <tr class="thead-indigo">
              <th>Date</th>
              <th>Client</th>
              <th class="ta-r">Qté</th>
              <th class="ta-r">P.U Vente</th>
              <th class="ta-r">Total</th>
              <th>Référence</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of selectedProductForDrawer.sales" class="drawer-row">
              <td>{{ s.date | date:'dd/MM/yyyy' }}</td>
              <td class="fw-500">{{ s.customerName || '—' }}</td>
              <td class="ta-r">{{ s.quantity }}</td>
              <td class="ta-r td-muted">{{ s.unitPrice | number:'1.3-3' }}</td>
              <td class="ta-r" style="white-space:nowrap;">
                <span [ngClass]="getPaymentBadgeClass(s.paymentStatus)">{{ s.paymentStatus }}</span>
                <span class="fw-600" style="margin-left:.35rem;">{{ s.total | number:'1.3-3' }}</span>
              </td>
              <td class="td-muted">{{ s.invoiceNumber || s.deliveryNoteNumber || '—' }}</td>
            </tr>
            <tr *ngIf="selectedProductForDrawer.sales?.length === 0">
              <td colspan="6" class="drawer-empty">Aucune vente enregistrée</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</div>
  `,
  styles: [`
    *, *::before, *::after {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      box-sizing: border-box;
    }

    /* ═══════════════ PAGE ═══════════════ */
    .page { padding: 1.5rem; background: #f8fafc; min-height: 100vh; }

    .page-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 1.5rem;
    }
    .page-title { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin: 0; }
    .btn-create {
      display: inline-flex; align-items: center; gap: .4rem;
      padding: .6rem 1.25rem;
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      color: #fff; border: none; border-radius: 10px;
      font-size: .875rem; font-weight: 600; cursor: pointer;
      transition: opacity .18s;
      box-shadow: 0 2px 8px rgba(79,70,229,.25);
    }
    .btn-create:hover { opacity: .88; }

    /* ═══════════════ MAIN CARD ═══════════════ */
    .main-card {
      background: #fff; border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 4px rgba(0,0,0,.04); overflow: visible;
    }

    /* ═══════════════ PURCHASE FORM ═══════════════ */
    .form-header {
      padding: .75rem 1.25rem;
      background: linear-gradient(135deg, #10b981, #059669);
      border-radius: 12px 12px 0 0;
    }
    .form-header-title { color: #fff; font-weight: 600; font-size: .95rem; }
    .form-body { padding: 1.25rem 1.5rem; }

    .form-row { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
    .form-group { display: flex; flex-direction: column; gap: .35rem; flex: 1; min-width: 140px; }
    .form-group.fg-wide { flex: 2; min-width: 200px; }
    .form-lbl {
      font-size: .72rem; font-weight: 700; color: #64748b;
      text-transform: uppercase; letter-spacing: .5px;
    }
    .form-ctrl {
      height: 38px; border: 1px solid #e2e8f0; border-radius: 8px;
      padding: 0 .75rem; font-size: .85rem;
      background: #fff; color: #0f172a; outline: none;
      transition: border-color .18s; width: 100%;
    }
    .form-ctrl:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,.08); }

    .lines-toolbar {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: .625rem;
    }
    .lines-label {
      font-size: .72rem; font-weight: 700; color: #64748b;
      text-transform: uppercase; letter-spacing: .5px;
    }
    .btn-add-line {
      padding: .3rem .75rem; border: 1px solid #c7d2fe; border-radius: 6px;
      background: #eef2ff; color: #4f46e5; font-size: .8rem; font-weight: 600;
      cursor: pointer; transition: all .15s;
    }
    .btn-add-line:hover { background: #e0e7ff; }

    .lines-table-wrap {
      border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;
      margin-bottom: 1rem;
    }
    .lines-table-head {
      display: grid; grid-template-columns: 2fr 1fr 1.2fr 36px;
      gap: .75rem; padding: .6rem 1rem;
      background: #f8fafc; border-bottom: 1px solid #e2e8f0;
    }
    .lth-product, .lth-qty, .lth-price, .lth-del {
      font-size: .72rem; font-weight: 700; color: #64748b;
      text-transform: uppercase; letter-spacing: .4px;
    }
    .lines-table-row {
      display: grid; grid-template-columns: 2fr 1fr 1.2fr 36px;
      gap: .75rem; align-items: center;
      padding: .5rem 1rem; border-bottom: 1px solid #f1f5f9; background: #fff;
    }
    .lines-table-row:last-child { border-bottom: none; }
    .lines-table-row.row-alt  { background: #fafafa; }
    .line-cell { display: flex; align-items: center; }

    /* dropdown produit */
    .product-dropdown {
      position: fixed; z-index: 9999;
      background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;
      max-height: 280px; overflow-y: auto;
      box-shadow: 0 8px 24px rgba(0,0,0,.12);
    }
    .dropdown-empty { padding: .75rem 1rem; color: #9ca3af; font-style: italic; font-size: .85rem; }
    .dropdown-item {
      padding: .55rem 1rem; cursor: pointer;
      border-bottom: 1px solid #f3f4f6; font-size: .88rem;
      transition: background .12s;
    }
    .dropdown-item:hover { background: #ede9fe; }
    .dropdown-unit { color: #6b7280; }

    .btn-del-line {
      width: 34px; height: 34px; border-radius: 6px;
      border: 1px solid #fca5a5; background: #fff;
      color: #dc2626; font-size: .9rem; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background .12s;
    }
    .btn-del-line:hover { background: #fee2e2; }

    .form-footer {
      display: flex; justify-content: space-between;
      align-items: center; flex-wrap: wrap; gap: 1rem;
      padding-top: .75rem; border-top: 1px solid #f1f5f9;
    }
    .form-total { font-size: .9rem; color: #64748b; }
    .form-total strong { color: #0f172a; font-size: 1.1rem; margin-left: .25rem; }
    .btn-submit {
      padding: .6rem 1.5rem;
      background: linear-gradient(135deg, #10b981, #059669);
      color: #fff; border: none; border-radius: 8px;
      font-size: .875rem; font-weight: 600; cursor: pointer;
      transition: opacity .18s;
    }
    .btn-submit:hover { opacity: .88; }

    .form-error-msg {
      color: #dc2626; font-size: .8125rem; font-weight: 600;
      background: #fef2f2; border: 1px solid #fecaca;
      border-radius: 6px; padding: .5rem .75rem;
      margin: 0 0 .5rem;
    }
    .input-error { border-color: #ef4444 !important; }

    /* ═══════════════ FILTER BAR ═══════════════ */
    .filter-bar {
      display: flex; align-items: flex-end; gap: .875rem;
      padding: 1rem 1.25rem;
      background: #f8fafc; border-bottom: 1px solid #f1f5f9;
      flex-wrap: wrap; border-radius: 12px 12px 0 0;
    }
    .filter-group { display: flex; flex-direction: column; gap: .35rem; flex: 1; min-width: 120px; }
    .filter-group.fg-wide { flex: 2; min-width: 200px; }
    .filter-lbl {
      font-size: .7rem; font-weight: 700; color: #64748b;
      text-transform: uppercase; letter-spacing: .5px;
    }
    .filter-ctrl {
      height: 38px; border: 1px solid #e2e8f0; border-radius: 8px;
      padding: 0 .75rem; font-size: .85rem;
      background: #fff; color: #0f172a; outline: none;
      transition: border-color .18s; width: 100%;
    }
    .filter-ctrl:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,.08); }
    .btn-reset {
      height: 38px; padding: 0 .875rem;
      border: 1px solid #e2e8f0; border-radius: 8px;
      background: #fff; color: #64748b; font-size: .8rem;
      font-weight: 500; cursor: pointer; white-space: nowrap;
      align-self: flex-end; transition: all .15s;
    }
    .btn-reset:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }

    /* ═══════════════ TABLE ═══════════════ */
    .data-table { width: 100%; border-collapse: collapse; font-size: .875rem; }
    .data-table thead tr { background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); }
    .data-table th {
      color: #fff; font-weight: 500; padding: .8rem 1rem; text-align: left;
      font-size: .78rem; letter-spacing: .4px; white-space: nowrap;
    }
    .data-table td { padding: .8rem 1rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    .data-row { cursor: pointer; transition: background .12s; }
    .data-row:hover { background: #f5f7ff !important; }
    .data-row:last-child td { border-bottom: none; }

    .ta-r  { text-align: right !important; }
    .fw-500 { font-weight: 500; }
    .fw-600 { font-weight: 600; }
    .fw-700 { font-weight: 700; }
    .td-muted   { color: #64748b; font-size: .875rem; }
    .c-green    { color: #16a34a !important; }
    .c-red      { color: #dc2626 !important; }
    .client-name { font-weight: 600; color: #1f2937; }

    .id-badge {
      display: inline-block; padding: .2rem .6rem;
      background: #eff6ff; color: #1e40af;
      border: 1px solid #bfdbfe; border-radius: 6px;
      font-weight: 600; font-size: .8rem;
    }
    .loupe {
      margin-left: .4rem; font-size: .85rem;
      opacity: .3; transition: opacity .15s; cursor: pointer;
    }
    .data-row:hover .loupe { opacity: .8; }

    .sort-col { cursor: pointer; user-select: none; }
    .sort-icon { font-size: .8rem; margin-left: 4px; }

    /* Bilan row tints */
    .bilan-pos { background: #f0fdf4 !important; }
    .bilan-neg { background: #fff1f2 !important; }
    .bilan-pos:hover { background: #dcfce7 !important; }
    .bilan-neg:hover { background: #ffe4e6 !important; }

    /* ═══════════════ EMPTY STATE ═══════════════ */
    .empty-state { padding: 3.5rem 1rem; text-align: center; color: #94a3b8; }
    .empty-icon  { font-size: 3.5rem; margin-bottom: .75rem; opacity: .6; }

    /* ═══════════════ RESPONSIVE ═══════════════ */
    .desktop-table { display: none; overflow-x: auto; }
    .mobile-scroll { display: block; overflow-x: auto; }

    @media (min-width: 1024px) {
      .desktop-table { display: block; }
      .mobile-scroll  { display: none; }
    }
    @media (max-width: 768px) {
      .page { padding: 1rem; }
      .form-row { flex-direction: column; }
      .lines-table-head { display: none; }
      .lines-table-row { grid-template-columns: 1fr; }
    }

    /* ═══════════════ DRAWER BACKDROP ═══════════════ */
    .drawer-backdrop {
      position: fixed; top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: rgba(15,23,42,.4); backdrop-filter: blur(2px);
      z-index: 1040; animation: fadeIn .2s ease-out;
    }

    /* ═══════════════ SIDE DRAWER ═══════════════ */
    .side-drawer {
      position: fixed; top: 0; right: -720px;
      width: 700px; max-width: 100%; height: 100vh;
      background: #f8fafc;
      box-shadow: -8px 0 24px rgba(0,0,0,.15);
      z-index: 1050;
      transition: right .3s cubic-bezier(.16,1,.3,1);
    }
    .side-drawer.open { right: 0; }

    .drawer-header {
      padding: 1.25rem 1.5rem; background: #fff;
      border-bottom: 1px solid #e2e8f0;
      display: flex; justify-content: space-between; align-items: center;
    }
    .drawer-title { margin: 0; font-size: 1.2rem; font-weight: 700; color: #0f172a; }
    .drawer-sub   { font-size: .85rem; color: #64748b; }
    .btn-close-drawer {
      background: #f1f5f9; border: none;
      width: 32px; height: 32px; border-radius: 50%;
      font-weight: bold; color: #64748b; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all .15s;
    }
    .btn-close-drawer:hover { background: #e2e8f0; color: #0f172a; }

    .drawer-body { flex: 1; overflow-y: auto; padding: 1.5rem; }

    .drawer-stats-grid {
      display: grid; grid-template-columns: repeat(2,1fr);
      gap: .75rem; margin-bottom: 1.5rem;
    }
    .drawer-stat-box {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;
      padding: .6rem .85rem; display: flex; flex-direction: column; gap: .2rem;
      box-shadow: 0 1px 2px rgba(0,0,0,.02);
    }
    .drawer-stat-box.full-width { grid-column: span 2; }
    .dstat-lbl {
      font-size: .72rem; text-transform: uppercase;
      color: #64748b; font-weight: 600; letter-spacing: .03em;
    }
    .dstat-val { font-size: 1.1rem; font-weight: 700; color: #1e293b; }
    .bilan-pos-box { background: #ecfdf5 !important; border-color: #a7f3d0 !important; }
    .bilan-pos-box .dstat-val { color: #047857 !important; }
    .bilan-neg-box { background: #fef2f2 !important; border-color: #fca5a5 !important; }
    .bilan-neg-box .dstat-val { color: #b91c1c !important; }

    .drawer-section-title {
      font-weight: 700; font-size: 1.05rem;
      margin-bottom: .625rem;
    }
    .drawer-table-wrap {
      border: 1px solid #e2e8f0; border-radius: 8px;
      overflow-x: auto; background: #fff;
    }
    .drawer-table { width: 100%; border-collapse: collapse; font-size: .9rem; min-width: 460px; }
    .drawer-table th { padding: .6rem .75rem; font-weight: 500; }
    .drawer-table td { padding: .6rem .75rem; border-bottom: 1px solid #f3f4f6; }
    .drawer-row:last-child td { border-bottom: none; }
    .thead-orange { background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); color: #fff; }
    .thead-indigo { background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #fff; }
    .drawer-empty { text-align: center; padding: 1.5rem; color: #9ca3af; font-style: italic; }

    /* badge statut paiement */
    .badge-status {
      display: inline-block; padding: .2rem .5rem;
      font-size: .7rem; font-weight: 700; border-radius: 4px;
      text-transform: uppercase; white-space: nowrap;
    }
    .badge-status.paid    { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
    .badge-status.partial { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
    .badge-status.unpaid  { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
    .badge-status.default { background: #f3f4f6; color: #4b5563; border: 1px solid #e5e7eb; }

    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }

    @media (max-width: 768px) {
      .side-drawer { width: 100vw; right: -100vw; }
      .side-drawer.open { right: 0; }
      .drawer-stats-grid { grid-template-columns: 1fr; }
      .drawer-stat-box.full-width { grid-column: span 1; }
      .drawer-body { padding: 1rem; }
      .drawer-header { padding: 1rem; }
      .drawer-title { font-size: 1rem; }
    }
  `]
})
export class TransactionsComponent implements OnInit, OnDestroy {

  loading         = true;
  showForm        = false;
  productSearch   = '';
  showAllProducts = false;
  isDrawerOpen    = false;
  selectedProductForDrawer: DashboardProduct | null = null;
  bilanSortState: 'none' | 'desc' | 'asc' = 'none';

  dropdownStyle: { top: string; left: string; width: string } = { top: '0px', left: '0px', width: '0px' };
  private activeDropdownIndex = -1;
  private activeDropdownInput: HTMLElement | null = null;
  private scrollHandler = () => this.repositionDropdown();

  products:        DashboardProduct[] = [];
  productsInStock: Product[]          = [];
  suppliers:       any[]              = [];

  newPurchase   = { ...EMPTY_PURCHASE };
  purchaseLines: PurchaseLine[] = [];
  formError     = '';

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

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

  closeDrawer(): void {
    this.isDrawerOpen = false;
    this.selectedProductForDrawer = null;
    this.cdr.markForCheck();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (this.showForm) {
      this.initPurchaseForm();
      if (this.productsInStock.length === 0) this.loadProducts();
    }
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
      const ba = this.getBilan(a), bb = this.getBilan(b);
      return this.bilanSortState === 'asc' ? ba - bb : bb - ba;
    });
  }

  // ── Formulaire achat ────────────────────────────────────────────────────────

  initPurchaseForm(): void {
    this.newPurchase   = { ...EMPTY_PURCHASE };
    this.purchaseLines = [this._emptyLine()];
    this.formError     = '';
  }

  private _emptyLine(): PurchaseLine {
    return { productId: '', productSearch: '', productLabel: '', quantity: 1, unitPriceTTC: 0, dropdownOpen: false };
  }

  addPurchaseLine():             void { this.purchaseLines.push(this._emptyLine()); }
  removePurchaseLine(i: number): void { if (this.purchaseLines.length > 1) this.purchaseLines.splice(i, 1); }

  getPurchaseLinesTotal(): number {
    return this.purchaseLines.reduce((acc, l) => acc + (l.quantity * l.unitPriceTTC), 0);
  }

  private repositionDropdown(): void {
    if (this.activeDropdownInput && this.activeDropdownIndex >= 0) {
      const rect = this.activeDropdownInput.getBoundingClientRect();
      this.dropdownStyle = { top: `${rect.bottom}px`, left: `${rect.left}px`, width: `${rect.width}px` };
      this.cdr.markForCheck();
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
      this.dropdownStyle = { top: `${rect.bottom}px`, left: `${rect.left}px`, width: `${rect.width}px` };
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

  // ── Accesseurs ──────────────────────────────────────────────────────────────

  getStockVendu(prod: DashboardProduct):           number { return prod.sales?.reduce((a, s) => a + (s.quantity ?? 0), 0) ?? 0; }
  getStockEntrepot(prod: DashboardProduct):         number { return prod.product?.stock ?? 0; }
  getAveragePurchasePrice(prod: DashboardProduct):  number { return prod.statistics?.averagePurchasePrice ?? 0; }
  getAverageSalePrice(prod: DashboardProduct):      number { return prod.statistics?.averageSalePrice ?? 0; }
  getBilan(prod: DashboardProduct):                 number { return prod.statistics?.balance ?? 0; }

  getPaymentBadgeClass(status: string): string {
    switch ((status || '').toUpperCase()) {
      case 'PAID':           return 'badge-status paid';
      case 'PARTIALLY_PAID': return 'badge-status partial';
      case 'UNPAID':         return 'badge-status unpaid';
      default:               return 'badge-status default';
    }
  }

  // ── API ─────────────────────────────────────────────────────────────────────

  loadDashboardData(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.api.getDashboardProducts().subscribe({
      next: (data: DashboardProduct[]) => {
        this.products = data;
        this.loading  = false;
        this.cdr.markForCheck();
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
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
    this.formError = '';
    const { supplierId, datePurchase } = this.newPurchase;
    if (!supplierId || !datePurchase) {
      this.formError = 'Veuillez sélectionner un fournisseur et une date.';
      this.cdr.markForCheck();
      return;
    }

    const invalidPrice = this.purchaseLines.some(l =>
      !!l.productId && Number(l.unitPriceTTC) <= 0
    );
    if (invalidPrice) {
      this.formError = 'Le prix unitaire doit être supérieur à 0 pour chaque produit.';
      this.cdr.markForCheck();
      return;
    }

    const validLines = this.purchaseLines.filter(l => {
      const id = Number(l.productId);
      return !!l.productId && !isNaN(id) && id > 0 && Number(l.quantity) > 0 && Number(l.unitPriceTTC) > 0;
    });
    if (!validLines.length) {
      this.formError = 'Ajoutez au moins une ligne produit valide.';
      this.cdr.markForCheck();
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

    this.api.createPurchase(payload).subscribe({
      next: () => {
        this.showForm = false;
        this.initPurchaseForm();
        this.loadDashboardData();
      },
      error: () => {
        this.formError = 'Erreur lors de la création de l\'achat. Veuillez réessayer.';
        this.cdr.markForCheck();
      }
    });
  }

  toggleBilanSort(): void {
    if (this.bilanSortState === 'none')      this.bilanSortState = 'desc';
    else if (this.bilanSortState === 'desc') this.bilanSortState = 'asc';
    else                                      this.bilanSortState = 'none';
    this.cdr.markForCheck();
  }
}
