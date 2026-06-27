import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page">

  <!-- ══ EN-TÊTE ═══════════════════════════════════════════════════════════ -->
  <div class="page-header">
    <h1 class="page-title">Produits</h1>
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

    <!-- ── Filtres ─────────────────────────────────────────────────────────── -->
    <div class="filter-bar">
      <div class="filter-group fg-wide">
        <label class="filter-lbl">Recherche</label>
        <input type="text" class="filter-ctrl" [ngModel]="searchText"
               (ngModelChange)="onSearchInput($event)"
               placeholder="Nom, désignation, gamme…">
      </div>
      <div class="filter-group" style="justify-content:flex-end;">
        <label class="filter-lbl">Affichage</label>
        <label class="toggle-label">
          <div class="toggle-track" (click)="showAllProducts = !showAllProducts"
               [class.toggle-on]="showAllProducts">
            <div class="toggle-thumb"></div>
          </div>
          <span class="toggle-text">Tous (y compris stock nul)</span>
        </label>
      </div>
      <button *ngIf="searchText" class="btn-reset" (click)="searchText=''">✕ Réinitialiser</button>
    </div>

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
          </tr>
          <tr *ngIf="getFilteredProducts().length === 0">
            <td colspan="8" class="empty-state">
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
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      box-sizing: border-box;
    }

    .page { padding: 1.5rem; background: #f8fafc; min-height: 100vh; }

    .page-header { margin-bottom: 1.5rem; }
    .page-title  { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin: 0; }

    /* ─── KPI ROW ─────────────────────────────────────── */
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: .875rem; margin-bottom: 1.5rem;
    }
    .kpi-card {
      background: #fff; border-radius: 12px; border: 1px solid #e2e8f0;
      padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: .3rem;
      box-shadow: 0 1px 4px rgba(0,0,0,.04); border-top-width: 3px;
      transition: transform .15s, box-shadow .15s;
    }
    .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,.08); }
    .kpi-blue   { border-top-color: #3b82f6; }
    .kpi-indigo { border-top-color: #4f46e5; }
    .kpi-green  { border-top-color: #10b981; }
    .kpi-orange { border-top-color: #f59e0b; }
    .kpi-val { font-size: 1.25rem; font-weight: 700; color: #0f172a; line-height: 1.2; }
    .kpi-lbl {
      font-size: .7rem; font-weight: 600; color: #64748b;
      text-transform: uppercase; letter-spacing: .4px;
    }

    /* ─── CHARTS ──────────────────────────────────────── */
    .charts-row {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 1rem; margin-bottom: 1.5rem;
    }
    .chart-card {
      background: #fff; border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 4px rgba(0,0,0,.04); overflow: hidden;
    }
    .chart-card-header {
      padding: .75rem 1.25rem;
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      color: #fff; font-weight: 600; font-size: .875rem;
    }
    .chart-body { padding: 1rem; height: 340px; position: relative; }
    .chart-body canvas { width: 100% !important; height: 100% !important; }

    /* ─── MAIN CARD ───────────────────────────────────── */
    .main-card {
      background: #fff; border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 4px rgba(0,0,0,.04); overflow: hidden;
    }

    /* ─── FILTER BAR ──────────────────────────────────── */
    .filter-bar {
      display: flex; align-items: flex-end; gap: .875rem;
      padding: 1rem 1.25rem;
      background: #f8fafc; border-bottom: 1px solid #f1f5f9;
      flex-wrap: wrap;
    }
    .filter-group { display: flex; flex-direction: column; gap: .35rem; flex: 1; min-width: 120px; }
    .filter-group.fg-wide { flex: 2; min-width: 180px; }
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

    .toggle-label { display: flex; align-items: center; gap: .5rem; cursor: pointer; }
    .toggle-track {
      width: 40px; height: 22px; border-radius: 11px; background: #e2e8f0;
      position: relative; transition: background .25s; flex-shrink: 0;
    }
    .toggle-track.toggle-on { background: #10b981; }
    .toggle-thumb {
      position: absolute; top: 2px; left: 2px;
      width: 18px; height: 18px; border-radius: 50%;
      background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.2); transition: left .25s;
    }
    .toggle-track.toggle-on .toggle-thumb { left: 20px; }
    .toggle-text { font-size: .8rem; color: #475569; white-space: nowrap; }

    /* ─── TABLE ───────────────────────────────────────── */
    .data-table { width: 100%; border-collapse: collapse; font-size: .875rem; }
    .data-table thead tr { background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); }
    .data-table th {
      color: #fff; font-weight: 500; padding: .8rem 1rem; text-align: left;
      font-size: .78rem; letter-spacing: .4px; white-space: nowrap;
    }
    .data-table td { padding: .8rem 1rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    .data-row { transition: background .12s; }
    .data-row:hover { background: #f5f7ff !important; }
    .data-row:last-child td { border-bottom: none; }

    .ta-r    { text-align: right !important; }
    .fw-500  { font-weight: 500; }
    .fw-600  { font-weight: 600; }
    .td-muted   { color: #64748b; font-size: .875rem; }
    .c-green    { color: #16a34a !important; }
    .c-orange   { color: #b45309 !important; }
    .client-name { font-weight: 600; color: #1f2937; }

    .gamme-badge {
      display: inline-block; padding: .2rem .65rem;
      background: #dbeafe; color: #1e40af;
      border-radius: 6px; font-size: .78rem; font-weight: 500;
    }
    .qty-badge {
      display: inline-block; padding: .2rem .65rem; border-radius: 6px;
      font-weight: 600; font-size: .8rem;
      background: #d1fae5; color: #065f46;
    }
    .qty-badge.qty-low { background: #fef3c7; color: #92400e; }

    /* ─── EMPTY STATE ─────────────────────────────────── */
    .empty-state { padding: 3.5rem 1rem; text-align: center; color: #94a3b8; }
    .empty-icon  { font-size: 3.5rem; margin-bottom: .75rem; opacity: .6; }

    /* ─── MOBILE CARDS ────────────────────────────────── */
    .mobile-row {
      padding: 1rem 1.25rem; border-bottom: 1px solid #f1f5f9; transition: background .12s;
    }
    .mobile-row:hover { background: #f8fafc; }
    .mobile-row:last-child { border-bottom: none; }
    .mobile-row-top {
      display: flex; justify-content: space-between;
      align-items: flex-start; margin-bottom: .4rem;
    }
    .mobile-grid-2 { display: grid; grid-template-columns: repeat(2,1fr); gap: .5rem; }
    .mobile-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: .5rem; }
    .mg-cell {
      background: #f8fafc; padding: .5rem; border-radius: 8px;
      text-align: center; display: flex; flex-direction: column; gap: .1rem;
    }
    .mg-lbl { font-size: .7rem; color: #6b7280; }

    /* ─── RESPONSIVE ──────────────────────────────────── */
    .desktop-table { display: none; overflow-x: auto; }
    .mobile-cards  { display: block; }

    @media (min-width: 1024px) {
      .desktop-table { display: block; }
      .mobile-cards  { display: none; }
    }
    @media (max-width: 768px) {
      .page       { padding: 1rem; }
      .charts-row { grid-template-columns: 1fr; }
      .chart-body { height: 240px; }
      .filter-bar { gap: .625rem; }
    }
  `]
})
export class ProductsComponent implements OnInit, AfterViewInit {
  @ViewChild('stockDistributionChart') stockDistributionChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') categoryChart!: ElementRef<HTMLCanvasElement>;

  products: any[] = [];
  loading = true;
  searchText = '';
  showAllProducts = false;

  private distributionChart: Chart | null = null;
  private catChart: Chart | null = null;
  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.searchSub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => { this.searchText = value; });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
    this.searchSubject.complete();
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
