import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRole } from '../../../services/user-management.service';

@Component({
  selector: 'app-role-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="role-badge" [class]="'role-badge--' + role.toLowerCase()">
      <i class="bi" [class.bi-shield-fill-check]="role === 'ADMIN'" [class.bi-person-fill]="role === 'USER'"></i>
      {{ role === 'ADMIN' ? 'Admin' : 'Utilisateur' }}
    </span>
  `,
  styles: [`
    .role-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.2rem 0.625rem;
      border-radius: var(--radius-full, 9999px);
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .role-badge--admin {
      background: #ede9fe;
      color: #6d28d9;
    }

    .role-badge--user {
      background: var(--color-info-bg, #dbeafe);
      color: var(--color-info-text, #1e40af);
    }
  `]
})
export class RoleBadgeComponent {
  @Input({ required: true }) role!: UserRole;
}
