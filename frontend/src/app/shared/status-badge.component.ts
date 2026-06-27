import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatusType =
  | 'PAID' | 'UNPAID' | 'PARTIALLY_PAID' | 'PENDING'
  | 'DELIVERED' | 'CANCELLED' | 'INVOICED'
  | 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PROSPECT'
  | string;

interface BadgeConfig {
  label:  string;
  css:    string;
  icon:   string;
}

const CONFIGS: Record<string, BadgeConfig> = {
  // Payment statuses
  PAID:             { label: 'Payé',      css: 'sb-success', icon: 'bi-check-circle-fill'  },
  UNPAID:           { label: 'Impayé',    css: 'sb-danger',  icon: 'bi-x-circle-fill'      },
  PARTIALLY_PAID:   { label: 'Partiel',   css: 'sb-warning', icon: 'bi-dash-circle-fill'   },

  // Delivery statuses
  PENDING:          { label: 'En attente', css: 'sb-info',    icon: 'bi-clock-fill'         },
  DELIVERED:        { label: 'Livré',      css: 'sb-success', icon: 'bi-truck'              },
  INVOICED:         { label: 'Facturé',    css: 'sb-primary', icon: 'bi-receipt'            },
  CANCELLED:        { label: 'Annulé',     css: 'sb-danger',  icon: 'bi-x-circle-fill'      },

  // Customer statuses
  ACTIVE:           { label: 'Actif',      css: 'sb-success', icon: 'bi-check-circle-fill'  },
  INACTIVE:         { label: 'Inactif',    css: 'sb-neutral', icon: 'bi-dash-circle-fill'   },
  BLOCKED:          { label: 'Bloqué',     css: 'sb-danger',  icon: 'bi-slash-circle-fill'  },
  PROSPECT:         { label: 'Prospect',   css: 'sb-info',    icon: 'bi-star-fill'          },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="sb {{ config.css }}" [title]="value">
      <i *ngIf="showIcon" class="bi {{ config.icon }}"></i>
      {{ config.label }}
    </span>
  `,
  styles: [`
    .sb {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 0.6875rem;
      font-weight: 600;
      line-height: 1.4;
      white-space: nowrap;
    }
    .sb i { font-size: 0.75rem; flex-shrink: 0; }

    .sb-success { background: var(--color-success-bg, #d1fae5); color: var(--color-success-text, #065f46); }
    .sb-danger  { background: var(--color-danger-bg,  #fee2e2); color: var(--color-danger-text,  #991b1b); }
    .sb-warning { background: var(--color-warning-bg, #fef3c7); color: var(--color-warning-text, #92400e); }
    .sb-info    { background: var(--color-info-bg,    #dbeafe); color: var(--color-info-text,    #1e40af); }
    .sb-primary { background: var(--color-primary-light, #eef2ff); color: var(--color-primary-hover, #4f46e5); }
    .sb-neutral { background: var(--color-surface-2, #f1f5f9);  color: var(--color-text-muted,  #64748b); }
  `]
})
export class StatusBadgeComponent {
  @Input() set value(v: StatusType) {
    this._value = v;
    this.config = CONFIGS[v] ?? { label: v, css: 'sb-neutral', icon: 'bi-circle' };
  }
  get value(): StatusType { return this._value; }

  @Input() showIcon = true;

  private _value: StatusType = '';
  config: BadgeConfig = { label: '', css: 'sb-neutral', icon: 'bi-circle' };
}
