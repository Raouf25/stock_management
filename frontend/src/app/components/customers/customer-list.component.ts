import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface CustomerWithStats {
  customer: {
    customerId: number;
    name: string;
    fullName: string;
    phone: string;
    email: string;
    city: string;
    status: string;
  };
  totalCA: number;
  unpaidAmount: number;
}

interface CustomerKPIs {
  totalCustomers: number;
  activeCustomers: number;
  blockedCustomers: number;
  newCustomersThisMonth: number;
  totalRevenue: number;
  averageRevenuePerCustomer: number;
  totalOutstanding: number;
}

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="invoice-page-container">
      <!-- Header -->
      <div class="invoice-page-header">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <span style="font-size: 2rem;">👥</span>
          <h1 class="invoice-page-title">Gestion des Clients</h1>
        </div>
        <a routerLink="/customers/create" 
           style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border-radius: 0.5rem; text-decoration: none; font-weight: 600;">
          + Nouveau Client
        </a>
      </div>

      <!-- KPIs -->
      <div class="invoice-stats-grid">
        <div class="invoice-stat-card border-blue">
          <div class="stat-number">{{ kpis.totalCustomers }}</div>
          <div class="stat-label">Total Clients</div>
        </div>
        <div class="invoice-stat-card border-green">
          <div class="stat-number">{{ kpis.activeCustomers }}</div>
          <div class="stat-label">Clients Actifs</div>
        </div>
        <div class="invoice-stat-card border-orange">
          <div class="stat-number">{{ kpis.newCustomersThisMonth }}</div>
          <div class="stat-label">Nouveaux ce Mois</div>
        </div>
        <div class="invoice-stat-card border-red">
          <div class="stat-number">{{ kpis.totalOutstanding | number:'1.0-0' }}</div>
          <div class="stat-label">Impayés (DNT)</div>
        </div>
      </div>

      <!-- Filtres -->
      <div class="invoice-card" style="margin-bottom: 1.5rem;">
        <div class="invoice-card-header gradient-purple">
          <span style="font-size: 1rem;">🔍</span>
          <span class="invoice-card-header-title">Filtres</span>
        </div>
        <div style="padding: 1rem;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                Rechercher
              </label>
              <input type="text" [(ngModel)]="searchQuery" (input)="applyFilters()" 
                     placeholder="Nom du client..."
                     style="width: 100%; padding: 0.625rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem;">
            </div>
            
            <div>
              <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                Statut
              </label>
              <select [(ngModel)]="statusFilter" (change)="applyFilters()"
                      style="width: 100%; padding: 0.625rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem;">
                <option value="">Tous les statuts</option>
                <option value="ACTIVE">Actif</option>
                <option value="INACTIVE">Inactif</option>
                <option value="BLOCKED">Bloqué</option>
                <option value="PROSPECT">Prospect</option>
              </select>
            </div>
            
            <div>
              <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                Ville
              </label>
              <input type="text" [(ngModel)]="cityFilter" (input)="applyFilters()" 
                     placeholder="Ville..."
                     style="width: 100%; padding: 0.625rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem;">
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des clients -->
      <div class="invoice-card">
        <div class="invoice-card-header gradient-purple">
          <span style="font-size: 1rem;">📋</span>
          <span class="invoice-card-header-title">Liste des Clients ({{ filteredCustomers.length }})</span>
        </div>
        
        <!-- Desktop Table -->
        <div class="desktop-table" style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);">
                <th style="color: white; font-weight: 500; padding: 0.75rem 1rem; text-align: left;">CLIENT</th>
                <th style="color: white; font-weight: 500; padding: 0.75rem 1rem; text-align: left;">CONTACT</th>
                <th style="color: white; font-weight: 500; padding: 0.75rem 1rem; text-align: left;">VILLE</th>
                <th style="color: white; font-weight: 500; padding: 0.75rem 1rem; text-align: right;">CA TOTAL</th>
                <th style="color: white; font-weight: 500; padding: 0.75rem 1rem; text-align: right;">IMPAYÉS</th>
                <th style="color: white; font-weight: 500; padding: 0.75rem 1rem; text-align: center;">STATUT</th>
                <th style="color: white; font-weight: 500; padding: 0.75rem 1rem; text-align: center;">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of filteredCustomers" 
                  style="border-bottom: 1px solid #e5e7eb; transition: background 0.2s;"
                  onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
                <td style="padding: 0.75rem 1rem;">
                  <div style="font-weight: 600; color: #111827;">{{ item.customer.name }}</div>
                </td>
                <td style="padding: 0.75rem 1rem;">
                  <div *ngIf="item.customer.fullName" style="font-weight: 600; color: #111827;">{{ item.customer.fullName }}</div>
                  <div style="color: #111827;">{{ item.customer.phone || '-' }}</div>
                  <div style="font-size: 0.75rem; color: #6b7280;">{{ item.customer.email || '-' }}</div>
                </td>
                <td style="padding: 0.75rem 1rem; color: #6b7280;">{{ item.customer.city || '-' }}</td>
                <td style="padding: 0.75rem 1rem; text-align: right; font-weight: 600; color: #059669;">
                  {{ item.totalCA | number:'1.0-0' }} DNT
                </td>
                <td style="padding: 0.75rem 1rem; text-align: right;">
                  <span [style.color]="item.unpaidAmount > 0 ? '#dc2626' : '#6b7280'" 
                        [style.fontWeight]="item.unpaidAmount > 0 ? '600' : '400'">
                    {{ item.unpaidAmount | number:'1.0-0' }} DNT
                  </span>
                </td>
                <td style="padding: 0.75rem 1rem; text-align: center;">
                  <span [style.background]="getStatusColor(item.customer.status)" 
                        style="padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; color: white;">
                    {{ item.customer.status || 'ACTIVE' }}
                  </span>
                </td>
                <td style="padding: 0.75rem 1rem;">
                  <div style="display: flex; align-items: center; justify-content: center; gap: 0.25rem;">
                    <button (click)="viewCustomer(item.customer.customerId)" title="Voir"
                            style="width: 2rem; height: 2rem; border-radius: 0.375rem; border: 1px solid #bfdbfe; background: #eff6ff; color: #1e40af; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: center;"
                            onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='#eff6ff'">👁️</button>
                    <button (click)="editCustomer(item.customer.customerId)" title="Modifier"
                            style="width: 2rem; height: 2rem; border-radius: 0.375rem; border: 1px solid #fcd34d; background: #fef3c7; color: #92400e; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: center;"
                            onmouseover="this.style.background='#fde68a'" onmouseout="this.style.background='#fef3c7'">✏️</button>
                    <button (click)="deleteCustomer(item.customer.customerId)" title="Supprimer"
                            style="width: 2rem; height: 2rem; border-radius: 0.375rem; border: 1px solid #fecaca; background: #fee2e2; color: #991b1b; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: center;"
                            onmouseover="this.style.background='#fecaca'" onmouseout="this.style.background='#fee2e2'">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Mobile Cards -->
        <div class="mobile-cards">
          <div *ngFor="let item of filteredCustomers"
               style="border-bottom: 1px solid #e5e7eb; padding: 1rem; background: white;">
            <!-- Header: Client Name & Status -->
            <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.75rem;">
              <div style="font-weight: 600; color: #111827; font-size: 1rem;">{{ item.customer.name }}</div>
              <span [style.background]="getStatusColor(item.customer.status)" 
                    style="padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; color: white;">
                {{ item.customer.status || 'ACTIVE' }}
              </span>
            </div>
            
            <!-- Contact Info -->
            <div style="margin-bottom: 0.75rem;">
              <div *ngIf="item.customer.fullName" style="font-weight: 500; color: #374151; font-size: 0.875rem;">{{ item.customer.fullName }}</div>
              <div style="color: #6b7280; font-size: 0.875rem;">{{ item.customer.phone || '-' }}</div>
              <div style="color: #6b7280; font-size: 0.75rem;">{{ item.customer.email || '-' }}</div>
              <div *ngIf="item.customer.city" style="color: #6b7280; font-size: 0.75rem; margin-top: 0.25rem;">📍 {{ item.customer.city }}</div>
            </div>
            
            <!-- Amounts - 2 Columns Grid -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin-bottom: 1rem; font-size: 0.875rem;">
              <div style="background: #f0fdf4; padding: 0.5rem; border-radius: 0.5rem; text-align: center;">
                <div style="font-size: 0.75rem; color: #6b7280; margin-bottom: 0.125rem;">CA Total</div>
                <div style="font-weight: 600; color: #059669; font-size: 0.875rem;">{{ item.totalCA | number:'1.0-0' }} DNT</div>
              </div>
              <div style="background: #fef2f2; padding: 0.5rem; border-radius: 0.5rem; text-align: center;">
                <div style="font-size: 0.75rem; color: #6b7280; margin-bottom: 0.125rem;">Impayés</div>
                <div [style.color]="item.unpaidAmount > 0 ? '#dc2626' : '#6b7280'" 
                     [style.fontWeight]="item.unpaidAmount > 0 ? '600' : '400'"
                     style="font-size: 0.875rem;">{{ item.unpaidAmount | number:'1.0-0' }} DNT</div>
              </div>
            </div>
            
            <!-- Actions -->
            <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 0.25rem; border-top: 1px solid #e5e7eb; padding-top: 0.75rem;">
              <button (click)="viewCustomer(item.customer.customerId)" title="Voir"
                      style="width: 2rem; height: 2rem; border-radius: 0.375rem; border: 1px solid #bfdbfe; background: #eff6ff; color: #1e40af; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: center;">👁️</button>
              <button (click)="editCustomer(item.customer.customerId)" title="Modifier"
                      style="width: 2rem; height: 2rem; border-radius: 0.375rem; border: 1px solid #fcd34d; background: #fef3c7; color: #92400e; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: center;">✏️</button>
              <button (click)="deleteCustomer(item.customer.customerId)" title="Supprimer"
                      style="width: 2rem; height: 2rem; border-radius: 0.375rem; border: 1px solid #fecaca; background: #fee2e2; color: #991b1b; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: center;">🗑️</button>
            </div>
          </div>
          
          <!-- Empty State -->
          <div *ngIf="filteredCustomers.length === 0" style="text-align: center; padding: 3rem 1rem; color: #7f8c8d;">
            <div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.5;">👥</div>
            <p style="font-size: 1.1rem; margin: 0;">Aucun client trouvé</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .invoice-page-container {
      padding: 2rem;
      background: #f3f4f6;
      min-height: 100vh;
    }

    .invoice-page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .invoice-page-title {
      font-size: 1.875rem;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }



    .invoice-card-header-title {
      font-weight: 600;
      font-size: 1.125rem;
    }
  `]
})
export class CustomerListComponent implements OnInit {
  customers: CustomerWithStats[] = [];
  filteredCustomers: CustomerWithStats[] = [];
  searchQuery = '';
  statusFilter = '';
  cityFilter = '';
  
  kpis: CustomerKPIs = {
    totalCustomers: 0,
    activeCustomers: 0,
    blockedCustomers: 0,
    newCustomersThisMonth: 0,
    totalRevenue: 0,
    averageRevenuePerCustomer: 0,
    totalOutstanding: 0
  };

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
    this.loadKPIs();
  }

  loadCustomers(): void {
    this.apiService.searchCustomers().subscribe({
      next: (data) => {
        this.customers = data;
        this.applyFilters();
      },
      error: (error) => console.error('Error loading customers:', error)
    });
  }

  applyFilters(): void {
    this.filteredCustomers = this.customers.filter(item => {
      const customer = item.customer;
      
      // Filtre par recherche (nom)
      if (this.searchQuery && !customer.name?.toLowerCase().includes(this.searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filtre par statut
      if (this.statusFilter && customer.status !== this.statusFilter) {
        return false;
      }
      
      // Filtre par ville
      if (this.cityFilter && !customer.city?.toLowerCase().includes(this.cityFilter.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }

  loadKPIs(): void {
    this.apiService.getCustomerKPIs().subscribe({
      next: (data) => this.kpis = data,
      error: (error) => console.error('Error loading KPIs:', error)
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return '#10b981';
      case 'BLOCKED': return '#ef4444';
      case 'INACTIVE': return '#6b7280';
      default: return '#3b82f6';
    }
  }

  viewCustomer(id: number): void {
    this.router.navigate(['/customers/edit', id]);
  }

  editCustomer(id: number): void {
    this.router.navigate(['/customers/edit', id]);
  }

  deleteCustomer(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      this.apiService.deleteCustomer(id).subscribe({
        next: () => {
          this.loadCustomers();
          this.loadKPIs();
        },
        error: (error) => console.error('Error deleting customer:', error)
      });
    }
  }
}
