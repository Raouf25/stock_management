import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skel-wrap">
      <!-- Header row skeleton -->
      <div class="skel-header">
        <div *ngFor="let c of colArr" class="skel-th skel-pulse"></div>
      </div>
      <!-- Data rows skeleton -->
      <div *ngFor="let r of rowArr" class="skel-row">
        <div *ngFor="let c of colArr" class="skel-td skel-pulse"></div>
      </div>
    </div>
  `,
  styles: [`
    .skel-wrap {
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid var(--color-border, #e2e8f0);
    }

    .skel-header {
      display: flex;
      gap: 1rem;
      padding: 0.75rem 1rem;
      background: var(--color-surface-2, #f1f5f9);
      border-bottom: 1px solid var(--color-border, #e2e8f0);
    }

    .skel-row {
      display: flex;
      gap: 1rem;
      padding: 0.875rem 1rem;
      border-bottom: 1px solid var(--color-border, #e2e8f0);
    }
    .skel-row:last-child { border-bottom: none; }

    .skel-th {
      flex: 1;
      height: 0.75rem;
      border-radius: 999px;
    }

    .skel-td {
      flex: 1;
      height: 0.875rem;
      border-radius: 999px;
    }
    .skel-td:first-child { flex: 0.4; }
    .skel-td:last-child  { flex: 0.6; }

    .skel-pulse {
      background: linear-gradient(
        90deg,
        var(--color-surface-2, #f1f5f9) 25%,
        var(--color-border, #e2e8f0)    50%,
        var(--color-surface-2, #f1f5f9) 75%
      );
      background-size: 200% 100%;
      animation: skelShimmer 1.5s infinite;
    }

    @keyframes skelShimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class SkeletonTableComponent {
  @Input() rows = 5;
  @Input() cols = 5;

  get rowArr(): number[] { return Array(this.rows).fill(0); }
  get colArr(): number[] { return Array(this.cols).fill(0); }
}

@Component({
  selector: 'app-skeleton-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skel-grid" [style.--cols]="cols">
      <div *ngFor="let i of cardArr" class="skel-card">
        <div class="skel-card-top skel-pulse"></div>
        <div class="skel-card-mid skel-pulse"></div>
        <div class="skel-card-bot skel-pulse"></div>
      </div>
    </div>
  `,
  styles: [`
    .skel-grid {
      display: grid;
      grid-template-columns: repeat(var(--cols, 4), 1fr);
      gap: 0.875rem;
    }

    .skel-card {
      background: var(--color-surface, #fff);
      border: 1px solid var(--color-border, #e2e8f0);
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
    }

    .skel-card-top {
      height: 2rem;
      width: 2rem;
      border-radius: 8px;
    }

    .skel-card-mid {
      height: 1.75rem;
      border-radius: 6px;
      width: 70%;
    }

    .skel-card-bot {
      height: 0.75rem;
      border-radius: 999px;
      width: 50%;
    }

    .skel-pulse {
      background: linear-gradient(
        90deg,
        var(--color-surface-2, #f1f5f9) 25%,
        var(--color-border, #e2e8f0)    50%,
        var(--color-surface-2, #f1f5f9) 75%
      );
      background-size: 200% 100%;
      animation: skelShimmer 1.5s infinite;
    }

    @keyframes skelShimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    @media (max-width: 768px) {
      .skel-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class SkeletonCardsComponent {
  @Input() count = 4;
  @Input() cols  = 4;
  get cardArr(): number[] { return Array(this.count).fill(0); }
}
