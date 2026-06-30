import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-server-error',
  standalone: true,
  template: `
    <div class="error-page">
      <div class="error-card">
        <div class="error-code">500</div>
        <div class="error-illustration">
          <i class="bi bi-exclamation-triangle"></i>
        </div>
        <h1 class="error-title">Erreur serveur</h1>
        <p class="error-description">
          Une erreur inattendue s'est produite. Veuillez réessayer dans quelques instants.
        </p>
        <div class="error-actions">
          <button class="btn btn-secondary" (click)="retry()">
            <i class="bi bi-arrow-clockwise"></i>
            Réessayer
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
      background: var(--color-bg);
      padding: 2rem;
    }

    .error-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
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
      color: var(--color-warning);
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
export class ServerErrorComponent {
  constructor(
    private readonly location: Location,
    private readonly router: Router
  ) {}

  retry(): void {
    this.location.back();
  }

  goHome(): void {
    this.router.navigate(['/dashboard']);
  }
}
