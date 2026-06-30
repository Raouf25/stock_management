import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';
import { adminGuard } from './services/admin.guard';

export const routes: Routes = [
  // Auth routes (public)
  { path: 'login', loadComponent: () => import('./components/auth/login.component').then(m => m.LoginComponent) },
  { path: 'forgot-password', loadComponent: () => import('./components/auth/forgot-password.component').then(m => m.ForgotPasswordComponent) },
  { path: 'reset-password', loadComponent: () => import('./components/auth/reset-password.component').then(m => m.ResetPasswordComponent) },

  // Error pages (public — no auth required)
  { path: 'error/403', loadComponent: () => import('./components/errors/forbidden.component').then(m => m.ForbiddenComponent) },
  { path: 'error/404', loadComponent: () => import('./components/errors/not-found.component').then(m => m.NotFoundComponent) },
  { path: 'error/500', loadComponent: () => import('./components/errors/server-error.component').then(m => m.ServerErrorComponent) },

  // Protected routes
  { path: '', loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'products', loadComponent: () => import('./components/products/products.component').then(m => m.ProductsComponent), canActivate: [authGuard] },
  // Clients (protected)
  { path: 'customers', loadComponent: () => import('./components/customers/customer-list.component').then(m => m.CustomerListComponent), canActivate: [authGuard] },
  { path: 'customers/create', loadComponent: () => import('./components/customers/customer-create.component').then(m => m.CustomerCreateComponent), canActivate: [authGuard] },
  { path: 'customers/edit/:id', loadComponent: () => import('./components/customers/customer-edit.component').then(m => m.CustomerEditComponent), canActivate: [authGuard] },

  // Fournisseurs (protected)
  { path: 'suppliers', loadComponent: () => import('./components/suppliers/suppliers.component').then(m => m.SuppliersComponent), canActivate: [authGuard] },
  { path: 'suppliers/create', loadComponent: () => import('./components/suppliers/supplier-create.component').then(m => m.SupplierCreateComponent), canActivate: [authGuard] },
  { path: 'suppliers/edit/:id', loadComponent: () => import('./components/suppliers/supplier-edit.component').then(m => m.SupplierEditComponent), canActivate: [authGuard] },
  { path: 'suppliers/view/:id', loadComponent: () => import('./components/suppliers/supplier-detail.component').then(m => m.SupplierDetailComponent), canActivate: [authGuard] },

  // Page unifiée Créer Facture / BL (protected)
  { path: 'documents/create', loadComponent: () => import('./components/create-document/create-document.component').then(m => m.CreateDocumentComponent), canActivate: [authGuard] },

  // Facturation (protected)
  { path: 'invoices', redirectTo: 'invoices/list', pathMatch: 'full' },
  { path: 'invoices/create', redirectTo: 'documents/create', pathMatch: 'full' },
  { path: 'invoices/list', loadComponent: () => import('./components/invoices/invoice-list.component').then(m => m.InvoiceListComponent), canActivate: [authGuard] },

  // Rapport TVA (protected)
  { path: 'tax-report', loadComponent: () => import('./components/tax-report/tax-report.component').then(m => m.TaxReportComponent), canActivate: [authGuard] },

  // Profil utilisateur (protected)
  { path: 'profile', loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard] },

  // Paramètres de l'entreprise (protected)
  { path: 'settings', loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent), canActivate: [authGuard] },

  // Bons de Livraison — liste intégrée dans /invoices/list (onglet BL)
  { path: 'delivery-notes', redirectTo: 'invoices/list', pathMatch: 'full' },
  { path: 'delivery-notes/list', redirectTo: 'invoices/list', pathMatch: 'full' },
  { path: 'delivery-notes/create', redirectTo: 'documents/create', pathMatch: 'full' },

  // Administration (ADMIN uniquement)
  { path: 'admin/users', loadComponent: () => import('./components/admin/users/users-list.component').then(m => m.UsersListComponent), canActivate: [authGuard, adminGuard] },

  { path: '**', loadComponent: () => import('./components/errors/not-found.component').then(m => m.NotFoundComponent) }
];
