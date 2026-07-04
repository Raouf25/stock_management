import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService } from '../services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="svc.state() as s">
      <div class="cd-backdrop" (click)="svc.respond(false)" role="presentation">
        <div class="cd-box" role="dialog" [attr.aria-label]="s.title" (click)="$event.stopPropagation()">
          <div class="cd-icon" [class.cd-icon-danger]="s.danger">
            <i class="bi" [class.bi-exclamation-triangle-fill]="s.danger" [class.bi-question-circle-fill]="!s.danger"></i>
          </div>
          <h2 class="cd-title">{{ s.title }}</h2>
          <p class="cd-body">{{ s.message }}</p>
          <div class="cd-actions">
            <button class="cd-btn cd-btn-cancel" (click)="svc.respond(false)">
              {{ s.cancelText ?? 'Annuler' }}
            </button>
            <button class="cd-btn" [class.cd-btn-danger]="s.danger" [class.cd-btn-primary]="!s.danger"
                    (click)="svc.respond(true)" cdkFocusInitial>
              {{ s.confirmText ?? 'Confirmer' }}
            </button>
          </div>
        </div>
      </div>
    </ng-container>
  `,
  styles: [`
    .cd-backdrop {
      position: fixed; inset: 0;
      background: rgba(15,23,42,0.55);
      backdrop-filter: blur(3px);
      z-index: 8500;
      display: flex; align-items: center; justify-content: center;
      padding: 1rem;
    }

    .cd-box {
      background: var(--glass-bg-strong);
      backdrop-filter: blur(30px) saturate(180%);
      -webkit-backdrop-filter: blur(30px) saturate(180%);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-2xl);
      box-shadow: 0 24px 70px -24px rgba(49,46,129,0.45);
      width: 100%; max-width: 400px;
      padding: 1.75rem;
      text-align: center;
      animation: cdIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both;
    }

    @keyframes cdIn {
      from { opacity: 0; transform: scale(0.92) translateY(-8px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }

    .cd-icon {
      width: 3rem; height: 3rem;
      background: #dbeafe;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 1rem;
      font-size: 1.375rem;
      color: #1d4ed8;
    }
    .cd-icon.cd-icon-danger { background: #fee2e2; color: #dc2626; }

    .cd-title {
      font-size: 1.0625rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.5rem;
    }

    .cd-body {
      font-size: 0.875rem;
      color: #64748b;
      line-height: 1.6;
      margin: 0 0 1.5rem;
    }

    .cd-actions {
      display: flex;
      justify-content: center;
      gap: 0.625rem;
    }

    .cd-btn {
      padding: 0.5625rem 1.25rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: background 0.15s, box-shadow 0.15s;
      min-width: 90px;
    }

    .cd-btn-cancel {
      background: #f1f5f9;
      color: #475569;
      border-color: #e2e8f0;
    }
    .cd-btn-cancel:hover { background: #e2e8f0; }

    .cd-btn-primary {
      background: #6366f1;
      color: #fff;
      box-shadow: 0 1px 4px rgba(99,102,241,0.25);
    }
    .cd-btn-primary:hover { background: #4f46e5; box-shadow: 0 4px 12px rgba(99,102,241,0.35); }

    .cd-btn-danger {
      background: #ef4444;
      color: #fff;
    }
    .cd-btn-danger:hover { background: #dc2626; box-shadow: 0 4px 12px rgba(239,68,68,0.30); }
  `]
})
export class ConfirmDialogComponent {
  readonly svc = inject(ConfirmDialogService);
}
