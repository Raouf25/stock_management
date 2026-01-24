import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductsComponent } from './components/products/products.component';
import { PurchasesComponent } from './components/purchases/purchases.component';
import { SalesComponent } from './components/sales/sales.component';
import { StockMovementComponent } from './components/stock-movement/stock-movement.component';
import { InvoicesComponent } from './components/invoices/invoices.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'purchases', component: PurchasesComponent },
  { path: 'sales', component: SalesComponent },
  { path: 'stock-movements', component: StockMovementComponent },
  { path: 'invoices', component: InvoicesComponent },
  { path: '**', redirectTo: '' }
];
