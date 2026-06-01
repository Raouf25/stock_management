import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductsComponent } from './components/products/products.component';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { StockMovementComponent } from './components/stock-movement/stock-movement.component';import { InvoiceListComponent } from './components/invoices/invoice-list.component';
import { DeliveryNoteListComponent } from './components/delivery-notes/delivery-note-list.component';
import { CreateDocumentComponent } from './components/create-document/create-document.component';
import { CustomerListComponent } from './components/customers/customer-list.component';
import { CustomerCreateComponent } from './components/customers/customer-create.component';
import { CustomerEditComponent } from './components/customers/customer-edit.component';
import { SuppliersComponent } from './components/suppliers/suppliers.component';
import { SupplierEditComponent } from './components/suppliers/supplier-edit.component';
import { SupplierCreateComponent } from './components/suppliers/supplier-create.component';
import { SupplierDetailComponent } from './components/suppliers/supplier-detail.component';
import { LoginComponent } from './components/auth/login.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password.component';
import { ResetPasswordComponent } from './components/auth/reset-password.component';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  // Auth routes (public)
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // Protected routes
  { path: '', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'products', component: ProductsComponent, canActivate: [authGuard] },
  { path: 'transactions', component: TransactionsComponent, canActivate: [authGuard] },

  // Clients (protected)
  { path: 'customers', component: CustomerListComponent, canActivate: [authGuard] },
  { path: 'customers/create', component: CustomerCreateComponent, canActivate: [authGuard] },
  { path: 'customers/edit/:id', component: CustomerEditComponent, canActivate: [authGuard] },

  // Fournisseurs (protected)
  { path: 'suppliers', component: SuppliersComponent, canActivate: [authGuard] },
  { path: 'suppliers/create', component: SupplierCreateComponent, canActivate: [authGuard] },
  { path: 'suppliers/edit/:id', component: SupplierEditComponent, canActivate: [authGuard] },
  { path: 'suppliers/view/:id', component: SupplierDetailComponent, canActivate: [authGuard] },

  // Page unifiée Créer Facture / BL (protected)
  { path: 'documents/create', component: CreateDocumentComponent, canActivate: [authGuard] },

  // Facturation (protected)
  { path: 'invoices', redirectTo: 'invoices/list', pathMatch: 'full' },
  { path: 'invoices/create', redirectTo: 'documents/create', pathMatch: 'full' },
  { path: 'invoices/list', component: InvoiceListComponent, canActivate: [authGuard] },

  // Bons de Livraison (protected)
  { path: 'delivery-notes', redirectTo: 'delivery-notes/list', pathMatch: 'full' },
  { path: 'delivery-notes/create', redirectTo: 'documents/create?mode=bl', pathMatch: 'full' },
  { path: 'delivery-notes/list', component: DeliveryNoteListComponent, canActivate: [authGuard] },

  { path: '**', redirectTo: 'login' }
];
