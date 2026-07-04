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

  <!-- ══ BARRE D'ACTIONS (maquette) ═════════════════════════════════════════ -->
  <div class="toolbar-row">
    <div class="toolbar-search">
      <i class="bi bi-search"></i>
      <input type="text" [ngModel]="searchText" (ngModelChange)="onSearchInput($event)"
             placeholder="Rechercher un fournisseur…">
    </div>
    <a routerLink="/suppliers/create" class="btn-accent">
      <i class="bi bi-plus-lg"></i> Nouveau fournisseur
    </a>
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

  <!-- Skeleton loading -->
  <app-skeleton-table *ngIf="loading" [rows]="5" [cols]="4" style="margin:.5rem 0;display:block;"></app-skeleton-table>

  <!-- ══ GRILLE DE CARTES (maquette) ═════════════════════════════════════════ -->
  <div *ngIf="!loading" class="suppliers-grid">
    <div *ngFor="let item of getFilteredSuppliers(); trackBy: trackById"
         class="supplier-card"
         (click)="viewSupplier(item.supplier.supplierId || item.supplier.id)">
      <div class="sc-top">
        <div class="sc-avatar" [style.background]="avatarGradient(item.supplier.name)">
          {{ getInitials(item.supplier.name) }}
        </div>
        <span class="sc-badge" [class.sc-badge-pause]="item.totalPurchases === 0">
          {{ item.totalPurchases > 0 ? 'Actif' : 'En pause' }}
        </span>
      </div>
      <div class="sc-name">{{ item.supplier.name }}</div>
      <div class="sc-sub">{{ item.supplier.contactPerson || item.supplier.address || '—' }}</div>
      <div class="sc-contact">
        <span *ngIf="item.supplier.email"><i class="bi bi-envelope"></i> {{ item.supplier.email }}</span>
        <span *ngIf="item.supplier.phone"><i class="bi bi-telephone"></i> {{ item.supplier.phone }}</span>
      </div>
      <div class="sc-foot">
        <div>
          <div class="sc-flbl">Achats</div>
          <div class="sc-fval">{{ item.totalAmount | number:'1.0-0' }} DNT</div>
        </div>
        <div class="sc-fright">
          <div class="sc-flbl">Commandes</div>
          <div class="sc-fval">{{ item.totalPurchases }}</div>
        </div>
      </div>
      <div class="sc-actions" (click)="$event.stopPropagation()">
        <button (click)="viewSupplier(item.supplier.supplierId || item.supplier.id)"
                class="sc-act" title="Voir détail"><i class="bi bi-eye"></i></button>
        <button (click)="editSupplier(item.supplier.supplierId || item.supplier.id)"
                class="sc-act" title="Modifier"><i class="bi bi-pencil"></i></button>
        <button (click)="deleteSupplier(item.supplier.supplierId || item.supplier.id)"
                class="sc-act sc-act-del" title="Supprimer"><i class="bi bi-trash"></i></button>
      </div>
    </div>
    <div *ngIf="getFilteredSuppliers().length === 0" class="empty-state" style="grid-column:1/-1;">
      <div class="empty-icon">📭</div>
      <p>Aucun fournisseur trouvé</p>
    </div>
  </div>


