import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../services/toast.service';

@Component({
  selector: 'app-toast-outlet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-outlet" aria-live="polite" aria-atomic="false">
      <div
        *ngFor="let t of toastSvc.toasts(); trackBy: trackById"
        class="toast-item toast-{{ t.type }}"
        role="alert">
        <i class="bi {{ iconFor(t.type) }} toast-icon"></i>
        <span class="toast-msg">{{ t.message }}</span>
        <button class="toast-close" (click)="toastSvc.dismiss(t.id)" aria-label="Fermer">
          <i class="bi bi-x"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-outlet {
      position: fixed;
      top: 1.25rem;
      right: 1.25rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      pointer-events: none;
      max-width: 380px;
      width: 100%;
    }

    .toast-item {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 500;
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      pointer-events: all;
      animation: toastIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both;
      border: 1px solid transparent;
    }

    @keyframes toastIn {
      from { opacity: 0; transform: translateX(1.5rem) scale(0.97); }
      to   { opacity: 1; transform: translateX(0) scale(1); }
    }

    .toast-success {
      background: #f0fdf4;
      color: #166534;
      border-color: #bbf7d0;
    }
    .toast-error {
      background: #fff1f2;
      color: #9f1239;
      border-color: #fecdd3;
    }
    .toast-warning {
      background: #fffbeb;
      color: #92400e;
      border-color: #fde68a;
    }
    .toast-info {
      background: #eff6ff;
      color: #1e40af;
      border-color: #bfdbfe;
    }

    .toast-icon { font-size: 1rem; flex-shrink: 0; }
    .toast-msg  { flex: 1; line-height: 1.4; }

    .toast-close {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 2px 4px;
      border-radius: 4px;
      color: inherit;
      opacity: 0.55;
      line-height: 1;
      font-size: 1rem;
      transition: opacity 0.15s;
      flex-shrink: 0;
    }
    .toast-close:hover { opacity: 1; }
  `]
})
export class ToastOutletComponent {
  readonly toastSvc = inject(ToastService);

  trackById(_: number, t: Toast): number { return t.id; }

  iconFor(type: string): string {
    const icons: Record<string, string> = {
      success: 'bi-check-circle-fill',
      error:   'bi-exclamation-circle-fill',
      warning: 'bi-exclamation-triangle-fill',
      info:    'bi-info-circle-fill',
    };
    return icons[type] ?? 'bi-info-circle-fill';
  }
}
