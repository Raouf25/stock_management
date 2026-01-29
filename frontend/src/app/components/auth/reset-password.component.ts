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
    <div class="auth-container">
      <div class="auth-card">
        <!-- Loading State -->
        <div *ngIf="isValidating" class="state-container">
          <div class="spinner"></div>
          <p>Vérification du lien...</p>
        </div>

        <!-- Invalid Token -->
        <div *ngIf="!isValidating && !isValidToken && !resetSuccess" class="state-container">
          <div class="icon-circle error-icon">
            <i class="bi bi-x-lg"></i>
          </div>
          <h2>Lien invalide</h2>
          <p>Ce lien de réinitialisation est invalide ou a expiré.</p>
          <a routerLink="/forgot-password" class="btn-primary">
            <i class="bi bi-arrow-repeat"></i> Demander un nouveau lien
          </a>
        </div>

        <!-- Reset Form -->
        <div *ngIf="!isValidating && isValidToken && !resetSuccess">
          <div class="auth-header">
            <div class="icon-circle">
              <i class="bi bi-shield-lock"></i>
            </div>
            <h1>Nouveau mot de passe</h1>
            <p>Choisissez un mot de passe sécurisé</p>
          </div>

          <div class="alert error" *ngIf="errorMessage">
            <i class="bi bi-exclamation-triangle"></i> {{ errorMessage }}
          </div>

          <form (ngSubmit)="onSubmit()" class="auth-form">
            <div class="form-group">
              <label><i class="bi bi-lock"></i> Nouveau mot de passe</label>
              <div class="password-field">
                <input [type]="showPassword ? 'text' : 'password'" 
                       [(ngModel)]="newPassword" name="newPassword" 
                       placeholder="Minimum 6 caractères" required minlength="6">
                <button type="button" (click)="showPassword = !showPassword">
                  <i class="bi" [class.bi-eye]="!showPassword" [class.bi-eye-slash]="showPassword"></i>
                </button>
              </div>
              <!-- Password Strength -->
              <div class="password-strength" *ngIf="newPassword">
                <div class="strength-bar">
                  <div class="strength-fill" [style.width]="passwordStrength + '%'" 
                       [class.weak]="passwordStrength < 40" 
                       [class.medium]="passwordStrength >= 40 && passwordStrength < 70"
                       [class.strong]="passwordStrength >= 70"></div>
                </div>
                <span [class.weak]="passwordStrength < 40" 
                      [class.medium]="passwordStrength >= 40 && passwordStrength < 70"
                      [class.strong]="passwordStrength >= 70">
                  {{ strengthLabel }}
                </span>
              </div>
            </div>

            <div class="form-group">
              <label><i class="bi bi-lock-fill"></i> Confirmer</label>
              <input [type]="showPassword ? 'text' : 'password'" 
                     [(ngModel)]="confirmPassword" name="confirmPassword" 
                     placeholder="Confirmez le mot de passe" required>
              <small class="match-error" *ngIf="confirmPassword && newPassword !== confirmPassword">
                <i class="bi bi-x-circle"></i> Les mots de passe ne correspondent pas
              </small>
            </div>

            <button type="submit" class="btn-primary" [disabled]="isLoading || !canSubmit">
              <i class="bi" [class.bi-check-lg]="!isLoading" [class.bi-arrow-repeat]="isLoading" [class.spin]="isLoading"></i>
              {{ isLoading ? 'Modification...' : 'Changer le mot de passe' }}
            </button>
          </form>
        </div>

        <!-- Success State -->
        <div *ngIf="resetSuccess" class="state-container">
          <div class="icon-circle success-icon">
            <i class="bi bi-check-lg"></i>
          </div>
          <h2>Mot de passe modifié !</h2>
          <p>Votre mot de passe a été réinitialisé avec succès.</p>
          <a routerLink="/login" class="btn-primary">
            <i class="bi bi-box-arrow-in-right"></i> Se connecter
          </a>
        </div>
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
    .icon-circle {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      font-size: 36px;
      color: white;
    }
    .icon-circle.error-icon {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }
    .icon-circle.success-icon {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }
    .auth-header h1, .state-container h2 {
      font-size: 24px;
      color: #333;
      margin: 0 0 10px;
    }
    .auth-header p, .state-container p {
      color: #666;
      margin: 0 0 20px;
      font-size: 14px;
      line-height: 1.5;
    }
    .state-container {
      text-align: center;
    }
    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #e9ecef;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
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
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
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
    .password-strength {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 8px;
    }
    .strength-bar {
      flex: 1;
      height: 4px;
      background: #e9ecef;
      border-radius: 2px;
      overflow: hidden;
    }
    .strength-fill {
      height: 100%;
      transition: width 0.3s, background 0.3s;
    }
    .strength-fill.weak { background: #ef4444; }
    .strength-fill.medium { background: #f59e0b; }
    .strength-fill.strong { background: #10b981; }
    .password-strength span {
      font-size: 12px;
      font-weight: 500;
    }
    span.weak { color: #ef4444; }
    span.medium { color: #f59e0b; }
    span.strong { color: #10b981; }
    .match-error {
      color: #ef4444;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
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
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.3s;
      text-decoration: none;
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
      if (this.token) {
        this.validateToken();
      } else {
        this.isValidating = false;
      }
    });
  }

  validateToken(): void {
    this.authService.validateResetToken(this.token).subscribe({
      next: (res) => {
        this.isValidating = false;
        this.isValidToken = res.success;
      },
      error: () => {
        this.isValidating = false;
        this.isValidToken = false;
      }
    });
  }

  get passwordStrength(): number {
    let strength = 0;
    const pwd = this.newPassword;
    if (pwd.length >= 6) strength += 25;
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
    return this.newPassword.length >= 6 && 
           this.newPassword === this.confirmPassword;
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.canSubmit) return;

    this.isLoading = true;
    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.resetSuccess = true;
        } else {
          this.errorMessage = res.message;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la réinitialisation';
      }
    });
  }
}
