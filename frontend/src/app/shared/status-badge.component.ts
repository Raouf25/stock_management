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
  // Payment statuses (féminin : une facture)
  PAID:             { label: 'Payée',      css: 'sb-success', icon: 'bi-check-circle-fill'  },
  UNPAID:           { label: 'Impayée',    css: 'sb-danger',  icon: 'bi-x-circle-fill'      },
  PARTIALLY_PAID:   { label: 'Partiel',    css: 'sb-warning', icon: 'bi-dash-circle-fill'   },

  // Delivery statuses
  PENDING:          { label: 'En attente', css: 'sb-warning', icon: 'bi-clock-fill'         },
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
    /* Pilule plate de la maquette : fond translucide, 12px/700, sans icône */
    .sb {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      line-height: 1.4;
      white-space: nowrap;
    }
    .sb i { font-size: 0.75rem; flex-shrink: 0; }

    .sb-success { background: rgba(16,185,129,0.14);  color: #047857; }
    .sb-danger  { background: rgba(239,68,68,0.14);   color: #b91c1c; }
    .sb-warning { background: rgba(245,158,11,0.16);  color: #b45309; }
    .sb-info    { background: rgba(99,102,241,0.14);  color: #4f46e5; }
    .sb-primary { background: rgba(99,102,241,0.14);  color: #4f46e5; }
    .sb-neutral { background: rgba(148,163,184,0.2);  color: #475569; }

    :host-context([data-theme="dark"]) .sb-success { color: #34d399; }
    :host-context([data-theme="dark"]) .sb-danger  { color: #f87171; }
    :host-context([data-theme="dark"]) .sb-warning { color: #fbbf24; }
    :host-context([data-theme="dark"]) .sb-info,
    :host-context([data-theme="dark"]) .sb-primary { color: #a5b4fc; }
    :host-context([data-theme="dark"]) .sb-neutral { color: #94a3b8; }
  `]
})
export class StatusBadgeComponent {
  @Input() set value(v: StatusType) {
    this._value = v;
    this.config = CONFIGS[v] ?? { label: v, css: 'sb-neutral', icon: 'bi-circle' };
  }
  get value(): StatusType { return this._value; }

  @Input() showIcon = false;

  private _value: StatusType = '';
  config: BadgeConfig = { label: '', css: 'sb-neutral', icon: 'bi-circle' };
}
