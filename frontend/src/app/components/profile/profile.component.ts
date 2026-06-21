import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page">

  <div class="page-head">
    <div>
      <h1 class="page-title">Mon Profil</h1>
      <p class="page-sub">Informations du compte et paramètres</p>
    </div>
  </div>

  <!-- Avatar + nom -->
  <div class="profile-hero">
    <div class="avatar-lg">
      <span>{{ getInitials() }}</span>
    </div>
    <div>
      <div class="hero-name">{{ user?.name || 'Utilisateur' }}</div>
      <div class="hero-email">{{ user?.email }}</div>
      <span class="badge-role">Administrateur</span>
    </div>
  </div>

  <div class="cards-grid">

    <!-- Informations du compte -->
    <div class="card">
      <div class="card-head">
        <i class="bi bi-person-fill"></i>
        <span>Informations du compte</span>
      </div>
      <div class="card-body">
        <div class="field-row">
          <label>Nom complet</label>
          <div class="field-value">{{ user?.name || '—' }}</div>
        </div>
        <div class="field-row">
          <label>Adresse email</label>
          <div class="field-value">{{ user?.email || '—' }}</div>
        </div>
        <div class="field-row">
          <label>Identifiant</label>
          <div class="field-value muted">#{{ user?.id || '—' }}</div>
        </div>
      </div>
    </div>

    <!-- Sécurité -->
    <div class="card">
      <div class="card-head">
        <i class="bi bi-shield-lock-fill"></i>
        <span>Sécurité</span>
      </div>
      <div class="card-body">
        <div class="field-row">
          <label>Mot de passe</label>
          <div class="field-value muted">••••••••</div>
        </div>
        <p class="hint">Pour changer votre mot de passe, utilisez la procédure de réinitialisation.</p>
        <button class="btn-outline" (click)="requestPasswordReset()" [disabled]="resetSent">
          <i class="bi bi-envelope"></i>
          {{ resetSent ? 'Email envoyé ✓' : 'Réinitialiser le mot de passe' }}
        </button>
        <p class="reset-hint" *ngIf="resetSent">
          Un email de réinitialisation a été envoyé à <strong>{{ user?.email }}</strong>.
        </p>
      </div>
    </div>

    <!-- Session -->
    <div class="card card-danger">
      <div class="card-head">
        <i class="bi bi-box-arrow-right"></i>
        <span>Session</span>
      </div>
      <div class="card-body">
        <p class="hint">Déconnectez-vous de l'application. Vous devrez vous reconnecter pour accéder au système.</p>
        <button class="btn-danger" (click)="logout()">
          <i class="bi bi-box-arrow-right"></i>
          Se déconnecter
        </button>
      </div>
    </div>

  </div>
</div>
  `,
  styles: [`
    .page {
      background: #f0f2f8;
      min-height: 100vh;
      padding: 1.75rem 2rem;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      box-sizing: border-box;
    }

    .page-head { margin-bottom: 1.75rem; }
    .page-title { font-size: 1.625rem; font-weight: 700; color: #0f172a; margin: 0 0 .25rem; }
    .page-sub   { font-size: .85rem; color: #64748b; margin: 0; }

    /* Hero */
    .profile-hero {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      background: #fff;
      border-radius: 14px;
      border: 1px solid #e2e8f0;
      padding: 1.5rem 2rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 4px rgba(0,0,0,.04);
    }

    .avatar-lg {
      width: 4.5rem;
      height: 4.5rem;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 700;
      color: #fff;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(79,70,229,.3);
    }

    .hero-name  { font-size: 1.25rem; font-weight: 700; color: #0f172a; }
    .hero-email { font-size: .875rem; color: #64748b; margin: .2rem 0 .5rem; }
    .badge-role {
      display: inline-block;
      background: #ede9fe;
      color: #5b21b6;
      font-size: .72rem;
      font-weight: 700;
      padding: .2rem .6rem;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: .04em;
    }

    /* Cards */
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.25rem;
    }

    .card {
      background: #fff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 4px rgba(0,0,0,.04);
      overflow: hidden;
    }

    .card-head {
      display: flex;
      align-items: center;
      gap: .625rem;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #f1f5f9;
      font-size: .82rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .05em;
      color: #475569;
    }
    .card-head i { font-size: 1rem; color: #4f46e5; }
    .card-danger .card-head i { color: #ef4444; }

    .card-body { padding: 1.25rem; }

    .field-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: .625rem 0;
      border-bottom: 1px solid #f8fafc;
    }
    .field-row:last-of-type { border-bottom: none; margin-bottom: .75rem; }

    label { font-size: .8125rem; color: #64748b; font-weight: 500; }
    .field-value { font-size: .875rem; font-weight: 600; color: #0f172a; }
    .field-value.muted { color: #94a3b8; font-weight: 400; }

    .hint { font-size: .8125rem; color: #64748b; margin: 0 0 1rem; line-height: 1.5; }

    /* Buttons */
    .btn-outline {
      display: inline-flex;
      align-items: center;
      gap: .5rem;
      padding: .6rem 1.125rem;
      background: transparent;
      border: 1.5px solid #4f46e5;
      color: #4f46e5;
      border-radius: 8px;
      font-size: .875rem;
      font-weight: 600;
      cursor: pointer;
      transition: background .18s, color .18s;
    }
    .btn-outline:hover:not(:disabled) { background: #4f46e5; color: #fff; }
    .btn-outline:disabled { opacity: .55; cursor: default; }

    .btn-danger {
      display: inline-flex;
      align-items: center;
      gap: .5rem;
      padding: .6rem 1.125rem;
      background: #fef2f2;
      border: 1.5px solid #fecaca;
      color: #dc2626;
      border-radius: 8px;
      font-size: .875rem;
      font-weight: 600;
      cursor: pointer;
      transition: background .18s, border-color .18s;
    }
    .btn-danger:hover { background: #ef4444; border-color: #ef4444; color: #fff; }

    .reset-hint {
      font-size: .8125rem;
      color: #10b981;
      margin: .75rem 0 0;
    }

    @media (max-width: 600px) {
      .page { padding: 1rem; }
      .profile-hero { flex-direction: column; text-align: center; }
    }
  `]
})
export class ProfileComponent implements OnInit {

  user = this.authService.currentUser;
  resetSent = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUser;
  }

  getInitials(): string {
    const name = this.user?.name || 'U';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
  }

  requestPasswordReset(): void {
    if (!this.user?.email) return;
    this.authService.forgotPassword(this.user.email).subscribe({
      next: () => { this.resetSent = true; },
      error: () => { this.resetSent = true; }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
