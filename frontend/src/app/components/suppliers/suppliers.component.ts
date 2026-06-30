import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { SkeletonTableComponent } from '../../shared/skeleton.component';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SkeletonTableComponent],
  template: `
<div class="page">

  <!-- ══ EN-TÊTE ══════════════════════════════════════════════════════════ -->
  <div class="page-header">
    <h1 class="page-title">Fournisseurs</h1>
    <a routerLink="/suppliers/create" class="btn-create">+ Nouveau Fournisseur</a>
  </div>

  <!-- ══ KPIs ═════════════════════════════════════════════════════════════ -->
  <div class="kpi-row" *ngIf="kpis">
    <div class="kpi-card kpi-blue">
      <span class="kpi-val">{{ kpis.totalSuppliers }}</span>
      <span class="kpi-lbl">Total Fournisseurs</span>
    </div>
    <div class="kpi-card kpi-green">
      <span class="kpi-val">{{ kpis.totalPurchases }}</span>
      <span class="kpi-lbl">Total Achats</span>
    </div>
    <div class="kpi-card kpi-indigo">
      <span class="kpi-val">{{ kpis.totalPurchaseAmount | number:'1.3-3' }}</span>
      <span class="kpi-lbl">Montant Total (DNT)</span>
    </div>
    <div class="kpi-card kpi-orange">
      <span class="kpi-val">{{ kpis.suppliersWithRecentPurchases }}</span>
      <span class="kpi-lbl">Actifs (3 mois)</span>
    </div>
  </div>

  <!-- ══ CARTE PRINCIPALE ══════════════════════════════════════════════════ -->
  <div class="main-card">

    <!-- ── Filtre ─────────────────────────────────────────────────────────── -->
    <div class="filter-bar">
      <div class="filter-group fg-wide">
        <label class="filter-lbl">Recherche</label>
        <input type="text" class="filter-ctrl" [ngModel]="searchText" (ngModelChange)="onSearchInput($event)"
               placeholder="Nom, email, téléphone, contact…">
      </div>
      <button *ngIf="searchText" class="btn-reset" (click)="searchText=''">✕ Réinitialiser</button>
    </div>

    <!-- Skeleton loading -->
    <app-skeleton-table *ngIf="loading" [rows]="5" [cols]="7" style="margin:.5rem 0;display:block;"></app-skeleton-table>

    <!-- ════════ TABLE (desktop) ════════ -->
    <div *ngIf="!loading" class="desktop-table">
      <table class="data-table">
        <thead>
          <tr>
            <th>FOURNISSEUR</th>
            <th>CONTACT</th>
            <th>COORDONNÉES</th>
            <th class="ta-r">ACHATS</th>
            <th class="ta-r">MONTANT (DNT)</th>
            <th class="ta-r">PRODUITS</th>
            <th class="ta-c">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of getFilteredSuppliers(); trackBy: trackById"
              class="data-row"
              (click)="viewSupplier(item.supplier.supplierId || item.supplier.id)">
            <td>
              <div class="client-name">{{ item.supplier.name }}</div>
              <div class="td-muted">{{ item.supplier.address }}</div>
            </td>
            <td class="client-name">{{ item.supplier.contactPerson }}</td>
            <td>
              <div class="td-muted">📧 {{ item.supplier.email }}</div>
              <div class="td-muted">📞 {{ item.supplier.phone }}</div>
              <div *ngIf="item.supplier.webSite" class="td-muted">🌐 {{ item.supplier.webSite }}</div>
            </td>
            <td class="ta-r">
              <span class="id-badge">{{ item.totalPurchases }}</span>
            </td>
            <td class="ta-r fw-600 c-green">{{ item.totalAmount | number:'1.3-3' }}</td>
            <td class="ta-r fw-600">{{ item.totalProductsSupplied }}</td>
            <td class="ta-c" (click)="$event.stopPropagation()">
              <div class="action-group">
                <button (click)="viewSupplier(item.supplier.supplierId || item.supplier.id)"
                        class="act-btn act-view" title="Voir détail">👁️</button>
                <button (click)="editSupplier(item.supplier.supplierId || item.supplier.id)"
                        class="act-btn act-edit" title="Modifier">✏️</button>
                <button (click)="deleteSupplier(item.supplier.supplierId || item.supplier.id)"
                        class="act-btn act-del" title="Supprimer">🗑️</button>
              </div>
            </td>
          </tr>
          <tr *ngIf="getFilteredSuppliers().length === 0">
            <td colspan="7" class="empty-state">
              <div class="empty-icon">📭</div>
              <p>Aucun fournisseur trouvé</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ════════ CARTES (mobile) ════════ -->
    <div *ngIf="!loading" class="mobile-cards">
      <div *ngFor="let item of getFilteredSuppliers(); trackBy: trackById"
           class="mobile-row"
           (click)="viewSupplier(item.supplier.supplierId || item.supplier.id)">
        <div class="mobile-row-top">
          <div class="mobile-row-left">
            <span class="client-name">{{ item.supplier.name }}</span>
          </div>
          <span class="id-badge">{{ item.totalPurchases }} achats</span>
        </div>
        <div class="td-muted" style="margin:.2rem 0 .4rem;">{{ item.supplier.contactPerson }}</div>
        <div class="td-muted" style="font-size:.8rem;margin-bottom:.75rem;">
          📧 {{ item.supplier.email }}&nbsp; 📞 {{ item.supplier.phone }}
        </div>
        <div class="mobile-grid-3">
          <div class="mg-cell">
            <span class="mg-lbl">Montant</span>
            <strong class="c-green" style="font-size:.8rem;">{{ item.totalAmount | number:'1.0-0' }}</strong>
          </div>
          <div class="mg-cell">
            <span class="mg-lbl">Achats</span>
            <strong>{{ item.totalPurchases }}</strong>
          </div>
          <div class="mg-cell">
            <span class="mg-lbl">Produits</span>
            <strong>{{ item.totalProductsSupplied }}</strong>
          </div>
        </div>
        <div class="mobile-actions" (click)="$event.stopPropagation()">
          <button (click)="viewSupplier(item.supplier.supplierId || item.supplier.id)"
                  class="act-btn act-view" title="Voir">👁️</button>
          <button (click)="editSupplier(item.supplier.supplierId || item.supplier.id)"
                  class="act-btn act-edit" title="Modifier">✏️</button>
          <button (click)="deleteSupplier(item.supplier.supplierId || item.supplier.id)"
                  class="act-btn act-del" title="Supprimer">🗑️</button>
        </div>
      </div>
      <div *ngIf="getFilteredSuppliers().length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p>Aucun fournisseur trouvé</p>
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

    /* ═══════════════ PAGE ═══════════════ */
    .page { padding: 1.5rem; background: var(--color-bg); min-height: 100vh; }

    /* ═══════════════ HEADER ═══════════════ */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .page-title { font-size: 1.5rem; font-weight: 700; color: var(--color-text); margin: 0; }
    .btn-create {
      display: inline-flex; align-items: center; gap: .4rem;
      padding: .6rem 1.25rem;
      background: linear-gradient(135deg, var(--color-primary-hover), var(--color-primary));
      color: var(--color-surface); border-radius: 10px; text-decoration: none;
      font-size: .875rem; font-weight: 600;
      transition: opacity .18s;
      box-shadow: 0 2px 8px rgba(79,70,229,.25);
    }
    .btn-create:hover { opacity: .88; }

    /* ═══════════════ KPI ROW ═══════════════ */
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: .875rem;
      margin-bottom: 1.5rem;
    }
    .kpi-card {
      background: var(--color-surface); border-radius: 12px;
      border: 1px solid var(--color-border); padding: 1rem 1.25rem;
      display: flex; flex-direction: column; gap: .3rem;
      box-shadow: 0 1px 3px rgba(0,0,0,.04);
      transition: transform .15s, box-shadow .15s;
    }
    .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,.07); }
    .kpi-val { font-size: 1.25rem; font-weight: 700; color: var(--color-text); line-height: 1.2; }
    .kpi-lbl {
      font-size: .7rem; font-weight: 600; color: var(--color-text-muted);
      text-transform: uppercase; letter-spacing: .4px;
    }

    /* ═══════════════ MAIN CARD ═══════════════ */
    .main-card {
      background: var(--color-surface); border-radius: 12px;
      border: 1px solid var(--color-border);
      box-shadow: 0 1px 4px rgba(0,0,0,.04);
      overflow: hidden;
    }

    /* ═══════════════ FILTER BAR ═══════════════ */
    .filter-bar {
      display: flex; align-items: flex-end; gap: .875rem;
      padding: 1rem 1.25rem;
      background: var(--color-bg); border-bottom: 1px solid var(--color-surface-2);
      flex-wrap: wrap;
    }
    .filter-group { display: flex; flex-direction: column; gap: .35rem; flex: 1; min-width: 120px; }
    .filter-group.fg-wide { flex: 2; min-width: 180px; }
    .filter-lbl {
      font-size: .7rem; font-weight: 700; color: var(--color-text-muted);
      text-transform: uppercase; letter-spacing: .5px;
    }
    .filter-ctrl {
      height: 38px; border: 1px solid var(--color-border); border-radius: 8px;
      padding: 0 .75rem; font-size: .85rem;
      background: var(--color-surface); color: var(--color-text); outline: none;
      transition: border-color .18s; width: 100%;
    }
    .filter-ctrl:focus { border-color: var(--color-primary-hover); box-shadow: 0 0 0 3px rgba(79,70,229,.08); }
    .btn-reset {
      height: 38px; padding: 0 .875rem;
      border: 1px solid var(--color-border); border-radius: 8px;
      background: var(--color-surface); color: var(--color-text-muted); font-size: .8rem;
      font-weight: 500; cursor: pointer; white-space: nowrap;
      align-self: flex-end; transition: all .15s;
    }
    .btn-reset:hover { border-color: var(--color-danger); color: var(--color-danger); background: var(--color-danger-bg); }

    /* ═══════════════ TABLE ═══════════════ */
    .data-table { width: 100%; border-collapse: collapse; font-size: .875rem; }
    .data-table thead tr { background: var(--color-bg); border-bottom: 2px solid var(--color-border); }
    .data-table th {
      color: var(--color-text-muted); font-weight: 700; padding: .8rem 1rem; text-align: left;
      font-size: .72rem; letter-spacing: .5px; white-space: nowrap; text-transform: uppercase;
    }
    .data-table td { padding: .8rem 1rem; border-bottom: 1px solid var(--color-surface-2); vertical-align: middle; }
    .data-row { cursor: pointer; transition: background .12s; }
    .data-row:hover { background: #f5f7ff !important; }
    .data-row:last-child td { border-bottom: none; }

    .ta-r { text-align: right !important; }
    .ta-c { text-align: center !important; }
    .fw-600 { font-weight: 600; }
    .td-muted { color: var(--color-text-muted); font-size: .875rem; }
    .c-green { color: var(--color-success) !important; }
    .client-name { font-weight: 500; color: var(--color-text); }

    .id-badge {
      display: inline-block; padding: .2rem .6rem;
      background: var(--color-info-bg); color: var(--color-info-text);
      border: 1px solid var(--color-primary-light); border-radius: 6px;
      font-weight: 600; font-size: .8rem;
    }

    /* ═══════════════ ACTION BUTTONS ═══════════════ */
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

    /* ═══════════════ EMPTY STATE ═══════════════ */
    .empty-state { padding: 3.5rem 1rem; text-align: center; color: var(--color-text-faint); }
    .empty-icon { font-size: 3.5rem; margin-bottom: .75rem; opacity: .6; }

    /* ═══════════════ MOBILE CARDS ═══════════════ */
    .mobile-row {
      padding: 1rem 1.25rem; border-bottom: 1px solid var(--color-surface-2);
      cursor: pointer; transition: background .12s;
    }
    .mobile-row:hover { background: var(--color-bg); }
    .mobile-row:last-child { border-bottom: none; }
    .mobile-row-top {
      display: flex; justify-content: space-between;
      align-items: flex-start; margin-bottom: .5rem;
    }
    .mobile-row-left { display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; }
    .mobile-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: .5rem; margin-bottom: .75rem; }
    .mg-cell {
      background: var(--color-bg); padding: .5rem; border-radius: 8px;
      text-align: center; display: flex; flex-direction: column; gap: .1rem;
    }
    .mg-lbl { font-size: .7rem; color: var(--color-text-muted); }
    .mobile-actions {
      display: flex; gap: .5rem; justify-content: flex-end;
      border-top: 1px solid var(--color-surface-2); padding-top: .75rem;
    }

    /* ═══════════════ RESPONSIVE ═══════════════ */
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
export class SuppliersComponent implements OnInit, OnDestroy {
  suppliers: any[] = [];
  loading = true;
  searchText = '';
  kpis: any = null;

  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  constructor(private apiService: ApiService, private router: Router, private toast: ToastService, private confirmDialog: ConfirmDialogService) {}

  ngOnInit(): void {
    this.loadSuppliers();
    this.loadKPIs();
    this.searchSub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => { this.searchText = value; });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
    this.searchSubject.complete();
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  loadSuppliers(): void {
    this.loading = true;
    this.apiService.getSuppliers().subscribe({
      next: (data) => { this.suppliers = data || []; this.loading = false; },
      error: () => { this.suppliers = []; this.loading = false; this.showError('Erreur lors du chargement des fournisseurs.'); }
    });
  }

  loadKPIs(): void {
    this.apiService.getSupplierKPIs().subscribe({
      next: (data) => { this.kpis = data; },
      error: () => {}
    });
  }

  getFilteredSuppliers(): any[] {
    if (!this.searchText?.trim()) return this.suppliers;
    const q = this.searchText.toLowerCase().trim();
    return this.suppliers.filter(s =>
      s.supplier?.name?.toLowerCase().includes(q) ||
      s.supplier?.email?.toLowerCase().includes(q) ||
      s.supplier?.phone?.toLowerCase().includes(q) ||
      s.supplier?.contactPerson?.toLowerCase().includes(q)
    );
  }

  trackById(_: number, item: any): number {
    return item.supplier?.supplierId ?? item.supplier?.id;
  }

  viewSupplier(id: number): void   { this.router.navigate(['/suppliers/view', id]); }
  editSupplier(id: number): void   { this.router.navigate(['/suppliers/edit', id]); }

  deleteSupplier(id: number): void {
    this.confirmDialog.confirm({
      title: 'Supprimer le fournisseur',
      message: 'Voulez-vous vraiment supprimer ce fournisseur ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      danger: true
    }).then(ok => {
      if (!ok) return;
      this.apiService.deleteSupplier(id).subscribe({
        next: () => { this.showSuccess('Fournisseur supprimé.'); this.loadSuppliers(); this.loadKPIs(); },
        error: () => this.showError('Erreur lors de la suppression.')
      });
    });
  }

  private showError(msg: string):   void { this.toast.error(msg); }
  private showSuccess(msg: string): void { this.toast.success(msg); }
}
