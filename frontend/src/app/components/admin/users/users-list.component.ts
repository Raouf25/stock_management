import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';

import {
  UserManagementService,
  UserSummary,
  PageResult
} from '../../../services/user-management.service';
import { ConfirmDialogService } from '../../../services/confirm-dialog.service';
import { ToastService } from '../../../services/toast.service';
import { UrlFiltersService } from '../../../shared/url-filters.service';
import { PaginatorComponent } from '../../../shared/paginator.component';
import { SkeletonTableComponent } from '../../../shared/skeleton.component';
import { RoleBadgeComponent } from './role-badge.component';
import { UserFormComponent } from './user-form.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PaginatorComponent,
    SkeletonTableComponent,
    RoleBadgeComponent,
    UserFormComponent
  ],
  template: `
    <div class="page">

      <!-- ── En-tête ── -->
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">
            <i class="bi bi-people-fill"></i>
            Gestion des utilisateurs
          </h1>
          <span class="page-subtitle" *ngIf="!loading">
            {{ total }} utilisateur{{ total !== 1 ? 's' : '' }}
          </span>
        </div>
        <button class="btn-create" (click)="openCreate()">
          <i class="bi bi-person-plus-fill"></i>
          Nouvel utilisateur
        </button>
      </div>

      <!-- ── Barre de recherche ── -->
      <div class="toolbar">
        <div class="search-wrap">
          <i class="bi bi-search search-icon"></i>
          <input
            class="search-input"
            type="text"
            placeholder="Rechercher par nom ou email…"
            [(ngModel)]="search"
            (ngModelChange)="onSearchChange($event)"
          />
          <button class="search-clear" *ngIf="search" (click)="clearSearch()" title="Effacer">
            <i class="bi bi-x-circle-fill"></i>
          </button>
        </div>
      </div>

      <!-- ── Squelette chargement ── -->
      <app-skeleton-table *ngIf="loading" [rows]="pageSize" [cols]="6"></app-skeleton-table>

      <!-- ── Tableau ── -->
      <div class="table-card" *ngIf="!loading">
        <table class="table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Créé le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="users.length === 0">
              <td colspan="6" class="empty-cell">
                <div class="empty-state">
                  <i class="bi bi-person-slash"></i>
                  <p>Aucun utilisateur trouvé</p>
                  <span *ngIf="search">Essayez de modifier votre recherche.</span>
                </div>
              </td>
            </tr>
            <tr *ngFor="let user of users">
              <td class="td-name">
                <div class="user-avatar-cell">
                  <div class="user-avatar">{{ getInitials(user.fullName) }}</div>
                  <span class="user-name">{{ user.fullName }}</span>
                </div>
              </td>
              <td class="td-email">{{ user.email }}</td>
              <td><app-role-badge [role]="user.role"></app-role-badge></td>
              <td>
                <span class="status-badge" [class.status-badge--active]="user.active" [class.status-badge--inactive]="!user.active">
                  <i class="bi" [class.bi-check-circle-fill]="user.active" [class.bi-x-circle-fill]="!user.active"></i>
                  {{ user.active ? 'Actif' : 'Désactivé' }}
                </span>
              </td>
              <td class="td-date">{{ formatDate(user.createdAt) }}</td>
              <td class="td-actions">
                <button class="action-btn action-btn--edit"
                        (click)="openEdit(user)"
                        title="Modifier">
                  <i class="bi bi-pencil-fill"></i>
                </button>
                <button class="action-btn"
                        [class.action-btn--deactivate]="user.active"
                        [class.action-btn--activate]="!user.active"
                        (click)="toggleStatus(user)"
                        [title]="user.active ? 'Désactiver' : 'Activer'">
                  <i class="bi" [class.bi-toggle-on]="user.active" [class.bi-toggle-off]="!user.active"></i>
                </button>
                <button class="action-btn action-btn--danger"
                        (click)="deleteUser(user)"
                        title="Supprimer">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <app-paginator
          [page]="page"
          [pageSize]="pageSize"
          [totalItems]="total"
          (pageChange)="onPageChange($event)"
          (pageSizeChange)="onPageSizeChange($event)"
        ></app-paginator>
      </div>
    </div>

    <!-- Drawer création / édition -->
    <app-user-form
      [open]="formOpen"
      [user]="selectedUser"
      (saved)="onSaved($event)"
      (closed)="formOpen = false"
    ></app-user-form>
  `,
  styles: [`
    .page {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      max-width: 1200px;
    }

    /* ── En-tête ── */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .page-header-left { display: flex; flex-direction: column; gap: 0.125rem; }

    .page-title {
      font-size: 1.375rem;
      font-weight: 700;
      color: var(--color-text, var(--color-text));
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .page-subtitle {
      font-size: 0.8125rem;
      color: var(--color-text-muted, var(--color-text-muted));
    }

    .btn-create {
      padding: 0.5625rem 1.125rem;
      background: var(--color-primary, var(--color-primary));
      color: var(--color-surface);
      border: none;
      border-radius: var(--radius-sm, 6px);
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      box-shadow: 0 1px 4px rgba(99,102,241,0.3);
      transition: background var(--transition, 150ms ease);
    }
    .btn-create:hover { background: var(--color-primary-hover, var(--color-primary-hover)); }

    /* ── Toolbar ── */
    .toolbar { display: flex; align-items: center; gap: 0.75rem; }

    .search-wrap {
      position: relative;
      flex: 1;
      max-width: 400px;
    }

    .search-icon {
      position: absolute;
      left: 0.75rem; top: 50%;
      transform: translateY(-50%);
      color: var(--color-text-muted, var(--color-text-muted));
      font-size: 0.875rem;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 0.5625rem 2.25rem 0.5625rem 2.25rem;
      border: 1.5px solid var(--color-border, var(--color-border));
      border-radius: var(--radius-sm, 6px);
      font-size: 0.875rem;
      color: var(--color-text, var(--color-text));
      background: var(--color-surface, var(--color-surface));
      outline: none;
      transition: border-color var(--transition, 150ms ease);
    }
    .search-input:focus { border-color: var(--color-primary, var(--color-primary)); box-shadow: 0 0 0 3px var(--color-primary-muted, rgba(99,102,241,0.12)); }

    .search-clear {
      position: absolute;
      right: 0.625rem; top: 50%;
      transform: translateY(-50%);
      background: none; border: none;
      color: var(--color-text-muted, var(--color-text-muted));
      cursor: pointer; font-size: 0.875rem;
      display: flex; align-items: center;
    }
    .search-clear:hover { color: var(--color-text, var(--color-text)); }

    /* ── Table ── */
    .table-card {
      background: var(--color-surface, var(--color-surface));
      border: 1px solid var(--color-border, var(--color-border));
      border-radius: var(--radius-lg, 14px);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }

    .table thead tr {
      background: var(--color-surface-2, var(--color-surface-2));
      border-bottom: 1px solid var(--color-border, var(--color-border));
    }

    .table th {
      padding: 0.75rem 1rem;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--color-text-muted, var(--color-text-muted));
      white-space: nowrap;
    }

    .table td {
      padding: 0.875rem 1rem;
      border-bottom: 1px solid var(--color-border, var(--color-border));
      color: var(--color-text-2, var(--color-text-2));
      vertical-align: middle;
    }

    .table tbody tr:last-child td { border-bottom: none; }
    .table tbody tr:hover { background: var(--color-surface-2, var(--color-surface-2)); }

    /* Colonnes spécifiques */
    .td-name { font-weight: 600; color: var(--color-text, var(--color-text)); }

    .user-avatar-cell {
      display: flex; align-items: center; gap: 0.625rem;
    }

    .user-avatar {
      width: 2rem; height: 2rem;
      background: var(--color-primary-light, var(--color-primary-light));
      color: var(--color-primary, var(--color-primary));
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.6875rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .user-name { font-weight: 600; }

    .td-email {
      color: var(--color-text-muted, var(--color-text-muted));
      font-size: 0.8125rem;
    }

    .td-date {
      font-size: 0.8125rem;
      color: var(--color-text-muted, var(--color-text-muted));
      white-space: nowrap;
    }

    .td-actions {
      white-space: nowrap;
    }

    /* Badges statut */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.2rem 0.625rem;
      border-radius: var(--radius-full, 9999px);
      font-size: 0.75rem;
      font-weight: 600;
    }

    .status-badge--active {
      background: var(--color-success-bg, var(--color-success-bg));
      color: var(--color-success-text, var(--color-success-text));
    }

    .status-badge--inactive {
      background: var(--color-danger-bg, var(--color-danger-bg));
      color: var(--color-danger-text, var(--color-danger-text));
    }

    /* Boutons d'action */
    .action-btn {
      width: 1.875rem; height: 1.875rem;
      display: inline-flex; align-items: center; justify-content: center;
      border: 1px solid var(--color-border, var(--color-border));
      border-radius: var(--radius-sm, 6px);
      background: var(--color-surface, var(--color-surface));
      cursor: pointer;
      font-size: 0.8125rem;
      color: var(--color-text-muted, var(--color-text-muted));
      transition: background var(--transition, 150ms ease), color var(--transition, 150ms ease);
      margin-left: 0.25rem;
    }

    .action-btn--edit:hover { background: var(--color-primary-light, var(--color-primary-light)); color: var(--color-primary, var(--color-primary)); border-color: var(--color-primary, var(--color-primary)); }
    .action-btn--deactivate:hover { background: var(--color-warning-bg, var(--color-warning-bg)); color: var(--color-warning-text, var(--color-warning-text)); border-color: var(--color-warning, var(--color-warning)); }
    .action-btn--activate:hover { background: var(--color-success-bg, var(--color-success-bg)); color: var(--color-success-text, var(--color-success-text)); border-color: var(--color-success, var(--color-success)); }
    .action-btn--danger:hover { background: var(--color-danger-bg, var(--color-danger-bg)); color: var(--color-danger-text, var(--color-danger-text)); border-color: var(--color-danger, var(--color-danger)); }

    /* État vide */
    .empty-cell { text-align: center; padding: 3rem 1rem !important; }

    .empty-state {
      display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
      color: var(--color-text-muted, var(--color-text-muted));
    }
    .empty-state i { font-size: 2rem; }
    .empty-state p { font-size: 0.9375rem; font-weight: 600; margin: 0; }
    .empty-state span { font-size: 0.8125rem; }
  `]
})
export class UsersListComponent implements OnInit, OnDestroy {

