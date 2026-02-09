import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductsComponent } from './components/products/products.component';
import { PurchasesComponent } from './components/purchases/purchases.component';
import { SalesComponent } from './components/sales/sales.component';
import { StockMovementComponent } from './components/stock-movement/stock-movement.component';
import { InvoicesComponent } from './components/invoices/invoices.component';
import { InvoiceCreateComponent } from './components/invoices/invoice-create.component';
import { InvoiceListComponent } from './components/invoices/invoice-list.component';
import { DeliveryNoteCreateComponent } from './components/delivery-notes/delivery-note-create.component';
import { DeliveryNoteListComponent } from './components/delivery-notes/delivery-note-list.component';
import { CustomerListComponent } from './components/customers/customer-list.component';
import { CustomerCreateComponent } from './components/customers/customer-create.component';
import { CustomerEditComponent } from './components/customers/customer-edit.component';
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
  { path: 'purchases', component: PurchasesComponent, canActivate: [authGuard] },
  { path: 'sales', component: SalesComponent, canActivate: [authGuard] },
  { path: 'stock-movements', component: StockMovementComponent, canActivate: [authGuard] },
  
  // Clients (protected)
  { path: 'customers', component: CustomerListComponent, canActivate: [authGuard] },
  { path: 'customers/create', component: CustomerCreateComponent, canActivate: [authGuard] },
  { path: 'customers/edit/:id', component: CustomerEditComponent, canActivate: [authGuard] },
  
  // Facturation - Navigation hiérarchique (protected)
  { path: 'invoices', redirectTo: 'invoices/list', pathMatch: 'full' },
  { path: 'invoices/create', component: InvoiceCreateComponent, canActivate: [authGuard] },
  { path: 'invoices/list', component: InvoiceListComponent, canActivate: [authGuard] },
  
  // Bons de Livraison (protected)
  { path: 'delivery-notes', redirectTo: 'delivery-notes/list', pathMatch: 'full' },
  { path: 'delivery-notes/create', component: DeliveryNoteCreateComponent, canActivate: [authGuard] },
  { path: 'delivery-notes/list', component: DeliveryNoteListComponent, canActivate: [authGuard] },
  
  { path: '**', redirectTo: 'login' }
];
