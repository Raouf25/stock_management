import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { UrlFiltersService } from '../../shared/url-filters.service';

interface CustomerWithStats {
  customer: {
    customerId: number;
    name: string;
    fullName: string;
    phone: string;
    email: string;
    address: string;
    status: string;
  };
  totalCA: number;
  unpaidAmount: number;
}

interface CustomerKPIs {
  totalCustomers: number;
  activeCustomers: number;
  blockedCustomers: number;
  newCustomersThisMonth: number;
  totalRevenue: number;
  averageRevenuePerCustomer: number;
  totalOutstanding: number;
}

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, StatusBadgeComponent],
  template: `
<div class="page">

  <!-- ══ BARRE DE FILTRES (maquette) ════════════════════════════════════════ -->
  <div class="toolbar-glass">
    <div class="toolbar-search">
      <i class="bi bi-search"></i>
      <input type="text" [(ngModel)]="searchQuery" (input)="applyFilters()"
             placeholder="Rechercher un client…">
    </div>
    <select class="toolbar-select" [(ngModel)]="statusFilter" (change)="applyFilters()">
      <option value="">Tous les statuts</option>
      <option value="ACTIVE">Actif</option>
      <option value="INACTIVE">Inactif</option>
      <option value="BLOCKED">Bloqué</option>
      <option value="PROSPECT">Prospect</option>
    </select>
    <input type="text" class="toolbar-select" [(ngModel)]="addressFilter"
           (input)="applyFilters()" placeholder="Ville, région…" style="max-width:160px;">
    <a routerLink="/customers/create" class="btn-accent">
      <i class="bi bi-person-plus"></i> Nouveau client
    </a>
  </div>

  <!-- ══ KPIs ══════════════════════════════════════════════════════════════ -->
  <div class="kpi-row">
    <div class="kpi-card kpi-blue">
      <span class="kpi-val">{{ kpis.totalCustomers }}</span>
      <span class="kpi-lbl">Total Clients</span>
    </div>
    <div class="kpi-card kpi-green">
      <span class="kpi-val">{{ kpis.activeCustomers }}</span>
      <span class="kpi-lbl">Clients Actifs</span>
    </div>
    <div class="kpi-card kpi-orange">
      <span class="kpi-val">{{ kpis.newCustomersThisMonth }}</span>
      <span class="kpi-lbl">Nouveaux ce Mois</span>
    </div>
    <div class="kpi-card kpi-red">
      <span class="kpi-val">{{ kpis.totalOutstanding | number:'1.0-0' }}</span>
      <span class="kpi-lbl">Impayés (DNT)</span>
    </div>
  </div>

  <!-- ══ CARTE PRINCIPALE ═══════════════════════════════════════════════════ -->
  <div class="main-card">

    <!-- ════════ TABLE (desktop) ════════ -->
    <div class="desktop-table">
      <table class="data-table">
        <thead>
          <tr>
            <th>CLIENT</th>
            <th>CONTACT</th>
            <th>COORDONNÉES</th>
            <th>ADRESSE</th>
            <th class="ta-r">CA TOTAL (DNT)</th>
            <th class="ta-r">IMPAYÉS (DNT)</th>
            <th class="ta-c">STATUT</th>
            <th class="ta-c">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of filteredCustomers; trackBy: trackById"
              class="data-row"
              (click)="viewCustomer(item.customer.customerId)">
            <td>
              <div class="client-cell">
                <div class="client-avatar" [style.background]="avatarGradient(item.customer.name)">
                  {{ getInitials(item.customer.name) }}
                </div>
                <span class="client-name">{{ item.customer.name }}</span>
              </div>
            </td>
            <td class="td-muted">{{ item.customer.fullName || '—' }}</td>
            <td>
              <div class="td-muted">📧 {{ item.customer.email || '—' }}</div>
              <div class="td-muted" style="font-size:.8rem;">📞 {{ item.customer.phone || '—' }}</div>
            </td>
            <td class="td-muted">{{ item.customer.address || '—' }}</td>
            <td class="ta-r fw-600 c-green">{{ item.totalCA | number:'1.0-0' }}</td>
            <td class="ta-r">
              <span [class.c-red]="item.unpaidAmount > 0"
                    [class.fw-600]="item.unpaidAmount > 0"
                    [class.td-muted]="item.unpaidAmount === 0">
                {{ item.unpaidAmount | number:'1.0-0' }}
              </span>
            </td>
            <td class="ta-c" (click)="$event.stopPropagation()">
              <app-status-badge [value]="item.customer.status || 'ACTIVE'"></app-status-badge>
            </td>
            <td class="ta-c" (click)="$event.stopPropagation()">
              <div class="action-group">
                <button (click)="viewCustomer(item.customer.customerId)"
                        class="act-btn act-view" title="Voir">👁️</button>
                <button (click)="editCustomer(item.customer.customerId)"
                        class="act-btn act-edit" title="Modifier">✏️</button>
                <button (click)="deleteCustomer(item.customer.customerId)"
                        class="act-btn act-del" title="Supprimer">🗑️</button>
              </div>
            </td>
          </tr>
          <tr *ngIf="filteredCustomers.length === 0">
            <td colspan="8" class="empty-state">
              <div class="empty-icon">📭</div>
              <p>Aucun client trouvé</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ════════ CARTES (mobile) ════════ -->
    <div class="mobile-cards">
      <div *ngFor="let item of filteredCustomers; trackBy: trackById"
           class="mobile-row"
           (click)="viewCustomer(item.customer.customerId)">
        <div class="mobile-row-top">
          <span class="client-name">{{ item.customer.name }}</span>
          <app-status-badge [value]="item.customer.status || 'ACTIVE'" [showIcon]="false"></app-status-badge>
        </div>
        <div *ngIf="item.customer.fullName" class="td-muted" style="margin:.15rem 0 .3rem;">
          {{ item.customer.fullName }}
        </div>
        <div class="td-muted" style="font-size:.8rem;margin-bottom:.75rem;">
          📧 {{ item.customer.email || '—' }}&nbsp; 📞 {{ item.customer.phone || '—' }}
        </div>
        <div class="mobile-grid-2" style="margin-bottom:.75rem;">
          <div class="mg-cell">
            <span class="mg-lbl">CA Total</span>
            <strong class="c-green" style="font-size:.8rem;">{{ item.totalCA | number:'1.0-0' }} DNT</strong>
          </div>
          <div class="mg-cell">
            <span class="mg-lbl">Impayés</span>
            <strong [class.c-red]="item.unpaidAmount > 0" style="font-size:.8rem;">
              {{ item.unpaidAmount | number:'1.0-0' }} DNT
            </strong>
          </div>
        </div>
        <div class="mobile-actions" (click)="$event.stopPropagation()">
          <button (click)="viewCustomer(item.customer.customerId)"
                  class="act-btn act-view" title="Voir">👁️</button>
          <button (click)="editCustomer(item.customer.customerId)"
                  class="act-btn act-edit" title="Modifier">✏️</button>
          <button (click)="deleteCustomer(item.customer.customerId)"
                  class="act-btn act-del" title="Supprimer">🗑️</button>
        </div>
      </div>
      <div *ngIf="filteredCustomers.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p>Aucun client trouvé</p>
      </div>
    </div>

  </div><!-- /main-card -->


</div><!-- /page -->
  `,
  styles: [`
    *, *::before, *::after {
      font-family: var(--font-sans);
      box-sizing: border-box;
    }

    .page { padding: 1.5rem; background: transparent; min-height: 100vh; }

    /* ─── BARRE DE FILTRES (maquette) ─────────────────── */
    .toolbar-glass {
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
      padding: 14px 16px; margin-bottom: 18px;
      border-radius: 18px;
      background: var(--glass-bg-soft);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid var(--glass-border);
      box-shadow: var(--glass-shadow-sm);
    }
    .toolbar-search { position: relative; flex: 1; min-width: 220px; }
    .toolbar-search i {
      position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
      color: var(--color-text-faint); font-size: 14px;
    }
    .toolbar-search input {
      width: 100%; padding: 10px 14px 10px 38px;
      border-radius: 11px; border: 1px solid rgba(15,23,42,0.1);
      background: rgba(255,255,255,0.7); font-size: 14px;
      color: var(--color-text); outline: none; font-family: inherit;
      transition: border-color .18s, box-shadow .18s;
    }
    .toolbar-search input:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-soft);
    }
    .toolbar-select {
      padding: 10px 14px; border-radius: 11px;
      border: 1px solid rgba(15,23,42,0.1);
      background: rgba(255,255,255,0.7); font-size: 13px;
      color: var(--color-text); outline: none; font-family: inherit;
      cursor: pointer;
    }
    .toolbar-select:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-soft);
    }
    .btn-accent {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 16px; border-radius: 11px; border: none;
      background: var(--color-primary); color: #fff;
      font-size: 14px; font-weight: 600; cursor: pointer;
      box-shadow: 0 8px 20px -6px var(--color-primary-glow);
      font-family: inherit; transition: background .18s;
      white-space: nowrap; text-decoration: none;
    }
    .btn-accent:hover { background: var(--color-primary-hover); }

    /* ─── Avatar client (maquette) ────────────────────── */
    .client-cell { display: flex; align-items: center; gap: 11px; }
    .client-avatar {
      width: 34px; height: 34px; flex-shrink: 0; border-radius: 10px;
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 13px;
    }

    .kpi-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: .875rem; margin-bottom: 1.5rem;
    }
    .kpi-card {
      background: var(--glass-bg); border-radius: var(--radius-lg); border: 1px solid var(--glass-border);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: .3rem;
      box-shadow: var(--glass-shadow-sm);
      transition: transform .15s, box-shadow .15s;
    }
    .kpi-card:hover { transform: translateY(-2px); box-shadow: var(--glass-shadow-lg); }
    .kpi-val { font-size: 1.25rem; font-weight: 700; color: var(--color-text); line-height: 1.2; }
    .kpi-lbl {
      font-size: .7rem; font-weight: 600; color: var(--color-text-muted);
      text-transform: uppercase; letter-spacing: .4px;
    }

    .main-card {
      background: var(--glass-bg); border-radius: var(--radius-xl); border: 1px solid var(--glass-border);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      box-shadow: var(--glass-shadow); overflow: hidden;
    }

    .filter-bar {
      display: flex; align-items: flex-end; gap: .875rem;
      padding: 1rem 1.25rem;
      background: rgba(255,255,255,0.3); border-bottom: 1px solid var(--glass-border);
      flex-wrap: wrap;
    }
    :host-context([data-theme="dark"]) .filter-bar { background: rgba(255,255,255,0.03); }
    .filter-group { display: flex; flex-direction: column; gap: .35rem; flex: 1; min-width: 120px; }
    .filter-group.fg-wide { flex: 2; min-width: 180px; }
    .filter-lbl {
      font-size: .7rem; font-weight: 700; color: var(--color-text-muted);
      text-transform: uppercase; letter-spacing: .5px;
    }
    .filter-ctrl {
      height: 38px; border: 1px solid rgba(15,23,42,0.1); border-radius: 8px;
      padding: 0 .75rem; font-size: .85rem;
      background: rgba(255,255,255,0.7); color: var(--color-text); outline: none;
      transition: border-color .18s; width: 100%;
    }
    .filter-ctrl:focus { border-color: var(--color-primary-hover); box-shadow: 0 0 0 3px rgba(79,70,229,.08); }
    .btn-reset {
      height: 38px; padding: 0 .875rem;
      border: 1px solid rgba(15,23,42,0.1); border-radius: 8px;
      background: rgba(255,255,255,0.6); color: var(--color-text-muted); font-size: .8rem;
      font-weight: 500; cursor: pointer; white-space: nowrap;
      align-self: flex-end; transition: all .15s;
    }
    .btn-reset:hover { border-color: var(--color-danger); color: var(--color-danger); background: var(--color-danger-bg); }

    .data-table { width: 100%; border-collapse: collapse; font-size: .875rem; }
    .data-table thead tr { background: rgba(255,255,255,0.3); border-bottom: 2px solid var(--glass-border); }
    :host-context([data-theme="dark"]) .data-table thead tr { background: rgba(255,255,255,0.03); }
    .data-table th {
      color: var(--color-text-muted); font-weight: 700; padding: .8rem 1rem; text-align: left;
      font-size: .72rem; letter-spacing: .5px; white-space: nowrap; text-transform: uppercase;
    }
    .data-table td { padding: .8rem 1rem; border-bottom: 1px solid var(--color-surface-2); vertical-align: middle; }
    .data-row { cursor: pointer; transition: background .12s; }
    .data-row:hover { background: var(--color-primary-soft) !important; }
    .data-row:last-child td { border-bottom: none; }

    .ta-r { text-align: right !important; }
    .ta-c { text-align: center !important; }
    .fw-600 { font-weight: 600; }
    .td-muted { color: var(--color-text-muted); font-size: .875rem; }
    .c-green { color: var(--color-success) !important; }
    .c-red   { color: var(--color-danger) !important; }
    .client-name { font-weight: 600; color: var(--color-text); }

    .status-badge {
      display: inline-block; padding: .2rem .65rem;
      border-radius: 9999px; font-size: .72rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: .4px;
    }
    .status-active   { background: var(--color-success-bg); color: var(--color-success-text); }
    .status-inactive { background: var(--color-surface-2); color: var(--color-text-muted); }
    .status-blocked  { background: var(--color-danger-bg); color: var(--color-danger-text); }
    .status-prospect { background: var(--color-info-bg); color: var(--color-info-text); }

    .action-group { display: flex; gap: .35rem; justify-content: center; }
    .act-btn {
      width: 2rem; height: 2rem; border-radius: 6px;
      border: 1px solid transparent; cursor: pointer; font-size: .875rem;
      display: flex; align-items: center; justify-content: center;
      transition: opacity .15s;
    }
    .act-btn:hover { opacity: .75; }
    .act-view { background: var(--color-success-bg); border-color: var(--color-success); }
    .act-edit { background: var(--color-warning-bg); border-color: var(--color-warning); }
    .act-del  { background: var(--color-danger-bg); border-color: #fecaca; }

    .empty-state { padding: 3.5rem 1rem; text-align: center; color: var(--color-text-faint); }
    .empty-icon  { font-size: 3.5rem; margin-bottom: .75rem; opacity: .6; }

    .mobile-row {
      padding: 1rem 1.25rem; border-bottom: 1px solid var(--color-surface-2);
      cursor: pointer; transition: background .12s;
    }
    .mobile-row:hover { background: rgba(255,255,255,0.35); }
    .mobile-row:last-child { border-bottom: none; }
    .mobile-row-top {
      display: flex; justify-content: space-between;
      align-items: flex-start; margin-bottom: .4rem;
    }
    .mobile-grid-2 { display: grid; grid-template-columns: repeat(2,1fr); gap: .5rem; }
    .mg-cell {
      background: rgba(15,23,42,0.04); padding: .5rem; border-radius: 8px;
      text-align: center; display: flex; flex-direction: column; gap: .1rem;
    }
    .mg-lbl { font-size: .7rem; color: var(--color-text-muted); }
    .mobile-actions {
      display: flex; gap: .5rem; justify-content: flex-end;
      border-top: 1px solid var(--color-surface-2); padding-top: .75rem;
    }

    .desktop-table { display: none; overflow-x: auto; }
    .mobile-cards  { display: block; }

    @media (min-width: 1024px) {
      .desktop-table { display: block; }
      .mobile-cards  { display: none; }
    }
    @media (max-width: 768px) {
      .page { padding: 1rem; }
      .filter-bar { gap: .625rem; }
    }
  `]
})
export class CustomerListComponent implements OnInit {
  customers: CustomerWithStats[] = [];
  filteredCustomers: CustomerWithStats[] = [];
  searchQuery   = '';
  statusFilter  = '';
  addressFilter = '';

