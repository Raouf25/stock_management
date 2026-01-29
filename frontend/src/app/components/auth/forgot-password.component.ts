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
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="icon-circle">
            <i class="bi" [class.bi-key]="!emailSent" [class.bi-envelope-check]="emailSent"></i>
          </div>
          <h1>{{ emailSent ? 'Email envoyé !' : 'Mot de passe oublié' }}</h1>
          <p>{{ emailSent ? 'Vérifiez votre boîte de réception' : 'Entrez votre email pour recevoir un lien de réinitialisation' }}</p>
        </div>

        <div class="alert error" *ngIf="errorMessage">
          <i class="bi bi-exclamation-triangle"></i> {{ errorMessage }}
        </div>

        <!-- Form -->
        <form *ngIf="!emailSent" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label><i class="bi bi-envelope"></i> Email</label>
            <input type="email" [(ngModel)]="email" name="email" 
                   placeholder="votre@email.com" required>
          </div>
          <button type="submit" class="btn-primary" [disabled]="isLoading">
            <i class="bi" [class.bi-send]="!isLoading" [class.bi-arrow-repeat]="isLoading" [class.spin]="isLoading"></i>
            {{ isLoading ? 'Envoi...' : 'Envoyer le lien' }}
          </button>
        </form>

        <!-- Success State -->
        <div *ngIf="emailSent" class="success-state">
          <p class="info-text">
            Si un compte existe avec l'email <strong>{{ email }}</strong>, 
            vous recevrez un lien de réinitialisation dans quelques minutes.
          </p>
          <div class="tips">
            <p><i class="bi bi-info-circle"></i> Vérifiez aussi vos spams</p>
            <p><i class="bi bi-clock"></i> Le lien expire dans 1 heure</p>
          </div>
          <button class="btn-secondary" (click)="resetForm()">
            <i class="bi bi-arrow-left"></i> Renvoyer un email
          </button>
        </div>

        <div class="back-link">
          <a routerLink="/login"><i class="bi bi-arrow-left"></i> Retour à la connexion</a>
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
    .auth-header h1 {
      font-size: 24px;
      color: #333;
      margin: 0 0 10px;
    }
    .auth-header p {
      color: #666;
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
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
    .btn-primary, .btn-secondary {
      padding: 14px;
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
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(102,126,234,0.4);
    }
    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    .btn-secondary {
      background: #f3f4f6;
      color: #333;
      width: 100%;
    }
    .btn-secondary:hover {
      background: #e5e7eb;
    }
    .success-state {
      text-align: center;
    }
    .info-text {
      color: #333;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .tips {
      background: #f3f4f6;
      padding: 15px;
      border-radius: 10px;
      margin-bottom: 20px;
    }
    .tips p {
      margin: 0;
      padding: 5px 0;
      color: #666;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .tips p i {
      color: #667eea;
    }
    .back-link {
      text-align: center;
      margin-top: 25px;
      padding-top: 20px;
      border-top: 1px solid #e9ecef;
    }
    .back-link a {
      color: #667eea;
      text-decoration: none;
      font-size: 14px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .back-link a:hover {
      text-decoration: underline;
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
export class ForgotPasswordComponent {
  email = '';
  isLoading = false;
  emailSent = false;
  errorMessage = '';

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.email) {
      this.errorMessage = 'Veuillez entrer votre email';
      return;
    }

    this.isLoading = true;
    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.emailSent = true;
      },
      error: () => {
        this.isLoading = false;
        // Always show success to prevent email enumeration
        this.emailSent = true;
      }
    });
  }

  resetForm(): void {
    this.emailSent = false;
    this.email = '';
  }
}
