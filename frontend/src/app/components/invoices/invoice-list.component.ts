import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="invoice-list-page">
      <h1 class="mb-4">📋 Liste des Factures</h1>

      <!-- KPIs Row -->
      <div class="row mb-4">
        <div class="col-md-4">
          <div class="stat-card stat-card-blue">
            <div class="stat-icon">📄</div>
            <div class="stat-number">{{ filteredInvoices.length }}</div>
            <div class="stat-label">Total Factures</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="stat-card stat-card-green">
            <div class="stat-icon">💰</div>
            <div class="stat-number">{{ getTotalAmount() | number:'1.2-2' }}</div>
            <div class="stat-label">Montant Total (DNT)</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="stat-card stat-card-warning">
            <div class="stat-icon">⏳</div>
            <div class="stat-number">{{ getTotalDue() | number:'1.2-2' }}</div>
            <div class="stat-label">Total Dû (DNT)</div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mb-4">
        <a routerLink="/invoices/create" class="btn btn-success btn-lg btn-action">
          ➕ Nouvelle Facture
        </a>
      </div>

      <!-- Filters Card -->
      <div class="card filter-card mb-4">
        <div class="card-header">
          <i class="bi bi-funnel me-2"></i>
          Filtres
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label fw-bold">Statut de Paiement</label>
              <select class="form-control form-control-modern" [(ngModel)]="filterStatus" (change)="applyFilters()">
                <option value="">Tous les statuts</option>
                <option value="PAID">Payé</option>
                <option value="UNPAID">Impayé</option>
                <option value="PARTIALLY_PAID">Partiellement Payé</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label fw-bold">Client</label>
              <input type="text" class="form-control form-control-modern" placeholder="Rechercher client..." 
                     [(ngModel)]="filterClient" (keyup)="applyFilters()">
            </div>
            <div class="col-md-3">
              <label class="form-label fw-bold">Date de</label>
              <input type="date" class="form-control form-control-modern" [(ngModel)]="filterDateFrom" (change)="applyFilters()">
            </div>
            <div class="col-md-3">
              <label class="form-label fw-bold">Date à</label>
              <input type="date" class="form-control form-control-modern" [(ngModel)]="filterDateTo" (change)="applyFilters()">
            </div>
          </div>
        </div>
      </div>

      <!-- Invoices Table -->
      <div class="card table-card">
        <div class="card-header">
          📋 Liste des Factures ({{ filteredInvoices.length }})
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th class="px-4">N° Facture</th>
                  <th>Date</th>
                  <th>Client</th>
                  <th class="text-end">Montant Total</th>
                  <th class="text-end">Acompte</th>
                  <th class="text-end">Montant Dû</th>
                  <th class="text-center">Statut</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let invoice of filteredInvoices; trackBy: trackByInvoiceId">
                  <td class="px-4">
                    <span class="badge bg-primary bg-opacity-10 text-primary fw-semibold">
                      #{{ invoice.billId }}
                    </span>
                  </td>
                  <td>{{ invoice.billDate | date:'dd/MM/yyyy' }}</td>
                  <td>
                    <div class="fw-semibold">{{ invoice.clientName }}</div>
                    <small class="text-muted">{{ invoice.clientPhone }}</small>
                  </td>
                  <td class="text-end fw-bold">{{ invoice.totalAmount | number:'1.2-2' }} DNT</td>
                  <td class="text-end text-success">{{ invoice.deposit | number:'1.2-2' }} DNT</td>
                  <td class="text-end">
                    <span class="fw-bold" [class]="invoice.amountDue > 0 ? 'text-danger' : 'text-success'">
                      {{ invoice.amountDue | number:'1.2-2' }} DNT
                    </span>
                  </td>
                  <td class="text-center">
                    <span class="badge" [ngClass]="getPaymentStatusClass(invoice.paymentStatus)">
                      {{ getPaymentStatusLabel(invoice.paymentStatus) }}
                    </span>
                  </td>
                  <td class="text-center">
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary" title="Voir" (click)="viewInvoice(invoice.billId)">
                        <i class="bi bi-eye"></i>
                      </button>
                      <button class="btn btn-outline-success" title="Télécharger PDF" (click)="downloadPDF(invoice.billId)">
                        <i class="bi bi-download"></i>
                      </button>
                      <button class="btn btn-outline-danger" title="Supprimer" (click)="deleteInvoice(invoice.billId)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="filteredInvoices.length === 0">
                  <td colspan="8" class="text-center py-5">
                    <i class="bi bi-inbox fs-1 text-muted"></i>
                    <p class="mt-2 mb-0 text-muted">Aucune facture trouvée</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .invoice-list-page {
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

    /* Action Button */
    .btn-action {
      box-shadow: 0 5px 15px rgba(46, 204, 113, 0.3);
      transition: all 0.3s ease;
      border-radius: 25px;
      padding: 12px 30px;
      font-weight: 600;
    }

    .btn-action:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(46, 204, 113, 0.4);
    }

    /* Filter Card */
    .filter-card {
      border: none;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .filter-card .card-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: 600;
      font-size: 1.1rem;
      padding: 15px 20px;
      border: none;
    }

    .form-control-modern {
      border-radius: 10px;
      border: 2px solid #e0e0e0;
      padding: 10px 15px;
      transition: all 0.3s ease;
    }

    .form-control-modern:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    }

    /* Table Card */
    .table-card {
      border: none;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .table-card .card-header {
      background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
      color: white;
      font-weight: 600;
      font-size: 1.1rem;
      padding: 15px 20px;
      border: none;
    }

    .table {
      margin-bottom: 0;
    }

    .table thead {
      background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    }

    .table thead th {
      color: white;
      border: none;
      font-weight: 600;
      padding: 1rem;
    }

    .table > tbody > tr {
      transition: background-color 0.15s ease;
    }

    .table > tbody > tr:hover {
      background-color: rgba(102, 126, 234, 0.05);
    }

    .table-responsive {
      border-radius: 0 0 15px 15px;
      overflow: hidden;
    }

    /* Badges */
    .badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-weight: 500;
      font-size: 0.85rem;
    }

    /* Card */
    .card {
      border: none;
      border-radius: 15px;
      overflow: hidden;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .invoice-list-page {
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
export class InvoiceListComponent implements OnInit {
  invoices: any[] = [];
  filteredInvoices: any[] = [];
  
  filterStatus = '';
  filterClient = '';
  filterDateFrom = '';
  filterDateTo = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  getTotalAmount(): number {
    return this.filteredInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  }

  getTotalDue(): number {
    return this.filteredInvoices.reduce((sum, inv) => sum + (inv.amountDue || 0), 0);
  }

  loadInvoices(): void {
    this.apiService.getAllBills().subscribe({
      next: (data: any[]) => {
        this.invoices = data;
        this.applyFilters();
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des factures:', error);
      }
    });
  }

  applyFilters(): void {
    this.filteredInvoices = this.invoices.filter(invoice => {
      if (this.filterStatus && invoice.paymentStatus !== this.filterStatus) {
        return false;
      }
      if (this.filterClient && !invoice.clientName?.toLowerCase().includes(this.filterClient.toLowerCase())) {
        return false;
      }
      const invoiceDate = new Date(invoice.billDate);
      if (this.filterDateFrom && invoiceDate < new Date(this.filterDateFrom)) {
        return false;
      }
      if (this.filterDateTo && invoiceDate > new Date(this.filterDateTo)) {
        return false;
      }
      return true;
    });
  }

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'PAID': return 'bg-success';
      case 'UNPAID': return 'bg-danger';
      case 'PARTIALLY_PAID': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  }

  getPaymentStatusLabel(status: string): string {
    switch (status) {
      case 'PAID': return 'Payé';
      case 'UNPAID': return 'Impayé';
      case 'PARTIALLY_PAID': return 'Partiellement Payé';
      default: return status;
    }
  }

  trackByInvoiceId(index: number, invoice: any): number {
    return invoice.billId;
  }

  viewInvoice(invoiceId: number): void {
    console.log('View invoice:', invoiceId);
  }

  downloadPDF(invoiceId: number): void {
    this.apiService.downloadInvoicePDF(invoiceId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `facture-${invoiceId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error: any) => {
        console.error('Erreur lors du téléchargement PDF:', error);
      }
    });
  }

  deleteInvoice(invoiceId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      this.apiService.deleteBill(invoiceId).subscribe({
        next: () => {
          this.loadInvoices();
        },
        error: (error: any) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }
}
