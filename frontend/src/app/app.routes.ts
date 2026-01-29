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

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'purchases', component: PurchasesComponent },
  { path: 'sales', component: SalesComponent },
  { path: 'stock-movements', component: StockMovementComponent },
  
  // Facturation - Navigation hiérarchique
  { path: 'invoices', redirectTo: 'invoices/dashboard', pathMatch: 'full' },
  { path: 'invoices/dashboard', component: InvoiceDashboardComponent },
  { path: 'invoices/create', component: InvoiceCreateComponent },
  { path: 'invoices/list', component: InvoiceListComponent },
  
  { path: '**', redirectTo: '' }
];
