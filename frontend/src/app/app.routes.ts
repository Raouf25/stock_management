import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductsComponent } from './components/products/products.component';
import { PurchasesComponent } from './components/purchases/purchases.component';
import { SalesComponent } from './components/sales/sales.component';
import { StockMovementComponent } from './components/stock-movement/stock-movement.component';
import { InvoicesComponent } from './components/invoices/invoices.component';
import { InvoiceCreateComponent } from './components/invoices/invoice-create.component';
import { InvoiceDashboardComponent } from './components/invoices/invoice-dashboard.component';
import { InvoiceListComponent } from './components/invoices/invoice-list.component';
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
  
  // Facturation - Navigation hiérarchique (protected)
  { path: 'invoices', redirectTo: 'invoices/dashboard', pathMatch: 'full' },
  { path: 'invoices/dashboard', component: InvoiceDashboardComponent, canActivate: [authGuard] },
  { path: 'invoices/create', component: InvoiceCreateComponent, canActivate: [authGuard] },
  { path: 'invoices/list', component: InvoiceListComponent, canActivate: [authGuard] },
  
  { path: '**', redirectTo: 'login' }
];
