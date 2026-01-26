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

  constructor(private router: Router) {}

  ngOnInit() {
    // Écouter les changements de route pour mettre à jour le titre
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.urlAfterRedirects;
    });
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    // Sauvegarder l'état dans le localStorage
    localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed.toString());
  }

  getCurrentPageTitle(): string {
    const routeTitles: { [key: string]: string } = {
      '/': 'Tableau de Bord',
      '/products': 'Gestion des Produits',
      '/purchases': 'Gestion des Achats',
      '/sales': 'Gestion des Ventes',
      '/stock-movements': 'Mouvements de Stock',
      '/invoices': 'Gestion des Factures'
    };

    return routeTitles[this.currentRoute] || 'Stock Management ERP';
  }

  refreshData() {
    // Émettre un événement de rafraîchissement global
    window.location.reload();
  }
}