  kpis: CustomerKPIs = {
    totalCustomers: 0,
    activeCustomers: 0,
    blockedCustomers: 0,
    newCustomersThisMonth: 0,
    totalRevenue: 0,
    averageRevenuePerCustomer: 0,
    totalOutstanding: 0
  };

  constructor(
    private apiService:    ApiService,
    private router:        Router,
    private route:         ActivatedRoute,
    private toast:         ToastService,
    private confirmDialog: ConfirmDialogService,
    private urlFilters:    UrlFiltersService
  ) {}

  ngOnInit(): void {
    const p = this.urlFilters.read(this.route);
    if (p['q'])      this.searchQuery   = p['q'];
    if (p['status']) this.statusFilter  = p['status'];
    if (p['addr'])   this.addressFilter = p['addr'];
    this.loadCustomers();
    this.loadKPIs();
  }

  loadCustomers(): void {
    this.apiService.searchCustomers().subscribe({
      next: (data) => { this.customers = data; this.applyFilters(); },
      error: () => this.showError('Erreur lors du chargement des clients.')
    });
  }

  applyFilters(): void {
    this.filteredCustomers = this.customers.filter(item => {
      const c = item.customer;
      if (this.searchQuery && !c.name?.toLowerCase().includes(this.searchQuery.toLowerCase())) return false;
      if (this.statusFilter && c.status !== this.statusFilter) return false;
      if (this.addressFilter && !c.address?.toLowerCase().includes(this.addressFilter.toLowerCase())) return false;
      return true;
    });
    this.urlFilters.write(this.router, this.route, {
      q:      this.searchQuery   || null,
      status: this.statusFilter  || null,
      addr:   this.addressFilter || null
    });
  }