</div><!-- /page -->
  `,
  styles: [`
    *, *::before, *::after {
      font-family: var(--font-sans);
      box-sizing: border-box;
    }

    /* ═══════════════ PAGE ═══════════════ */
    .page { padding: 1.5rem; background: transparent; min-height: 100vh; }

    /* ═══════════════ BARRE D'ACTIONS ═══════════════ */
    .toolbar-row {
      display: flex; align-items: center; gap: 12px;
      margin-bottom: 18px; flex-wrap: wrap;
    }
    .toolbar-search { position: relative; flex: 1; min-width: 220px; }
    .toolbar-search i {
      position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
      color: var(--color-text-faint); font-size: 14px;
    }
    .toolbar-search input {
      width: 100%; padding: 10px 14px 10px 38px;
      border-radius: 13px; border: 1px solid var(--glass-border);
      background: rgba(255,255,255,0.6);
      backdrop-filter: blur(18px) saturate(180%);
      -webkit-backdrop-filter: blur(18px) saturate(180%);
      box-shadow: 0 6px 20px -10px rgba(49,46,129,0.25);
      font-size: 14px; color: var(--color-text);
      outline: none; font-family: inherit;
      transition: border-color .18s, box-shadow .18s;
    }
    .toolbar-search input:focus {
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

    /* ═══════════════ KPI ROW ═══════════════ */
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: .875rem;
      margin-bottom: 1.5rem;
    }
    .kpi-card {
      background: var(--glass-bg); border-radius: var(--radius-lg);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--glass-border); padding: 1rem 1.25rem;
      display: flex; flex-direction: column; gap: .3rem;
      box-shadow: var(--glass-shadow-sm);
      transition: transform .15s, box-shadow .15s;
    }
    .kpi-card:hover { transform: translateY(-2px); box-shadow: var(--glass-shadow-lg); }
    .kpi-val { font-size: 1.25rem; font-weight: 700; color: var(--color-text); line-height: 1.2; }
    .kpi-lbl {
      font-size: .7rem; font-weight: 600; color: var(--color-text-muted);
      text-transform: uppercase; letter-spacing: .4px;
    }

    /* ═══════════════ GRILLE DE CARTES (maquette) ═══════════════ */
    .suppliers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 18px;
    }
    .supplier-card {
      padding: 22px; border-radius: 20px;
      background: var(--glass-bg);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--glass-border);
      box-shadow: var(--glass-shadow);
      cursor: pointer;
      transition: transform .15s, box-shadow .15s;
    }
    .supplier-card:hover { transform: translateY(-2px); box-shadow: var(--glass-shadow-lg); }

    .sc-top {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 16px;
    }
    .sc-avatar {
      width: 46px; height: 46px; border-radius: 13px;
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 15px;
    }
    .sc-badge {
      display: inline-flex; padding: 4px 10px; border-radius: 999px;
      background: rgba(16,185,129,0.14); color: #047857;
      font-size: 12px; font-weight: 700;
    }
    .sc-badge-pause { background: rgba(245,158,11,0.16); color: #b45309; }

    .sc-name { font-size: 16px; font-weight: 700; color: var(--color-text); }
    .sc-sub  { font-size: 13px; color: var(--color-text-faint); margin-top: 2px; }
    .sc-contact {
      display: flex; flex-direction: column; gap: 2px;
      font-size: 12px; color: var(--color-text-muted); margin-top: 8px;
      overflow: hidden;
    }
    .sc-contact span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .sc-foot {
      display: flex; justify-content: space-between;
      margin-top: 18px; padding-top: 16px;
      border-top: 1px solid rgba(15,23,42,0.08);
    }
    .sc-fright { text-align: right; }
    .sc-flbl { font-size: 11px; color: var(--color-text-faint); font-weight: 600; }
    .sc-fval { font-size: 15px; font-weight: 700; margin-top: 2px; color: var(--color-text); }

    .sc-actions {
      display: flex; gap: 8px; justify-content: flex-end; margin-top: 14px;
    }
    .sc-act {
      width: 30px; height: 30px; border-radius: 9px;
      border: 1px solid rgba(15,23,42,0.1);
      background: rgba(255,255,255,0.6); color: var(--color-text-muted);
      cursor: pointer; font-size: 13px;
      display: inline-flex; align-items: center; justify-content: center;
      transition: all .15s;
    }
    .sc-act:hover { color: var(--color-primary); border-color: var(--color-primary); }
    .sc-act-del:hover { color: var(--color-danger); border-color: var(--color-danger); background: var(--color-danger-bg); }

    /* ═══════════════ EMPTY STATE ═══════════════ */
    .empty-state { padding: 3.5rem 1rem; text-align: center; color: var(--color-text-faint); }
    .empty-icon { font-size: 3.5rem; margin-bottom: .75rem; opacity: .6; }

    @media (max-width: 768px) {
      .page { padding: 1rem; }
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

  private static readonly AVATAR_GRADIENTS = [
    'linear-gradient(135deg, #6366f1, #4f46e5)',
    'linear-gradient(135deg, #fbbf24, #f97316)',
    'linear-gradient(135deg, #38bdf8, #6366f1)',
    'linear-gradient(135deg, #34d399, #059669)',
    'linear-gradient(135deg, #f472b6, #a855f7)'
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
    const gradients = SuppliersComponent.AVATAR_GRADIENTS;
    return gradients[Math.abs(hash) % gradients.length];
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
