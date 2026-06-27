import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { StockAlertBannerComponent } from '../../shared/stock-alert-banner.component';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StockAlertBannerComponent],
  template: `
<div class="page">

  <!-- ══ EN-TÊTE ══════════════════════════════════════════════════════════════ -->
  <div class="page-head">
    <div>
      <h1 class="page-title">Tableau de Bord</h1>
      <p class="page-sub">Bhouri Stock — Vue d'ensemble en temps réel</p>
    </div>
    <div class="head-actions">
      <a routerLink="/documents/create" class="btn-new">+ Nouveau Document</a>
    </div>
  </div>

  <!-- ══ SKELETON ══════════════════════════════════════════════════════════════ -->
  <div *ngIf="loading" class="skeleton-grid">
    <div class="sk-card" *ngFor="let i of [1,2,3,4,5,6,7,8]"></div>
  </div>

  <ng-container *ngIf="!loading">

    <!-- ══ BANNIÈRE ALERTES STOCK ═══════════════════════════════════════════ -->
    <app-stock-alert-banner [alerts]="alerts"></app-stock-alert-banner>

    <!-- ══ KPIs FACTURATION ══════════════════════════════════════════════════ -->
    <div class="section-label">Facturation</div>
    <div class="kpi-row">

      <div class="kpi-card kpi-blue">
        <div class="kpi-top">
          <div class="kpi-ic-wrap kpi-ic-blue"><i class="bi bi-receipt"></i></div>
          <span *ngIf="trends['invoices']" class="kpi-trend"
                [class.up]="trends['invoices'].dir==='up'"
                [class.down]="trends['invoices'].dir==='down'"
                [class.neutral]="trends['invoices'].dir==='neutral'">
            <i class="bi" [class.bi-arrow-up-short]="trends['invoices'].dir==='up'"
                          [class.bi-arrow-down-short]="trends['invoices'].dir==='down'"
                          [class.bi-dash]="trends['invoices'].dir==='neutral'"></i>
            {{ trends['invoices'].pct }}%
          </span>
        </div>
        <span class="kpi-val">{{ invoiceKPIs.totalInvoices || 0 }}</span>
        <span class="kpi-lbl">Total Factures</span>
        <span *ngIf="trends['invoices']" class="kpi-sub">{{ trends['invoices'].label }}</span>
      </div>

      <div class="kpi-card kpi-green">
        <div class="kpi-top">
          <div class="kpi-ic-wrap kpi-ic-green"><i class="bi bi-currency-dollar"></i></div>
          <span *ngIf="trends['revenue']" class="kpi-trend"
                [class.up]="trends['revenue'].dir==='up'"
                [class.down]="trends['revenue'].dir==='down'"
                [class.neutral]="trends['revenue'].dir==='neutral'">
            <i class="bi" [class.bi-arrow-up-short]="trends['revenue'].dir==='up'"
                          [class.bi-arrow-down-short]="trends['revenue'].dir==='down'"
                          [class.bi-dash]="trends['revenue'].dir==='neutral'"></i>
            {{ trends['revenue'].pct }}%
          </span>
        </div>
        <span class="kpi-val">{{ invoiceKPIs.totalInvoicedAmount || 0 | number:'1.3-3' }}</span>
        <span class="kpi-lbl">CA Total (DNT)</span>
        <span *ngIf="trends['revenue']" class="kpi-sub">{{ trends['revenue'].label }}</span>
      </div>

      <div class="kpi-card kpi-orange">
        <div class="kpi-top">
          <div class="kpi-ic-wrap kpi-ic-orange"><i class="bi bi-calendar-check"></i></div>
        </div>
        <span class="kpi-val">{{ invoiceKPIs.revenueThisMonth || 0 | number:'1.3-3' }}</span>
        <span class="kpi-lbl">CA ce Mois (DNT)</span>
        <span class="kpi-sub">Mois courant</span>
      </div>

      <div class="kpi-card kpi-red">
        <div class="kpi-top">
          <div class="kpi-ic-wrap kpi-ic-red"><i class="bi bi-hourglass-split"></i></div>
        </div>
        <span class="kpi-val">{{ invoiceKPIs.totalAmountDue || 0 | number:'1.3-3' }}</span>
        <span class="kpi-lbl">Montant Dû (DNT)</span>
        <span class="kpi-sub">{{ invoiceKPIs.unpaidInvoices || 0 }} facture(s) en attente</span>
      </div>

      <div class="kpi-card kpi-amber">
        <div class="kpi-top">
          <div class="kpi-ic-wrap kpi-ic-amber"><i class="bi bi-exclamation-triangle"></i></div>
        </div>
        <span class="kpi-val">{{ invoiceKPIs.unpaidInvoices || 0 }}</span>
        <span class="kpi-lbl">Impayées</span>
        <span class="kpi-sub">À recouvrer</span>
      </div>

    </div>

    <!-- ══ KPIs STOCK & BL ════════════════════════════════════════════════════ -->
    <div class="section-label">Stock & Livraisons</div>
    <div class="kpi-row">

      <div class="kpi-card kpi-indigo">
        <div class="kpi-top">
          <div class="kpi-ic-wrap kpi-ic-indigo"><i class="bi bi-box-seam"></i></div>
        </div>
        <span class="kpi-val">{{ products.length }}</span>
        <span class="kpi-lbl">Produits Actifs</span>
        <span class="kpi-sub">{{ alerts.length }} en alerte</span>
      </div>

      <div class="kpi-card kpi-teal">
        <div class="kpi-top">
          <div class="kpi-ic-wrap kpi-ic-teal"><i class="bi bi-tags"></i></div>
        </div>
        <span class="kpi-val">{{ totalValue | number:'1.3-3' }}</span>
        <span class="kpi-lbl">Valeur Stock (DNT)</span>
        <span class="kpi-sub">Coût total inventaire</span>
      </div>

      <div class="kpi-card kpi-purple">
        <div class="kpi-top">
          <div class="kpi-ic-wrap kpi-ic-purple"><i class="bi bi-truck"></i></div>
        </div>
        <span class="kpi-val">{{ deliveryNoteKPIs.totalDeliveryNotes || 0 }}</span>
        <span class="kpi-lbl">Total BL</span>
        <span class="kpi-sub">{{ deliveryNoteKPIs.notInvoiced || 0 }} non facturés</span>
      </div>

      <div class="kpi-card kpi-orange">
        <div class="kpi-top">
          <div class="kpi-ic-wrap kpi-ic-orange"><i class="bi bi-file-earmark-text"></i></div>
          <span *ngIf="trends['purchases']" class="kpi-trend"
                [class.up]="trends['purchases'].dir==='up'"
                [class.down]="trends['purchases'].dir==='down'"
                [class.neutral]="trends['purchases'].dir==='neutral'">
            <i class="bi" [class.bi-arrow-up-short]="trends['purchases'].dir==='up'"
                          [class.bi-arrow-down-short]="trends['purchases'].dir==='down'"
                          [class.bi-dash]="trends['purchases'].dir==='neutral'"></i>
            {{ trends['purchases'].pct }}%
          </span>
        </div>
        <span class="kpi-val">{{ deliveryNoteKPIs.notInvoiced || 0 }}</span>
        <span class="kpi-lbl">BL Non Facturés</span>
        <span *ngIf="trends['purchases']" class="kpi-sub">{{ trends['purchases'].label }}</span>
      </div>

      <div class="kpi-card kpi-green">
        <div class="kpi-top">
          <div class="kpi-ic-wrap kpi-ic-green"><i class="bi bi-bar-chart"></i></div>
        </div>
        <span class="kpi-val">{{ getAverageBasket() | number:'1.3-3' }}</span>
        <span class="kpi-lbl">Panier Moyen (DNT)</span>
        </div>
      </div>

    </div>

    <!-- ══ GRAPHIQUES ════════════════════════════════════════════════════════ -->
    <div class="charts-layout">

      <!-- Ventes vs Achats (large) -->
      <div class="chart-card chart-wide">
        <div class="chart-head">
          <span class="chart-title">Évolution Ventes vs Achats</span>
          <div class="chart-legend">
            <span class="legend-dot" style="background:#10b981;"></span> Ventes
            <span class="legend-dot" style="background:#ef4444;margin-left:.75rem;"></span> Achats
          </div>
        </div>
        <div class="chart-body">
          <canvas #salesChartCanvas></canvas>
        </div>
      </div>

      <!-- Statuts de paiement (narrow) -->
      <div class="chart-card">
        <div class="chart-head">
          <span class="chart-title">Statuts de Paiement</span>
        </div>
        <div class="chart-body chart-body-sm">
          <canvas #paymentChartCanvas></canvas>
        </div>
        <div class="payment-legend">
          <div class="pl-row">
            <span class="pl-dot paid"></span>
            <span class="pl-lbl">Payé</span>
            <strong>{{ invoiceKPIs.paymentStatusDistribution?.PAID || 0 }}</strong>
          </div>
          <div class="pl-row">
            <span class="pl-dot partial"></span>
            <span class="pl-lbl">Partiel</span>
            <strong>{{ invoiceKPIs.paymentStatusDistribution?.PARTIALLY_PAID || 0 }}</strong>
          </div>
          <div class="pl-row">
            <span class="pl-dot unpaid"></span>
            <span class="pl-lbl">Impayé</span>
            <strong>{{ invoiceKPIs.paymentStatusDistribution?.UNPAID || 0 }}</strong>
          </div>
        </div>
      </div>

      <!-- Top 5 produits -->
      <div class="chart-card">
        <div class="chart-head">
          <span class="chart-title">Top 5 Produits Vendus</span>
        </div>
        <div class="chart-body chart-body-sm">
          <canvas #topProductsChartCanvas></canvas>
        </div>
      </div>

      <!-- Catégories -->
      <div class="chart-card">
        <div class="chart-head">
          <span class="chart-title">Produits par Catégorie</span>
        </div>
        <div class="chart-body chart-body-sm">
          <canvas #categoryChartCanvas></canvas>
        </div>
      </div>

    </div>


  </ng-container>
</div>
  `,
  styles: [`
    :host { display: block; }

    .page {
      background: #f8fafc;
      min-height: 100vh;
      padding: 1.5rem;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      box-sizing: border-box;
    }

    /* ── Header ─────────────────────────────────────── */
    .page-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }
    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 .2rem;
    }
    .page-sub {
      font-size: .82rem;
      color: #64748b;
      margin: 0;
    }
    .btn-new {
      display: inline-flex;
      align-items: center;
      padding: .6rem 1.25rem;
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      color: #fff;
      border-radius: 10px;
      text-decoration: none;
      font-size: .875rem;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(79,70,229,.25);
      transition: opacity .18s;
      white-space: nowrap;
    }
    .btn-new:hover { opacity: .88; }
    .head-actions { display: flex; gap: .625rem; align-items: center; flex-wrap: wrap; }

    /* ── Section label ───────────────────────────────── */
    .section-label {
      font-size: .7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .7px;
      color: #94a3b8;
      margin-bottom: .75rem;
    }

    /* ── KPI Row ─────────────────────────────────────── */
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: .875rem;
      margin-bottom: 1.5rem;
    }
    .kpi-card {
      background: #fff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      border-top: 3px solid #e2e8f0;
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: .1rem;
      box-shadow: 0 1px 4px rgba(0,0,0,.04);
      transition: transform .15s, box-shadow .15s;
    }
    .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(0,0,0,.08); }

    .kpi-blue   { border-top-color: #3b82f6; }
    .kpi-green  { border-top-color: #10b981; }
    .kpi-orange { border-top-color: #f59e0b; }
    .kpi-red    { border-top-color: #ef4444; }
    .kpi-amber  { border-top-color: #f97316; }
    .kpi-indigo { border-top-color: #4f46e5; }
    .kpi-teal   { border-top-color: #14b8a6; }
    .kpi-purple { border-top-color: #8b5cf6; }

    /* ── KPI inner structure ──────────── */
    .kpi-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: .375rem;
    }
    .kpi-ic-wrap {
      width: 2rem; height: 2rem;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1rem;
    }
    .kpi-ic-blue   { background: #dbeafe; color: #1d4ed8; }
    .kpi-ic-green  { background: #d1fae5; color: #059669; }
    .kpi-ic-orange { background: #fef3c7; color: #d97706; }
    .kpi-ic-red    { background: #fee2e2; color: #dc2626; }
    .kpi-ic-amber  { background: #ffedd5; color: #ea580c; }
    .kpi-ic-indigo { background: #e0e7ff; color: #4338ca; }
    .kpi-ic-teal   { background: #ccfbf1; color: #0f766e; }
    .kpi-ic-purple { background: #ede9fe; color: #7c3aed; }

    /* trend badge */
    .kpi-trend {
      display: inline-flex; align-items: center; gap: 1px;
      font-size: .6875rem; font-weight: 600;
      padding: 2px 7px; border-radius: 999px;
    }
    .kpi-trend.up      { background: #d1fae5; color: #065f46; }
    .kpi-trend.down    { background: #fee2e2; color: #991b1b; }
    .kpi-trend.neutral { background: #f1f5f9; color: #64748b; }

    .kpi-val {
      display: block;
      font-size: 1.375rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.15;
      letter-spacing: -.02em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .kpi-lbl {
      display: block;
      font-size: .6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .05em;
      color: #64748b;
      margin-top: .125rem;
    }
    .kpi-sub {
      display: block;
      font-size: .6875rem;
      color: #94a3b8;
      margin-top: .125rem;
    }

    /* ── Charts ──────────────────────────────────────── */
    .charts-layout {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: auto auto;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .chart-card {
      background: #fff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 4px rgba(0,0,0,.04);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .chart-wide { grid-column: span 2; }
    .chart-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: .75rem 1.25rem;
      background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
    }
    .chart-title {
      font-size: .82rem;
      font-weight: 600;
      color: #fff;
      letter-spacing: .3px;
    }
    .chart-legend {
      display: flex;
      align-items: center;
      font-size: .75rem;
      color: rgba(255,255,255,.85);
      gap: .25rem;
    }
    .legend-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      display: inline-block;
      margin-right: .25rem;
    }
    .chart-body {
      flex: 1;
      padding: 1.25rem;
      position: relative;
      height: 260px;
    }
    .chart-body-sm { height: 180px; }

    /* Payment status legend */
    .payment-legend {
      padding: .75rem 1.25rem 1rem;
      display: flex;
      flex-direction: column;
      gap: .5rem;
    }
    .pl-row {
      display: flex;
      align-items: center;
      gap: .5rem;
      font-size: .82rem;
    }
    .pl-dot {
      width: 10px; height: 10px;
      border-radius: 50%; flex-shrink: 0;
    }
    .pl-dot.paid    { background: #10b981; }
    .pl-dot.partial { background: #f59e0b; }
    .pl-dot.unpaid  { background: #ef4444; }
    .pl-lbl { flex: 1; color: #64748b; }
    .pl-row strong { color: #0f172a; font-weight: 700; }

    /* ── Skeleton ────────────────────────────────────── */
    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: .875rem;
      margin-bottom: 1.5rem;
    }
    .sk-card {
      height: 80px;
      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
      border-radius: 12px;
    }
    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }

    /* ── Responsive ──────────────────────────────────── */
    @media (max-width: 1200px) {
      .kpi-row { grid-template-columns: repeat(3, 1fr); }
    }
    @media (max-width: 900px) {
      .page { padding: 1rem; }
      .kpi-row { grid-template-columns: repeat(2, 1fr); }
      .charts-layout { grid-template-columns: 1fr; }
      .chart-wide { grid-column: span 1; }
    }
    @media (max-width: 480px) {
      .kpi-row { grid-template-columns: 1fr 1fr; }
      .page-head { flex-direction: column; gap: 1rem; }
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {

  @ViewChild('salesChartCanvas')       salesChartCanvas!:       ElementRef<HTMLCanvasElement>;
  @ViewChild('paymentChartCanvas')     paymentChartCanvas!:     ElementRef<HTMLCanvasElement>;
  @ViewChild('topProductsChartCanvas') topProductsChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChartCanvas')    categoryChartCanvas!:    ElementRef<HTMLCanvasElement>;

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

  constructor(private apiService: ApiService) {}

  ngOnInit():      void { this.loadDashboard(); }
  ngAfterViewInit(): void {}

  loadDashboard(): void {
    this.loading = true;

    this.apiService.getStockTotalValue().subscribe({
      next: (d) => { this.totalValue = typeof d === 'number' ? d : (d?.totalValue || 0); }
    });

    this.apiService.getStockAlerts(20).subscribe({
      next: (d) => { this.alerts = d; }
    });

    this.apiService.getProducts().subscribe({
      next: (d) => { this.products = d; this.ready.products = true; this.tryCharts(); }
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
      next: (d) => {
        this.purchases = d;
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

    const curPurch  = sumMonth(this.purchases, 'datePurchase', 'totalAmountTTC',  curM);
    const prevPurch = sumMonth(this.purchases, 'datePurchase', 'totalAmountTTC',  prevM);
    const purchPct  = pct(curPurch, prevPurch);

    const curInv    = this.sales.filter(r => (r['dateSale'] || '').startsWith(curM)).length;
    const prevInv   = this.sales.filter(r => (r['dateSale'] || '').startsWith(prevM)).length;
    const invPct    = pct(curInv, prevInv);

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

  // ── Ventes vs Achats ───────────────────────────────────────────────────────

  private createSalesChart(): void {
    const canvas = this.salesChartCanvas?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.salesChart?.destroy();

    const salesByMonth    = this.groupByMonth(this.sales,     'dateSale',     'totalSaleAmount');
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
            label: 'Ventes',
            data: months.map(m => salesByMonth[m] || 0),
            borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.1)',
            tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: '#10b981'
          },
          {
            label: 'Achats',
            data: months.map(m => purchasesByMonth[m] || 0),
            borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,.1)',
            tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: '#ef4444'
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#64748b' } },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,.04)' },
            ticks: {
              font: { size: 11 }, color: '#64748b',
              callback: (v) => `${Number(v).toLocaleString()} DNT`
            }
          }
        }
      }
    } as ChartConfiguration);
  }

  // ── Statuts de paiement ────────────────────────────────────────────────────

  private createPaymentChart(): void {
    const canvas = this.paymentChartCanvas?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.paymentChart?.destroy();

    const dist = this.invoiceKPIs.paymentStatusDistribution || {};
    const paid    = dist.PAID           || 0;
    const partial = dist.PARTIALLY_PAID || 0;
    const unpaid  = dist.UNPAID         || 0;

    if (paid + partial + unpaid === 0) return;

    this.paymentChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Payé', 'Partiel', 'Impayé'],
        datasets: [{
          data: [paid, partial, unpaid],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
          borderWidth: 3, borderColor: '#fff'
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed} facture(s)`
            }
          }
        }
      }
    } as ChartConfiguration);
  }

  // ── Top 5 produits ─────────────────────────────────────────────────────────

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

    const top5 = Object.entries(byProduct)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (!top5.length) return;

    this.topProductsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: top5.map(([name]) => name.length > 22 ? name.slice(0, 22) + '…' : name),
        datasets: [{
          label: 'Ventes (DNT)',
          data: top5.map(([, v]) => v),
          backgroundColor: ['#4f46e5','#10b981','#f59e0b','#ef4444','#8b5cf6'],
          borderRadius: 6, borderWidth: 0
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,.04)' },
            ticks: { font: { size: 10 }, color: '#64748b', callback: (v) => `${Number(v).toLocaleString()}` }
          },
          y: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#334155' } }
        }
      }
    } as ChartConfiguration);
  }

  // ── Catégories ─────────────────────────────────────────────────────────────

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

    const palette = ['#4f46e5','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316'];

    this.categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(cats),
        datasets: [{
          data: Object.values(cats),
          backgroundColor: palette,
          borderWidth: 3, borderColor: '#fff'
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '55%',
        plugins: {
          legend: { position: 'right', labels: { font: { size: 10 }, boxWidth: 10, padding: 8 } }
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

  getTotalSales():    number { return this.sales.reduce((s, x) => s + (x.totalSaleAmount || 0), 0); }
  getTotalPurchases():number { return this.purchases.reduce((s, x) => s + (x.totalAmountTTC || 0), 0); }

  getAverageBasket(): number {
    const total = this.invoiceKPIs.totalInvoicedAmount || 0;
    const count = this.invoiceKPIs.totalInvoices       || 1;
    return total / count;
  }
}