  resetFilters(): void {
    this.searchQuery   = '';
    this.statusFilter  = '';
    this.addressFilter = '';
    this.applyFilters();
  }

  loadKPIs(): void {
    this.apiService.getCustomerKPIs().subscribe({
      next: (data) => { this.kpis = data; },
      error: () => {}
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      ACTIVE:   'status-active',
      INACTIVE: 'status-inactive',
      BLOCKED:  'status-blocked',
      PROSPECT: 'status-prospect'
    };
    return map[status] ?? 'status-active';
  }

  trackById(_: number, item: CustomerWithStats): number {
    return item.customer.customerId;
  }

  private static readonly AVATAR_GRADIENTS = [
    'linear-gradient(135deg, #6366f1, #4f46e5)',
    'linear-gradient(135deg, #f472b6, #a855f7)',
    'linear-gradient(135deg, #38bdf8, #6366f1)',
    'linear-gradient(135deg, #34d399, #059669)',
    'linear-gradient(135deg, #fbbf24, #f97316)'
  ];

  getInitials(name: string): string {
    return (name || '?')
      .split(/\s+/)
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  avatarGradient(name: string): string {
    let hash = 0;
    for (const c of name || '') hash = (hash * 31 + c.charCodeAt(0)) | 0;
    const gradients = CustomerListComponent.AVATAR_GRADIENTS;
    return gradients[Math.abs(hash) % gradients.length];
  }

  viewCustomer(id: number): void { this.router.navigate(['/customers/edit', id]); }
  editCustomer(id: number): void { this.router.navigate(['/customers/edit', id]); }

  deleteCustomer(id: number): void {
    this.confirmDialog.confirm({
      title: 'Supprimer le client',
      message: 'Voulez-vous vraiment supprimer ce client ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      danger: true
    }).then(ok => {
      if (!ok) return;
      this.apiService.deleteCustomer(id).subscribe({
        next: () => { this.showSuccess('Client supprimé.'); this.loadCustomers(); this.loadKPIs(); },
        error: () => this.showError('Erreur lors de la suppression.')
      });
    });
  }

  private showError(msg: string):   void { this.toast.error(msg); }
  private showSuccess(msg: string): void { this.toast.success(msg); }
}
