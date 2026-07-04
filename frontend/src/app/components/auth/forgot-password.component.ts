import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">

      <!-- Right panel — form -->
      <div class="form-panel">
        <div class="form-card">

          <!-- ── FORM STATE ── -->
          <ng-container *ngIf="!emailSent">
            <div class="form-header">
              <div class="form-icon"><i class="bi bi-key-fill"></i></div>
              <h2>Mot de passe oublié ?</h2>
              <p>Entrez votre email pour recevoir un lien de réinitialisation</p>
            </div>

            <div class="alert alert-error" *ngIf="errorMessage">
              <i class="bi bi-exclamation-circle-fill"></i>
              <span>{{ errorMessage }}</span>
            </div>

            <form (ngSubmit)="onSubmit()" autocomplete="on">
              <div class="form-field">
                <label for="fp-email">
                  <i class="bi bi-envelope"></i> Email
                </label>
                <input
                  id="fp-email"
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  placeholder="votre@email.com"
                  autocomplete="email"
                  required>
              </div>

              <button type="submit" class="btn-submit" [disabled]="isLoading">
                <i class="bi" [class.bi-send-fill]="!isLoading" [class.bi-arrow-repeat]="isLoading"
                   [class.spin]="isLoading"></i>
                {{ isLoading ? 'Envoi en cours...' : 'Envoyer le lien' }}
              </button>
            </form>
          </ng-container>

          <!-- ── SUCCESS STATE ── -->
          <ng-container *ngIf="emailSent">
            <div class="success-view">
              <div class="success-icon-wrap">
                <i class="bi bi-envelope-check-fill"></i>
              </div>
              <h2>Email envoyé !</h2>
              <p class="success-desc">
                Si un compte existe avec l'adresse <strong>{{ email }}</strong>,
                vous recevrez un lien de réinitialisation dans quelques instants.
              </p>

              <div class="info-cards">
                <div class="info-card">
                  <i class="bi bi-inbox"></i>
                  <span>Vérifiez aussi votre dossier <strong>Spam</strong></span>
                </div>
                <div class="info-card">
                  <i class="bi bi-clock"></i>
                  <span>Le lien expire dans <strong>1 heure</strong></span>
                </div>
                <div class="info-card resend-badge">
                  <i class="bi bi-send"></i>
                  <span>Envoyé via <strong>Resend</strong></span>
                </div>
              </div>

              <button class="btn-secondary" (click)="resetForm()" type="button">
                <i class="bi bi-arrow-counterclockwise"></i> Renvoyer un email
              </button>
            </div>
          </ng-container>

          <!-- Back link -->
          <p class="back-link">
            <a routerLink="/login">
              <i class="bi bi-arrow-left"></i> Retour à la connexion
            </a>
          </p>

        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; flex: 1; }

    .auth-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }

    /* ── Brand panel ── */
    .brand-panel {
      flex: 1;
      background: linear-gradient(150deg, #1f235e 0%, #262261 45%, #101336 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem 2.5rem;
      position: relative;
      overflow: hidden;
    }
    .blob {
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.06);
    }
    .blob-1 { width: 300px; height: 300px; top: -60px; left: -60px; animation: float 8s ease-in-out infinite; }
    .blob-2 { width: 220px; height: 220px; bottom: -50px; right: -30px; animation: float 10s ease-in-out infinite reverse; }
    @keyframes float {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-18px); }
    }
    .brand-content { position: relative; z-index: 1; max-width: 400px; }
    .brand-logo {
      width: 64px; height: 64px;
      background: rgba(255,255,255,0.15);
      border: 2px solid rgba(255,255,255,0.25);
      border-radius: 1.25rem;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.875rem; color: white;
      margin-bottom: 1.25rem;
    }
    .brand-name  { font-size: 2.25rem; font-weight: 800; color: white; margin: 0 0 0.625rem; letter-spacing: -0.03em; }
    .brand-tagline { font-size: 1rem; color: rgba(255,255,255,0.72); line-height: 1.65; margin: 0 0 2rem; }

    .steps { display: flex; flex-direction: column; gap: 1rem; }
    .step-item {
      display: flex; align-items: flex-start; gap: 1rem;
      padding: 0.875rem 1.125rem;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 0.75rem;
    }
    .step-num {
      width: 1.75rem; height: 1.75rem; flex-shrink: 0;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.8125rem; font-weight: 700; color: white;
    }
    .step-text { display: flex; flex-direction: column; gap: 0.125rem; }
    .step-text strong { font-size: 0.875rem; font-weight: 600; color: white; }
    .step-text span   { font-size: 0.8125rem; color: rgba(255,255,255,0.6); }

    /* ── Form panel ── */
    .form-panel { display: contents; }
    .form-card {
      width: 100%; max-width: 400px;
      background: var(--glass-bg-strong);
      backdrop-filter: blur(30px) saturate(180%);
      -webkit-backdrop-filter: blur(30px) saturate(180%);
      border: 1px solid var(--glass-border);
      border-radius: 1.625rem;
      padding: 2.25rem 2rem;
      box-shadow: 0 24px 70px -24px rgba(49,46,129,0.45);
      animation: slideUp 0.3s ease-out;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .form-header { text-align: center; margin-bottom: 1.75rem; }
    .form-icon {
      width: 52px; height: 52px;
      background: var(--color-primary);
      border-radius: 1rem;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; color: white;
      margin: 0 auto 1rem;
    }
    .form-header h2 { font-size: 1.375rem; font-weight: 700; color: var(--color-text); margin: 0 0 0.375rem; }
    .form-header p  { font-size: 0.875rem; color: var(--color-text-muted); margin: 0; line-height: 1.5; }

    /* Alert */
    .alert {
      display: flex; align-items: flex-start; gap: 0.625rem;
      padding: 0.75rem 1rem; border-radius: 0.625rem;
      margin-bottom: 1.25rem; font-size: 0.875rem;
    }
    .alert-error { background: var(--color-danger-bg); color: var(--color-danger-text); border: 1px solid #fecaca; }

    /* Form field */
    .form-field { display: flex; flex-direction: column; gap: 0.375rem; margin-bottom: 1rem; }
    .form-field label {
      font-size: 0.8125rem; font-weight: 600; color: var(--color-text-2);
      display: flex; align-items: center; gap: 0.375rem;
    }
    .form-field label i { color: var(--color-primary); }
    .form-field input {
      width: 100%; padding: 0.6875rem 0.875rem;
      border: 1.5px solid var(--color-border); border-radius: 0.625rem;
      font-size: 0.9375rem; color: var(--color-text);
      transition: all 0.18s ease; box-sizing: border-box;
    }
    .form-field input:focus {
      outline: none; border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-soft);
    }

    /* Buttons */
    .btn-submit {
      width: 100%; padding: 0.8125rem 1rem;
      background: var(--color-primary);
      color: white; border: none; border-radius: 0.75rem;
      font-size: 0.9375rem; font-weight: 600; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      transition: all 0.2s ease; margin-bottom: 0.5rem;
      box-shadow: 0 8px 20px -6px var(--color-primary-glow);
    }
    .btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 12px 26px -8px var(--color-primary-glow); }
    .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
    .btn-secondary {
      width: 100%; padding: 0.75rem 1rem;
      background: var(--color-surface-2); color: var(--color-text-2);
      border: none; border-radius: 0.75rem;
      font-size: 0.875rem; font-weight: 600; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      transition: background 0.15s ease;
    }
    .btn-secondary:hover { background: var(--color-border); }

    /* Success state */
    .success-view { text-align: center; }
    .success-icon-wrap {
      width: 64px; height: 64px;
      background: linear-gradient(135deg, var(--color-success), var(--color-success));
      border-radius: 50%; margin: 0 auto 1.25rem;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.75rem; color: white;
      box-shadow: 0 4px 16px rgba(34,197,94,0.35);
      animation: popIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
    }
    @keyframes popIn {
      from { transform: scale(0.5); opacity: 0; }
      to   { transform: scale(1);   opacity: 1; }
    }
    .success-view h2 { font-size: 1.375rem; font-weight: 700; color: var(--color-text); margin: 0 0 0.75rem; }
    .success-desc { font-size: 0.875rem; color: var(--color-text-muted); line-height: 1.65; margin: 0 0 1.5rem; }
    .info-cards { display: flex; flex-direction: column; gap: 0.625rem; margin-bottom: 1.5rem; }
    .info-card {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.75rem 1rem; background: var(--color-bg);
      border: 1px solid var(--color-border); border-radius: 0.625rem;
      font-size: 0.8125rem; color: var(--color-text-2); text-align: left;
    }
    .info-card i { color: var(--color-primary); font-size: 1rem; flex-shrink: 0; }
    .info-card.resend-badge { background: #f0fdf4; border-color: #bbf7d0; }
    .info-card.resend-badge i { color: var(--color-success); }

    /* Back link */
    .back-link { text-align: center; margin-top: 1.25rem; padding-top: 1.25rem; border-top: 1px solid var(--color-border); }
    .back-link a {
      color: var(--color-primary); text-decoration: none; font-size: 0.875rem; font-weight: 500;
      display: inline-flex; align-items: center; gap: 0.375rem;
      transition: color 0.15s ease;
    }
    .back-link a:hover { color: var(--color-primary-hover); text-decoration: underline; }

    /* Spinner */
    .spin { animation: spin 0.8s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Responsive */
    @media (max-width: 900px) {
      .brand-panel { display: none; }
      .form-panel  { width: 100%; background: transparent; }
    }
    @media (max-width: 480px) {
      .form-panel { padding: 1.25rem 1rem; padding-top: 3rem; align-items: flex-start; }
      .form-card  { padding: 1.75rem 1.25rem; }
    }
  `]
})
export class ForgotPasswordComponent {
  email = '';
  isLoading = false;
  emailSent = false;
  errorMessage = '';

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    this.errorMessage = '';
    if (!this.email) { this.errorMessage = 'Veuillez entrer votre email'; return; }

    this.isLoading = true;
    this.authService.forgotPassword(this.email).subscribe({
      next:  () => { this.isLoading = false; this.emailSent = true; },
      error: () => { this.isLoading = false; this.emailSent = true; } // anti-enumeration
    });
  }

  resetForm(): void {
    this.emailSent = false;
    this.email = '';
    this.errorMessage = '';
  }
}
