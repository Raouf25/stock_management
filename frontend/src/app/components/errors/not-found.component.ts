import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  template: `
    <div class="error-page">
      <div class="error-card">
        <div class="error-code">404</div>
        <div class="error-illustration">
          <i class="bi bi-compass"></i>
        </div>
        <h1 class="error-title">Page introuvable</h1>
        <p class="error-description">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <button class="btn btn-primary" (click)="goHome()">
          <i class="bi bi-house-door"></i>
          Retour au tableau de bord
        </button>
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
      color: var(--color-primary);
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

    @media (max-width: 480px) {
      .error-card {
        padding: 2rem 1.5rem;
      }
      .error-code {
        font-size: 4rem;
      }
    }
  `]
})
export class NotFoundComponent {
  constructor(private readonly router: Router) {}

  goHome(): void {
    this.router.navigate(['/dashboard']);
  }
}
