import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

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
  currentRoute = '';
  invoiceMenuOpen = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Écouter les changements de route pour mettre à jour le titre
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.urlAfterRedirects;
      // Auto-ouvrir le menu Facturation si on est sur une route de facture
      if (this.isInvoiceRouteActive()) {
        this.invoiceMenuOpen = true;
      }
    });
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    // Fermer les sous-menus quand on réduit la sidebar
    if (this.sidebarCollapsed) {
      this.invoiceMenuOpen = false;
    }
    localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed.toString());
  }

  toggleInvoiceMenu() {
    if (!this.sidebarCollapsed) {
      this.invoiceMenuOpen = !this.invoiceMenuOpen;
    }
  }

  isInvoiceRouteActive(): boolean {
    return this.currentRoute.startsWith('/invoices');
  }

  getCurrentPageTitle(): string {
    const routeTitles: { [key: string]: string } = {
      '/': 'Tableau de Bord',
      '/products': 'Gestion des Produits',
      '/purchases': 'Gestion des Achats',
      '/sales': 'Gestion des Ventes',
      '/stock-movements': 'Mouvements de Stock',
      '/invoices': 'Gestion des Factures',
      '/invoices/dashboard': 'Dashboard Facturation',
      '/invoices/create': 'Créer Facture',
      '/invoices/list': 'Liste des Factures'
    };

    return routeTitles[this.currentRoute] || 'Stock Management ERP';
  }

  refreshData() {
    window.location.reload();
  }
}
