import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { UrlFiltersService } from '../../shared/url-filters.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page">

  <!-- ══ BARRE DE FILTRES (maquette) ════════════════════════════════════════ -->
  <div class="toolbar-glass">
    <div class="toolbar-search">
      <i class="bi bi-search"></i>
      <input type="text" [ngModel]="searchText"
             (ngModelChange)="onSearchInput($event)"
             placeholder="Rechercher un produit…">
    </div>
    <div class="gamme-pills" *ngIf="getGammes().length > 0">
      <span class="gpill" [class.gpill-on]="!selectedGamme" (click)="selectedGamme = ''">Toutes</span>
      <span class="gpill" *ngFor="let g of getGammes()"
            [class.gpill-on]="selectedGamme === g" (click)="selectedGamme = g">{{ g }}</span>
    </div>
    <label class="toggle-label" title="Inclure les produits en rupture">
      <div class="toggle-track" (click)="showAllProducts = !showAllProducts"
           [class.toggle-on]="showAllProducts">
        <div class="toggle-thumb"></div>
      </div>
      <span class="toggle-text">Tous</span>
    </label>
    <button class="btn-accent" (click)="togglePurchaseForm()">
      <i class="bi" [class.bi-plus-lg]="!showPurchaseForm" [class.bi-x-lg]="showPurchaseForm"></i>
      {{ showPurchaseForm ? 'Fermer' : 'Nouvel Achat' }}
    </button>
  </div>

  <!-- ══ FORMULAIRE NOUVEL ACHAT ════════════════════════════════════════════ -->
  <div *ngIf="showPurchaseForm" class="main-card purchase-form-card">
    <div class="form-header">
      <i class="bi bi-cart-plus"></i>
      <span>Nouvel Achat</span>
    </div>
    <div class="form-body">
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
          <input type="text" class="form-ctrl" [(ngModel)]="newPurchase.invoiceNumber" name="invoiceNumber" placeholder="Ex : FAC-2026-001">
        </div>
        <div class="form-group">
          <label class="form-lbl">Date d'Achat</label>
          <input type="date" class="form-ctrl" [(ngModel)]="newPurchase.datePurchase" name="datePurchase">
        </div>
      </div>

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
        <div *ngFor="let line of purchaseLines; let i = index" class="lines-table-row" [class.row-alt]="i % 2 !== 0">
          <div class="line-cell cell-product" style="position:relative;">
            <input type="text" class="form-ctrl"
                   [placeholder]="line.productLabel || 'Rechercher…'"
                   [(ngModel)]="line.productSearch" [name]="'productSearch_' + i"
                   (focus)="openLineDropdown(i, $event)"
                   (input)="onLineSearchChange(i, $event)"
                   (blur)="closeLineDropdown(i)" autocomplete="off">
            <div *ngIf="line.dropdownOpen" class="product-dropdown"
                 [style.top]="dropdownStyle.top" [style.left]="dropdownStyle.left" [style.width]="dropdownStyle.width">
              <div *ngIf="getFilteredProductsForLine(line).length === 0" class="dropdown-empty">Aucun produit trouvé</div>
              <div *ngFor="let p of getFilteredProductsForLine(line)"
                   (mousedown)="$event.preventDefault(); selectProductForLine(i, p)" class="dropdown-item">
                {{ p.name }} <span class="dropdown-unit">— {{ p.unit }}</span>
              </div>
            </div>
          </div>
          <div class="line-cell cell-qty">
            <input type="number" class="form-ctrl" [(ngModel)]="line.quantity" [name]="'qty_' + i" min="1">
          </div>
          <div class="line-cell cell-price">
            <input type="number" step="0.001" min="0.001" class="form-ctrl"
                   [(ngModel)]="line.unitPriceTTC" [name]="'price_' + i"
                   [class.input-error]="!!line.productId && line.unitPriceTTC <= 0">
          </div>
          <div class="line-cell cell-del">
            <button type="button" *ngIf="purchaseLines.length > 1" class="btn-del-line" (click)="removePurchaseLine(i)">✕</button>
          </div>
        </div>
      </div>

      <p *ngIf="formError" class="form-error-msg">⚠ {{ formError }}</p>
      <div class="form-footer">
        <span class="form-total">Total TTC : <strong>{{ getPurchaseLinesTotal() | number:'1.3-3' }} DT</strong></span>
        <button type="button" class="btn-submit" (click)="createPurchase()">✓ Créer l'Achat</button>
      </div>
    </div>
  </div>

  <!-- ══ KPIs ══════════════════════════════════════════════════════════════ -->
  <div class="kpi-row" *ngIf="!loading && products.length > 0">
    <div class="kpi-card kpi-blue">
      <span class="kpi-val">{{ getFilteredProducts().length }}</span>
      <span class="kpi-lbl">Total Produits</span>
    </div>
    <div class="kpi-card kpi-indigo">
      <span class="kpi-val">{{ getTotalStock() }}</span>
      <span class="kpi-lbl">Quantité Totale</span>
    </div>
    <div class="kpi-card kpi-green">
      <span class="kpi-val">{{ getTotalValue() | number:'1.0-0' }}</span>
      <span class="kpi-lbl">Valeur Totale (DNT)</span>
    </div>
    <div class="kpi-card kpi-orange">
      <span class="kpi-val">{{ getLowStockCount() }}</span>
      <span class="kpi-lbl">Stock Faible</span>
    </div>
  </div>

  <!-- ══ GRAPHIQUES ════════════════════════════════════════════════════════ -->
  <div class="charts-row" *ngIf="!loading && products.length > 0">
    <div class="chart-card">
      <div class="chart-card-header">📊 Distribution du Stock (Top 15)</div>
      <div class="chart-body">
        <canvas #stockDistributionChart></canvas>
      </div>
    </div>
    <div class="chart-card">
      <div class="chart-card-header">🥧 Valeur par Gamme</div>
      <div class="chart-body">
        <canvas #categoryChart></canvas>
      </div>
    </div>
  </div>

  <!-- ══ CARTE PRINCIPALE ═══════════════════════════════════════════════════ -->
  <div class="main-card">

    <!-- Chargement / vide -->
    <div *ngIf="loading" class="empty-state">
      <div class="empty-icon">⏳</div>
      <p>Chargement des produits…</p>
    </div>
    <div *ngIf="!loading && products.length === 0" class="empty-state">
      <div class="empty-icon">📦</div>
      <p>Aucun produit disponible.</p>
    </div>

    <!-- ════════ TABLE (desktop) ════════ -->
    <div class="desktop-table" *ngIf="!loading && products.length > 0">
      <table class="data-table">
        <thead>
          <tr>
            <th>NOM</th>
            <th>DÉSIGNATION</th>
            <th>GAMME</th>
            <th class="ta-r">QTÉ INIT.</th>
            <th class="ta-r">QTÉ ACTUELLE</th>
            <th class="ta-r">VALEUR INIT. (DNT)</th>
            <th class="ta-r">VALEUR ACT. (DNT)</th>
            <th class="ta-r">CMP (DNT)</th>
            <th>STATUT</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of getFilteredProducts(); trackBy: trackById" class="data-row">
            <td>
              <span class="client-name">{{ p.name }}</span>
              <span class="td-muted" style="margin-left:.25rem;font-size:.8rem;">{{ p.unit }}</span>
            </td>
            <td class="td-muted">{{ p.designation }}</td>
            <td><span class="gamme-badge">{{ p.gamme }}</span></td>
            <td class="ta-r td-muted">{{ p.initialStockQuantity }}</td>
            <td class="ta-r">
              <span class="qty-badge" [class.qty-low]="p.currentStockQuantity < 50">
                {{ p.currentStockQuantity }}
              </span>
            </td>
            <td class="ta-r td-muted">{{ p.initialStockValue | number:'1.3-3' }}</td>
            <td class="ta-r fw-600 c-green">{{ p.currentStockValue | number:'1.3-3' }}</td>
            <td class="ta-r fw-500">{{ p.cmp | number:'1.3-3' }}</td>
            <td>
              <span class="stock-pill" [ngClass]="'sp-' + stockStatus(p).kind">{{ stockStatus(p).label }}</span>
            </td>
          </tr>
          <tr *ngIf="getFilteredProducts().length === 0">
            <td colspan="9" class="empty-state">
              <div class="empty-icon">📭</div>
              <p>Aucun produit trouvé</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ════════ CARTES (mobile) ════════ -->
    <div class="mobile-cards" *ngIf="!loading && products.length > 0">
      <div *ngFor="let p of getFilteredProducts(); trackBy: trackById" class="mobile-row">
        <div class="mobile-row-top">
          <div>
            <span class="client-name">{{ p.name }}</span>
            <span class="td-muted" style="margin-left:.3rem;font-size:.75rem;">{{ p.unit }}</span>
          </div>
          <span class="gamme-badge">{{ p.gamme }}</span>
        </div>
        <div class="td-muted" style="font-size:.85rem;margin-bottom:.6rem;">{{ p.designation }}</div>
        <div class="mobile-grid-2" style="margin-bottom:.5rem;">
          <div class="mg-cell">
            <span class="mg-lbl">Qté Initiale</span>
            <strong>{{ p.initialStockQuantity }}</strong>
          </div>
          <div class="mg-cell">
            <span class="mg-lbl">Qté Actuelle</span>
            <strong [class.c-orange]="p.currentStockQuantity < 50">{{ p.currentStockQuantity }}</strong>
          </div>
        </div>
        <div class="mobile-grid-3">
          <div class="mg-cell">
            <span class="mg-lbl">Val. Init</span>
            <strong class="td-muted" style="font-size:.75rem;">{{ p.initialStockValue | number:'1.3-3' }}</strong>
          </div>
          <div class="mg-cell">
            <span class="mg-lbl">Val. Act.</span>
            <strong class="c-green" style="font-size:.75rem;">{{ p.currentStockValue | number:'1.3-3' }}</strong>
          </div>
          <div class="mg-cell">
            <span class="mg-lbl">CMP</span>
            <strong style="font-size:.75rem;">{{ p.cmp | number:'1.3-3' }}</strong>
          </div>
        </div>
      </div>
      <div *ngIf="getFilteredProducts().length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p>Aucun produit trouvé</p>
      </div>
    </div>

  </div><!-- /main-card -->

