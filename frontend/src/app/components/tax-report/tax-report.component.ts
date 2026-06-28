import {
  Component, OnInit, OnDestroy,
  ViewChild, ElementRef, AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

const VAT_RATE = 0.19;

interface BillRow {
  billId:        number;
  billDate:      string;
  clientName:    string;
  totalAmount:   number;
  deposit:       number;
  amountDue:     number;
  paymentStatus: string;
  applyTva:      boolean;
}

interface PeriodRow {
  label:       string;
  sortKey:     string;
  count:       number;
  countWithVAT:number;
  totalHT:     number;
  vatAmount:   number;
  totalTTC:    number;
  paidHT:      number;
  paidVAT:     number;
  paidTTC:     number;
}

@Component({
  selector: 'app-tax-report',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
<div class="page">

  <!-- ══ Header ══════════════════════════════════════════════════════════════ -->
  <div class="page-head">
    <div>
      <h1 class="page-title">Rapport TVA / Taxes</h1>
      <p class="page-sub">Déclaration TVA — taux 19 %</p>
    </div>
    <div class="head-actions">
      <button class="btn-secondary" (click)="exportCsv()" [disabled]="loading">
        <i class="bi bi-download"></i> Export CSV
      </button>
    </div>
  </div>

  <!-- ══ Skeleton ══════════════════════════════════════════════════════════ -->
  <ng-container *ngIf="loading">
    <div class="kpi-row skeleton-row">
      <div class="kpi-card sk" *ngFor="let _ of [1,2,3,4]"></div>
    </div>
    <div class="chart-card sk" style="height:320px; margin-bottom:1.5rem;"></div>
    <div class="table-card sk" style="height:260px;"></div>
  </ng-container>

  <ng-container *ngIf="!loading">

    <!-- ══ KPI Cards ════════════════════════════════════════════════════════ -->
    <div class="kpi-row">
      <div class="kpi-card kpi-blue">
        <div class="kpi-top">
          <div class="kpi-ic-wrap kpi-ic-blue"><i class="bi bi-receipt-cutoff"></i></div>
        </div>
        <span class="kpi-val">{{ totals.count }}</span>
        <span class="kpi-lbl">Factures analysées</span>
        <span class="kpi-sub">{{ totals.countWithVAT }} avec TVA</span>
      </div>

      <div class="kpi-card kpi-orange">
        <div class="kpi-top">
          <div class="kpi-ic-wrap kpi-ic-orange"><i class="bi bi-file-text"></i></div>
        </div>
        <span class="kpi-val">{{ totals.totalHT | number:'1.3-3' }}</span>
        <span class="kpi-lbl">Total HT (DNT)</span>
        <span class="kpi-sub">Base imposable</span>
      </div>

      <div class="kpi-card kpi-red">
        <div class="kpi-top">
          <div class="kpi-ic-wrap kpi-ic-red"><i class="bi bi-percent"></i></div>
        </div>
        <span class="kpi-val">{{ totals.vatAmount | number:'1.3-3' }}</span>
        <span class="kpi-lbl">TVA Collectée (DNT)</span>
        <span class="kpi-sub">19 % sur HT imposable</span>
      </div>

      <div class="kpi-card kpi-green">
        <div class="kpi-top">
          <div class="kpi-ic-wrap kpi-ic-green"><i class="bi bi-check2-circle"></i></div>
        </div>
        <span class="kpi-val">{{ totals.paidVAT | number:'1.3-3' }}</span>
        <span class="kpi-lbl">TVA Encaissée (DNT)</span>
        <span class="kpi-sub">Sur factures payées</span>
      </div>
    </div>

    <!-- ══ Period toggle + chart ════════════════════════════════════════════ -->
    <div class="section-bar">
      <span class="section-title">Évolution TVA collectée</span>
      <div class="toggle-group">
        <button [class.active]="period==='month'"   (click)="setPeriod('month')">Mensuel</button>
        <button [class.active]="period==='quarter'" (click)="setPeriod('quarter')">Trimestriel</button>
        <button [class.active]="period==='year'"    (click)="setPeriod('year')">Annuel</button>
      </div>
    </div>

    <div class="chart-card">
      <canvas #vatChartCanvas></canvas>
    </div>

    <!-- ══ Detail table ═════════════════════════════════════════════════════ -->
    <div class="section-bar" style="margin-top:1.5rem;">
      <span class="section-title">Détail par {{ periodLabel }}</span>
      <span class="badge-count">{{ rows.length }} période(s)</span>
    </div>

    <div class="table-card">
      <table class="table">
        <thead>
          <tr>
            <th>Période</th>
            <th class="num">Factures</th>
            <th class="num">Avec TVA</th>
            <th class="num">Total HT (DNT)</th>
            <th class="num vat-col">TVA 19% (DNT)</th>
            <th class="num">Total TTC (DNT)</th>
            <th class="num">TVA encaissée (DNT)</th>
            <th class="num">Taux encaissement</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of rows">
            <td class="period-cell">{{ row.label }}</td>
            <td class="num">{{ row.count }}</td>
            <td class="num">
              <span class="badge" [class.badge-success]="row.countWithVAT > 0"
                                  [class.badge-neutral]="row.countWithVAT === 0">
                {{ row.countWithVAT }}
              </span>
            </td>
            <td class="num">{{ row.totalHT | number:'1.3-3' }}</td>
            <td class="num vat-col">{{ row.vatAmount | number:'1.3-3' }}</td>
            <td class="num">{{ row.totalTTC | number:'1.3-3' }}</td>
            <td class="num">{{ row.paidVAT | number:'1.3-3' }}</td>
            <td class="num">
              <span class="collection-rate"
                    [class.rate-good]="collectionRate(row) >= 80"
                    [class.rate-mid]="collectionRate(row) >= 40 && collectionRate(row) < 80"
                    [class.rate-low]="collectionRate(row) < 40">
                {{ collectionRate(row) }}%
              </span>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td>Total</td>
            <td class="num">{{ totals.count }}</td>
            <td class="num">{{ totals.countWithVAT }}</td>
            <td class="num">{{ totals.totalHT | number:'1.3-3' }}</td>
            <td class="num vat-col">{{ totals.vatAmount | number:'1.3-3' }}</td>
            <td class="num">{{ totals.totalTTC | number:'1.3-3' }}</td>
            <td class="num">{{ totals.paidVAT | number:'1.3-3' }}</td>
            <td class="num">{{ collectionRate(totals) }}%</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- ══ Per-invoice detail ═══════════════════════════════════════════════ -->
    <div class="section-bar" style="margin-top:1.5rem;">
      <span class="section-title">Détail par facture</span>
      <span class="badge-count">{{ bills.length }} facture(s)</span>
    </div>

    <div class="table-card">
      <table class="table">
        <thead>
          <tr>
            <th>N° Facture</th>
            <th>Date</th>
            <th>Client</th>
            <th class="num">Total HT (DNT)</th>
            <th class="num vat-col">TVA 19% (DNT)</th>
            <th class="num">Total TTC (DNT)</th>
            <th class="num">Statut</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let b of bills">
            <td class="id-cell">#{{ b.billId }}</td>
            <td>{{ b.billDate | date:'dd/MM/yyyy' }}</td>
            <td>{{ b.clientName }}</td>
            <td class="num">{{ htOf(b) | number:'1.3-3' }}</td>
            <td class="num vat-col">{{ vatOf(b) | number:'1.3-3' }}</td>
            <td class="num">{{ b.totalAmount | number:'1.3-3' }}</td>
            <td>
              <span class="status-badge" [ngClass]="statusClass(b.paymentStatus)">
                {{ statusLabel(b.paymentStatus) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </ng-container>
</div>
  `,
  styles: [`
    .page { padding: 1.5rem 2rem; background: var(--color-bg); min-height: 100vh; }

    .page-head {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 1.5rem;
    }
    .page-title { font-size: 1.5rem; font-weight: 700; color: var(--color-text); margin: 0 0 .25rem; }
    .page-sub   { font-size: .875rem; color: var(--color-text-muted); margin: 0; }
    .head-actions { display: flex; gap: .5rem; }

    /* ── KPI row ── */
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .kpi-card {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      border-top: 3px solid transparent;
      box-shadow: var(--shadow-sm);
      display: flex; flex-direction: column;
    }
    .kpi-card.kpi-blue   { border-top-color: #3b82f6; }
    .kpi-card.kpi-orange { border-top-color: #f59e0b; }
    .kpi-card.kpi-red    { border-top-color: #ef4444; }
    .kpi-card.kpi-green  { border-top-color: #10b981; }

    .kpi-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: .75rem; }
    .kpi-ic-wrap {
      width: 2.25rem; height: 2.25rem; border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
    }
    .kpi-ic-wrap i { font-size: 1.125rem; }
    .kpi-ic-blue   { background: #eff6ff; color: #3b82f6; }
    .kpi-ic-orange { background: #fffbeb; color: #f59e0b; }
    .kpi-ic-red    { background: #fef2f2; color: #ef4444; }
    .kpi-ic-green  { background: #ecfdf5; color: #10b981; }

    .kpi-val { font-size: 1.5rem; font-weight: 700; color: var(--color-text); line-height: 1.2; }
    .kpi-lbl { font-size: .75rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: .05em; margin-top: .25rem; }
    .kpi-sub { font-size: .75rem; color: var(--color-text-muted); margin-top: .25rem; }

    /* ── Skeleton ── */
    .skeleton-row { pointer-events: none; }
    .sk {
      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: var(--radius-lg);
    }
    @keyframes shimmer { to { background-position: -200% 0; } }

    /* ── Section bar ── */
    .section-bar {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: .75rem;
    }
    .section-title { font-size: .875rem; font-weight: 700; color: var(--color-text); }
    .badge-count {
      font-size: .75rem; background: var(--color-surface-2);
      color: var(--color-text-muted); padding: .2rem .6rem;
      border-radius: var(--radius-full);
    }

    /* ── Toggle ── */
    .toggle-group {
      display: flex; background: var(--color-surface-2);
      border-radius: var(--radius-full); padding: 2px; gap: 2px;
    }
    .toggle-group button {
      padding: .3rem .875rem; border: none; background: transparent;
      border-radius: var(--radius-full); font-size: .8125rem; font-weight: 500;
      color: var(--color-text-muted); cursor: pointer;
      transition: all var(--transition);
    }
    .toggle-group button.active {
      background: var(--color-primary); color: #fff;
      box-shadow: 0 1px 4px rgba(99,102,241,.35);
    }

    /* ── Chart ── */
    .chart-card {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      box-shadow: var(--shadow-sm);
      height: 300px;
      position: relative;
    }
    .chart-card canvas { width: 100% !important; height: 100% !important; }

    /* ── Table ── */
    .table-card {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      overflow-x: auto;
    }
    .table { width: 100%; border-collapse: collapse; font-size: .875rem; }
    .table th {
      padding: .75rem 1rem; text-align: left; font-size: .6875rem;
      font-weight: 700; text-transform: uppercase; letter-spacing: .05em;
      color: var(--color-text-muted); background: var(--color-surface-2);
      border-bottom: 1px solid var(--color-border);
    }
    .table td {
      padding: .75rem 1rem; border-bottom: 1px solid var(--color-border);
      color: var(--color-text);
    }
    .table tbody tr:last-child td { border-bottom: none; }
    .table tbody tr:hover { background: var(--color-surface-2); }
    .table tfoot td {
      padding: .75rem 1rem; font-weight: 700; color: var(--color-text);
      background: var(--color-surface-2); border-top: 2px solid var(--color-border);
    }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    .vat-col { color: #ef4444; font-weight: 600; }
    .period-cell { font-weight: 600; }
    .id-cell { color: var(--color-primary); font-weight: 600; font-size: .8125rem; }

    /* ── Collection rate ── */
    .collection-rate {
      display: inline-block; padding: .2rem .5rem;
      border-radius: var(--radius-full); font-size: .75rem; font-weight: 700;
    }
    .rate-good { background: #ecfdf5; color: #059669; }
    .rate-mid  { background: #fffbeb; color: #d97706; }
    .rate-low  { background: #fef2f2; color: #dc2626; }

    /* ── Badge ── */
    .badge { display: inline-block; padding: .2rem .55rem; border-radius: var(--radius-full); font-size: .75rem; font-weight: 600; }
    .badge-success { background: #ecfdf5; color: #059669; }
    .badge-neutral { background: var(--color-surface-2); color: var(--color-text-muted); }

    /* ── Status badge ── */
    .status-badge {
      display: inline-block; padding: .25rem .65rem;
      border-radius: var(--radius-full); font-size: .75rem; font-weight: 600;
    }
    .status-paid     { background: #ecfdf5; color: #059669; }
    .status-unpaid   { background: #fef2f2; color: #dc2626; }
    .status-partial  { background: #fffbeb; color: #d97706; }

    /* ── Buttons ── */
    .btn-secondary {
      display: inline-flex; align-items: center; gap: .4rem;
      padding: .5rem 1rem; border: 1px solid var(--color-border);
      background: var(--color-surface); color: var(--color-text);
      border-radius: var(--radius-md); font-size: .875rem; font-weight: 500;
      cursor: pointer; transition: all var(--transition);
    }
    .btn-secondary:hover { background: var(--color-surface-2); }
    .btn-secondary:disabled { opacity: .5; cursor: not-allowed; }

    /* ── Responsive ── */
    @media (max-width: 900px) { .kpi-row { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) { .kpi-row { grid-template-columns: 1fr 1fr; } .page { padding: 1rem; } }
  `]
})
export class TaxReportComponent implements OnInit, AfterViewInit {

  @ViewChild('vatChartCanvas') vatChartCanvas!: ElementRef<HTMLCanvasElement>;

  loading  = true;
  period: 'month' | 'quarter' | 'year' = 'month';
  bills:   BillRow[]  = [];
  rows:    PeriodRow[] = [];
  totals:  PeriodRow  = this.emptyPeriod('Total', '');

  private chart: Chart | null = null;
  private chartsReady = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.load(); }

  ngAfterViewInit(): void {
    this.chartsReady = true;
    if (!this.loading) this.buildChart();
  }

  private load(): void {
    this.api.getAllBills(0, 1000).subscribe({
      next: (page) => {
        const raw: any[] = Array.isArray(page) ? page : (page?.content ?? []);
        this.bills = raw.map(b => ({
          billId:        b.billId,
          billDate:      b.billDate,
          clientName:    b.clientName ?? '—',
          totalAmount:   Number(b.totalAmount ?? 0),
          deposit:       Number(b.deposit ?? 0),
          amountDue:     Number(b.amountDue ?? 0),
          paymentStatus: b.paymentStatus ?? 'UNPAID',
          applyTva:      b.applyTva === true
        }));
        this.loading = false;
        this.buildRows();
        if (this.chartsReady) setTimeout(() => this.buildChart(), 100);
      },
      error: () => { this.loading = false; }
    });
  }

  // ── Period key ─────────────────────────────────────────────────────────────

  private periodKey(dateStr: string): string {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Inconnu';
    const y  = d.getFullYear();
    const m  = d.getMonth() + 1;
    if (this.period === 'month')   return `${y}-${String(m).padStart(2,'0')}`;
    if (this.period === 'quarter') return `${y}-Q${Math.ceil(m / 3)}`;
    return `${y}`;
  }

  private labelForKey(key: string): string {
    if (this.period === 'month') {
      const [y, mo] = key.split('-');
      const names = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
      return `${names[+mo - 1]} ${y}`;
    }
    return key;
  }

  get periodLabel(): string {
    return this.period === 'month' ? 'mois' : this.period === 'quarter' ? 'trimestre' : 'année';
  }

  // ── Calculations ───────────────────────────────────────────────────────────

  htOf(b: BillRow): number {
    if (!b.applyTva) return b.totalAmount;
    return b.totalAmount / (1 + VAT_RATE);
  }

  vatOf(b: BillRow): number {
    if (!b.applyTva) return 0;
    return b.totalAmount - this.htOf(b);
  }

  private isPaid(b: BillRow): boolean {
    return b.paymentStatus === 'PAID';
  }

  private buildRows(): void {
    const map = new Map<string, PeriodRow>();

    for (const b of this.bills) {
      const key   = this.periodKey(b.billDate);
      const label = this.labelForKey(key);
      if (!map.has(key)) map.set(key, this.emptyPeriod(label, key));
      const row = map.get(key)!;
      const ht  = this.htOf(b);
      const vat = this.vatOf(b);
      row.count++;
      if (b.applyTva) row.countWithVAT++;
      row.totalHT   += ht;
      row.vatAmount  += vat;
      row.totalTTC   += b.totalAmount;
      if (this.isPaid(b)) {
        row.paidHT  += ht;
        row.paidVAT += vat;
        row.paidTTC += b.totalAmount;
      }
    }

    this.rows = [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, r]) => r);

    this.totals = this.rows.reduce((acc, r) => ({
      label:        'Total',
      sortKey:      '',
      count:        acc.count        + r.count,
      countWithVAT: acc.countWithVAT + r.countWithVAT,
      totalHT:      acc.totalHT      + r.totalHT,
      vatAmount:    acc.vatAmount    + r.vatAmount,
      totalTTC:     acc.totalTTC     + r.totalTTC,
      paidHT:       acc.paidHT       + r.paidHT,
      paidVAT:      acc.paidVAT      + r.paidVAT,
      paidTTC:      acc.paidTTC      + r.paidTTC,
    }), this.emptyPeriod('Total', ''));
  }

  private emptyPeriod(label: string, sortKey: string): PeriodRow {
    return { label, sortKey, count: 0, countWithVAT: 0,
             totalHT: 0, vatAmount: 0, totalTTC: 0,
             paidHT: 0, paidVAT: 0, paidTTC: 0 };
  }

  collectionRate(row: { vatAmount: number; paidVAT: number }): number {
    if (row.vatAmount === 0) return 0;
    return Math.round((row.paidVAT / row.vatAmount) * 100);
  }

  setPeriod(p: 'month' | 'quarter' | 'year'): void {
    this.period = p;
    this.buildRows();
    this.buildChart();
  }

  // ── Chart ──────────────────────────────────────────────────────────────────

  private buildChart(): void {
    const canvas = this.vatChartCanvas?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.chart?.destroy();

    const labels    = this.rows.map(r => r.label);
    const vatData   = this.rows.map(r => +r.vatAmount.toFixed(3));
    const paidData  = this.rows.map(r => +r.paidVAT.toFixed(3));

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'TVA collectée',
            data: vatData,
            backgroundColor: 'rgba(239,68,68,.75)',
            borderColor: '#ef4444',
            borderWidth: 1,
            borderRadius: 4,
            order: 2
          },
          {
            label: 'TVA encaissée',
            data: paidData,
            backgroundColor: 'rgba(16,185,129,.75)',
            borderColor: '#10b981',
            borderWidth: 1,
            borderRadius: 4,
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { size: 12 }, color: '#64748b', boxWidth: 12, padding: 16 }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString('fr-TN', { minimumFractionDigits: 3 })} DNT`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 }, color: '#64748b' }
          },
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

  // ── Status helpers ─────────────────────────────────────────────────────────

  statusClass(s: string): string {
    if (s === 'PAID')           return 'status-paid';
    if (s === 'PARTIALLY_PAID') return 'status-partial';
    return 'status-unpaid';
  }

  statusLabel(s: string): string {
    if (s === 'PAID')           return 'Payée';
    if (s === 'PARTIALLY_PAID') return 'Partielle';
    return 'Impayée';
  }

  // ── CSV export ─────────────────────────────────────────────────────────────

  exportCsv(): void {
    const header = 'N° Facture,Date,Client,Total HT,TVA 19%,Total TTC,Statut\n';
    const lines  = this.bills.map(b =>
      [b.billId, b.billDate?.split('T')[0],
       `"${b.clientName}"`,
       this.htOf(b).toFixed(3),
       this.vatOf(b).toFixed(3),
       b.totalAmount.toFixed(3),
       b.paymentStatus
      ].join(',')
    ).join('\n');

    const blob = new Blob(['﻿' + header + lines], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `rapport-tva-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
