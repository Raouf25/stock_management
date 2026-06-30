import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="brand-panel">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
        <div class="brand-content">
          <div class="brand-logo"><i class="bi bi-shield-lock-fill"></i></div>
          <h1 class="brand-name">Bhouri Stock</h1>
          <p class="brand-tagline">Sécurisez votre compte avec<br>un mot de passe robuste</p>
          <div class="tips-section">
            <h3>Conseils de sécurité</h3>
            <div class="tip-item">
              <i class="bi bi-check-circle-fill"></i>
              <span>Minimum <strong>6 caractères</strong></span>
            </div>
            <div class="tip-item">
              <i class="bi bi-check-circle-fill"></i>
              <span>Mélangez <strong>majuscules & minuscules</strong></span>
            </div>
            <div class="tip-item">
              <i class="bi bi-check-circle-fill"></i>
              <span>Ajoutez des <strong>chiffres</strong></span>
            </div>
            <div class="tip-item">
              <i class="bi bi-check-circle-fill"></i>
              <span>Utilisez des <strong>caractères spéciaux</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div class="form-panel">
        <div class="form-card">

          <!-- Loading state -->
          <div class="state-view" *ngIf="isValidating">
            <div class="spinner"></div>
            <h2>Vérification du lien...</h2>
            <p>Veuillez patienter</p>
          </div>

          <!-- Invalid token -->
          <div class="state-view" *ngIf="!isValidating && !isValidToken && !resetSuccess">
            <div class="icon-error"><i class="bi bi-x-circle-fill"></i></div>
            <h2>Lien invalide</h2>
            <p>Ce lien de réinitialisation est invalide ou a expiré.</p>
            <a routerLink="/forgot-password" class="btn-submit">
              <i class="bi bi-arrow-counterclockwise"></i> Demander un nouveau lien
            </a>
          </div>

          <!-- Reset form -->
          <ng-container *ngIf="!isValidating && isValidToken && !resetSuccess">
            <div class="form-header">
              <div class="form-icon"><i class="bi bi-lock-fill"></i></div>
              <h2>Nouveau mot de passe</h2>
              <p>Choisissez un mot de passe sécurisé</p>
            </div>

            <div class="alert alert-error" *ngIf="errorMessage">
              <i class="bi bi-exclamation-circle-fill"></i>
              <span>{{ errorMessage }}</span>
            </div>

            <form (ngSubmit)="onSubmit()" autocomplete="on">
              <div class="form-field">
                <label for="new-pwd">
                  <i class="bi bi-lock"></i> Nouveau mot de passe
                </label>
                <div class="password-wrapper">
                  <input
                    id="new-pwd"
                    [type]="showPassword ? 'text' : 'password'"
                    [(ngModel)]="newPassword"
                    name="newPassword"
                    placeholder="Minimum 6 caractères"
                    autocomplete="new-password"
                    required minlength="6">
                  <button type="button" class="btn-eye" (click)="showPassword = !showPassword" tabindex="-1">
                    <i class="bi" [class.bi-eye]="!showPassword" [class.bi-eye-slash]="showPassword"></i>
                  </button>
                </div>
                <div class="password-strength" *ngIf="newPassword">
                  <div class="strength-bar">
                    <div class="strength-fill" [style.width.%]="passwordStrength"
                         [class.weak]="passwordStrength < 40"
                         [class.medium]="passwordStrength >= 40 && passwordStrength < 70"
                         [class.strong]="passwordStrength >= 70"></div>
                  </div>
                  <span class="strength-label"
                        [class.weak]="passwordStrength < 40"
                        [class.medium]="passwordStrength >= 40 && passwordStrength < 70"
                        [class.strong]="passwordStrength >= 70">
                    {{ strengthLabel }}
                  </span>
                </div>
              </div>

              <div class="form-field">
                <label for="confirm-pwd">
                  <i class="bi bi-lock-fill"></i> Confirmer le mot de passe
                </label>
                <input
                  id="confirm-pwd"
                  [type]="showPassword ? 'text' : 'password'"
                  [(ngModel)]="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirmez le mot de passe"
                  autocomplete="new-password"
                  required>
                <span class="match-indicator" *ngIf="confirmPassword.length > 0">
                  <i class="bi"
                     [class.bi-check-circle-fill]="newPassword === confirmPassword"
                     [class.bi-x-circle-fill]="newPassword !== confirmPassword"
                     [class.text-success]="newPassword === confirmPassword"
                     [class.text-danger]="newPassword !== confirmPassword"></i>
                  {{ newPassword === confirmPassword ? 'Mots de passe identiques' : 'Mots de passe différents' }}
                </span>
              </div>

              <button type="submit" class="btn-submit" [disabled]="isLoading || !canSubmit">
                <i class="bi" [class.bi-check-lg]="!isLoading" [class.bi-arrow-repeat]="isLoading"
                   [class.spin]="isLoading"></i>
                {{ isLoading ? 'Modification...' : 'Changer le mot de passe' }}
              </button>
            </form>
          </ng-container>

          <!-- Success state -->
          <div class="state-view" *ngIf="resetSuccess">
            <div class="icon-success"><i class="bi bi-check-circle-fill"></i></div>
            <h2>Mot de passe modifié !</h2>
            <p>Votre mot de passe a été réinitialisé avec succès.</p>
            <a routerLink="/login" class="btn-submit btn-submit--success">
              <i class="bi bi-box-arrow-in-right"></i> Se connecter
            </a>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { display: flex; min-height: 100vh; width: 100vw; position: fixed; inset: 0; }

    /* Brand panel */
    .brand-panel {
      flex: 1;
      background: linear-gradient(150deg, var(--color-primary-hover) 0%, #6d28d9 50%, #7c3aed 100%);
      display: flex; align-items: center; justify-content: center;
      padding: 3rem 2.5rem; position: relative; overflow: hidden;
    }
    .blob { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.06); }
    .blob-1 { width: 280px; height: 280px; top: -50px; left: -50px; animation: float 8s ease-in-out infinite; }
    .blob-2 { width: 200px; height: 200px; bottom: -40px; right: -20px; animation: float 10s ease-in-out infinite reverse; }
    @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-16px); } }
    .brand-content { position: relative; z-index: 1; max-width: 380px; }
    .brand-logo {
      width: 64px; height: 64px;
      background: rgba(255,255,255,0.15); border: 2px solid rgba(255,255,255,0.25);
      border-radius: 1.25rem; display: flex; align-items: center; justify-content: center;
      font-size: 1.875rem; color: white; margin-bottom: 1.25rem;
    }
    .brand-name { font-size: 2.25rem; font-weight: 800; color: white; margin: 0 0 0.625rem; letter-spacing: -0.03em; }
    .brand-tagline { font-size: 1rem; color: rgba(255,255,255,0.72); line-height: 1.65; margin: 0 0 2rem; }
    .tips-section h3 {
      font-size: 0.875rem; font-weight: 700; color: rgba(255,255,255,0.9);
      text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 1rem;
    }
    .tip-item {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.75rem 1rem; background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12); border-radius: 0.625rem;
      margin-bottom: 0.625rem; font-size: 0.8125rem; color: rgba(255,255,255,0.85);
    }
    .tip-item i { color: rgba(255,255,255,0.5); flex-shrink: 0; font-size: 0.875rem; }

    /* Form panel */
    .form-panel {
      width: 480px; min-width: 320px; background: #f8f9fb;
      display: flex; align-items: center; justify-content: center;
      padding: 2rem 1.5rem; overflow-y: auto;
    }
    .form-card {
      width: 100%; max-width: 400px; background: white; border-radius: 1.25rem;
      padding: 2.25rem 2rem;
      box-shadow: 0 4px 32px rgba(67,56,202,0.10), 0 1px 4px rgba(0,0,0,0.06);
      animation: slideUp 0.3s ease-out;
    }
    @keyframes slideUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }

    /* States */
    .state-view { text-align: center; }
    .spinner {
      width: 48px; height: 48px; border: 4px solid var(--color-border); border-top-color: #6d28d9;
      border-radius: 50%; margin: 0 auto 1.25rem; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .icon-error {
      width: 64px; height: 64px; margin: 0 auto 1.25rem;
      background: linear-gradient(135deg, var(--color-danger), var(--color-danger)); border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.75rem; color: white;
      box-shadow: 0 4px 16px rgba(239,68,68,0.35);
    }
    .icon-success {
      width: 64px; height: 64px; margin: 0 auto 1.25rem;
      background: linear-gradient(135deg, var(--color-success), var(--color-success)); border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.75rem; color: white;
      box-shadow: 0 4px 16px rgba(34,197,94,0.35);
      animation: popIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
    }
    @keyframes popIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .state-view h2 { font-size: 1.375rem; font-weight: 700; color: var(--color-text); margin: 0 0 0.625rem; }
    .state-view p { font-size: 0.875rem; color: var(--color-text-muted); margin: 0 0 1.5rem; }

    /* Form header */
    .form-header { text-align: center; margin-bottom: 1.75rem; }
    .form-icon {
      width: 52px; height: 52px;
      background: linear-gradient(135deg, var(--color-primary-hover), #7c3aed); border-radius: 1rem;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; color: white; margin: 0 auto 1rem;
    }
    .form-header h2 { font-size: 1.375rem; font-weight: 700; color: var(--color-text); margin: 0 0 0.375rem; }
    .form-header p { font-size: 0.875rem; color: var(--color-text-muted); margin: 0; }

    /* Alert */
    .alert {
      display: flex; align-items: flex-start; gap: 0.625rem;
      padding: 0.75rem 1rem; border-radius: 0.625rem;
      margin-bottom: 1.25rem; font-size: 0.875rem;
    }
    .alert-error { background: var(--color-danger-bg); color: var(--color-danger-text); border: 1px solid #fecaca; }

    /* Form */
    .form-field { display: flex; flex-direction: column; gap: 0.375rem; margin-bottom: 1rem; }
    .form-field label {
      font-size: 0.8125rem; font-weight: 600; color: var(--color-text-2);
      display: flex; align-items: center; gap: 0.375rem;
    }
    .form-field label i { color: #6d28d9; }
    .form-field input {
      width: 100%; padding: 0.6875rem 0.875rem;
      border: 1.5px solid var(--color-border); border-radius: 0.625rem;
      font-size: 0.9375rem; color: var(--color-text); transition: all 0.18s ease; box-sizing: border-box;
    }
    .form-field input:focus { outline: none; border-color: #6d28d9; box-shadow: 0 0 0 3px rgba(109,40,217,0.1); }
    .password-wrapper { position: relative; }
    .password-wrapper input { padding-right: 2.75rem; }
    .btn-eye {
      position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%);
      background: none; border: none; color: var(--color-text-faint); cursor: pointer;
      padding: 0.25rem; font-size: 1rem; transition: color 0.15s ease;
    }
    .btn-eye:hover { color: #6d28d9; }

    /* Password strength */
    .password-strength { display: flex; align-items: center; gap: 0.625rem; margin-top: 0.375rem; }
    .strength-bar { flex: 1; height: 4px; background: var(--color-border); border-radius: 2px; overflow: hidden; }
    .strength-fill { height: 100%; border-radius: 2px; transition: width 0.3s ease, background 0.3s ease; }
    .strength-fill.weak { background: var(--color-danger); }
    .strength-fill.medium { background: var(--color-warning); }
    .strength-fill.strong { background: var(--color-success); }
    .strength-label { font-size: 0.75rem; font-weight: 600; white-space: nowrap; }
    .strength-label.weak { color: var(--color-danger); }
    .strength-label.medium { color: var(--color-warning); }
    .strength-label.strong { color: var(--color-success); }

    /* Match indicator */
    .match-indicator {
      font-size: 0.75rem; display: flex; align-items: center; gap: 0.3rem; margin-top: 0.25rem;
    }
    .text-success { color: var(--color-success); }
    .text-danger { color: var(--color-danger); }

    /* Buttons */
    .btn-submit {
      width: 100%; padding: 0.8125rem 1rem;
      background: linear-gradient(135deg, var(--color-primary-hover), #7c3aed);
      color: white; border: none; border-radius: 0.75rem;
      font-size: 0.9375rem; font-weight: 600; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      transition: all 0.2s ease; box-shadow: 0 2px 12px rgba(109,40,217,0.3);
      text-decoration: none;
    }
    .btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(109,40,217,0.4); }
    .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
    .btn-submit--success { background: linear-gradient(135deg, var(--color-success), var(--color-success)); box-shadow: 0 2px 12px rgba(34,197,94,0.3); }
    .btn-submit--success:hover { box-shadow: 0 6px 20px rgba(34,197,94,0.4); }

    /* Responsive */
    @media (max-width: 900px) {
      .brand-panel { display: none; }
      .form-panel { width: 100%; background: linear-gradient(150deg, var(--color-primary-hover), #7c3aed); }
    }
    @media (max-width: 480px) {
      .form-panel { padding: 1.25rem 1rem; padding-top: 3rem; align-items: flex-start; }
      .form-card { padding: 1.75rem 1.25rem; }
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  newPassword = '';
  confirmPassword = '';
  showPassword = false;
  isLoading = false;
  isValidating = true;
  isValidToken = false;
  resetSuccess = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      if (this.token) this.validateToken();
      else this.isValidating = false;
    });
  }

  validateToken(): void {
    this.authService.validateResetToken(this.token).subscribe({
      next:  (res) => { this.isValidating = false; this.isValidToken = res.success; },
      error: ()    => { this.isValidating = false; this.isValidToken = false; }
    });
  }

  get passwordStrength(): number {
    const pwd = this.newPassword;
    let strength = 0;
    if (pwd.length >= 6)  strength += 25;
    if (pwd.length >= 10) strength += 15;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 20;
    if (/\d/.test(pwd)) strength += 20;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength += 20;
    return Math.min(strength, 100);
  }

  get strengthLabel(): string {
    if (this.passwordStrength < 40) return 'Faible';
    if (this.passwordStrength < 70) return 'Moyen';
    return 'Fort';
  }

  get canSubmit(): boolean {
    return this.newPassword.length >= 6 && this.newPassword === this.confirmPassword;
  }

  onSubmit(): void {
    this.errorMessage = '';
    if (!this.canSubmit) return;

    this.isLoading = true;
    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) this.resetSuccess = true;
        else this.errorMessage = res.message;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la réinitialisation';
      }
    });
  }
}
