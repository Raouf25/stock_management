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
          <div class="stat-number">{{ kpis.totalOutstanding | number:'1.0-0' }} DNT</div>
          <div class="stat-label">Impayés Total</div>
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
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">Client</th>
                <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">Contact</th>
                <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">Ville</th>
                <th style="padding: 1rem; text-align: right; font-weight: 600; color: #374151;">CA Total</th>
                <th style="padding: 1rem; text-align: right; font-weight: 600; color: #374151;">Impayés</th>
                <th style="padding: 1rem; text-align: center; font-weight: 600; color: #374151;">Statut</th>
                <th style="padding: 1rem; text-align: center; font-weight: 600; color: #374151;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of filteredCustomers" 
                  style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 1rem;">
                  <div style="font-weight: 600; color: #111827;">{{ item.customer.name }}</div>
                </td>
                <td style="padding: 1rem;">
                  <div *ngIf="item.customer.fullName" style="font-weight: 600; color: #111827;">{{ item.customer.fullName }}</div>
                  <div style="color: #111827;">{{ item.customer.phone || '-' }}</div>
                  <div style="font-size: 0.75rem; color: #6b7280;">{{ item.customer.email || '-' }}</div>
                </td>
                <td style="padding: 1rem; color: #6b7280;">{{ item.customer.city || '-' }}</td>
                <td style="padding: 1rem; text-align: right; font-weight: 600; color: #059669;">
                  {{ item.totalCA | number:'1.0-0' }} DNT
                </td>
                <td style="padding: 1rem; text-align: right;">
                  <span [style.color]="item.unpaidAmount > 0 ? '#dc2626' : '#6b7280'" 
                        [style.fontWeight]="item.unpaidAmount > 0 ? '600' : '400'">
                    {{ item.unpaidAmount | number:'1.0-0' }} DNT
                  </span>
                </td>
                <td style="padding: 1rem; text-align: center;">
                  <span [style.background]="getStatusColor(item.customer.status)" 
                        style="padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; color: white;">
                    {{ item.customer.status || 'ACTIVE' }}
                  </span>
                </td>
                <td style="padding: 1rem; text-align: center;">
                  <button (click)="viewCustomer(item.customer.customerId)" 
                          style="margin: 0 0.25rem; padding: 0.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
                    👁️
                  </button>
                  <button (click)="editCustomer(item.customer.customerId)" 
                          style="margin: 0 0.25rem; padding: 0.5rem; background: #f59e0b; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
                    ✏️
                  </button>
                  <button (click)="deleteCustomer(item.customer.customerId)" 
                          style="margin: 0 0.25rem; padding: 0.5rem; background: #ef4444; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
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

    .invoice-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
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
