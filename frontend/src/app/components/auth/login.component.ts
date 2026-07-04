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
      <div class="auth-card">

        <!-- Header -->
        <div class="auth-head">
          <div class="auth-logo">
            <i class="bi bi-boxes"></i>
          </div>
          <h1>Bhouri Stock</h1>
          <p>{{ activeTab === 'login' ? 'Connectez-vous à votre espace' : 'Créez votre compte' }}</p>
        </div>

        <!-- Tabs -->
        <div class="tabs">
          <button [class.active]="activeTab === 'login'" (click)="switchTab('login')" type="button">
            Connexion
          </button>
          <button [class.active]="activeTab === 'register'" (click)="switchTab('register')" type="button">
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
            <label for="login-email">Adresse e-mail</label>
            <div class="input-wrap">
              <i class="bi bi-envelope"></i>
              <input
                id="login-email"
                type="email"
                [(ngModel)]="loginForm.email"
                name="email"
                placeholder="votre@email.com"
                autocomplete="email"
                required>
            </div>
          </div>

          <div class="form-field">
            <label for="login-password">Mot de passe</label>
            <div class="input-wrap">
              <i class="bi bi-lock"></i>
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

          <div class="options-row">
            <label class="remember">
              <input type="checkbox" [(ngModel)]="rememberMe" name="rememberMe">
              Se souvenir de moi
            </label>
            <a routerLink="/forgot-password" class="forgot-link">Mot de passe oublié ?</a>
          </div>

          <button type="submit" class="btn-submit" [disabled]="isLoading">
            <span *ngIf="isLoading"><i class="bi bi-arrow-repeat spin"></i> Connexion en cours…</span>
            <span *ngIf="!isLoading">Se connecter</span>
          </button>

        </form>

        <!-- ── REGISTER FORM ── -->
        <form *ngIf="activeTab === 'register'" (ngSubmit)="onRegister()" class="auth-form" autocomplete="on">

          <div class="form-field">
            <label for="reg-name">Nom complet</label>
            <div class="input-wrap">
              <i class="bi bi-person"></i>
              <input
                id="reg-name"
                type="text"
                [(ngModel)]="registerForm.name"
                name="name"
                placeholder="Votre nom"
                autocomplete="name"
                required minlength="2">
            </div>
          </div>

          <div class="form-field">
            <label for="reg-email">Adresse e-mail</label>
            <div class="input-wrap">
              <i class="bi bi-envelope"></i>
              <input
                id="reg-email"
                type="email"
                [(ngModel)]="registerForm.email"
                name="email"
                placeholder="votre@email.com"
                autocomplete="email"
                required>
            </div>
          </div>

          <div class="form-field">
            <label for="reg-password">Mot de passe</label>
            <div class="input-wrap">
              <i class="bi bi-lock"></i>
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
            <label for="reg-confirm">Confirmer le mot de passe</label>
            <div class="input-wrap">
              <i class="bi bi-lock-fill"></i>
              <input
                id="reg-confirm"
                [type]="showPassword ? 'text' : 'password'"
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                placeholder="Confirmez le mot de passe"
                autocomplete="new-password"
                required>
            </div>
            <span class="match-indicator" *ngIf="confirmPassword.length > 0">
              <i class="bi" [class.bi-check-circle-fill]="registerForm.password === confirmPassword"
                            [class.bi-x-circle-fill]="registerForm.password !== confirmPassword"
                            [class.text-success]="registerForm.password === confirmPassword"
                            [class.text-danger]="registerForm.password !== confirmPassword"></i>
              {{ registerForm.password === confirmPassword ? 'Mots de passe identiques' : 'Mots de passe différents' }}
            </span>
          </div>

          <button type="submit" class="btn-submit" [disabled]="isLoading">
            <span *ngIf="isLoading"><i class="bi bi-arrow-repeat spin"></i> Inscription…</span>
            <span *ngIf="!isLoading">Créer mon compte</span>
          </button>

        </form>

        <!-- Footer -->
        <p class="auth-footer">Bhouri Stock v2.0 · Gestion de stock &amp; facturation</p>

      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; flex: 1; }

    /* ══ Carte centrée (maquette) ══ */
    .auth-page {
      position: relative;
      z-index: 1;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      animation: fadeUpAuth .4s ease both;
    }
    @keyframes fadeUpAuth {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .auth-card {
      width: 100%;
      max-width: 410px;
      padding: 38px 34px;
      border-radius: 26px;
      background: var(--glass-bg-strong);
      backdrop-filter: blur(30px) saturate(180%);
      -webkit-backdrop-filter: blur(30px) saturate(180%);
      border: 1px solid var(--glass-border);
      box-shadow: 0 24px 70px -24px rgba(49,46,129,0.45);
    }

    .auth-head {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 22px;
    }
    .auth-logo {
      width: 56px;
      height: 56px;
      border-radius: 17px;
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 12px 28px -8px var(--color-primary-glow);
      margin-bottom: 16px;
    }
    .auth-logo i { color: #fff; font-size: 27px; }
    .auth-head h1 {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--color-text);
      margin: 0;
    }
    .auth-head p {
      font-size: 13px;
      color: var(--color-text-faint);
      margin: 4px 0 0;
    }

    /* Tabs segmentés */
    .tabs {
      display: flex;
      padding: 4px;
      gap: 4px;
      border-radius: 13px;
      background: rgba(15,23,42,0.05);
      margin-bottom: 18px;
    }
    .tabs button {
      flex: 1;
      padding: 9px 0;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: var(--color-text-muted);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: all .18s;
    }
    .tabs button.active {
      background: var(--color-primary);
      color: #fff;
      box-shadow: 0 6px 16px -6px var(--color-primary-glow);
    }

    /* Alerts */
    .alert {
      display: flex;
      align-items: flex-start;
      gap: 0.625rem;
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      line-height: 1.5;
    }
    .alert i { flex-shrink: 0; font-size: 1rem; margin-top: 0.0625rem; }
    .alert-error   { background: var(--color-danger-bg); color: var(--color-danger-text); border: 1px solid rgba(248,113,113,0.35); }
    .alert-success { background: var(--color-success-bg); color: var(--color-success-text); border: 1px solid rgba(16,185,129,0.35); }

    /* Form */
    .auth-form { display: flex; flex-direction: column; gap: 14px; }

    .form-field { display: flex; flex-direction: column; }
    .form-field label {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text-2);
      display: block;
      margin-bottom: 6px;
    }

    .input-wrap { position: relative; }
    .input-wrap > i {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-text-faint);
      font-size: 14px;
      pointer-events: none;
    }
    .input-wrap input {
      width: 100%;
      padding: 11px 14px 11px 40px;
      border-radius: 12px;
      border: 1px solid rgba(15,23,42,0.1);
      background: rgba(255,255,255,0.7);
      font-size: 14px;
      color: var(--color-text);
      outline: none;
      font-family: inherit;
      box-sizing: border-box;
      transition: border-color .18s, box-shadow .18s;
    }
    .input-wrap input:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-soft);
    }
    .input-wrap input::placeholder { color: var(--color-text-faint); }

    .btn-eye {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--color-text-faint);
      cursor: pointer;
      padding: 4px;
      font-size: 15px;
      transition: color .15s;
    }
    .btn-eye:hover { color: var(--color-primary); }

    /* Options row */
    .options-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
      margin-top: 2px;
    }
    .remember {
      display: flex;
      align-items: center;
      gap: 7px;
      color: var(--color-text-2);
      cursor: pointer;
    }
    .remember input {
      accent-color: var(--color-primary);
      width: 15px;
      height: 15px;
    }
    .forgot-link {
      color: var(--color-primary);
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
    }
    .forgot-link:hover { text-decoration: underline; }

    /* Password strength */
    .password-strength {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      margin-top: 0.5rem;
    }
    .strength-bar {
      flex: 1;
      height: 4px;
      background: rgba(15,23,42,0.08);
      border-radius: 2px;
      overflow: hidden;
    }
    .strength-fill {
      height: 100%;
      border-radius: 2px;
      transition: width 0.3s ease, background 0.3s ease;
    }
    .strength-fill.weak   { background: var(--color-danger); }
    .strength-fill.medium { background: var(--color-warning); }
    .strength-fill.strong { background: var(--color-success); }
    .strength-label { font-size: 0.75rem; font-weight: 600; white-space: nowrap; }
    .strength-label.weak   { color: var(--color-danger); }
    .strength-label.medium { color: var(--color-warning); }
    .strength-label.strong { color: var(--color-success); }

    .match-indicator {
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      margin-top: 0.5rem;
    }
    .text-success { color: var(--color-success); }
    .text-danger  { color: var(--color-danger); }

    /* Submit */
    .btn-submit {
      margin-top: 8px;
      width: 100%;
      padding: 13px;
      border-radius: 13px;
      border: none;
      background: var(--color-primary);
      color: #fff;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 12px 26px -8px var(--color-primary-glow);
      font-family: inherit;
      transition: background .18s;
    }
    .btn-submit:hover:not(:disabled) { background: var(--color-primary-hover); }
    .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

    /* Footer */
    .auth-footer {
      text-align: center;
      font-size: 12px;
      color: var(--color-text-faint);
      margin: 22px 0 0;
    }

    .spin { animation: spin 0.8s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 480px) {
      .auth-card { padding: 28px 20px; border-radius: 18px; }
    }
  `]
})
export class LoginComponent {
  activeTab: TabType = 'login';
  isLoading = false;
  showPassword = false;
  rememberMe = true;
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
