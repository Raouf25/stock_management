import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService, AppSettings } from '../../services/settings.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
<div class="page">

  <div class="page-head">
    <div>
      <h1 class="page-title">Paramètres</h1>
      <p class="page-sub">Configuration de l'entreprise et de l'application</p>
    </div>
  </div>

  <!-- Skeleton pendant le chargement -->
  <ng-container *ngIf="loading">
    <div class="skel-section">
      <div class="skel-card-head skel-pulse"></div>
      <div class="skel-fields">
        <div class="skel-field skel-pulse" *ngFor="let i of [1,2,3,4]"></div>
      </div>
    </div>
    <div class="skel-section" style="margin-top:1rem">
      <div class="skel-card-head skel-pulse"></div>
      <div class="skel-fields">
        <div class="skel-field skel-pulse" *ngFor="let i of [1,2,3]"></div>
      </div>
    </div>
  </ng-container>

  <!-- Formulaire -->
  <ng-container *ngIf="!loading && form">
    <form [formGroup]="form" (ngSubmit)="save()">

      <!-- Section Entreprise -->
      <div class="settings-card">
        <div class="card-head">
          <i class="bi bi-building"></i>
          <span>Informations de l'entreprise</span>
        </div>
        <div class="card-body">

          <div class="field-group">
            <label for="company_name">Nom de l'entreprise</label>
            <input
              id="company_name"
              type="text"
              formControlName="company_name"
              placeholder="Ex : Bhouri Stock"
              [class.input-error]="isInvalid('company_name')"
            />
            <span class="error-msg" *ngIf="isInvalid('company_name')">Ce champ est requis.</span>
          </div>

          <div class="field-group">
            <label for="company_email">Email de l'entreprise</label>
            <input
              id="company_email"
              type="email"
              formControlName="company_email"
              placeholder="contact@exemple.com"
              [class.input-error]="isInvalid('company_email')"
            />
            <span class="error-msg" *ngIf="isInvalid('company_email')">Email invalide.</span>
          </div>

          <div class="field-group">
            <label for="company_phone">Téléphone</label>
            <input
              id="company_phone"
              type="text"
              formControlName="company_phone"
              placeholder="+216 XX XXX XXX"
            />
          </div>

          <div class="field-group">
            <label for="company_address">Adresse</label>
            <textarea
              id="company_address"
              formControlName="company_address"
              placeholder="Rue, Ville, Code postal"
              rows="3"
            ></textarea>
          </div>

        </div>
      </div>

      <!-- Section Facturation -->
      <div class="settings-card">
        <div class="card-head">
          <i class="bi bi-receipt"></i>
          <span>Facturation</span>
        </div>
        <div class="card-body">

          <div class="fields-row">

            <div class="field-group">
              <label for="currency">Devise</label>
              <input
                id="currency"
                type="text"
                formControlName="currency"
                placeholder="DNT"
                [class.input-error]="isInvalid('currency')"
              />
              <span class="error-msg" *ngIf="isInvalid('currency')">Ce champ est requis.</span>
            </div>

            <div class="field-group">
              <label for="tax_rate">Taux TVA (%)</label>
              <input
                id="tax_rate"
                type="number"
                formControlName="tax_rate"
                placeholder="19"
                min="0"
                max="100"
                step="0.1"
                [class.input-error]="isInvalid('tax_rate')"
              />
              <span class="error-msg" *ngIf="isInvalid('tax_rate')">Valeur entre 0 et 100 requise.</span>
            </div>

            <div class="field-group">
              <label for="invoice_prefix">Préfixe facture</label>
              <input
                id="invoice_prefix"
                type="text"
                formControlName="invoice_prefix"
                placeholder="FAC"
                [class.input-error]="isInvalid('invoice_prefix')"
              />
              <span class="error-msg" *ngIf="isInvalid('invoice_prefix')">Ce champ est requis.</span>
            </div>

          </div>
        </div>
      </div>

      <!-- Section Notifications -->
      <div class="settings-card">
        <div class="card-head">
          <i class="bi bi-bell"></i>
          <span>Notifications</span>
        </div>
        <div class="card-body">

          <div class="toggle-row">
            <div class="toggle-info">
              <span class="toggle-label">Notifications par email</span>
              <span class="toggle-hint">Recevoir des alertes et confirmations par email</span>
            </div>
            <button
              type="button"
              class="toggle-btn"
              [class.active]="emailNotificationsEnabled"
              (click)="toggleEmailNotifications()"
              [attr.aria-pressed]="emailNotificationsEnabled"
              [disabled]="isReadOnly"
            >
              <span class="toggle-knob"></span>
            </button>
          </div>

        </div>
      </div>

      <!-- Bouton Enregistrer (ADMIN uniquement) -->
      <div class="form-actions" *ngIf="isAdmin">
        <button
          type="submit"
          class="btn-primary"
          [disabled]="form.invalid || saving"
        >
          <i class="bi" [class.bi-check-lg]="!saving" [class.bi-hourglass-split]="saving"></i>
          {{ saving ? 'Enregistrement…' : 'Enregistrer les paramètres' }}
        </button>
      </div>

      <!-- Message pour les non-admins -->
      <div class="readonly-notice" *ngIf="!isAdmin">
        <i class="bi bi-info-circle"></i>
        Ces paramètres sont en lecture seule. Contactez un administrateur pour les modifier.
      </div>

    </form>
  </ng-container>

