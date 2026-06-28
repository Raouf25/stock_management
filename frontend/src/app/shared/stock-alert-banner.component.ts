import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface StockAlert {
  productDesignation: string;
  currentQuantity:    number;
  alertLevel:         'CRITICAL' | 'WARNING' | string;
}

@Component({
  selector: 'app-stock-alert-banner',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div *ngIf="criticals.length > 0" class="sab sab-critical" role="alert">
      <i class="bi bi-exclamation-triangle-fill sab-icon"></i>
      <span class="sab-msg">
        <strong>{{ criticals.length }} produit(s) en rupture critique</strong>
        — consultez la liste pour agir immédiatement.
      </span>
      <a routerLink="/products" class="sab-cta">Consulter la liste <i class="bi bi-arrow-right"></i></a>
    </div>

    <div *ngIf="criticals.length === 0 && warnings.length > 0" class="sab sab-warning" role="alert">
      <i class="bi bi-exclamation-circle-fill sab-icon"></i>
      <span class="sab-msg">
        <strong>{{ warnings.length }} produit(s) à stock faible</strong>
        — un réapprovisionnement est recommandé.
      </span>
      <a routerLink="/products" class="sab-cta">Consulter la liste <i class="bi bi-arrow-right"></i></a>
    </div>
  `,
  styles: [`
    .sab {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.125rem;
      border-radius: 10px;
      margin-bottom: 1.25rem;
      font-size: 0.8125rem;
      border: 1px solid transparent;
      animation: bannerIn 0.3s ease-out;
    }
    @keyframes bannerIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

    .sab-critical { background: #fff1f2; border-color: #fecdd3; color: #9f1239; }
    .sab-warning  { background: #fffbeb; border-color: #fde68a; color: #92400e; }

    .sab-icon { font-size: 1.125rem; flex-shrink: 0; }
    .sab-msg  { flex: 1; }
    .sab-msg strong { font-weight: 700; }

    .sab-cta {
      display: inline-flex; align-items: center; gap: 4px;
      font-weight: 600; color: inherit; text-decoration: none;
      white-space: nowrap; padding: 5px 14px;
      border: 1px solid currentColor;
      border-radius: 6px; font-size: 0.8rem;
      transition: background 0.15s; flex-shrink: 0;
    }
    .sab-cta:hover { background: rgba(0,0,0,0.07); }
    .sab-cta i { font-size: 0.75rem; }
  `]
})
export class StockAlertBannerComponent implements OnChanges {
  @Input() alerts:     StockAlert[] = [];
  @Input() maxVisible = 4;

  criticals: StockAlert[] = [];
  warnings:  StockAlert[] = [];

  ngOnChanges(_changes: SimpleChanges): void {
    this.criticals = this.alerts.filter(a => a.alertLevel === 'CRITICAL');
    this.warnings  = this.alerts.filter(a => a.alertLevel !== 'CRITICAL');
  }
}
