import {
  Component, Input, Output, EventEmitter, OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UserManagementService,
  UserSummary,
  UserCreate,
  UserUpdate,
  UserRole
} from '../../../services/user-management.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Backdrop -->
    <div class="drawer-backdrop" *ngIf="open" (click)="onClose()"></div>

    <!-- Drawer panel -->
    <div class="drawer" [class.drawer--open]="open" role="dialog" [attr.aria-label]="isEdit ? 'Modifier l\\'utilisateur' : 'Créer un utilisateur'">
      <div class="drawer-header">
        <h2 class="drawer-title">
          <i class="bi" [class.bi-person-plus]="!isEdit" [class.bi-pencil-square]="isEdit"></i>
          {{ isEdit ? 'Modifier l\'utilisateur' : 'Créer un utilisateur' }}
        </h2>
        <button class="drawer-close" (click)="onClose()" title="Fermer">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <form class="drawer-body" #f="ngForm" (ngSubmit)="onSubmit(f.valid)">

        <!-- Nom complet -->
        <div class="field">
          <label class="field-label" for="fullName">Nom complet <span class="required">*</span></label>
          <input
            id="fullName"
            class="field-input"
            type="text"
            name="fullName"
            [(ngModel)]="form.fullName"
            required
            placeholder="ex: Jean Dupont"
            [class.field-input--error]="f.submitted && !form.fullName"
          />
          <span class="field-error" *ngIf="f.submitted && !form.fullName">Le nom complet est obligatoire.</span>
        </div>

        <!-- Email -->
        <div class="field">
          <label class="field-label" for="email">Email <span class="required">*</span></label>
          <input
            id="email"
            class="field-input"
            type="email"
            name="email"
            [(ngModel)]="form.email"
            required
            email
            placeholder="ex: jean@exemple.com"
            [class.field-input--error]="f.submitted && !form.email"
          />
          <span class="field-error" *ngIf="f.submitted && !form.email">Un email valide est obligatoire.</span>
        </div>

        <!-- Mot de passe (création uniquement) -->
        <div class="field" *ngIf="!isEdit">
          <label class="field-label" for="password">Mot de passe <span class="required">*</span></label>
          <div class="field-password-wrap">
            <input
              id="password"
              class="field-input"
              [type]="showPassword ? 'text' : 'password'"
              name="password"
              [(ngModel)]="form.password"
              required
              minlength="6"
              placeholder="Minimum 6 caractères"
              [class.field-input--error]="f.submitted && (!form.password || form.password.length < 6)"
            />
            <button type="button" class="field-eye" (click)="showPassword = !showPassword" tabindex="-1">
              <i class="bi" [class.bi-eye]="!showPassword" [class.bi-eye-slash]="showPassword"></i>
            </button>
          </div>
          <span class="field-error" *ngIf="f.submitted && (!form.password || form.password.length < 6)">
            Le mot de passe doit contenir au moins 6 caractères.
          </span>
        </div>

        <!-- Rôle -->
        <div class="field">
          <label class="field-label" for="role">Rôle <span class="required">*</span></label>
          <select
            id="role"
            class="field-input"
            name="role"
            [(ngModel)]="form.role"
            required
          >
            <option value="USER">Utilisateur</option>
            <option value="ADMIN">Administrateur</option>
          </select>
        </div>

        <!-- Reset password (édition uniquement) -->
        <div class="reset-section" *ngIf="isEdit">
          <p class="reset-label">Réinitialiser le mot de passe</p>
          <div class="field">
            <div class="field-password-wrap">
              <input
                class="field-input"
                [type]="showNewPassword ? 'text' : 'password'"
                name="newPassword"
                [(ngModel)]="newPassword"
                placeholder="Nouveau mot de passe (optionnel)"
              />
              <button type="button" class="field-eye" (click)="showNewPassword = !showNewPassword" tabindex="-1">
                <i class="bi" [class.bi-eye]="!showNewPassword" [class.bi-eye-slash]="showNewPassword"></i>
              </button>
            </div>
          </div>
          <button type="button" class="btn-reset-pw" (click)="onResetPassword()" [disabled]="!newPassword || newPassword.length < 6 || saving">
            <i class="bi bi-key-fill"></i> Réinitialiser
          </button>
        </div>

        <div class="drawer-actions">
          <button type="button" class="btn btn-cancel" (click)="onClose()" [disabled]="saving">Annuler</button>
          <button type="submit" class="btn btn-primary" [disabled]="saving">
            <span *ngIf="saving" class="spinner"></span>
            <i class="bi bi-check-lg" *ngIf="!saving"></i>
            {{ saving ? 'Enregistrement…' : (isEdit ? 'Enregistrer' : 'Créer') }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .drawer-backdrop {
      position: fixed; inset: 0;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(2px);
      z-index: 900;
    }

    .drawer {
      position: fixed;
      top: 0; right: 0; bottom: 0;
      width: 420px;
      max-width: 100vw;
      background: var(--glass-bg-strong);
      backdrop-filter: blur(30px) saturate(180%);
      -webkit-backdrop-filter: blur(30px) saturate(180%);
      border-left: 1px solid var(--glass-border);
      box-shadow: var(--glass-shadow-lg);
      z-index: 901;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform var(--transition-md, 250ms ease);
      overflow-y: auto;
    }

    .drawer--open { transform: translateX(0); }

    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--color-border, var(--color-border));
      flex-shrink: 0;
    }

    .drawer-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--color-text, var(--color-text));
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
    }

    .drawer-close {
      width: 2rem; height: 2rem;
      display: flex; align-items: center; justify-content: center;
      background: none;
      border: 1px solid var(--color-border, var(--color-border));
      border-radius: 6px;
      color: var(--color-text-muted, var(--color-text-muted));
      cursor: pointer;
      font-size: 0.875rem;
      transition: background var(--transition, 150ms ease);
    }
    .drawer-close:hover { background: var(--color-surface-2, var(--color-surface-2)); }

    .drawer-body {
      flex: 1;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .field { display: flex; flex-direction: column; gap: 0.375rem; }

    .field-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-text-2, var(--color-text-2));
    }

    .required { color: var(--color-danger, var(--color-danger)); margin-left: 2px; }

    .field-input {
      width: 100%;
      padding: 0.5625rem 0.875rem;
      border: 1.5px solid rgba(15,23,42,0.1);
      border-radius: var(--radius-sm, 6px);
      font-size: 0.875rem;
      color: var(--color-text, var(--color-text));
      background: rgba(255,255,255,0.7);
      transition: border-color var(--transition, 150ms ease);
      outline: none;
    }
    .field-input:focus { border-color: var(--color-primary, var(--color-primary)); box-shadow: 0 0 0 3px var(--color-primary-muted, rgba(99,102,241,0.12)); }
    .field-input--error { border-color: var(--color-danger, var(--color-danger)); }
    .field-input--error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.12); }

    .field-password-wrap { position: relative; }
    .field-password-wrap .field-input { padding-right: 2.5rem; }

    .field-eye {
      position: absolute;
      right: 0.625rem; top: 50%;
      transform: translateY(-50%);
      background: none; border: none;
      color: var(--color-text-muted, var(--color-text-muted));
      cursor: pointer;
      padding: 0.25rem;
      font-size: 0.875rem;
    }

    .field-error {
      font-size: 0.75rem;
      color: var(--color-danger, var(--color-danger));
      font-weight: 500;
    }

    .reset-section {
      padding: 1rem;
      background: rgba(15,23,42,0.04);
      border-radius: var(--radius-md, 10px);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .reset-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-text-2, var(--color-text-2));
      margin: 0;
    }

    .btn-reset-pw {
      align-self: flex-start;
      padding: 0.4375rem 0.875rem;
      background: var(--color-warning-bg, var(--color-warning-bg));
      color: var(--color-warning-text, var(--color-warning-text));
      border: 1px solid var(--color-warning, var(--color-warning));
      border-radius: var(--radius-sm, 6px);
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      transition: background var(--transition, 150ms ease);
    }
    .btn-reset-pw:hover:not(:disabled) { background: var(--color-warning); }
    .btn-reset-pw:disabled { opacity: 0.5; cursor: not-allowed; }

    .drawer-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      margin-top: auto;
      padding-top: 1rem;
      border-top: 1px solid var(--color-border, var(--color-border));
    }

    .btn {
      padding: 0.5625rem 1.25rem;
      border-radius: var(--radius-sm, 6px);
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      border: 1px solid transparent;
      transition: background var(--transition, 150ms ease), box-shadow var(--transition, 150ms ease);
    }

    .btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .btn-cancel {
      background: var(--color-surface-2, var(--color-surface-2));
      color: var(--color-text-2, var(--color-text-2));
      border-color: var(--color-border, var(--color-border));
    }
    .btn-cancel:hover:not(:disabled) { background: var(--color-border, var(--color-border)); }

    .btn-primary {
      background: var(--color-primary, var(--color-primary));
      color: #fff;
      box-shadow: 0 8px 20px -6px var(--color-primary-glow);
    }
    .btn-primary:hover:not(:disabled) { background: var(--color-primary-hover, var(--color-primary-hover)); }

    .spinner {
      display: inline-block;
      width: 0.875rem; height: 0.875rem;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class UserFormComponent implements OnChanges {
  @Input() open = false;
  @Input() user: UserSummary | null = null;
  @Output() saved  = new EventEmitter<UserSummary>();
  @Output() closed = new EventEmitter<void>();

  form: { fullName: string; email: string; password?: string; role: UserRole } = {
    fullName: '',
    email: '',
    password: '',
    role: 'USER'
  };

  newPassword = '';
  showPassword = false;
  showNewPassword = false;
  saving = false;

  get isEdit(): boolean { return !!this.user; }

  constructor(
    private readonly svc: UserManagementService,
    private readonly toast: ToastService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.resetForm();
    }
  }

  onClose(): void {
    this.closed.emit();
  }

  onSubmit(valid: boolean | null): void {
    if (!valid) return;

    this.saving = true;

    if (this.isEdit && this.user) {
      const dto: UserUpdate = { email: this.form.email, fullName: this.form.fullName, role: this.form.role };
      this.svc.updateUser(this.user.id, dto).subscribe({
        next: (updated: UserSummary) => {
          this.toast.success('Utilisateur modifié avec succès.');
          this.saved.emit(updated);
          this.saving = false;
        },
        error: (err: { error?: { message?: string } }) => {
          this.toast.error(err?.error?.message || 'Erreur lors de la modification.');
          this.saving = false;
        }
      });
    } else {
      const dto: UserCreate = {
        email: this.form.email,
        fullName: this.form.fullName,
        password: this.form.password!,
        role: this.form.role
      };
      this.svc.createUser(dto).subscribe({
        next: (created: UserSummary) => {
          this.toast.success('Utilisateur créé avec succès.');
          this.saved.emit(created);
          this.saving = false;
        },
        error: (err: { error?: { message?: string } }) => {
          this.toast.error(err?.error?.message || 'Erreur lors de la création.');
          this.saving = false;
        }
      });
    }
  }

  onResetPassword(): void {
    if (!this.user || !this.newPassword || this.newPassword.length < 6) return;
    this.svc.resetPassword(this.user.id, this.newPassword).subscribe({
      next: () => {
        this.toast.success('Mot de passe réinitialisé avec succès.');
        this.newPassword = '';
      },
      error: (err: { error?: { message?: string } }) => {
        this.toast.error(err?.error?.message || 'Erreur lors de la réinitialisation.');
      }
    });
  }

  private resetForm(): void {
    this.showPassword = false;
    this.showNewPassword = false;
    this.newPassword = '';
    this.saving = false;

    if (this.user) {
      this.form = { fullName: this.user.fullName, email: this.user.email, role: this.user.role };
    } else {
      this.form = { fullName: '', email: '', password: '', role: 'USER' };
    }
  }
}
