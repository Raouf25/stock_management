import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { ToastOutletComponent } from './shared/toast-outlet.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastOutletComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Stock Management System';
  sidebarCollapsed = false;
  sidebarOpen = false;
  currentRoute = '';

  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit() {
    // Écouter les changements de route pour mettre à jour le titre
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.urlAfterRedirects;
      this.closeSidebarOnMobile();
    });
  }

  toggleSidebar() {
    if (window.innerWidth < 992) {
      this.sidebarOpen = false;
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
      localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed.toString());
    }
  }

  toggleSidebarOpen() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebarOnMobile() {
    if (window.innerWidth <= 768) {
      this.sidebarOpen = false;
    }
  }

  isAuthRoute(): boolean {
    return ['/login', '/forgot-password', '/reset-password'].some(r => this.currentRoute.startsWith(r));
  }

  getCurrentPageTitle(): string {
    const routeTitles: { [key: string]: string } = {
      '/': 'Tableau de Bord',
      '/products': 'Gestion des Produits',
      '/purchases': 'Gestion des Achats',
      '/sales': 'Gestion des Ventes',
      '/stock-movements': 'Mouvements de Stock',
      '/customers': 'Gestion des Clients',
      '/invoices': 'Gestion des Factures',
      '/documents/create': 'Créer Facture / BL',
      '/invoices/create': 'Créer Facture',
      '/invoices/list': 'Liste des Factures',
      '/delivery-notes': 'Bons de Livraison',
      '/delivery-notes/create': 'Créer BL'
    };

    return routeTitles[this.currentRoute] || 'Stock Management ERP';
  }

  refreshData() {
    window.location.reload();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUserInitials(): string {
    const name = this.authService.currentUser?.name || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getTruncatedEmail(): string {
    const email = this.authService.currentUser?.email || '';
    if (email.length > 20) {
      return email.substring(0, 20) + '...';
    }
    return email;
  }
}
