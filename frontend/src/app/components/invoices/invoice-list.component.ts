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
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i class="bi bi-list-ul me-2"></i>
          Liste des Factures ({{ filteredInvoices.length }})
        </h2>
        <a routerLink="/invoices/create" class="btn btn-primary">
          <i class="bi bi-plus-circle me-2"></i>
          Nouvelle Facture
        </a>
      </div>

      <!-- Filters -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label fw-semibold">Statut de Paiement</label>
              <select class="form-select" [(ngModel)]="filterStatus" (change)="applyFilters()">
                <option value="">Tous les statuts</option>
                <option value="PAID">Payé</option>
                <option value="UNPAID">Impayé</option>
                <option value="PARTIALLY_PAID">Partiellement Payé</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label fw-semibold">Client</label>
              <input type="text" class="form-control" placeholder="Rechercher client..." 
                     [(ngModel)]="filterClient" (keyup)="applyFilters()">
            </div>
            <div class="col-md-3">
              <label class="form-label fw-semibold">Date de</label>
              <input type="date" class="form-control" [(ngModel)]="filterDateFrom" (change)="applyFilters()">
            </div>
            <div class="col-md-3">
              <label class="form-label fw-semibold">Date à</label>
              <input type="date" class="form-control" [(ngModel)]="filterDateTo" (change)="applyFilters()">
            </div>
          </div>
        </div>
      </div>

      <!-- Invoices Table -->
      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
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
    .table > tbody > tr {
      transition: background-color 0.15s ease;
    }
    .table > tbody > tr:hover {
      background-color: rgba(102, 126, 234, 0.05);
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
