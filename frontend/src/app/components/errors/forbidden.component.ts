import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  template: `
    <div class="error-page">
      <div class="error-card">
        <div class="error-code">403</div>
        <div class="error-illustration">
          <i class="bi bi-shield-lock"></i>
        </div>
        <h1 class="error-title">Accès refusé</h1>
        <p class="error-description">
          Vous n'avez pas les permissions nécessaires pour accéder à cette ressource.
        </p>
        <div class="error-actions">
          <button class="btn btn-secondary" (click)="goBack()">
            <i class="bi bi-arrow-left"></i>
            Retour
          </button>
          <button class="btn btn-primary" (click)="goHome()">
            <i class="bi bi-house-door"></i>
            Tableau de bord
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      padding: 2rem;
    }

    .error-card {
      background: var(--glass-bg-strong);
      backdrop-filter: blur(30px) saturate(180%);
      -webkit-backdrop-filter: blur(30px) saturate(180%);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-2xl);
      box-shadow: 0 24px 70px -24px rgba(49,46,129,0.45);
      padding: 3rem 2.5rem;
      text-align: center;
      max-width: 440px;
      width: 100%;
      animation: pageFadeIn 0.3s ease-out;
    }

    @keyframes pageFadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .error-code {
      font-size: 5rem;
      font-weight: 800;
      line-height: 1;
      color: var(--color-danger);
      letter-spacing: -0.04em;
      margin-bottom: 1rem;
    }

    .error-illustration {
      font-size: 3rem;
      color: var(--color-text-faint);
      margin-bottom: 1.5rem;
      line-height: 1;
    }

    .error-title {
      font-size: 1.375rem;
      font-weight: 700;
      color: var(--color-text);
      letter-spacing: -0.02em;
      margin: 0 0 0.625rem;
    }

    .error-description {
      font-size: 0.9375rem;
      color: var(--color-text-muted);
      line-height: 1.6;
      margin: 0 0 2rem;
    }

    .error-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    @media (max-width: 480px) {
      .error-card {
        padding: 2rem 1.5rem;
      }
      .error-code {
        font-size: 4rem;
      }
      .error-actions {
        flex-direction: column;
      }
      .error-actions .btn {
        width: 100%;
      }
    }
  `]
})
export class ForbiddenComponent {
  constructor(
    private readonly location: Location,
    private readonly router: Router
  ) {}

  goBack(): void {
    this.location.back();
  }

  goHome(): void {
    this.router.navigate(['/dashboard']);
  }
}
