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
    <div class="auth-container">
      <div class="auth-card">
        <!-- Header -->
        <div class="auth-header">
          <div class="logo"><i class="bi bi-box-seam"></i></div>
          <h1>Stock Management</h1>
          <p>Gérez votre inventaire efficacement</p>
        </div>

        <!-- Tabs -->
        <div class="tabs">
          <button [class.active]="activeTab === 'login'" (click)="activeTab = 'login'">
            <i class="bi bi-box-arrow-in-right"></i> Connexion
          </button>
          <button [class.active]="activeTab === 'register'" (click)="activeTab = 'register'">
            <i class="bi bi-person-plus"></i> Inscription
          </button>
        </div>

        <!-- Messages -->
        <div class="alert error" *ngIf="errorMessage">
          <i class="bi bi-exclamation-triangle"></i> {{ errorMessage }}
        </div>
        <div class="alert success" *ngIf="successMessage">
          <i class="bi bi-check-circle"></i> {{ successMessage }}
        </div>

        <!-- Login Form -->
        <form *ngIf="activeTab === 'login'" (ngSubmit)="onLogin()" class="auth-form">
          <div class="form-group">
            <label><i class="bi bi-envelope"></i> Email</label>
            <input type="email" [(ngModel)]="loginForm.email" name="email" 
                   placeholder="votre@email.com" required>
          </div>
          <div class="form-group">
            <label><i class="bi bi-lock"></i> Mot de passe</label>
            <div class="password-field">
              <input [type]="showPassword ? 'text' : 'password'" 
                     [(ngModel)]="loginForm.password" name="password" 
                     placeholder="••••••••" required>
              <button type="button" (click)="showPassword = !showPassword">
                <i class="bi" [class.bi-eye]="!showPassword" [class.bi-eye-slash]="showPassword"></i>
              </button>
            </div>
          </div>
          <div class="forgot-link">
            <a routerLink="/forgot-password">Mot de passe oublié ?</a>
          </div>
          <button type="submit" class="btn-primary" [disabled]="isLoading">
            <i class="bi" [class.bi-box-arrow-in-right]="!isLoading" [class.bi-arrow-repeat]="isLoading" [class.spin]="isLoading"></i>
            {{ isLoading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>

        <!-- Register Form -->
        <form *ngIf="activeTab === 'register'" (ngSubmit)="onRegister()" class="auth-form">
          <div class="form-group">
            <label><i class="bi bi-person"></i> Nom complet</label>
            <input type="text" [(ngModel)]="registerForm.name" name="name" 
                   placeholder="Votre nom" required minlength="2">
          </div>
          <div class="form-group">
            <label><i class="bi bi-envelope"></i> Email</label>
            <input type="email" [(ngModel)]="registerForm.email" name="email" 
                   placeholder="votre@email.com" required>
          </div>
          <div class="form-group">
            <label><i class="bi bi-lock"></i> Mot de passe</label>
            <div class="password-field">
              <input [type]="showPassword ? 'text' : 'password'" 
                     [(ngModel)]="registerForm.password" name="password" 
                     placeholder="Minimum 6 caractères" required minlength="6">
              <button type="button" (click)="showPassword = !showPassword">
                <i class="bi" [class.bi-eye]="!showPassword" [class.bi-eye-slash]="showPassword"></i>
              </button>
            </div>
          </div>
          <div class="form-group">
            <label><i class="bi bi-lock-fill"></i> Confirmer</label>
            <input [type]="showPassword ? 'text' : 'password'" 
                   [(ngModel)]="confirmPassword" name="confirmPassword" 
                   placeholder="Confirmez le mot de passe" required>
          </div>
          <button type="submit" class="btn-primary" [disabled]="isLoading">
            <i class="bi" [class.bi-person-plus]="!isLoading" [class.bi-arrow-repeat]="isLoading" [class.spin]="isLoading"></i>
            {{ isLoading ? 'Inscription...' : "S'inscrire" }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    .auth-card {
      background: white;
      border-radius: 20px;
      padding: 40px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .auth-header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      width: 70px;
      height: 70px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 15px;
      font-size: 32px;
      color: white;
    }
    .auth-header h1 {
      font-size: 24px;
      color: #333;
      margin: 0 0 8px;
    }
    .auth-header p {
      color: #666;
      margin: 0;
      font-size: 14px;
    }
    .tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 25px;
    }
    .tabs button {
      flex: 1;
      padding: 12px;
      border: 2px solid #e9ecef;
      background: white;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 500;
      color: #666;
      transition: all 0.3s;
    }
    .tabs button:hover {
      border-color: #667eea;
      color: #667eea;
    }
    .tabs button.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-color: transparent;
    }
    .alert {
      padding: 12px 15px;
      border-radius: 10px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
    }
    .alert.error {
      background: #fee2e2;
      color: #dc2626;
    }
    .alert.success {
      background: #d1fae5;
      color: #059669;
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group label {
      font-weight: 500;
      color: #333;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .form-group label i {
      color: #667eea;
    }
    .form-group input {
      padding: 12px 15px;
      border: 2px solid #e9ecef;
      border-radius: 10px;
      font-size: 15px;
      transition: all 0.3s;
    }
    .form-group input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
    }
    .password-field {
      position: relative;
    }
    .password-field input {
      width: 100%;
      padding-right: 45px;
    }
    .password-field button {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
    }
    .forgot-link {
      text-align: right;
      margin-top: -10px;
    }
    .forgot-link a {
      color: #667eea;
      text-decoration: none;
      font-size: 13px;
    }
    .forgot-link a:hover {
      text-decoration: underline;
    }
    .btn-primary {
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.3s;
    }
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(102,126,234,0.4);
    }
    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    .spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
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
        if (res.success) {
          this.router.navigate([this.returnUrl]);
        } else {
          this.errorMessage = res.message;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erreur de connexion';
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
        if (res.success) {
          this.router.navigate([this.returnUrl]);
        } else {
          this.errorMessage = res.message;
        }
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
