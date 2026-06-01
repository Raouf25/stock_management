import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Stock Management System';
  sidebarCollapsed = false;
  sidebarOpen = false;
  currentRoute = '';
  documentsMenuOpen = false;

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
      // Auto-ouvrir Archives si on est sur une route de liste documents
      if (this.isDocumentListRouteActive()) {
        this.documentsMenuOpen = true;
      }
      this.closeSidebarOnMobile();
    });
  }

  toggleSidebar() {
    if (window.innerWidth < 992) {
      this.sidebarOpen = false;
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
      if (this.sidebarCollapsed) {
        this.documentsMenuOpen = false;
      }
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

  toggleDocumentsMenu() {
    if (!this.sidebarCollapsed) {
      this.documentsMenuOpen = !this.documentsMenuOpen;
    }
  }

  isInvoiceRouteActive(): boolean {
    return this.currentRoute.startsWith('/invoices') || this.currentRoute.startsWith('/documents/create');
  }

  isDeliveryRouteActive(): boolean {
    return this.currentRoute.startsWith('/delivery-notes');
  }

  isDocumentListRouteActive(): boolean {
    return this.currentRoute.startsWith('/invoices') || this.currentRoute.startsWith('/delivery-notes');
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
      '/delivery-notes': 'Gestion des BL',
      '/delivery-notes/create': 'Créer BL',
      '/delivery-notes/list': 'Liste des BL'
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
