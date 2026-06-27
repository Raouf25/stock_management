import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';

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
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
<div class="page">

  <!-- ══ EN-TÊTE ═══════════════════════════════════════════════════════════ -->
  <div class="page-header">
    <h1 class="page-title">Clients</h1>
    <a routerLink="/customers/create" class="btn-create">+ Nouveau Client</a>
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

    <!-- ── Filtres ─────────────────────────────────────────────────────────── -->
    <div class="filter-bar">
      <div class="filter-group fg-wide">
        <label class="filter-lbl">Recherche</label>
        <input type="text" class="filter-ctrl" [(ngModel)]="searchQuery"
               (input)="applyFilters()" placeholder="Nom, email, téléphone…">
      </div>
      <div class="filter-group">
        <label class="filter-lbl">Statut</label>
        <select class="filter-ctrl" [(ngModel)]="statusFilter" (change)="applyFilters()">
          <option value="">Tous</option>
          <option value="ACTIVE">Actif</option>
          <option value="INACTIVE">Inactif</option>
          <option value="BLOCKED">Bloqué</option>
          <option value="PROSPECT">Prospect</option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-lbl">Adresse</label>
        <input type="text" class="filter-ctrl" [(ngModel)]="addressFilter"
               (input)="applyFilters()" placeholder="Ville, région…">
      </div>
      <button *ngIf="searchQuery || statusFilter || addressFilter"
              class="btn-reset" (click)="resetFilters()">✕ Réinitialiser</button>
    </div>

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
            <td><span class="client-name">{{ item.customer.name }}</span></td>
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
              <span class="status-badge" [ngClass]="getStatusClass(item.customer.status)">
                {{ item.customer.status || 'ACTIVE' }}
              </span>
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
          <span class="status-badge" [ngClass]="getStatusClass(item.customer.status)">
            {{ item.customer.status || 'ACTIVE' }}
          </span>
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
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      box-sizing: border-box;
    }

    .page { padding: 1.5rem; background: #f8fafc; min-height: 100vh; }

    .page-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 1.5rem;
    }
    .page-title { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin: 0; }
    .btn-create {
      display: inline-flex; align-items: center; gap: .4rem;
      padding: .6rem 1.25rem;
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      color: #fff; border-radius: 10px; text-decoration: none;
      font-size: .875rem; font-weight: 600;
      transition: opacity .18s;
      box-shadow: 0 2px 8px rgba(79,70,229,.25);
    }
    .btn-create:hover { opacity: .88; }

    .kpi-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: .875rem; margin-bottom: 1.5rem;
    }
    .kpi-card {
      background: #fff; border-radius: 12px; border: 1px solid #e2e8f0;
      padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: .3rem;
      box-shadow: 0 1px 4px rgba(0,0,0,.04); border-top-width: 3px;
      transition: transform .15s, box-shadow .15s;
    }
    .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,.08); }
    .kpi-blue   { border-top-color: #3b82f6; }
    .kpi-green  { border-top-color: #10b981; }
    .kpi-orange { border-top-color: #f59e0b; }
    .kpi-red    { border-top-color: #ef4444; }
    .kpi-val { font-size: 1.25rem; font-weight: 700; color: #0f172a; line-height: 1.2; }
    .kpi-lbl {
      font-size: .7rem; font-weight: 600; color: #64748b;
      text-transform: uppercase; letter-spacing: .4px;
    }

    .main-card {
      background: #fff; border-radius: 12px; border: 1px solid #e2e8f0;
      box-shadow: 0 1px 4px rgba(0,0,0,.04); overflow: hidden;
    }

    .filter-bar {
      display: flex; align-items: flex-end; gap: .875rem;
      padding: 1rem 1.25rem;
      background: #f8fafc; border-bottom: 1px solid #f1f5f9;
      flex-wrap: wrap;
    }
    .filter-group { display: flex; flex-direction: column; gap: .35rem; flex: 1; min-width: 120px; }
    .filter-group.fg-wide { flex: 2; min-width: 180px; }
    .filter-lbl {
      font-size: .7rem; font-weight: 700; color: #64748b;
      text-transform: uppercase; letter-spacing: .5px;
    }
    .filter-ctrl {
      height: 38px; border: 1px solid #e2e8f0; border-radius: 8px;
      padding: 0 .75rem; font-size: .85rem;
      background: #fff; color: #0f172a; outline: none;
      transition: border-color .18s; width: 100%;
    }
    .filter-ctrl:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,.08); }
    .btn-reset {
      height: 38px; padding: 0 .875rem;
      border: 1px solid #e2e8f0; border-radius: 8px;
      background: #fff; color: #64748b; font-size: .8rem;
      font-weight: 500; cursor: pointer; white-space: nowrap;
      align-self: flex-end; transition: all .15s;
    }
    .btn-reset:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }

    .data-table { width: 100%; border-collapse: collapse; font-size: .875rem; }
    .data-table thead tr { background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); }
    .data-table th {
      color: #fff; font-weight: 500; padding: .8rem 1rem; text-align: left;
      font-size: .78rem; letter-spacing: .4px; white-space: nowrap;
    }
    .data-table td { padding: .8rem 1rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    .data-row { cursor: pointer; transition: background .12s; }
    .data-row:hover { background: #f5f7ff !important; }
    .data-row:last-child td { border-bottom: none; }

    .ta-r { text-align: right !important; }
    .ta-c { text-align: center !important; }
    .fw-600 { font-weight: 600; }
    .td-muted { color: #64748b; font-size: .875rem; }
    .c-green { color: #16a34a !important; }
    .c-red   { color: #dc2626 !important; }
    .client-name { font-weight: 600; color: #1f2937; }

    .status-badge {
      display: inline-block; padding: .2rem .65rem;
      border-radius: 9999px; font-size: .72rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: .4px;
    }
    .status-active   { background: #d1fae5; color: #065f46; }
    .status-inactive { background: #f1f5f9; color: #475569; }
    .status-blocked  { background: #fee2e2; color: #991b1b; }
    .status-prospect { background: #eff6ff; color: #1d4ed8; }

    .action-group { display: flex; gap: .35rem; justify-content: center; }
    .act-btn {
      width: 2rem; height: 2rem; border-radius: 6px;
      border: 1px solid transparent; cursor: pointer; font-size: .875rem;
      display: flex; align-items: center; justify-content: center;
      transition: opacity .15s;
    }
    .act-btn:hover { opacity: .75; }
    .act-view { background: #d1fae5; border-color: #a7f3d0; }
    .act-edit { background: #fef3c7; border-color: #fde68a; }
    .act-del  { background: #fee2e2; border-color: #fecaca; }

    .empty-state { padding: 3.5rem 1rem; text-align: center; color: #94a3b8; }
    .empty-icon  { font-size: 3.5rem; margin-bottom: .75rem; opacity: .6; }

    .mobile-row {
      padding: 1rem 1.25rem; border-bottom: 1px solid #f1f5f9;
      cursor: pointer; transition: background .12s;
    }
    .mobile-row:hover { background: #f8fafc; }
    .mobile-row:last-child { border-bottom: none; }
    .mobile-row-top {
      display: flex; justify-content: space-between;
      align-items: flex-start; margin-bottom: .4rem;
    }
    .mobile-grid-2 { display: grid; grid-template-columns: repeat(2,1fr); gap: .5rem; }
    .mg-cell {
      background: #f8fafc; padding: .5rem; border-radius: 8px;
      text-align: center; display: flex; flex-direction: column; gap: .1rem;
    }
    .mg-lbl { font-size: .7rem; color: #6b7280; }
    .mobile-actions {
      display: flex; gap: .5rem; justify-content: flex-end;
      border-top: 1px solid #f1f5f9; padding-top: .75rem;
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

  constructor(private apiService: ApiService, private router: Router, private toast: ToastService, private confirmDialog: ConfirmDialogService) {}

  ngOnInit(): void {
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
