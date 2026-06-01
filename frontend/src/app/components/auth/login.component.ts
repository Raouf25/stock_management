import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type TabType = 'login' | 'register';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">

      <!-- ══════════════════════════════
           LEFT PANEL — Branding
      ══════════════════════════════ -->
      <div class="brand-panel">
        <!-- Decorative blobs -->
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
        <div class="blob blob-3"></div>

        <div class="brand-content">
          <div class="brand-logo">
            <i class="bi bi-box-seam-fill"></i>
          </div>
          <h1 class="brand-name">Stock ERP</h1>
          <p class="brand-tagline">Gérez votre inventaire<br>avec précision et efficacité</p>

          <div class="brand-features">
            <div class="feature-item">
              <div class="feature-icon"><i class="bi bi-graph-up-arrow"></i></div>
              <div class="feature-text">
                <strong>Tableau de bord analytique</strong>
                <span>Visualisez vos KPIs en temps réel</span>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon"><i class="bi bi-receipt"></i></div>
              <div class="feature-text">
                <strong>Facturation & BL</strong>
                <span>Créez et gérez vos documents</span>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon"><i class="bi bi-boxes"></i></div>
              <div class="feature-text">
                <strong>Gestion des stocks</strong>
                <span>Suivez vos mouvements d'inventaire</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════
           RIGHT PANEL — Form
      ══════════════════════════════ -->
      <div class="form-panel">
        <div class="form-card">

          <!-- Header -->
          <div class="form-header">
            <div class="form-logo-sm">
              <i class="bi bi-box-seam-fill"></i>
            </div>
            <h2>{{ activeTab === 'login' ? 'Bienvenue !' : 'Créer un compte' }}</h2>
            <p>{{ activeTab === 'login' ? 'Connectez-vous à votre espace' : 'Rejoignez Stock ERP' }}</p>
          </div>

          <!-- Tabs -->
          <div class="tabs">
            <button [class.active]="activeTab === 'login'" (click)="switchTab('login')" type="button">
              <i class="bi bi-box-arrow-in-right"></i>
              Connexion
            </button>
            <button [class.active]="activeTab === 'register'" (click)="switchTab('register')" type="button">
              <i class="bi bi-person-plus"></i>
              Inscription
            </button>
          </div>

          <!-- Alert messages -->
          <div class="alert alert-error" *ngIf="errorMessage">
            <i class="bi bi-exclamation-circle-fill"></i>
            <span>{{ errorMessage }}</span>
          </div>
          <div class="alert alert-success" *ngIf="successMessage">
            <i class="bi bi-check-circle-fill"></i>
            <span>{{ successMessage }}</span>
          </div>

          <!-- ── LOGIN FORM ── -->
          <form *ngIf="activeTab === 'login'" (ngSubmit)="onLogin()" class="auth-form" autocomplete="on">

            <div class="form-field">
              <label for="login-email">
                <i class="bi bi-envelope"></i> Email
              </label>
              <input
                id="login-email"
                type="email"
                [(ngModel)]="loginForm.email"
                name="email"
                placeholder="votre@email.com"
                autocomplete="email"
                required>
            </div>

            <div class="form-field">
              <label for="login-password">
                <i class="bi bi-lock"></i> Mot de passe
              </label>
              <div class="password-wrapper">
                <input
                  id="login-password"
                  [type]="showPassword ? 'text' : 'password'"
                  [(ngModel)]="loginForm.password"
                  name="password"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  required>
                <button type="button" class="btn-eye" (click)="showPassword = !showPassword" tabindex="-1">
                  <i class="bi" [class.bi-eye]="!showPassword" [class.bi-eye-slash]="showPassword"></i>
                </button>
              </div>
            </div>

            <div class="forgot-row">
              <a routerLink="/forgot-password" class="forgot-link">Mot de passe oublié ?</a>
            </div>

            <button type="submit" class="btn-submit" [disabled]="isLoading">
              <span class="btn-spinner" *ngIf="isLoading">
                <i class="bi bi-arrow-repeat spin"></i>
              </span>
              <span *ngIf="!isLoading">
                <i class="bi bi-box-arrow-in-right"></i>
                Se connecter
              </span>
              <span *ngIf="isLoading">Connexion en cours...</span>
            </button>

          </form>

          <!-- ── REGISTER FORM ── -->
          <form *ngIf="activeTab === 'register'" (ngSubmit)="onRegister()" class="auth-form" autocomplete="on">

            <div class="form-field">
              <label for="reg-name">
                <i class="bi bi-person"></i> Nom complet
              </label>
              <input
                id="reg-name"
                type="text"
                [(ngModel)]="registerForm.name"
                name="name"
                placeholder="Votre nom"
                autocomplete="name"
                required minlength="2">
            </div>

            <div class="form-field">
              <label for="reg-email">
                <i class="bi bi-envelope"></i> Email
              </label>
              <input
                id="reg-email"
                type="email"
                [(ngModel)]="registerForm.email"
                name="email"
                placeholder="votre@email.com"
                autocomplete="email"
                required>
            </div>

            <div class="form-field">
              <label for="reg-password">
                <i class="bi bi-lock"></i> Mot de passe
              </label>
              <div class="password-wrapper">
                <input
                  id="reg-password"
                  [type]="showPassword ? 'text' : 'password'"
                  [(ngModel)]="registerForm.password"
                  name="password"
                  placeholder="Minimum 6 caractères"
                  autocomplete="new-password"
                  required minlength="6">
                <button type="button" class="btn-eye" (click)="showPassword = !showPassword" tabindex="-1">
                  <i class="bi" [class.bi-eye]="!showPassword" [class.bi-eye-slash]="showPassword"></i>
                </button>
              </div>
              <!-- Password strength -->
              <div class="password-strength" *ngIf="registerForm.password.length > 0">
                <div class="strength-bar">
                  <div class="strength-fill" [style.width.%]="getPasswordStrength()" [class]="getPasswordStrengthClass()"></div>
                </div>
                <span class="strength-label" [class]="getPasswordStrengthClass()">{{ getPasswordStrengthLabel() }}</span>
              </div>
            </div>

            <div class="form-field">
              <label for="reg-confirm">
                <i class="bi bi-lock-fill"></i> Confirmer le mot de passe
              </label>
              <input
                id="reg-confirm"
                [type]="showPassword ? 'text' : 'password'"
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                placeholder="Confirmez le mot de passe"
                autocomplete="new-password"
                required>
              <span class="match-indicator" *ngIf="confirmPassword.length > 0">
                <i class="bi" [class.bi-check-circle-fill]="registerForm.password === confirmPassword"
                              [class.bi-x-circle-fill]="registerForm.password !== confirmPassword"
                              [class.text-success]="registerForm.password === confirmPassword"
                              [class.text-danger]="registerForm.password !== confirmPassword"></i>
                {{ registerForm.password === confirmPassword ? 'Mots de passe identiques' : 'Mots de passe différents' }}
              </span>
            </div>

            <button type="submit" class="btn-submit" [disabled]="isLoading">
              <span *ngIf="isLoading"><i class="bi bi-arrow-repeat spin"></i> Inscription...</span>
              <span *ngIf="!isLoading"><i class="bi bi-person-check"></i> Créer mon compte</span>
            </button>

          </form>

          <!-- Footer -->
          <p class="form-footer">
            <span *ngIf="activeTab === 'login'">
              Pas encore de compte ?
              <a (click)="switchTab('register')" class="switch-link">S'inscrire</a>
            </span>
            <span *ngIf="activeTab === 'register'">
              Déjà un compte ?
              <a (click)="switchTab('login')" class="switch-link">Se connecter</a>
            </span>
          </p>

        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ══════════════════════════════════════════
       PAGE LAYOUT
    ══════════════════════════════════════════ */
    .auth-page {
      display: flex;
      min-height: 100vh;
      width: 100vw;
      position: fixed;
      inset: 0;
      z-index: 0;
    }

    /* ══════════════════════════════════════════
       LEFT — BRAND PANEL
    ══════════════════════════════════════════ */
    .brand-panel {
      flex: 1;
      background: linear-gradient(150deg, #4338ca 0%, #6d28d9 50%, #7c3aed 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem 2.5rem;
      position: relative;
      overflow: hidden;
    }

    /* Decorative blobs */
    .blob {
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.06);
    }
    .blob-1 { width: 320px; height: 320px; top: -80px; left: -80px; animation: float 8s ease-in-out infinite; }
    .blob-2 { width: 240px; height: 240px; bottom: -60px; right: -40px; animation: float 10s ease-in-out infinite reverse; }
    .blob-3 { width: 160px; height: 160px; top: 40%; left: 60%; animation: float 7s ease-in-out infinite 2s; }

    @keyframes float {
      0%, 100% { transform: translateY(0) scale(1); }
      50%       { transform: translateY(-20px) scale(1.04); }
    }

    .brand-content {
      position: relative;
      z-index: 1;
      max-width: 420px;
      text-align: left;
    }

    .brand-logo {
      width: 72px;
      height: 72px;
      background: rgba(255,255,255,0.15);
      border: 2px solid rgba(255,255,255,0.25);
      border-radius: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      color: white;
      margin-bottom: 1.5rem;
      backdrop-filter: blur(10px);
    }

    .brand-name {
      font-size: 2.5rem;
      font-weight: 800;
      color: white;
      margin: 0 0 0.75rem;
      letter-spacing: -0.03em;
    }

    .brand-tagline {
      font-size: 1.0625rem;
      color: rgba(255,255,255,0.75);
      line-height: 1.65;
      margin: 0 0 2.5rem;
    }

    .brand-features { display: flex; flex-direction: column; gap: 1.25rem; }

    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 0.875rem;
      backdrop-filter: blur(6px);
      transition: background 0.2s ease;
    }
    .feature-item:hover { background: rgba(255,255,255,0.13); }

    .feature-icon {
      width: 2.25rem;
      height: 2.25rem;
      background: rgba(255,255,255,0.15);
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.0625rem;
      color: white;
      flex-shrink: 0;
    }

    .feature-text { display: flex; flex-direction: column; gap: 0.125rem; }
    .feature-text strong { font-size: 0.875rem; font-weight: 600; color: white; }
    .feature-text span   { font-size: 0.8125rem; color: rgba(255,255,255,0.6); }

    /* ══════════════════════════════════════════
       RIGHT — FORM PANEL
    ══════════════════════════════════════════ */
    .form-panel {
      width: 480px;
      min-width: 320px;
      background: #f8f9fb;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1.5rem;
      overflow-y: auto;
    }

    .form-card {
      width: 100%;
      max-width: 400px;
      background: white;
      border-radius: 1.25rem;
      padding: 2.25rem 2rem;
      box-shadow: 0 4px 32px rgba(67,56,202,0.10), 0 1px 4px rgba(0,0,0,0.06);
      animation: slideUp 0.35s ease-out;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Form header */
    .form-header { text-align: center; margin-bottom: 1.5rem; }

    .form-logo-sm {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #4338ca, #7c3aed);
      border-radius: 0.875rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.375rem;
      color: white;
      margin: 0 auto 0.875rem;
    }

    .form-header h2 {
      font-size: 1.375rem;
      font-weight: 700;
      color: #111827;
      margin: 0 0 0.25rem;
    }

    .form-header p {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0;
    }

    /* Tabs */
    .tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      background: #f3f4f6;
      padding: 0.25rem;
      border-radius: 0.75rem;
    }

    .tabs button {
      flex: 1;
      padding: 0.625rem 0.75rem;
      border: none;
      background: transparent;
      border-radius: 0.5625rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
    }
    .tabs button:hover:not(.active) { color: #374151; }
    .tabs button.active {
      background: white;
      color: #4338ca;
      font-weight: 600;
      box-shadow: 0 1px 4px rgba(0,0,0,0.1);
    }

    /* Alerts */
    .alert {
      display: flex;
      align-items: flex-start;
      gap: 0.625rem;
      padding: 0.75rem 1rem;
      border-radius: 0.625rem;
      margin-bottom: 1.25rem;
      font-size: 0.875rem;
      line-height: 1.5;
    }
    .alert i { flex-shrink: 0; font-size: 1rem; margin-top: 0.0625rem; }
    .alert-error   { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
    .alert-success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }

    /* Form */
    .auth-form { display: flex; flex-direction: column; gap: 1rem; }

    .form-field { display: flex; flex-direction: column; gap: 0.375rem; }

    .form-field label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: #374151;
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }
    .form-field label i { color: #6d28d9; font-size: 0.875rem; }

    .form-field input {
      width: 100%;
      padding: 0.6875rem 0.875rem;
      border: 1.5px solid #e5e7eb;
      border-radius: 0.625rem;
      font-size: 0.9375rem;
      color: #111827;
      background: white;
      transition: all 0.18s ease;
      box-sizing: border-box;
    }
    .form-field input::placeholder { color: #9ca3af; }
    .form-field input:focus {
      outline: none;
      border-color: #6d28d9;
      box-shadow: 0 0 0 3px rgba(109,40,217,0.1);
    }

    /* Password */
    .password-wrapper { position: relative; }
    .password-wrapper input { padding-right: 2.75rem; }
    .btn-eye {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      padding: 0.25rem;
      font-size: 1rem;
      transition: color 0.15s ease;
    }
    .btn-eye:hover { color: #6d28d9; }

    /* Password strength */
    .password-strength {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      margin-top: 0.25rem;
    }
    .strength-bar {
      flex: 1;
      height: 4px;
      background: #e5e7eb;
      border-radius: 2px;
      overflow: hidden;
    }
    .strength-fill {
      height: 100%;
      border-radius: 2px;
      transition: width 0.3s ease, background 0.3s ease;
    }
    .strength-fill.weak   { background: #ef4444; }
    .strength-fill.medium { background: #f59e0b; }
    .strength-fill.strong { background: #22c55e; }
    .strength-label { font-size: 0.75rem; font-weight: 600; white-space: nowrap; }
    .strength-label.weak   { color: #ef4444; }
    .strength-label.medium { color: #f59e0b; }
    .strength-label.strong { color: #22c55e; }

    /* Match indicator */
    .match-indicator {
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      margin-top: 0.25rem;
    }
    .text-success { color: #16a34a; }
    .text-danger  { color: #dc2626; }

    /* Forgot link */
    .forgot-row { text-align: right; margin-top: -0.25rem; }
    .forgot-link {
      font-size: 0.8125rem;
      color: #6d28d9;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.15s ease;
    }
    .forgot-link:hover { color: #4338ca; text-decoration: underline; }

    /* Submit button */
    .btn-submit {
      width: 100%;
      padding: 0.8125rem 1rem;
      background: linear-gradient(135deg, #4338ca, #7c3aed);
      color: white;
      border: none;
      border-radius: 0.75rem;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
      margin-top: 0.25rem;
      box-shadow: 0 2px 12px rgba(109,40,217,0.3);
    }
    .btn-submit:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(109,40,217,0.4);
    }
    .btn-submit:active:not(:disabled) { transform: translateY(0); }
    .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

    /* Footer */
    .form-footer {
      text-align: center;
      margin-top: 1.25rem;
      margin-bottom: 0;
      font-size: 0.875rem;
      color: #6b7280;
    }
    .switch-link {
      color: #6d28d9;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      margin-left: 0.25rem;
    }
    .switch-link:hover { text-decoration: underline; }

    /* Spinner */
    .spin { animation: spin 0.8s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ══════════════════════════════════════════
       RESPONSIVE
    ══════════════════════════════════════════ */
    @media (max-width: 900px) {
      .brand-panel { display: none; }
      .form-panel  { width: 100%; background: linear-gradient(150deg, #4338ca 0%, #7c3aed 100%); }
      .form-card   { box-shadow: 0 8px 40px rgba(0,0,0,0.2); }
    }
    @media (max-width: 480px) {
      .form-panel  { padding: 1.25rem 1rem; align-items: flex-start; padding-top: 3rem; }
      .form-card   { padding: 1.75rem 1.25rem; border-radius: 1rem; }
    }
  `]
})
export class LoginComponent {
  activeTab: TabType = 'login';
  isLoading = false;
  showPassword = false;
  errorMessage = '';
  successMessage = '';

  loginForm = { email: '', password: '' };
  registerForm = { name: '', email: '', password: '' };
  confirmPassword = '';

  private returnUrl = '/dashboard';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/dashboard';
    });
    if (this.authService.isAuthenticated) {
      this.router.navigate([this.returnUrl]);
    }
  }

  switchTab(tab: TabType) {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
    this.showPassword = false;
  }

  getPasswordStrength(): number {
    const p = this.registerForm.password;
    if (p.length === 0) return 0;
    let score = 0;
    if (p.length >= 6)  score += 33;
    if (p.length >= 10) score += 17;
    if (/[A-Z]/.test(p))      score += 17;
    if (/[0-9]/.test(p))      score += 17;
    if (/[^A-Za-z0-9]/.test(p)) score += 16;
    return Math.min(score, 100);
  }

  getPasswordStrengthClass(): string {
    const s = this.getPasswordStrength();
    if (s < 40) return 'weak';
    if (s < 75) return 'medium';
    return 'strong';
  }

  getPasswordStrengthLabel(): string {
    const c = this.getPasswordStrengthClass();
    return c === 'weak' ? 'Faible' : c === 'medium' ? 'Moyen' : 'Fort';
  }

  onLogin(): void {
    this.clearMessages();
    if (!this.loginForm.email || !this.loginForm.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }
    this.isLoading = true;
    this.authService.login(this.loginForm).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) this.router.navigate([this.returnUrl]);
        else this.errorMessage = res.message;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Email ou mot de passe incorrect';
      }
    });
  }

  onRegister(): void {
    this.clearMessages();
    if (!this.registerForm.name || !this.registerForm.email || !this.registerForm.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }
    if (this.registerForm.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }
    if (this.registerForm.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }
    this.isLoading = true;
    this.authService.register(this.registerForm).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) this.router.navigate([this.returnUrl]);
        else this.errorMessage = res.message;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || "Erreur lors de l'inscription";
      }
    });
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
