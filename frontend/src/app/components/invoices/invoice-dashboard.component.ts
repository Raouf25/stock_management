import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-invoice-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <h2 class="mb-4">
            <i class="bi bi-graph-up-arrow me-2"></i>
            Dashboard Facturation
          </h2>
        </div>
      </div>

      <!-- KPIs Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="rounded-circle bg-primary bg-opacity-10 p-3 d-inline-block mb-3">
                <i class="bi bi-receipt fs-2 text-primary"></i>
              </div>
              <h3 class="card-title mb-1">{{ kpis?.totalInvoices || 0 }}</h3>
              <p class="card-text text-muted mb-0">Total Factures</p>
            </div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="rounded-circle bg-success bg-opacity-10 p-3 d-inline-block mb-3">
                <i class="bi bi-currency-exchange fs-2 text-success"></i>
              </div>
              <h3 class="card-title mb-1">{{ (kpis?.totalInvoicedAmount || 0) | number:'1.2-2' }} <small class="fs-6">DNT</small></h3>
              <p class="card-text text-muted mb-0">Chiffre d'Affaires</p>
            </div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="rounded-circle bg-warning bg-opacity-10 p-3 d-inline-block mb-3">
                <i class="bi bi-exclamation-triangle fs-2 text-warning"></i>
              </div>
              <h3 class="card-title mb-1">{{ kpis?.unpaidInvoices || 0 }}</h3>
              <p class="card-text text-muted mb-0">Factures Impayées</p>
            </div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="rounded-circle bg-info bg-opacity-10 p-3 d-inline-block mb-3">
                <i class="bi bi-calendar-month fs-2 text-info"></i>
              </div>
              <h3 class="card-title mb-1">{{ kpis?.invoicesThisMonth || 0 }}</h3>
              <p class="card-text text-muted mb-0">Ce Mois</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Second Row -->
      <div class="row g-3">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-0">
              <h5 class="card-title mb-0">
                <i class="bi bi-pie-chart me-2 text-primary"></i>
                Statuts de Paiement
              </h5>
            </div>
            <div class="card-body">
              <div *ngFor="let status of getPaymentStatusArray()" class="d-flex justify-content-between align-items-center mb-3 p-2 rounded bg-light">
                <span class="badge" [ngClass]="getStatusClass(status.key)">{{ getStatusLabel(status.key) }}</span>
                <span class="fw-bold fs-5">{{ status.value }}</span>
              </div>
              <div *ngIf="getPaymentStatusArray().length === 0" class="text-center text-muted py-3">
                <i class="bi bi-inbox fs-1"></i>
                <p class="mb-0 mt-2">Aucune donnée disponible</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-0">
              <h5 class="card-title mb-0">
                <i class="bi bi-cash-stack me-2 text-success"></i>
                Résumé Financier
              </h5>
            </div>
            <div class="card-body">
              <div class="row text-center">
                <div class="col-6 border-end">
                  <h4 class="text-success mb-1">{{ (kpis?.revenueThisMonth || 0) | number:'1.2-2' }}</h4>
                  <small class="text-muted">CA ce Mois (DNT)</small>
                </div>
                <div class="col-6">
                  <h4 class="text-danger mb-1">{{ (kpis?.totalAmountDue || 0) | number:'1.2-2' }}</h4>
                  <small class="text-muted">Total Dû (DNT)</small>
                </div>
              </div>
              <hr>
              <div class="text-center">
                <h5 class="text-info mb-1">{{ (kpis?.averageInvoiceAmount || 0) | number:'1.2-2' }} DNT</h5>
                <small class="text-muted">Panier Moyen</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
    }
  `]
})
export class InvoiceDashboardComponent implements OnInit {
  kpis: any = {};

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadKPIs();
  }

  loadKPIs(): void {
    this.apiService.getInvoiceKPIs().subscribe({
      next: (data: any) => {
        this.kpis = data;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des KPIs:', error);
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