</div><!-- /page -->
  `,
  styles: [`
    *, *::before, *::after {
      font-family: var(--font-sans);
      box-sizing: border-box;
    }

    .page { padding: 1.5rem; background: transparent; min-height: 100vh; }

    /* ─── BARRE DE FILTRES (maquette) ─────────────────── */
    .toolbar-glass {
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
      padding: 14px 16px; margin-bottom: 18px;
      border-radius: 18px;
      background: var(--glass-bg-soft);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid var(--glass-border);
      box-shadow: var(--glass-shadow-sm);
    }
    .toolbar-search { position: relative; flex: 1; min-width: 220px; }
    .toolbar-search i {
      position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
      color: var(--color-text-faint); font-size: 14px;
    }
    .toolbar-search input {
      width: 100%; padding: 10px 14px 10px 38px;
      border-radius: 11px; border: 1px solid rgba(15,23,42,0.1);
      background: rgba(255,255,255,0.7); font-size: 14px;
      color: var(--color-text); outline: none; font-family: inherit;
      transition: border-color .18s, box-shadow .18s;
    }
    .toolbar-search input:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-soft);
    }
    .gamme-pills { display: flex; gap: 8px; flex-wrap: wrap; }
    .gpill {
      padding: 8px 14px; border-radius: 10px;
      background: rgba(15,23,42,0.04); color: var(--color-text-muted);
      font-size: 13px; font-weight: 600; cursor: pointer;
      transition: all .18s; white-space: nowrap;
    }
    .gpill:hover { background: rgba(15,23,42,0.08); }
    .gpill-on { background: var(--color-primary-soft); color: var(--color-primary); }

    .btn-accent {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 16px; border-radius: 11px; border: none;
      background: var(--color-primary); color: #fff;
      font-size: 14px; font-weight: 600; cursor: pointer;
      box-shadow: 0 8px 20px -6px var(--color-primary-glow);
      font-family: inherit; transition: background .18s; white-space: nowrap;
    }
    .btn-accent:hover { background: var(--color-primary-hover); }

    .stock-pill {
      display: inline-flex; padding: 4px 10px; border-radius: 999px;
      font-size: 12px; font-weight: 700; white-space: nowrap;
    }
    .sp-ok       { background: rgba(16,185,129,0.14); color: #047857; }
    .sp-low      { background: rgba(245,158,11,0.16); color: #b45309; }
    .sp-critical { background: rgba(239,68,68,0.14);  color: #b91c1c; }
    .sp-out      { background: rgba(239,68,68,0.14);  color: #b91c1c; }

    /* ─── KPI ROW ─────────────────────────────────────── */
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: .875rem; margin-bottom: 1.5rem;
    }
    .kpi-card {
      background: var(--glass-bg); border-radius: var(--radius-lg); border: 1px solid var(--glass-border);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: .3rem;
      box-shadow: var(--glass-shadow-sm);
      transition: transform .15s, box-shadow .15s;
    }
    .kpi-card:hover { transform: translateY(-2px); box-shadow: var(--glass-shadow-lg); }
    .kpi-val { font-size: 1.25rem; font-weight: 700; color: var(--color-text); line-height: 1.2; }
    .kpi-lbl {
      font-size: .7rem; font-weight: 600; color: var(--color-text-muted);
      text-transform: uppercase; letter-spacing: .4px;
    }

    /* ─── CHARTS ──────────────────────────────────────── */
    .charts-row {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 1rem; margin-bottom: 1.5rem;
    }
    .chart-card {
      background: var(--glass-bg); border-radius: var(--radius-xl);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--glass-border);
      box-shadow: var(--glass-shadow); overflow: hidden;
    }
    .chart-card-header {
      padding: .75rem 1.25rem;
      background: transparent;
      border-bottom: 1px solid var(--glass-border);
      color: var(--color-text); font-weight: 700; font-size: .875rem;
    }
    .chart-body { padding: 1rem; height: 340px; position: relative; }
    .chart-body canvas { width: 100% !important; height: 100% !important; }

    /* ─── MAIN CARD ───────────────────────────────────── */
    .main-card {
      background: var(--glass-bg); border-radius: var(--radius-xl);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--glass-border);
      box-shadow: var(--glass-shadow); overflow: hidden;
    }

    /* ─── FILTER BAR ──────────────────────────────────── */
    .filter-bar {
      display: flex; align-items: flex-end; gap: .875rem;
      padding: 1rem 1.25rem;
      background: rgba(255,255,255,0.3); border-bottom: 1px solid var(--glass-border);
      flex-wrap: wrap;
    }
    :host-context([data-theme="dark"]) .filter-bar { background: rgba(255,255,255,0.03); }
    .filter-group { display: flex; flex-direction: column; gap: .35rem; flex: 1; min-width: 120px; }
    .filter-group.fg-wide { flex: 2; min-width: 180px; }
    .filter-lbl {
      font-size: .7rem; font-weight: 700; color: var(--color-text-muted);
      text-transform: uppercase; letter-spacing: .5px;
    }
    .filter-ctrl {
      height: 38px; border: 1px solid rgba(15,23,42,0.1); border-radius: 8px;
      padding: 0 .75rem; font-size: .85rem;
      background: rgba(255,255,255,0.7); color: var(--color-text); outline: none;
      transition: border-color .18s; width: 100%;
    }
    .filter-ctrl:focus { border-color: var(--color-primary-hover); box-shadow: 0 0 0 3px rgba(79,70,229,.08); }
    .btn-reset {
      height: 38px; padding: 0 .875rem;
      border: 1px solid rgba(15,23,42,0.1); border-radius: 8px;
      background: rgba(255,255,255,0.6); color: var(--color-text-muted); font-size: .8rem;
      font-weight: 500; cursor: pointer; white-space: nowrap;
      align-self: flex-end; transition: all .15s;
    }
    .btn-reset:hover { border-color: var(--color-danger); color: var(--color-danger); background: var(--color-danger-bg); }

    .toggle-label { display: flex; align-items: center; gap: .5rem; cursor: pointer; }
    .toggle-track {
      width: 40px; height: 22px; border-radius: 11px; background: var(--color-border);
      position: relative; transition: background .25s; flex-shrink: 0;
    }
    .toggle-track.toggle-on { background: var(--color-success); }
    .toggle-thumb {
      position: absolute; top: 2px; left: 2px;
      width: 18px; height: 18px; border-radius: 50%;
      background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.2); transition: left .25s;
    }
    .toggle-track.toggle-on .toggle-thumb { left: 20px; }
    .toggle-text { font-size: .8rem; color: var(--color-text-muted); white-space: nowrap; }

    /* ─── TABLE ───────────────────────────────────────── */
    .data-table { width: 100%; border-collapse: collapse; font-size: .875rem; }
    .data-table thead tr { background: rgba(255,255,255,0.3); border-bottom: 2px solid var(--glass-border); }
    :host-context([data-theme="dark"]) .data-table thead tr { background: rgba(255,255,255,0.03); }
    .data-table th {
      color: var(--color-text-muted); font-weight: 700; padding: .8rem 1rem; text-align: left;
      font-size: .72rem; letter-spacing: .5px; white-space: nowrap; text-transform: uppercase;
    }
    .data-table td { padding: .8rem 1rem; border-bottom: 1px solid var(--color-surface-2); vertical-align: middle; }
    .data-row { transition: background .12s; }
    .data-row:hover { background: var(--color-primary-soft) !important; }
    .data-row:last-child td { border-bottom: none; }

    .ta-r    { text-align: right !important; }
    .fw-500  { font-weight: 500; }
    .fw-600  { font-weight: 600; }
    .td-muted   { color: var(--color-text-muted); font-size: .875rem; }
    .c-green    { color: var(--color-success) !important; }
    .c-orange   { color: #b45309 !important; }
    .client-name { font-weight: 600; color: var(--color-text); }

    .gamme-badge {
      display: inline-block; padding: .2rem .65rem;
      background: var(--color-info-bg); color: var(--color-info-text);
      border-radius: 6px; font-size: .78rem; font-weight: 500;
    }
    .qty-badge {
      display: inline-block; padding: .2rem .65rem; border-radius: 6px;
      font-weight: 600; font-size: .8rem;
      background: var(--color-success-bg); color: var(--color-success-text);
    }
    .qty-badge.qty-low { background: var(--color-warning-bg); color: var(--color-warning-text); }

    /* ─── EMPTY STATE ─────────────────────────────────── */
    .empty-state { padding: 3.5rem 1rem; text-align: center; color: var(--color-text-faint); }
    .empty-icon  { font-size: 3.5rem; margin-bottom: .75rem; opacity: .6; }

    /* ─── MOBILE CARDS ────────────────────────────────── */
    .mobile-row {
      padding: 1rem 1.25rem; border-bottom: 1px solid var(--color-surface-2); transition: background .12s;
    }
    .mobile-row:hover { background: rgba(255,255,255,0.35); }
    .mobile-row:last-child { border-bottom: none; }
    .mobile-row-top {
      display: flex; justify-content: space-between;
      align-items: flex-start; margin-bottom: .4rem;
    }
    .mobile-grid-2 { display: grid; grid-template-columns: repeat(2,1fr); gap: .5rem; }
    .mobile-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: .5rem; }
    .mg-cell {
      background: rgba(15,23,42,0.04); padding: .5rem; border-radius: 8px;
      text-align: center; display: flex; flex-direction: column; gap: .1rem;
    }
    .mg-lbl { font-size: .7rem; color: var(--color-text-muted); }

    /* ─── RESPONSIVE ──────────────────────────────────── */
    .desktop-table { display: none; overflow-x: auto; }
    .mobile-cards  { display: block; }

    @media (min-width: 1024px) {
      .desktop-table { display: block; }
      .mobile-cards  { display: none; }
    }
    /* ─── PURCHASE FORM ─────────────────────────────────────── */
    .purchase-form-card { margin-bottom: 1rem; overflow: visible; }

    .form-header {
      display: flex; align-items: center; gap: .5rem;
      padding: .75rem 1.25rem;
      background: linear-gradient(135deg, var(--color-success), var(--color-success));
      border-radius: var(--radius-xl) var(--radius-xl) 0 0;
      color: #fff; font-weight: 600; font-size: .95rem;
    }
    .form-body { padding: 1.25rem 1.5rem; }
    .form-row  { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
    .form-group { display: flex; flex-direction: column; gap: .35rem; flex: 1; min-width: 140px; }
    .form-group.fg-wide { flex: 2; min-width: 200px; }
    .form-lbl {
      font-size: .72rem; font-weight: 700; color: var(--color-text-muted);
      text-transform: uppercase; letter-spacing: .5px;
    }
    .form-ctrl {
      height: 38px; border: 1px solid rgba(15,23,42,0.1); border-radius: 8px;
      padding: 0 .75rem; font-size: .85rem;
      background: rgba(255,255,255,0.7); color: var(--color-text); outline: none;
      transition: border-color .18s; width: 100%;
    }
    .form-ctrl:focus { border-color: var(--color-primary-hover); box-shadow: 0 0 0 3px rgba(79,70,229,.08); }
    .input-error { border-color: var(--color-danger) !important; }

    .lines-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: .625rem; }
    .lines-label   { font-size: .72rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: .5px; }
    .btn-add-line  {
      padding: .3rem .75rem; border: 1px solid var(--color-primary-light); border-radius: 6px;
      background: var(--color-primary-light); color: var(--color-primary-hover); font-size: .8rem; font-weight: 600;
      cursor: pointer; transition: all .15s;
    }
    .btn-add-line:hover { background: var(--color-primary-light); }

    .lines-table-wrap  { border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; margin-bottom: 1rem; }
    .lines-table-head  {
      display: grid; grid-template-columns: 2fr 1fr 1.2fr 36px;
      gap: .75rem; padding: .6rem 1rem;
      background: rgba(255,255,255,0.3); border-bottom: 1px solid var(--glass-border);
    }
    .lth-product, .lth-qty, .lth-price, .lth-del {
      font-size: .72rem; font-weight: 700; color: var(--color-text-muted);
      text-transform: uppercase; letter-spacing: .4px;
    }
    .lines-table-row {
      display: grid; grid-template-columns: 2fr 1fr 1.2fr 36px;
      gap: .75rem; align-items: center;
      padding: .5rem 1rem; border-bottom: 1px solid var(--color-surface-2); background: transparent;
    }
    .lines-table-row:last-child { border-bottom: none; }
    .lines-table-row.row-alt    { background: rgba(15,23,42,0.03); }
    .line-cell { display: flex; align-items: center; }

    .product-dropdown {
      position: fixed; z-index: 9999;
      background: var(--glass-bg-strong); border: 1px solid var(--glass-border); border-radius: 11px;
      backdrop-filter: blur(30px) saturate(180%);
      -webkit-backdrop-filter: blur(30px) saturate(180%);
      max-height: 280px; overflow-y: auto;
      box-shadow: var(--glass-shadow-lg);
    }
    .dropdown-empty { padding: .75rem 1rem; color: var(--color-text-faint); font-style: italic; font-size: .85rem; }
    .dropdown-item  { padding: .55rem 1rem; cursor: pointer; border-bottom: 1px solid var(--color-surface-2); font-size: .88rem; transition: background .12s; }
    .dropdown-item:hover { background: var(--color-primary-light); }
    .dropdown-unit  { color: var(--color-text-muted); }

    .btn-del-line {
      width: 34px; height: 34px; border-radius: 6px;
      border: 1px solid var(--color-danger); background: rgba(255,255,255,0.6);
      color: var(--color-danger); font-size: .9rem; cursor: pointer;
      display: flex; align-items: center; justify-content: center; transition: background .12s;
    }
    .btn-del-line:hover { background: var(--color-danger-bg); }

    .form-footer {
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 1rem;
      padding-top: .75rem; border-top: 1px solid var(--color-surface-2);
    }
    .form-total { font-size: .9rem; color: var(--color-text-muted); }
    .form-total strong { color: var(--color-text); font-size: 1.1rem; margin-left: .25rem; }
    .btn-submit {
      padding: .6rem 1.5rem;
      background: linear-gradient(135deg, var(--color-success), var(--color-success));
      color: #fff; border: none; border-radius: 8px;
      font-size: .875rem; font-weight: 600; cursor: pointer; transition: opacity .18s;
    }
    .btn-submit:hover { opacity: .88; }
    .form-error-msg {
      color: var(--color-danger); font-size: .8125rem; font-weight: 600;
      background: var(--color-danger-bg); border: 1px solid #fecaca;
      border-radius: 6px; padding: .5rem .75rem; margin: 0 0 .5rem;
    }

    @media (max-width: 768px) {
      .page       { padding: 1rem; }
      .charts-row { grid-template-columns: 1fr; }
      .chart-body { height: 240px; }
      .filter-bar { gap: .625rem; }
      .form-row { flex-direction: column; }
      .lines-table-head { display: none; }
      .lines-table-row { grid-template-columns: 1fr; }
    }
  `]
})
export class ProductsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('stockDistributionChart') stockDistributionChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') categoryChart!: ElementRef<HTMLCanvasElement>;

  products: any[] = [];
  loading = true;
  private static readonly LOW_STOCK_THRESHOLD = 50;
  private static readonly CRITICAL_STOCK_THRESHOLD = 10;

  searchText = '';
  showAllProducts = false;
  selectedGamme = '';

  showPurchaseForm = false;
  newPurchase = { supplierId: '', invoiceNumber: '', datePurchase: '' };
  purchaseLines: { productId: string; productSearch: string; productLabel: string; quantity: number; unitPriceTTC: number; dropdownOpen: boolean }[] = [];
  formError = '';
  suppliers: any[] = [];
  productsForForm: any[] = [];
  dropdownStyle: { top: string; left: string; width: string } = { top: '0px', left: '0px', width: '0px' };
  private activeDropdownIndex = -1;
  private activeDropdownInput: HTMLElement | null = null;
  private readonly scrollHandler = () => this.repositionDropdown();

  private distributionChart: Chart | null = null;
  private catChart: Chart | null = null;
  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  constructor(
    private apiService:  ApiService,
    private route:       ActivatedRoute,
    private router:      Router,
    private urlFilters:  UrlFiltersService
  ) {}

  ngOnInit(): void {
    const params = this.urlFilters.read(this.route);
    if (params['q']) this.searchText = params['q'];

    this.loadProducts();
    this.loadSuppliers();

    this.searchSub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.searchText = value;
      this.urlFilters.write(this.router, this.route, { q: value || null });
    });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
    this.searchSubject.complete();
    window.removeEventListener('scroll', this.scrollHandler, true);
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  ngAfterViewInit(): void {}

  private loadProducts(): void {
    this.loading = true;
    this.apiService.getProducts().subscribe({
      next: (data) => {
        this.products = data || [];
        this.loading = false;
        this.buildProductsForForm(data || []);
        this.createCharts();
      },
      error: () => {
        this.products = [];
        this.loading = false;
      }
    });
  }

  getFilteredProducts(): any[] {
    let list = this.showAllProducts
      ? [...this.products]
      : this.products.filter(p => (p.currentStockQuantity || 0) > 0);

    if (this.selectedGamme) {
      list = list.filter(p => p.gamme === this.selectedGamme);
    }

    const q = this.searchText?.toLowerCase().trim();
    if (q) {
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.designation?.toLowerCase().includes(q) ||
        p.gamme?.toLowerCase().includes(q)
      );
    }
    return list;
  }

  getGammes(): string[] {
    const gammes = new Set<string>();
    for (const p of this.products) {
      if (p.gamme) gammes.add(p.gamme);
    }
    return [...gammes].sort();
  }

  stockStatus(p: any): { kind: string; label: string } {
    const qty = p.currentStockQuantity || 0;
    if (qty <= 0) return { kind: 'out', label: 'Rupture' };
    if (qty < ProductsComponent.CRITICAL_STOCK_THRESHOLD) return { kind: 'critical', label: 'Critique' };
    if (qty < ProductsComponent.LOW_STOCK_THRESHOLD) return { kind: 'low', label: 'Faible' };
    return { kind: 'ok', label: 'En stock' };
  }

  getTotalStock(): number {
    return this.products.reduce((s, p) => s + (p.currentStockQuantity || 0), 0);
  }

  getTotalValue(): number {
    return this.products.reduce((s, p) => s + (p.currentStockValue || 0), 0);
  }

  getLowStockCount(): number {
    return this.products.filter(p => (p.currentStockQuantity || 0) < 50).length;
  }

  trackById(_: number, p: any): any {
    return p.id ?? p.productId;
  }

  createCharts(): void {
    if (this.products.length === 0) return;
    setTimeout(() => {
      this.createStockDistributionChart();
      this.createCategoryDistributionChart();
    }, 100);
  }

  createStockDistributionChart(): void {
    if (!this.stockDistributionChart?.nativeElement) return;
    const ctx = this.stockDistributionChart.nativeElement.getContext('2d');
    if (!ctx) return;
    if (this.distributionChart) this.distributionChart.destroy();

    const top = [...this.products]
      .sort((a, b) => (b.currentStockQuantity || 0) - (a.currentStockQuantity || 0))
      .slice(0, 15);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: top.map(p => p.name?.substring(0, 15) || 'Sans nom'),
        datasets: [{
          label: 'Quantité en Stock',
          data: top.map(p => p.currentStockQuantity || 0),
          backgroundColor: top.map(p =>
            (p.currentStockQuantity || 0) < 50 ? 'rgba(231,76,60,.8)' : 'rgba(52,152,219,.8)'
          ),
          borderColor: top.map(p =>
            (p.currentStockQuantity || 0) < 50 ? 'rgba(231,76,60,1)' : 'rgba(52,152,219,1)'
          ),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, indexAxis: 'y',
        plugins: {
          legend: { display: true, position: 'top' },
          title: { display: true, text: 'Top 15 — Stock par Produit' }
        },
        scales: { x: { beginAtZero: true } }
      }
    };
    this.distributionChart = new Chart(ctx, config);
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

  togglePurchaseForm(): void {
    this.showPurchaseForm = !this.showPurchaseForm;
    if (this.showPurchaseForm) this.initPurchaseForm();
  }

  initPurchaseForm(): void {
    this.newPurchase   = { supplierId: '', invoiceNumber: '', datePurchase: '' };
    this.purchaseLines = [this.emptyLine()];
    this.formError     = '';
  }

  private emptyLine() {
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

  getFilteredProductsForLine(line: any): any[] {
    const term = line.productSearch.trim().toLowerCase();
    const list = term
      ? this.productsForForm.filter((p: any) =>
          (p.name || '').toLowerCase().includes(term) ||
          (p.designation || '').toLowerCase().includes(term))
      : [...this.productsForForm];
    return list.sort((a: any, b: any) => (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase(), 'fr'));
  }

  selectProductForLine(i: number, p: any): void {
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
        this.loadProducts();
      },
      error: () => { this.formError = 'Erreur lors de la création de l\'achat. Veuillez réessayer.'; }
    });
  }

  createCategoryDistributionChart(): void {
    if (!this.categoryChart?.nativeElement) return;
    const ctx = this.categoryChart.nativeElement.getContext('2d');
    if (!ctx) return;
    if (this.catChart) this.catChart.destroy();

    const catData: Record<string, number> = {};
    this.products.forEach(p => {
      const cat = p.range || p.gamme || p.category || 'Non défini';
      catData[cat] = (catData[cat] ?? 0) + (p.currentStockValue || 0);
    });

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: Object.keys(catData),
        datasets: [{
          label: 'Valeur par Gamme (DNT)',
          data: Object.values(catData),
          backgroundColor: [
            'rgba(102,126,234,.8)', 'rgba(46,204,113,.8)', 'rgba(231,76,60,.8)',
            'rgba(241,196,15,.8)',  'rgba(155,89,182,.8)', 'rgba(52,152,219,.8)',
            'rgba(230,126,34,.8)'
          ],
          borderWidth: 2, borderColor: '#fff'
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'right' },
          title: { display: true, text: 'Valeur du Stock par Gamme' }
        }
      }
    };
    this.catChart = new Chart(ctx, config);
  }
}
