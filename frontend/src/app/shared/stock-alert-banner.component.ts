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
      <div class="sab-body">
        <strong>{{ criticals.length }} produit(s) en rupture critique</strong>
        <div class="sab-chips">
          <span *ngFor="let a of criticals.slice(0, maxVisible)" class="sab-chip">
            {{ a.productDesignation }}
            <span class="sab-qty">{{ a.currentQuantity }} u.</span>
          </span>
          <span *ngIf="criticals.length > maxVisible" class="sab-chip sab-chip-more">
            +{{ criticals.length - maxVisible }} autre(s)
          </span>
        </div>
      </div>
      <a routerLink="/products" class="sab-link">Gérer le stock <i class="bi bi-arrow-right"></i></a>
    </div>

    <div *ngIf="criticals.length === 0 && warnings.length > 0" class="sab sab-warning" role="alert">
      <i class="bi bi-exclamation-circle-fill sab-icon"></i>
      <div class="sab-body">
        <strong>{{ warnings.length }} produit(s) à stock faible</strong>
        <div class="sab-chips">
          <span *ngFor="let a of warnings.slice(0, maxVisible)" class="sab-chip">
            {{ a.productDesignation }}
            <span class="sab-qty">{{ a.currentQuantity }} u.</span>
          </span>
          <span *ngIf="warnings.length > maxVisible" class="sab-chip sab-chip-more">
            +{{ warnings.length - maxVisible }} autre(s)
          </span>
        </div>
      </div>
      <a routerLink="/products" class="sab-link">Gérer le stock <i class="bi bi-arrow-right"></i></a>
    </div>
  `,
  styles: [`
    .sab {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      flex-wrap: wrap;
      padding: 0.875rem 1.125rem;
      border-radius: 10px;
      margin-bottom: 1.25rem;
      font-size: 0.8125rem;
      border: 1px solid transparent;
      animation: bannerIn 0.3s ease-out;
    }
    @keyframes bannerIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

    .sab-critical { background: #fff1f2; border-color: #fecdd3; color: #9f1239; }
    .sab-warning  { background: #fffbeb; border-color: #fde68a; color: #92400e; }

    .sab-icon { font-size: 1.125rem; flex-shrink: 0; margin-top: 1px; }

    .sab-body { flex: 1; min-width: 0; }
    .sab-body strong { font-weight: 600; display: block; margin-bottom: 0.375rem; }

    .sab-chips { display: flex; flex-wrap: wrap; gap: 0.375rem; }

    .sab-chip {
      display: inline-flex; align-items: center; gap: 4px;
      background: rgba(0,0,0,0.06);
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .sab-qty { font-weight: 700; }
    .sab-chip-more { background: rgba(0,0,0,0.10); }

    .sab-link {
      display: inline-flex; align-items: center; gap: 4px;
      font-weight: 600;
      color: inherit;
      text-decoration: none;
      white-space: nowrap;
      padding: 4px 12px;
      background: rgba(0,0,0,0.08);
      border-radius: 6px;
      transition: background 0.15s;
      align-self: center;
    }
    .sab-link:hover { background: rgba(0,0,0,0.14); }
    .sab-link i { font-size: 0.75rem; }
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
