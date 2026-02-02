import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-invoice-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="min-height: 100vh; background: linear-gradient(135deg, rgb(240 249 255) 0%, rgb(224 242 254) 100%); padding: 2rem;">
      
      <!-- Header Section -->
      <div style="background: linear-gradient(135deg, rgb(79 70 229) 0%, rgb(124 58 237) 100%); border-radius: 1rem; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 10px 40px rgba(79, 70, 229, 0.3);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 style="color: white; font-size: 2rem; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 0.75rem;">
              <svg style="width: 2.5rem; height: 2.5rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              Dashboard Facturation
            </h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 0.5rem 0 0 0; font-size: 1rem;">Vue d'ensemble de votre activité de facturation</p>
          </div>
          <a 
            [routerLink]="['/invoices/create']"
            style="background: white; color: rgb(79 70 229); padding: 0.75rem 1.5rem; border-radius: 0.5rem; border: none; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); transition: all 0.3s ease; text-decoration: none;"
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(0, 0, 0, 0.15)'"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(0, 0, 0, 0.1)'">
            <svg style="width: 1.25rem; height: 1.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Nouvelle Facture
          </a>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div *ngIf="loading" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5rem 0;">
        <div style="width: 4rem; height: 4rem; border: 4px solid rgb(224 242 254); border-top-color: rgb(79 70 229); border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <p style="margin-top: 1rem; color: rgb(107 114 128); font-weight: 500;">Chargement des données...</p>
      </div>

      <div *ngIf="!loading">
        <!-- KPI Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
          
          <!-- Total Factures -->
          <div style="background: white; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border-top: 4px solid rgb(59 130 246); transition: all 0.3s ease;"
               onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 24px rgba(0, 0, 0, 0.1)'"
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(0, 0, 0, 0.05)'">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
              <div style="width: 3rem; height: 3rem; background: linear-gradient(135deg, rgb(59 130 246) 0%, rgb(37 99 235) 100%); border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem;">
                <svg style="width: 1.75rem; height: 1.75rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div style="flex: 1;">
                <div style="color: rgb(107 114 128); font-size: 0.875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">Total Factures</div>
                <div style="color: rgb(17 24 39); font-size: 2rem; font-weight: 700; line-height: 1;">{{ kpis?.totalInvoices || 0 }}</div>
              </div>
            </div>
            <div style="padding-top: 0.75rem; border-top: 1px solid rgb(229 231 235);">
              <span style="color: rgb(107 114 128); font-size: 0.875rem;">Toutes périodes confondues</span>
            </div>
          </div>

          <!-- Chiffre d'Affaires -->
          <div style="background: white; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border-top: 4px solid rgb(34 197 94); transition: all 0.3s ease;"
               onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 24px rgba(0, 0, 0, 0.1)'"
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(0, 0, 0, 0.05)'">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
              <div style="width: 3rem; height: 3rem; background: linear-gradient(135deg, rgb(34 197 94) 0%, rgb(22 163 74) 100%); border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem;">
                <svg style="width: 1.75rem; height: 1.75rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div style="flex: 1;">
                <div style="color: rgb(107 114 128); font-size: 0.875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">Chiffre d'Affaires</div>
                <div style="color: rgb(17 24 39); font-size: 2rem; font-weight: 700; line-height: 1;">{{ (kpis?.totalInvoicedAmount || 0) | number:'1.2-2' }}</div>
              </div>
            </div>
            <div style="padding-top: 0.75rem; border-top: 1px solid rgb(229 231 235);">
              <span style="color: rgb(34 197 94); font-size: 0.875rem; font-weight: 600;">DNT</span>
            </div>
          </div>

          <!-- Factures Impayées -->
          <div style="background: white; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border-top: 4px solid rgb(239 68 68); transition: all 0.3s ease;"
               onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 24px rgba(0, 0, 0, 0.1)'"
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(0, 0, 0, 0.05)'">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
              <div style="width: 3rem; height: 3rem; background: linear-gradient(135deg, rgb(239 68 68) 0%, rgb(220 38 38) 100%); border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem;">
                <svg style="width: 1.75rem; height: 1.75rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <div style="flex: 1;">
                <div style="color: rgb(107 114 128); font-size: 0.875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">Impayées</div>
                <div style="color: rgb(17 24 39); font-size: 2rem; font-weight: 700; line-height: 1;">{{ kpis?.unpaidInvoices || 0 }}</div>
              </div>
            </div>
            <div style="padding-top: 0.75rem; border-top: 1px solid rgb(229 231 235);">
              <span style="color: rgb(239 68 68); font-size: 0.875rem; font-weight: 600;">{{ (kpis?.totalAmountDue || 0) | number:'1.2-2' }} DNT</span>
            </div>
          </div>

          <!-- Ce Mois -->
          <div style="background: white; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border-top: 4px solid rgb(168 85 247); transition: all 0.3s ease;"
               onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 24px rgba(0, 0, 0, 0.1)'"
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(0, 0, 0, 0.05)'">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
              <div style="width: 3rem; height: 3rem; background: linear-gradient(135deg, rgb(168 85 247) 0%, rgb(147 51 234) 100%); border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem;">
                <svg style="width: 1.75rem; height: 1.75rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div style="flex: 1;">
                <div style="color: rgb(107 114 128); font-size: 0.875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">Ce Mois</div>
                <div style="color: rgb(17 24 39); font-size: 2rem; font-weight: 700; line-height: 1;">{{ kpis?.invoicesThisMonth || 0 }}</div>
              </div>
            </div>
            <div style="padding-top: 0.75rem; border-top: 1px solid rgb(229 231 235);">
              <span style="color: rgb(168 85 247); font-size: 0.875rem; font-weight: 600;">{{ (kpis?.revenueThisMonth || 0) | number:'1.2-2' }} DNT</span>
            </div>
          </div>

        </div>

        <!-- Second Row: Charts and Stats -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem;">
          
          <!-- Payment Status Distribution -->
          <div style="background: white; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <div style="background: linear-gradient(135deg, rgb(79 70 229) 0%, rgb(124 58 237) 100%); border-radius: 0.75rem; padding: 1rem; margin: -1.5rem -1.5rem 1.5rem -1.5rem;">
              <h3 style="color: white; font-size: 1.25rem; font-weight: 600; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                <svg style="width: 1.5rem; height: 1.5rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                </svg>
                Statuts de Paiement
              </h3>
            </div>
            
            <div *ngIf="paymentStatusArray.length > 0">
              <div *ngFor="let status of paymentStatusArray" 
                   style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; margin-bottom: 0.75rem; background: linear-gradient(135deg, rgb(249 250 251) 0%, rgb(243 244 246) 100%); border-radius: 0.5rem; transition: all 0.3s ease;"
                   onmouseover="this.style.transform='translateX(4px)'; this.style.background='linear-gradient(135deg, rgb(243 244 246) 0%, rgb(229 231 235) 100%)'"
                   onmouseout="this.style.transform='translateX(0)'; this.style.background='linear-gradient(135deg, rgb(249 250 251) 0%, rgb(243 244 246) 100%)'">
                <span [style.background]="getStatusColor(status.key)" 
                      [style.color]="status.key === 'PARTIALLY_PAID' ? 'rgb(17 24 39)' : 'white'"
                      style="padding: 0.5rem 1rem; border-radius: 1.5rem; font-size: 0.875rem; font-weight: 600;">
                  {{ getStatusLabel(status.key) }}
                </span>
                <span style="font-weight: 700; font-size: 1.5rem; color: rgb(17 24 39);">{{ status.value }}</span>
              </div>
            </div>
            
            <div *ngIf="paymentStatusArray.length === 0" style="text-align: center; padding: 3rem 1rem; color: rgb(156 163 175);">
              <svg style="width: 4rem; height: 4rem; margin: 0 auto 1rem; opacity: 0.5;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
              </svg>
              <p style="margin: 0; font-weight: 500;">Aucune donnée disponible</p>
            </div>
          </div>

          <!-- Financial Summary -->
          <div style="background: white; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <div style="background: linear-gradient(135deg, rgb(34 197 94) 0%, rgb(22 163 74) 100%); border-radius: 0.75rem; padding: 1rem; margin: -1.5rem -1.5rem 1.5rem -1.5rem;">
              <h3 style="color: white; font-size: 1.25rem; font-weight: 600; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                <svg style="width: 1.5rem; height: 1.5rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
                Résumé Financier
              </h3>
            </div>
            
            <div style="display: grid; gap: 1rem;">
              <!-- CA This Month -->
              <div style="background: linear-gradient(135deg, rgb(240 253 244) 0%, rgb(220 252 231) 100%); border-radius: 0.75rem; padding: 1.25rem; border-left: 4px solid rgb(34 197 94);">
                <div style="color: rgb(22 163 74); font-size: 0.875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">CA ce Mois</div>
                <div style="color: rgb(17 24 39); font-size: 2rem; font-weight: 700;">{{ (kpis?.revenueThisMonth || 0) | number:'1.2-2' }}</div>
                <div style="color: rgb(22 163 74); font-size: 0.875rem; font-weight: 500; margin-top: 0.25rem;">DNT</div>
              </div>

              <!-- Total Due -->
              <div style="background: linear-gradient(135deg, rgb(254 242 242) 0%, rgb(254 226 226) 100%); border-radius: 0.75rem; padding: 1.25rem; border-left: 4px solid rgb(239 68 68);">
                <div style="color: rgb(220 38 38); font-size: 0.875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Total Dû</div>
                <div style="color: rgb(17 24 39); font-size: 2rem; font-weight: 700;">{{ (kpis?.totalAmountDue || 0) | number:'1.2-2' }}</div>
                <div style="color: rgb(220 38 38); font-size: 0.875rem; font-weight: 500; margin-top: 0.25rem;">DNT</div>
              </div>

              <!-- Average Basket -->
              <div style="background: linear-gradient(135deg, rgb(240 249 255) 0%, rgb(224 242 254) 100%); border-radius: 0.75rem; padding: 1.25rem; border-left: 4px solid rgb(59 130 246);">
                <div style="color: rgb(37 99 235); font-size: 0.875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Panier Moyen</div>
                <div style="color: rgb(17 24 39); font-size: 2rem; font-weight: 700;">{{ (kpis?.averageInvoiceAmount || 0) | number:'1.2-2' }}</div>
                <div style="color: rgb(37 99 235); font-size: 0.875rem; font-weight: 500; margin-top: 0.25rem;">DNT</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <style>
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `,
  styles: [`
    .invoice-dashboard-page {
      padding: 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
    }

    /* Stat Cards */
    .stat-card {
      background: white;
      padding: 25px;
      border-radius: 15px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
    }

    .stat-card-blue::before {
      background: linear-gradient(90deg, #3498db 0%, #2980b9 100%);
    }

    .stat-card-green::before {
      background: linear-gradient(90deg, #2ecc71 0%, #27ae60 100%);
    }

    .stat-card-warning::before {
      background: linear-gradient(90deg, #f39c12 0%, #e67e22 100%);
    }

    .stat-card-purple::before {
      background: linear-gradient(90deg, #9b59b6 0%, #8e44ad 100%);
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
    }

    .stat-icon {
      font-size: 2.5rem;
      margin-bottom: 10px;
      opacity: 0.8;
    }

    .stat-number {
      font-size: 2.2rem;
      font-weight: bold;
      color: #2c3e50;
      margin: 10px 0;
    }

    .stat-label {
      color: #7f8c8d;
      font-size: 0.95rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Chart Cards */
    .chart-card {
      border: none;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .chart-card:hover {
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
    }

    .chart-card .card-header {
      color: white;
      font-weight: 600;
      font-size: 1.1rem;
      padding: 15px 20px;
      border: none;
    }

    .bg-gradient-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .bg-gradient-success {
      background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
    }

    .status-item {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      transition: all 0.3s ease;
    }

    .status-item:hover {
      background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
      transform: translateX(5px);
    }

    .financial-stat {
      padding: 15px;
      border-radius: 10px;
      background: #f8f9fa;
    }

    .badge {
      padding: 8px 15px;
      font-size: 0.9rem;
      border-radius: 20px;
    }

    /* Card */
    .card {
      border: none;
      border-radius: 15px;
      overflow: hidden;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .invoice-dashboard-page {
        padding: 10px;
      }
      
      .stat-number {
        font-size: 1.8rem;
      }
      
      .stat-icon {
        font-size: 2rem;
      }
    }
  `]
})
export class InvoiceDashboardComponent implements OnInit {
  kpis: any = {};
  loading = true;
  paymentStatusArray: {key: string, value: number}[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadKPIs();
  }

  loadKPIs(): void {
    this.loading = true;
    this.apiService.getInvoiceKPIs().subscribe({
      next: (data: any) => {
        this.kpis = data;
        this.paymentStatusArray = this.calculatePaymentStatusArray();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des KPIs:', error);
        this.loading = false;
      }
    });
  }

  calculatePaymentStatusArray(): {key: string, value: number}[] {
    if (!this.kpis?.paymentStatusDistribution) return [];
    return Object.entries(this.kpis.paymentStatusDistribution).map(([key, value]) => ({ key, value: value as number }));
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PAID': return 'linear-gradient(135deg, rgb(34 197 94) 0%, rgb(22 163 74) 100%)';
      case 'UNPAID': return 'linear-gradient(135deg, rgb(239 68 68) 0%, rgb(220 38 38) 100%)';
      case 'PARTIALLY_PAID': return 'linear-gradient(135deg, rgb(251 191 36) 0%, rgb(245 158 11) 100%)';
      default: return 'linear-gradient(135deg, rgb(107 114 128) 0%, rgb(75 85 99) 100%)';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PAID': return 'bg-success';
      case 'UNPAID': return 'bg-danger';
      case 'PARTIALLY_PAID': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PAID': return 'Payé';
      case 'UNPAID': return 'Impayé';
      case 'PARTIALLY_PAID': return 'Partiellement Payé';
      default: return status;
    }
  }
}