  users: UserSummary[] = [];
  total = 0;
  page = 0;
  pageSize = 20;
  search = '';
  loading = true;
  formOpen = false;
  selectedUser: UserSummary | null = null;

  private readonly search$ = new Subject<string>();
  private sub?: Subscription;

  constructor(
    private readonly svc: UserManagementService,
    private readonly confirm: ConfirmDialogService,
    private readonly toast: ToastService,
    private readonly urlFilters: UrlFiltersService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const params = this.urlFilters.read(this.route);
    this.search   = params['search'] ?? '';
    this.page     = Number(params['page'] ?? 0);
    this.pageSize = Number(params['size'] ?? 20);

    this.sub = this.search$.pipe(
      debounceTime(200),
      distinctUntilChanged()
    ).subscribe((value: string) => {
      this.page = 0;
      this.urlFilters.write(this.router, this.route, { search: value || null, page: null });
      this.load();
    });

    this.load();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  load(): void {
    this.loading = true;
    this.svc.getUsers(this.page, this.pageSize, this.search).subscribe({
      next: (result: PageResult<UserSummary>) => {
        this.users = result.content;
        this.total = result.totalElements;
        this.loading = false;
      },
      error: () => {
        this.toast.error('Erreur lors du chargement des utilisateurs.');
        this.loading = false;
      }
    });
  }

  onSearchChange(value: string): void {
    this.search$.next(value);
  }

  clearSearch(): void {
    this.search = '';
    this.search$.next('');
  }

  onPageChange(p: number): void {
    this.page = p;
    this.urlFilters.write(this.router, this.route, { page: p.toString() });
    this.load();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.page = 0;
    this.urlFilters.write(this.router, this.route, { size: size.toString(), page: null });
    this.load();
  }

  openCreate(): void {
    this.selectedUser = null;
    this.formOpen = true;
  }

  openEdit(user: UserSummary): void {
    this.selectedUser = user;
    this.formOpen = true;
  }

  onSaved(user: UserSummary): void {
    this.formOpen = false;
    this.load();
  }

  async toggleStatus(user: UserSummary): Promise<void> {
    const label = user.active ? 'désactiver' : 'activer';
    const confirmed = await this.confirm.confirm({
      title: `${user.active ? 'Désactiver' : 'Activer'} l'utilisateur`,
      message: `Voulez-vous vraiment ${label} "${user.fullName}" ?`,
      confirmText: user.active ? 'Désactiver' : 'Activer',
      danger: user.active
    });
    if (!confirmed) return;

    this.svc.toggleStatus(user.id).subscribe({
      next: (updated: UserSummary) => {
        const idx = this.users.findIndex(u => u.id === user.id);
        if (idx !== -1) this.users[idx] = updated;
        this.toast.success(`Utilisateur ${updated.active ? 'activé' : 'désactivé'}.`);
      },
      error: (err: { error?: { message?: string } }) => this.toast.error(err?.error?.message || 'Erreur lors de la modification du statut.')
    });
  }

  async deleteUser(user: UserSummary): Promise<void> {
    const confirmed = await this.confirm.confirm({
      title: 'Supprimer l\'utilisateur',
      message: `Cette action est irréversible. Voulez-vous vraiment supprimer "${user.fullName}" ?`,
      confirmText: 'Supprimer',
      danger: true
    });
    if (!confirmed) return;

    this.svc.deleteUser(user.id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== user.id);
        this.total--;
        this.toast.success('Utilisateur supprimé.');
      },
      error: (err: { error?: { message?: string } }) => this.toast.error(err?.error?.message || 'Erreur lors de la suppression.')
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
}
