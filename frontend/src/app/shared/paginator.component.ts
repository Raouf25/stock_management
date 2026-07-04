import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="totalPages > 1" class="pag-wrap">

      <!-- Count info -->
      <span class="pag-info">
        {{ firstItem }}–{{ lastItem }} sur {{ totalItems }}
      </span>

      <div class="pag-controls">
        <!-- First -->
        <button class="pag-btn" [disabled]="page === 0" (click)="go(0)" title="Première page">
          <i class="bi bi-chevron-double-left"></i>
        </button>

        <!-- Prev -->
        <button class="pag-btn" [disabled]="page === 0" (click)="go(page - 1)" title="Précédent">
          <i class="bi bi-chevron-left"></i>
        </button>

        <!-- Page numbers -->
        <ng-container *ngFor="let p of pages">
          <span *ngIf="p === -1" class="pag-ellipsis">…</span>
          <button *ngIf="p !== -1" class="pag-btn pag-num"
                  [class.pag-active]="p === page"
                  (click)="go(p)">
            {{ p + 1 }}
          </button>
        </ng-container>

        <!-- Next -->
        <button class="pag-btn" [disabled]="page === totalPages - 1" (click)="go(page + 1)" title="Suivant">
          <i class="bi bi-chevron-right"></i>
        </button>

        <!-- Last -->
        <button class="pag-btn" [disabled]="page === totalPages - 1" (click)="go(totalPages - 1)" title="Dernière page">
          <i class="bi bi-chevron-double-right"></i>
        </button>
      </div>

      <!-- Page size selector -->
      <select class="pag-size" [value]="pageSize" (change)="onSizeChange($event)">
        <option *ngFor="let s of pageSizeOptions" [value]="s">{{ s }} / page</option>
      </select>
    </div>
  `,
  styles: [`
    .pag-wrap {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border-top: 1px solid var(--glass-border);
      background: rgba(255,255,255,0.3);
    }
    :host-context([data-theme="dark"]) .pag-wrap { background: rgba(255,255,255,0.03); }

    .pag-info {
      font-size: 0.8125rem;
      color: var(--color-text-muted, #64748b);
      white-space: nowrap;
    }

    .pag-controls {
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .pag-btn {
      width: 2rem; height: 2rem;
      display: inline-flex; align-items: center; justify-content: center;
      border: 1px solid rgba(15,23,42,0.1);
      background: rgba(255,255,255,0.6);
      border-radius: 6px;
      font-size: 0.75rem;
      color: var(--color-text-2, #334155);
      cursor: pointer;
      transition: background 0.12s, border-color 0.12s;
    }

    .pag-btn:hover:not(:disabled) {
      background: var(--color-surface-2, #f1f5f9);
      border-color: var(--color-border-strong, #cbd5e1);
    }

    .pag-btn:disabled { opacity: 0.38; cursor: default; }

    .pag-btn.pag-active {
      background: var(--color-primary, #6366f1);
      border-color: var(--color-primary, #6366f1);
      color: #fff;
      font-weight: 600;
    }

    .pag-num { min-width: 2rem; font-size: 0.8125rem; }

    .pag-ellipsis {
      width: 2rem; height: 2rem;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 0.875rem;
      color: var(--color-text-muted, #64748b);
    }

    .pag-size {
      padding: 0.25rem 0.5rem;
      font-size: 0.8125rem;
      border: 1px solid rgba(15,23,42,0.1);
      border-radius: 6px;
      background: rgba(255,255,255,0.6);
      color: var(--color-text-2, #334155);
      cursor: pointer;
    }
    .pag-size:focus { outline: none; border-color: var(--color-primary, #6366f1); }
  `]
})
export class PaginatorComponent implements OnChanges {
  @Input() page      = 0;
  @Input() pageSize  = 20;
  @Input() totalItems = 0;
  @Input() pageSizeOptions = [10, 20, 50, 100];

  @Output() pageChange     = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  totalPages = 0;
  pages: number[] = [];
  firstItem = 0;
  lastItem  = 0;

  ngOnChanges(_changes: SimpleChanges): void {
    this.totalPages = Math.ceil(this.totalItems / this.pageSize) || 1;
    this.firstItem  = this.totalItems === 0 ? 0 : this.page * this.pageSize + 1;
    this.lastItem   = Math.min((this.page + 1) * this.pageSize, this.totalItems);
    this.pages      = this.buildPages();
  }

  go(p: number): void {
    if (p < 0 || p >= this.totalPages) return;
    this.pageChange.emit(p);
  }

  onSizeChange(e: Event): void {
    const size = Number((e.target as HTMLSelectElement).value);
    this.pageSizeChange.emit(size);
  }

  private buildPages(): number[] {
    const total  = this.totalPages;
    const cur    = this.page;
    const result: number[] = [];

    if (total <= 7) {
      for (let i = 0; i < total; i++) result.push(i);
      return result;
    }

    result.push(0);
    if (cur > 2) result.push(-1);

    const from = Math.max(1, cur - 1);
    const to   = Math.min(total - 2, cur + 1);
    for (let i = from; i <= to; i++) result.push(i);

    if (cur < total - 3) result.push(-1);
    result.push(total - 1);

    return result;
  }
}