</div>
  `,
  styles: [`
    .page {
      background: var(--color-bg);
      min-height: 100vh;
      padding: 1.5rem;
      font-family: var(--font-sans);
      box-sizing: border-box;
      max-width: 860px;
    }

    .page-head { margin-bottom: 1.5rem; }
    .page-title { font-size: 1.5rem; font-weight: 700; color: var(--color-text); margin: 0 0 .2rem; }
    .page-sub   { font-size: .82rem; color: var(--color-text-muted); margin: 0; }

    /* Card */
    .settings-card {
      background: var(--color-surface);
      border-radius: 12px;
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-xs);
      overflow: hidden;
      margin-bottom: 1rem;
    }

    .card-head {
      display: flex;
      align-items: center;
      gap: .625rem;
      padding: .75rem 1.25rem;
      font-size: .82rem;
      font-weight: 700;
      color: var(--color-text);
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
    }
    .card-head i { font-size: 1rem; color: var(--color-primary); }

    .card-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }

    /* Fields */
    .field-group {
      display: flex;
      flex-direction: column;
      gap: .375rem;
    }

    .fields-row {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }

    label {
      font-size: .8125rem;
      font-weight: 600;
      color: var(--color-text-2);
    }

    input, textarea {
      width: 100%;
      padding: .6rem .875rem;
      border: 1.5px solid var(--color-border);
      border-radius: 8px;
      font-size: .875rem;
      color: var(--color-text);
      background: var(--color-surface);
      transition: border-color .15s, box-shadow .15s;
      box-sizing: border-box;
      font-family: inherit;
    }
    input:focus, textarea:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-muted);
    }
    input:disabled, textarea:disabled {
      background: var(--color-surface-2);
      color: var(--color-text-faint);
      cursor: not-allowed;
    }
    input[readonly], textarea[readonly] {
      background: var(--color-surface-2);
      color: var(--color-text-muted);
    }
    textarea { resize: vertical; min-height: 80px; }

    .input-error {
      border-color: var(--color-danger) !important;
    }
    .error-msg {
      font-size: .75rem;
      color: var(--color-danger);
    }

    /* Toggle */
    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .toggle-info { display: flex; flex-direction: column; gap: .2rem; }
    .toggle-label { font-size: .875rem; font-weight: 600; color: var(--color-text); }
    .toggle-hint  { font-size: .8125rem; color: var(--color-text-muted); }

    .toggle-btn {
      position: relative;
      width: 48px;
      height: 26px;
      border-radius: 999px;
      background: var(--color-border);
      border: none;
      cursor: pointer;
      transition: background .2s;
      flex-shrink: 0;
      padding: 0;
    }
    .toggle-btn.active { background: var(--color-primary); }
    .toggle-btn:disabled { opacity: .55; cursor: not-allowed; }

    .toggle-knob {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--color-surface);
      box-shadow: 0 1px 3px rgba(0,0,0,.2);
      transition: transform .2s;
    }
    .toggle-btn.active .toggle-knob { transform: translateX(22px); }

    /* Actions */
    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: .5rem;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: .5rem;
      padding: .65rem 1.5rem;
      background: var(--color-primary);
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: .875rem;
      font-weight: 600;
      cursor: pointer;
      transition: background .18s;
    }
    .btn-primary:hover:not(:disabled) { background: var(--color-primary-hover); }
    .btn-primary:disabled { opacity: .55; cursor: not-allowed; }

    /* Readonly notice */
    .readonly-notice {
      display: flex;
      align-items: center;
      gap: .5rem;
      padding: .875rem 1.125rem;
      background: var(--color-info-bg);
      border: 1px solid var(--color-info);
      border-radius: 8px;
      font-size: .875rem;
      color: var(--color-info-text);
      margin-top: .5rem;
    }
    .readonly-notice i { font-size: 1rem; flex-shrink: 0; }

    /* Skeleton */
    .skel-section {
      background: var(--color-surface);
      border-radius: 12px;
      border: 1px solid var(--color-border);
      overflow: hidden;
    }
    .skel-card-head {
      height: 2.5rem;
      margin: 0;
      border-radius: 0;
    }
    .skel-fields {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: .875rem;
    }
    .skel-field {
      height: 2.5rem;
      border-radius: 8px;
    }
    .skel-pulse {
      background: linear-gradient(
        90deg,
        #f1f5f9 25%,
        #e2e8f0 50%,
        #f1f5f9 75%
      );
      background-size: 200% 100%;
      animation: skelShimmer 1.5s infinite;
    }
    @keyframes skelShimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    @media (max-width: 600px) {
      .page { padding: 1rem; }
      .fields-row { grid-template-columns: 1fr; }
      .toggle-row { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class SettingsComponent implements OnInit {

  form!: FormGroup;
  loading = true;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  get isAdmin(): boolean {
    return this.authService.currentUser?.role === 'ADMIN';
  }

  get isReadOnly(): boolean {
    return !this.isAdmin;
  }

  get emailNotificationsEnabled(): boolean {
    return this.form?.get('email_notifications_enabled')?.value === 'true';
  }

  ngOnInit(): void {
    this.settingsService.getSettings().subscribe({
      next: (settings) => {
        this.initForm(settings);
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Impossible de charger les paramètres.');
        this.loading = false;
      }
    });
  }

  private initForm(settings: AppSettings): void {
    this.form = this.fb.group({
      company_name:                 [settings.company_name ?? '', Validators.required],
      company_email:                [settings.company_email ?? '', [Validators.email]],
      company_phone:                [settings.company_phone ?? ''],
      company_address:              [settings.company_address ?? ''],
      currency:                     [settings.currency ?? 'DNT', Validators.required],
      tax_rate:                     [settings.tax_rate ?? '19', [Validators.required, Validators.min(0), Validators.max(100)]],
      invoice_prefix:               [settings.invoice_prefix ?? 'FAC', Validators.required],
      email_notifications_enabled:  [settings.email_notifications_enabled ?? 'true']
    });

    if (this.isReadOnly) {
      this.form.disable();
    }
  }

  toggleEmailNotifications(): void {
    if (this.isReadOnly) return;
    const current = this.emailNotificationsEnabled;
    this.form.patchValue({ email_notifications_enabled: current ? 'false' : 'true' });
  }

  isInvalid(controlName: string): boolean {
    const control = this.form?.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  save(): void {
    if (this.form.invalid || this.isReadOnly) return;

    this.saving = true;
    const payload = this.form.getRawValue() as AppSettings;

    this.settingsService.updateSettings(payload).subscribe({
      next: () => {
        this.saving = false;
        this.toastService.success('Paramètres enregistrés avec succès.');
      },
      error: () => {
        this.saving = false;
        this.toastService.error('Erreur lors de l\'enregistrement des paramètres.');
      }
    });
  }
}
