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
    <div class="invoice-page-container">
      
      <!-- Header - Responsive -->
      <div class="invoice-page-header">
        <span style="font-size: 2rem;">📁</span>
        <h1 class="invoice-page-title">Liste des Factures</h1>
      </div>

      <!-- Stats Cards - Responsive Grid -->
      <div class="invoice-stats-grid stats-3-cols">
        <!-- Total Factures -->
        <div class="invoice-stat-card border-blue">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div style="display: none; width: 2.5rem; height: 2.5rem; background: #eff6ff; border-radius: 9999px; padding: 0.5rem; align-items: center; justify-content: center;">
              <span style="font-size: 1.25rem;">📄</span>
            </div>
            <div style="flex: 1; min-width: 0; text-align: center;">
              <div style="font-size: 1.125rem; font-weight: 700; color: #1f2937;">{{ filteredInvoices.length }}</div>
              <div style="font-size: 0.625rem; font-weight: 600; color: #6b7280; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Total Factures</div>
            </div>
          </div>
        </div>
        
        <!-- Montant Total -->
        <div class="invoice-stat-card border-green">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div style="display: none; width: 2.5rem; height: 2.5rem; background: #dcfce7; border-radius: 9999px; padding: 0.5rem; align-items: center; justify-content: center;">
              <span style="font-size: 1.25rem;">💵</span>
            </div>
            <div style="flex: 1; min-width: 0; text-align: center;">
              <div style="font-size: 1.125rem; font-weight: 700; color: #1f2937;">{{ getTotalAmount() | number:'1.3-3' }}</div>
              <div style="font-size: 0.625rem; font-weight: 600; color: #6b7280; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Montant (DNT)</div>
            </div>
          </div>
        </div>
        
        <!-- Total Dû -->
        <div class="invoice-stat-card border-orange">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div style="display: none; width: 2.5rem; height: 2.5rem; background: #fef3c7; border-radius: 9999px; padding: 0.5rem; align-items: center; justify-content: center;">
              <span style="font-size: 1.25rem;">💰</span>
            </div>
            <div style="flex: 1;">
              <div style="font-size: 0.625rem; color: #f59e0b; font-weight: 600; margin-bottom: 0.125rem; text-transform: uppercase;">Total Dû</div>
              <div style="font-size: 1rem; font-weight: 700; color: #1f2937;">{{ getTotalDue() | number:'1.3-3' }} DNT</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Filtres Card - Compact & Responsive -->
      <div class="invoice-card">
        <div class="invoice-card-header gradient-purple">
          <div style="display: flex; align-items: center; gap: 0.5rem; color: white;">
            <span style="font-size: 1rem;">🔍</span>
            <span class="invoice-card-header-title">Filtres</span>
          </div>
        </div>
        <div style="padding: 0.75rem 1rem;">
          <div style="display: grid; grid-template-columns: 1fr; gap: 0.75rem;">
            <!-- Statut -->
            <div style="display: flex; flex-direction: column; gap: 0.25rem;">
              <label style="font-size: 0.625rem; font-weight: 600; color: #6b7280; text-transform: uppercase;">Statut</label>
              <select [(ngModel)]="filterStatus" (change)="applyFilters()"
                      style="height: 2.25rem; width: 100%; background: white; font-size: 0.875rem; padding: 0 0.5rem; border: 1px solid #e5e7eb; border-radius: 0.375rem; outline: none;"
                      onfocus="this.style.borderColor='#6366f1'" onblur="this.style.borderColor='#e5e7eb'">
                <option value="">Tous les statuts</option>
                <option value="PAID">Payé</option>
                <option value="UNPAID">Impayé</option>
                <option value="PARTIALLY_PAID">Partiel</option>
              </select>
            </div>
            <!-- Client -->
            <div style="display: flex; flex-direction: column; gap: 0.25rem;">
              <label style="font-size: 0.625rem; font-weight: 600; color: #6b7280; text-transform: uppercase;">Client</label>
              <input type="text" [(ngModel)]="filterClient" (keyup)="applyFilters()" placeholder="Rechercher..."
                     style="height: 2.25rem; width: 100%; background: white; font-size: 0.875rem; padding: 0 0.5rem; border: 1px solid #e5e7eb; border-radius: 0.375rem; outline: none;"
                     onfocus="this.style.borderColor='#6366f1'" onblur="this.style.borderColor='#e5e7eb'">
            </div>
            <!-- Dates - Grid 2 columns on larger screens -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                <label style="font-size: 0.625rem; font-weight: 600; color: #6b7280; text-transform: uppercase;">Date de</label>
                <input type="date" [(ngModel)]="filterDateFrom" (change)="applyFilters()"
                       style="height: 2.25rem; width: 100%; background: white; font-size: 0.875rem; padding: 0 0.5rem; border: 1px solid #e5e7eb; border-radius: 0.375rem; outline: none;"
                       onfocus="this.style.borderColor='#6366f1'" onblur="this.style.borderColor='#e5e7eb'">
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                <label style="font-size: 0.625rem; font-weight: 600; color: #6b7280; text-transform: uppercase;">Date à</label>
                <input type="date" [(ngModel)]="filterDateTo" (change)="applyFilters()"
                       style="height: 2.25rem; width: 100%; background: white; font-size: 0.875rem; padding: 0 0.5rem; border: 1px solid #e5e7eb; border-radius: 0.375rem; outline: none;"
                       onfocus="this.style.borderColor='#6366f1'" onblur="this.style.borderColor='#e5e7eb'">
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Invoices List Card -->
      <div class="invoice-card">
        <div class="invoice-card-header gradient-blue">
          <div style="display: flex; align-items: center; gap: 0.5rem; color: white;">
            <span style="font-size: 1.125rem;">📁</span>
            <span class="invoice-card-header-title">Liste des Factures ({{ filteredInvoices.length }})</span>
          </div>
        </div>
        
        <!-- Desktop Table -->
        <div class="desktop-table" style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);">
                <th style="color: white; font-weight: 500; padding: 0.75rem 1rem; text-align: left;">N° FACTURE</th>
                <th style="color: white; font-weight: 500; padding: 0.75rem 1rem; text-align: left;">DATE</th>
                <th style="color: white; font-weight: 500; padding: 0.75rem 1rem; text-align: left;">CLIENT</th>
                <th style="color: white; font-weight: 500; padding: 0.75rem 1rem; text-align: right;">MONTANT TOTAL</th>
                <th style="color: white; font-weight: 500; padding: 0.75rem 1rem; text-align: right;">ACOMPTE</th>
                <th style="color: white; font-weight: 500; padding: 0.75rem 1rem; text-align: right;">MONTANT DÛ</th>
                <th style="color: white; font-weight: 500; padding: 0.75rem 1rem; text-align: center;">STATUT</th>
                <th style="color: white; font-weight: 500; padding: 0.75rem 1rem; text-align: center;">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let invoice of filteredInvoices; trackBy: trackByInvoiceId"
                  style="border-bottom: 1px solid #e5e7eb; transition: background 0.2s;"
                  onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
                <td style="padding: 0.75rem 1rem;">
                  <span style="display: inline-block; padding: 0.25rem 0.75rem; background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; border-radius: 0.375rem; font-weight: 600; font-size: 0.875rem;">
                    #{{ invoice.billId }}
                  </span>
                </td>
                <td style="padding: 0.75rem 1rem; color: #6b7280;">{{ invoice.billDate | date:'dd/MM/yyyy' }}</td>
                <td style="padding: 0.75rem 1rem;">
                  <div style="font-weight: 500; color: #1f2937;">{{ invoice.clientName }}</div>
                  <div style="font-size: 0.875rem; color: #6b7280;">{{ invoice.clientPhone }}</div>
                </td>
                <td style="padding: 0.75rem 1rem; text-align: right; font-weight: 500; color: #1f2937;">{{ invoice.totalAmount | number:'1.3-3' }}</td>
                <td style="padding: 0.75rem 1rem; text-align: right; color: #0891b2;">{{ invoice.deposit | number:'1.3-3' }}</td>
                <td style="padding: 0.75rem 1rem; text-align: right; font-weight: 500; color: #16a34a;">{{ invoice.amountDue | number:'1.3-3' }}</td>
                <td style="padding: 0.75rem 1rem; text-align: center;">
                  <span [ngClass]="getPaymentStatusClass(invoice.paymentStatus)"
                        style="padding: 0.375rem 0.75rem; border-radius: 0.375rem; font-weight: 600; font-size: 0.875rem; display: inline-block;">
                    {{ getPaymentStatusLabel(invoice.paymentStatus) }}
                  </span>
                </td>
                <td style="padding: 0.75rem 1rem;">
                  <div style="display: flex; align-items: center; justify-content: center; gap: 0.25rem;">
                    <button (click)="viewInvoice(invoice.billId)" title="Voir"
                            style="width: 2rem; height: 2rem; border-radius: 0.375rem; border: 1px solid #bfdbfe; background: #eff6ff; color: #1e40af; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"
                            onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='#eff6ff'">👁️</button>
                    <button (click)="downloadPDF(invoice.billId)" title="Télécharger"
                            style="width: 2rem; height: 2rem; border-radius: 0.375rem; border: 1px solid #bbf7d0; background: #dcfce7; color: #166534; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"
                            onmouseover="this.style.background='#bbf7d0'" onmouseout="this.style.background='#dcfce7'">⬇️</button>
                    <button (click)="sendInvoiceByEmail(invoice)" [disabled]="sendingEmail === invoice.billId" title="Email"
                            style="width: 2rem; height: 2rem; border-radius: 0.375rem; border: 1px solid #a5f3fc; background: #cffafe; color: #155e75; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"
                            [style.opacity]="sendingEmail === invoice.billId ? '0.5' : '1'"
                            onmouseover="if(!this.disabled) this.style.background='#a5f3fc'" onmouseout="this.style.background='#cffafe'">
                      {{ sendingEmail === invoice.billId ? '⏳' : '✉️' }}
                    </button>
                    <button *ngIf="invoice.paymentStatus === 'UNPAID' || invoice.paymentStatus === 'PARTIALLY_PAID'"
                            (click)="openPaymentModal(invoice)" title="Paiement"
                            style="width: 2rem; height: 2rem; border-radius: 0.375rem; border: 1px solid #fcd34d; background: #fde047; color: white; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"
                            onmouseover="this.style.background='#facc15'" onmouseout="this.style.background='#fde047'">💰</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Mobile Cards -->
        <div class="mobile-cards">
          <div *ngFor="let invoice of filteredInvoices; trackBy: trackByInvoiceId"
               style="border-bottom: 1px solid #e5e7eb; padding: 1rem; background: white;">
            <!-- Invoice ID with Badge and Date -->
            <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.75rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="display: inline-block; padding: 0.25rem 0.75rem; background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; border-radius: 0.375rem; font-weight: 600; font-size: 0.75rem;">
                  #{{ invoice.billId }}
                </span>
                <span style="color: #6b7280; font-size: 0.875rem;">{{ invoice.billDate | date:'dd/MM/yyyy' }}</span>
              </div>
              <span [ngClass]="getPaymentStatusClass(invoice.paymentStatus)"
                    style="padding: 0.25rem 0.75rem; border-radius: 0.375rem; font-weight: 600; font-size: 0.75rem; display: inline-block;">
                {{ getPaymentStatusLabel(invoice.paymentStatus) }}
              </span>
            </div>
            
            <!-- Client Info -->
            <div style="margin-bottom: 0.75rem;">
              <div style="font-weight: 600; color: #1f2937; font-size: 0.875rem; margin-bottom: 0.125rem;">{{ invoice.clientName }}</div>
              <div style="color: #6b7280; font-size: 0.875rem;">{{ invoice.clientPhone }}</div>
            </div>
            
            <!-- Amounts - 3 Columns Grid -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 1rem; font-size: 0.875rem;">
              <div style="background: #f8fafc; padding: 0.5rem; border-radius: 0.5rem; text-align: center;">
                <div style="font-size: 0.75rem; color: #6b7280; margin-bottom: 0.125rem;">Total</div>
                <div style="font-weight: 600; color: #1f2937; font-size: 0.875rem;">{{ invoice.totalAmount | number:'1.3-3' }}</div>
              </div>
              <div style="background: #f8fafc; padding: 0.5rem; border-radius: 0.5rem; text-align: center;">
                <div style="font-size: 0.75rem; color: #6b7280; margin-bottom: 0.125rem;">Acompte</div>
                <div style="font-weight: 600; color: #0891b2; font-size: 0.875rem;">{{ invoice.deposit | number:'1.3-3' }}</div>
              </div>
              <div style="background: #f8fafc; padding: 0.5rem; border-radius: 0.5rem; text-align: center;">
                <div style="font-size: 0.75rem; color: #6b7280; margin-bottom: 0.125rem;">Dû</div>
                <div style="font-weight: 600; color: #16a34a; font-size: 0.875rem;">{{ invoice.amountDue | number:'1.3-3' }}</div>
              </div>
            </div>
            
            <!-- Actions - Compact Buttons -->
            <div style="display: flex; flex-wrap: wrap; align-items: center; justify-end: flex-end; gap: 0.25rem; border-top: 1px solid #e5e7eb; padding-top: 0.75rem;">
              <button (click)="viewInvoice(invoice.billId)" title="Voir"
                      style="width: 2rem; height: 2rem; border-radius: 0.375rem; border: 1px solid #bfdbfe; background: #eff6ff; color: #1e40af; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"
                      onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='#eff6ff'">👁️</button>
              <button (click)="downloadPDF(invoice.billId)" title="Télécharger"
                      style="width: 2rem; height: 2rem; border-radius: 0.375rem; border: 1px solid #bbf7d0; background: #dcfce7; color: #166534; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"
                      onmouseover="this.style.background='#bbf7d0'" onmouseout="this.style.background='#dcfce7'">⬇️</button>
              <button (click)="sendInvoiceByEmail(invoice)" [disabled]="sendingEmail === invoice.billId" title="Email"
                      style="width: 2rem; height: 2rem; border-radius: 0.375rem; border: 1px solid #a5f3fc; background: #cffafe; color: #155e75; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"
                      [style.opacity]="sendingEmail === invoice.billId ? '0.5' : '1'"
                      onmouseover="if(!this.disabled) this.style.background='#a5f3fc'" onmouseout="this.style.background='#cffafe'">
                {{ sendingEmail === invoice.billId ? '⏳' : '✉️' }}
              </button>
              <button *ngIf="invoice.paymentStatus === 'UNPAID' || invoice.paymentStatus === 'PARTIALLY_PAID'"
                      (click)="openPaymentModal(invoice)" title="Paiement"
                      style="width: 2rem; height: 2rem; border-radius: 0.375rem; border: 1px solid #fcd34d; background: #fde047; color: white; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"
                      onmouseover="this.style.background='#facc15'" onmouseout="this.style.background='#fde047'">💰</button>
            </div>
          </div>
          
          <!-- Empty State -->
          <div *ngIf="filteredInvoices.length === 0" style="text-align: center; padding: 3rem 1rem; color: #7f8c8d;">
            <div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.5;">📭</div>
            <p style="font-size: 1.1rem; margin: 0;">Aucune facture trouvée</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InvoiceListComponent implements OnInit {
  invoices: any[] = [];
  filteredInvoices: any[] = [];
  
  filterStatus = '';
  filterClient = '';
  filterDateFrom = '';
  filterDateTo = '';
  
  sendingEmail: number | null = null;
  emailSuccess = '';
  emailError = '';

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

  sendInvoiceByEmail(invoice: any): void {
    if (!invoice.clientEmail) {
      alert('❌ Ce client n\'a pas d\'adresse email enregistrée.');
      return;
    }
    
    if (confirm(`Envoyer la facture #${invoice.billId} par email à ${invoice.clientEmail} ?`)) {
      this.sendingEmail = invoice.billId;
      this.emailError = '';
      this.emailSuccess = '';
      
      this.apiService.sendInvoiceByEmail(invoice.billId).subscribe({
        next: () => {
          this.sendingEmail = null;
          this.emailSuccess = `✅ Facture #${invoice.billId} envoyée avec succès à ${invoice.clientEmail}`;
          alert(this.emailSuccess);
          setTimeout(() => this.emailSuccess = '', 5000);
        },
        error: (error: any) => {
          this.sendingEmail = null;
          this.emailError = `❌ Erreur lors de l'envoi de la facture: ${error.message || 'Erreur inconnue'}`;
          alert(this.emailError);
          console.error('Erreur lors de l\'envoi par email:', error);
        }
      });
    }
  }

  paymentModalInvoice: any = null;
  paymentAmount: number = 0;
  paymentError: string = '';

  openPaymentModal(invoice: any) {
    this.paymentModalInvoice = invoice;
    this.paymentAmount = invoice.amountDue;
    this.paymentError = '';
    const amountDueFormatted = invoice.amountDue.toFixed(3);
    const montant = prompt(`Montant à enregistrer pour la facture #${invoice.billId} (max: ${amountDueFormatted} DNT)`, amountDueFormatted);
    if (montant !== null) {
      const value = Number(montant);
      if (isNaN(value) || value <= 0 || value > invoice.amountDue) {
        alert('Montant invalide ou supérieur au montant dû.');
        return;
      }
      this.registerPayment(invoice, value);
    }
  }

  registerPayment(invoice: any, amount: number) {
    this.apiService.registerInvoicePayment(invoice.billId, amount).subscribe({
      next: (updatedInvoice: any) => {
        const idx = this.invoices.findIndex(inv => inv.billId === invoice.billId);
        if (idx !== -1) {
          this.invoices[idx] = updatedInvoice;
          this.applyFilters();
        }
        alert('Paiement enregistré avec succès !');
      },
      error: (error: any) => {
        alert('Erreur lors de l\'enregistrement du paiement.');
        console.error(error);
      }
    });
  }
}
