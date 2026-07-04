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
    <div *ngIf="criticals.length > 0 || warnings.length > 0" class="sab" role="alert">
      <div class="sab-icon-box">
        <i class="bi bi-exclamation-triangle-fill"></i>
      </div>
      <div class="sab-text">
        <div class="sab-title">
          <ng-container *ngIf="criticals.length > 0">{{ criticals.length }} produit(s) en rupture critique</ng-container>
          <ng-container *ngIf="criticals.length > 0 && warnings.length > 0"> · </ng-container>
          <ng-container *ngIf="warnings.length > 0">{{ warnings.length }} en stock faible</ng-container>
        </div>
        <div class="sab-sub">Réapprovisionnement recommandé pour maintenir la disponibilité.</div>
      </div>
      <a routerLink="/products" class="sab-cta">Voir les produits</a>
    </div>
  `,
  styles: [`
    .sab {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      border-radius: 18px;
      margin-bottom: 22px;
      background: linear-gradient(135deg, rgba(254,242,242,0.85), rgba(255,247,237,0.8));
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(248,113,113,0.35);
      box-shadow: 0 10px 34px -16px rgba(239,68,68,0.4);
      animation: bannerIn 0.3s ease-out;
    }
    @keyframes bannerIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

    :host-context([data-theme="dark"]) .sab {
      background: linear-gradient(135deg, rgba(69,26,26,0.6), rgba(60,32,18,0.55));
      border-color: rgba(248,113,113,0.3);
    }

    .sab-icon-box {
      width: 42px; height: 42px; flex-shrink: 0;
      border-radius: 12px;
      background: rgba(239,68,68,0.14);
      display: flex; align-items: center; justify-content: center;
      color: #dc2626;
    }
    .sab-icon-box i { font-size: 19px; }

    .sab-text { flex: 1; }
    .sab-title { font-size: 14px; font-weight: 700; color: #991b1b; }
    .sab-sub   { font-size: 13px; color: #b45309; margin-top: 2px; }
    :host-context([data-theme="dark"]) .sab-title { color: #fca5a5; }
    :host-context([data-theme="dark"]) .sab-sub   { color: #fcd34d; }

    .sab-cta {
      padding: 9px 16px;
      border-radius: 11px;
      border: 1px solid rgba(239,68,68,0.3);
      background: rgba(255,255,255,0.6);
      color: #b91c1c;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      white-space: nowrap;
      transition: background .15s;
      flex-shrink: 0;
    }
    .sab-cta:hover { background: #fff; }
    :host-context([data-theme="dark"]) .sab-cta { background: rgba(255,255,255,0.08); color: #fca5a5; }
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
