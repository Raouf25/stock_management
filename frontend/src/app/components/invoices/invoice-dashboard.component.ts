import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-invoice-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="invoice-dashboard-page">
      <h1 class="mb-4">📊 Dashboard Facturation</h1>

      <!-- Loading Spinner -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Chargement...</span>
        </div>
        <p class="mt-3 text-muted">Chargement des données...</p>
      </div>

      <!-- KPIs Cards -->
      <div *ngIf="!loading" class="row mb-4">
        <div class="col-md-3">
          <div class="stat-card stat-card-blue">
            <div class="stat-icon">📋</div>
            <div class="stat-number">{{ kpis?.totalInvoices || 0 }}</div>
            <div class="stat-label">Total Factures</div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="stat-card stat-card-green">
            <div class="stat-icon">💰</div>
            <div class="stat-number">{{ (kpis?.totalInvoicedAmount || 0) | number:'1.2-2' }}</div>
            <div class="stat-label">Chiffre d'Affaires (DNT)</div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="stat-card stat-card-warning">
            <div class="stat-icon">⚠️</div>
            <div class="stat-number">{{ kpis?.unpaidInvoices || 0 }}</div>
            <div class="stat-label">Factures Impayées</div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="stat-card stat-card-purple">
            <div class="stat-icon">📅</div>
            <div class="stat-number">{{ kpis?.invoicesThisMonth || 0 }}</div>
            <div class="stat-label">Ce Mois</div>
          </div>
        </div>
      </div>

      <!-- Second Row -->
      <div *ngIf="!loading" class="row g-4">
        <div class="col-md-6">
          <div class="card chart-card">
            <div class="card-header bg-gradient-primary">
              <i class="bi bi-pie-chart me-2"></i>
              Statuts de Paiement
            </div>
            <div class="card-body">
              <div *ngFor="let status of getPaymentStatusArray()" class="d-flex justify-content-between align-items-center mb-3 p-3 rounded status-item">
                <span class="badge" [ngClass]="getStatusClass(status.key)">{{ getStatusLabel(status.key) }}</span>
                <span class="fw-bold fs-4">{{ status.value }}</span>
              </div>
              <div *ngIf="getPaymentStatusArray().length === 0" class="text-center text-muted py-3">
                <i class="bi bi-inbox fs-1"></i>
                <p class="mb-0 mt-2">Aucune donnée disponible</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-6">
          <div class="card chart-card">
            <div class="card-header bg-gradient-success">
              <i class="bi bi-cash-stack me-2"></i>
              Résumé Financier
            </div>
            <div class="card-body">
              <div class="row text-center mb-4">
                <div class="col-6">
                  <div class="financial-stat">
                    <h3 class="text-success mb-1">{{ (kpis?.revenueThisMonth || 0) | number:'1.2-2' }}</h3>
                    <p class="text-muted mb-0">CA ce Mois (DNT)</p>
                  </div>
                </div>
                <div class="col-6">
                  <div class="financial-stat">
                    <h3 class="text-danger mb-1">{{ (kpis?.totalAmountDue || 0) | number:'1.2-2' }}</h3>
                    <p class="text-muted mb-0">Total Dû (DNT)</p>
                  </div>
                </div>
              </div>
              <hr>
              <div class="text-center">
                <div class="financial-stat">
                  <h3 class="text-info mb-1">{{ (kpis?.averageInvoiceAmount || 0) | number:'1.2-2' }} DNT</h3>
                  <p class="text-muted mb-0">Panier Moyen</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadKPIs();
  }

  loadKPIs(): void {
    this.loading = true;
    this.apiService.getInvoiceKPIs().subscribe({
      next: (data: any) => {
        this.kpis = data;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des KPIs:', error);
        this.loading = false;
      }
    });
  }

  getPaymentStatusArray(): {key: string, value: number}[] {
    if (!this.kpis?.paymentStatusDistribution) return [];
    return Object.entries(this.kpis.paymentStatusDistribution).map(([key, value]) => ({ key, value: value as number }));
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
