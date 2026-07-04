import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { LayoutService } from './services/layout.service';
import { ToastOutletComponent } from './shared/toast-outlet.component';
import { ConfirmDialogComponent } from './shared/confirm-dialog.component';
import { CommandPaletteComponent } from './shared/command-palette.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastOutletComponent, ConfirmDialogComponent, CommandPaletteComponent],
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
    public authService: AuthService,
    public layoutService: LayoutService
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

  openCommandPalette(): void {
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'k', metaKey: true, bubbles: true
    }));
  }

  isAuthRoute(): boolean {
    return ['/login', '/forgot-password', '/reset-password'].some(r => this.currentRoute.startsWith(r));
  }

  private static readonly PAGE_HEADERS: ReadonlyArray<{ prefix: string; title: string; subtitle: string }> = [
    { prefix: '/products',         title: 'Produits',                       subtitle: 'Inventaire, coût moyen pondéré et alertes de stock' },
    { prefix: '/customers/create', title: 'Nouveau client',                 subtitle: 'Créez une fiche client complète' },
    { prefix: '/customers',        title: 'Clients',                        subtitle: 'Répertoire clients et suivi des impayés' },
    { prefix: '/suppliers/create', title: 'Nouveau fournisseur',            subtitle: 'Ajoutez un partenaire à votre répertoire' },
    { prefix: '/suppliers',        title: 'Fournisseurs',                   subtitle: "Vos partenaires et historique d'achats" },
    { prefix: '/documents/create', title: 'Créer Facture / BL',             subtitle: 'Catalogue, panier, facturation et synthèse' },
    { prefix: '/invoices',         title: 'Factures & Bons de livraison',   subtitle: 'Facturation conforme à la législation tunisienne' },
    { prefix: '/delivery-notes',   title: 'Factures & Bons de livraison',   subtitle: 'Facturation conforme à la législation tunisienne' },
    { prefix: '/tax-report',       title: 'Rapport TVA / Taxes',            subtitle: 'Déclaration TVA — taux 19 %' },
    { prefix: '/settings',         title: 'Paramètres',                     subtitle: "Configuration de l'entreprise et de l'application" },
    { prefix: '/profile',          title: 'Mon profil',                     subtitle: 'Informations du compte et paramètres' },
    { prefix: '/admin/users',      title: 'Utilisateurs',                   subtitle: 'Gestion des comptes et des rôles' }
  ];

  private matchHeader(): { title: string; subtitle: string } {
    const route = this.currentRoute.split('?')[0];
    const match = AppComponent.PAGE_HEADERS.find(h => route.startsWith(h.prefix));
    return match ?? { title: 'Tableau de bord', subtitle: "Vue d'ensemble de votre activité" };
  }

  get pageTitle(): string { return this.matchHeader().title; }
  get pageSubtitle(): string { return this.matchHeader().subtitle; }

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

  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }
}
