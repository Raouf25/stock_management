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
    <div style="min-height: 100vh; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 1.5rem;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 1rem; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 style="color: white; font-size: 1.8rem; font-weight: 700; margin: 0;">📁 Liste des Factures</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 0.5rem 0 0 0; font-size: 0.95rem;">Gestion de vos factures</p>
          </div>
          <a routerLink="/invoices/create"
             style="background: white; color: #667eea; padding: 0.75rem 1.5rem; border-radius: 0.5rem; border: none; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); transition: all 0.3s ease;"
             onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(0, 0, 0, 0.15)'"
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(0, 0, 0, 0.1)'">
            ➕ Nouvelle Facture
          </a>
        </div>
      </div>

      <!-- Stats Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
        <div style="background: white; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08); display: flex; align-items: center; gap: 1rem; border-left: 5px solid #3498db; transition: all 0.3s ease;"
             onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 25px rgba(0, 0, 0, 0.12)'"
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(0, 0, 0, 0.08)'">
          <div style="width: 3.5rem; height: 3.5rem; background: linear-gradient(135deg, #3498db20, #2980b920); border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">📄</div>
          <div style="flex: 1;">
            <div style="font-size: 0.85rem; color: #7f8c8d; font-weight: 600; text-transform: uppercase; margin-bottom: 0.25rem;">Total Factures</div>
            <div style="font-size: 1.8rem; font-weight: 700; color: #2c3e50;">{{ filteredInvoices.length }}</div>
          </div>
        </div>
        <div style="background: white; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08); display: flex; align-items: center; gap: 1rem; border-left: 5px solid #2ecc71; transition: all 0.3s ease;"
             onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 25px rgba(0, 0, 0, 0.12)'"
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(0, 0, 0, 0.08)'">
          <div style="width: 3.5rem; height: 3.5rem; background: linear-gradient(135deg, #2ecc7120, #27ae6020); border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">💵</div>
          <div style="flex: 1;">
            <div style="font-size: 0.85rem; color: #7f8c8d; font-weight: 600; text-transform: uppercase; margin-bottom: 0.25rem;">Montant Total</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: #2c3e50;">{{ getTotalAmount() | number:'1.2-2' }} DNT</div>
          </div>
        </div>
        <div style="background: white; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08); display: flex; align-items: center; gap: 1rem; border-left: 5px solid #f39c12; transition: all 0.3s ease;"
             onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 25px rgba(0, 0, 0, 0.12)'"
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(0, 0, 0, 0.08)'">
          <div style="width: 3.5rem; height: 3.5rem; background: linear-gradient(135deg, #f39c1220, #e67e2220); border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">⏳</div>
          <div style="flex: 1;">
            <div style="font-size: 0.85rem; color: #7f8c8d; font-weight: 600; text-transform: uppercase; margin-bottom: 0.25rem;">Total Dû</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: #2c3e50;">{{ getTotalDue() | number:'1.2-2' }} DNT</div>
          </div>
        </div>
      </div>


      <!-- Filters -->
      <div style="background: white; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08); margin-bottom: 1.5rem;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 0.75rem; padding: 1rem; margin: -1.5rem -1.5rem 1.5rem -1.5rem;">
          <h3 style="color: white; font-size: 1.1rem; font-weight: 600; margin: 0; display: flex; align-items: center; gap: 0.5rem;">🔍 Filtres</h3>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <div>
            <label style="display: block; color: #2c3e50; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem;">Statut</label>
            <select [(ngModel)]="filterStatus" (change)="applyFilters()"
                    style="width: 100%; padding: 0.75rem; border: 2px solid #e0e0e0; border-radius: 0.5rem; font-size: 0.95rem; transition: all 0.3s; outline: none;"
                    onfocus="this.style.borderColor='#667eea'; this.style.boxShadow='0 0 0 3px rgba(102, 126, 234, 0.1)'"
                    onblur="this.style.borderColor='#e0e0e0'; this.style.boxShadow='none'">
              <option value="">Tous les statuts</option>
              <option value="PAID">Payé</option>
              <option value="UNPAID">Impayé</option>
              <option value="PARTIALLY_PAID">Partiel</option>
            </select>
          </div>
          <div>
            <label style="display: block; color: #2c3e50; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem;">Client</label>
            <input type="text" [(ngModel)]="filterClient" (keyup)="applyFilters()" placeholder="Rechercher..."
                   style="width: 100%; padding: 0.75rem; border: 2px solid #e0e0e0; border-radius: 0.5rem; font-size: 0.95rem; transition: all 0.3s; outline: none;"
                   onfocus="this.style.borderColor='#667eea'; this.style.boxShadow='0 0 0 3px rgba(102, 126, 234, 0.1)'"
                   onblur="this.style.borderColor='#e0e0e0'; this.style.boxShadow='none'">
          </div>
          <div>
            <label style="display: block; color: #2c3e50; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem;">Date de</label>
            <input type="date" [(ngModel)]="filterDateFrom" (change)="applyFilters()"
                   style="width: 100%; padding: 0.75rem; border: 2px solid #e0e0e0; border-radius: 0.5rem; font-size: 0.95rem; transition: all 0.3s; outline: none;"
                   onfocus="this.style.borderColor='#667eea'; this.style.boxShadow='0 0 0 3px rgba(102, 126, 234, 0.1)'"
                   onblur="this.style.borderColor='#e0e0e0'; this.style.boxShadow='none'">
          </div>
          <div>
            <label style="display: block; color: #2c3e50; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem;">Date à</label>
            <input type="date" [(ngModel)]="filterDateTo" (change)="applyFilters()"
                   style="width: 100%; padding: 0.75rem; border: 2px solid #e0e0e0; border-radius: 0.5rem; font-size: 0.95rem; transition: all 0.3s; outline: none;"
                   onfocus="this.style.borderColor='#667eea'; this.style.boxShadow='0 0 0 3px rgba(102, 126, 234, 0.1)'"
                   onblur="this.style.borderColor='#e0e0e0'; this.style.boxShadow='none'">
          </div>
        </div>
      </div>

      <!-- Invoices List -->
      <div style="background: white; border-radius: 1rem; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); padding: 1rem 1.5rem;">
          <h3 style="color: white; font-size: 1.1rem; font-weight: 600; margin: 0; display: flex; align-items: center; gap: 0.5rem;">📁 Factures ({{ filteredInvoices.length }})</h3>
        </div>
        
        <!-- Invoice Cards (No columns, stacked) -->
        <div style="padding: 1rem;">
          <div *ngFor="let invoice of filteredInvoices; trackBy: trackByInvoiceId"
               style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 0.75rem; padding: 1rem; margin-bottom: 1rem; border-left: 4px solid #667eea; transition: all 0.3s ease;"
               onmouseover="this.style.transform='translateX(4px)'; this.style.boxShadow='0 4px 15px rgba(0, 0, 0, 0.1)'"
               onmouseout="this.style.transform='translateX(0)'; this.style.boxShadow='none'">
            
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
              <span style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 0.4rem 0.9rem; border-radius: 1.5rem; font-weight: 600; font-size: 0.9rem;">
                #{{ invoice.billId }}
              </span>
              <span style="color: #7f8c8d; font-size: 0.9rem;">{{ invoice.billDate | date:'dd/MM/yyyy' }}</span>
            </div>
            
            <!-- Client Info -->
            <div style="margin-bottom: 0.75rem; padding-bottom: 0.75rem; border-bottom: 1px solid #dee2e6;">
              <div style="font-weight: 600; color: #2c3e50; font-size: 1rem; margin-bottom: 0.25rem;">{{ invoice.clientName }}</div>
              <div style="color: #7f8c8d; font-size: 0.9rem;">{{ invoice.clientPhone }}</div>
            </div>
            
            <!-- Amounts -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem; margin-bottom: 0.75rem;">
              <div style="background: white; padding: 0.75rem; border-radius: 0.5rem; text-align: center;">
                <div style="font-size: 0.8rem; color: #7f8c8d; font-weight: 600; margin-bottom: 0.25rem;">TOTAL</div>
                <div style="font-size: 1.1rem; font-weight: 700; color: #2c3e50;">{{ invoice.totalAmount | number:'1.2-2' }}</div>
              </div>
              <div style="background: white; padding: 0.75rem; border-radius: 0.5rem; text-align: center;">
                <div style="font-size: 0.8rem; color: #7f8c8d; font-weight: 600; margin-bottom: 0.25rem;">ACOMPTE</div>
                <div style="font-size: 1.1rem; font-weight: 700; color: #1abc9c;">{{ invoice.deposit | number:'1.2-2' }}</div>
              </div>
              <div style="background: white; padding: 0.75rem; border-radius: 0.5rem; text-align: center;">
                <div style="font-size: 0.8rem; color: #7f8c8d; font-weight: 600; margin-bottom: 0.25rem;">DÛ</div>
                <div style="font-size: 1.1rem; font-weight: 700; color: #2ecc71;">{{ invoice.amountDue | number:'1.2-2' }}</div>
              </div>
            </div>
            
            <!-- Status & Actions -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
              <span [ngClass]="getPaymentStatusClass(invoice.paymentStatus)"
                    style="padding: 0.4rem 0.9rem; border-radius: 1.5rem; font-weight: 600; font-size: 0.85rem; display: inline-block;">
                {{ getPaymentStatusLabel(invoice.paymentStatus) }}
              </span>
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button (click)="viewInvoice(invoice.billId)" title="Voir"
                        style="width: 2.2rem; height: 2.2rem; border-radius: 0.5rem; border: none; background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; cursor: pointer; font-size: 1rem; transition: all 0.2s;"
                        onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">👁️</button>
                <button (click)="downloadPDF(invoice.billId)" title="Télécharger"
                        style="width: 2.2rem; height: 2.2rem; border-radius: 0.5rem; border: none; background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); color: white; cursor: pointer; font-size: 1rem; transition: all 0.2s;"
                        onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">⬇️</button>
                <button (click)="sendInvoiceByEmail(invoice)" [disabled]="sendingEmail === invoice.billId" title="Email"
                        style="width: 2.2rem; height: 2.2rem; border-radius: 0.5rem; border: none; background: linear-gradient(135deg, #1abc9c 0%, #16a085 100%); color: white; cursor: pointer; font-size: 1rem; transition: all 0.2s;"
                        [style.opacity]="sendingEmail === invoice.billId ? '0.5' : '1'"
                        onmouseover="if(!this.disabled) this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                  {{ sendingEmail === invoice.billId ? '⏳' : '✉️' }}
                </button>
                <button *ngIf="invoice.paymentStatus === 'UNPAID' || invoice.paymentStatus === 'PARTIALLY_PAID'"
                        (click)="openPaymentModal(invoice)" title="Paiement"
                        style="width: 2.2rem; height: 2.2rem; border-radius: 0.5rem; border: none; background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); color: white; cursor: pointer; font-size: 1rem; transition: all 0.2s;"
                        onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">💰</button>
              </div>
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
  `,
  styles: [`
    .bg-success {
      background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
      color: white;
    }

    .bg-danger {
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
      color: white;
    }

    .bg-warning {
      background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
      color: white;
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
    const montant = prompt(`Montant à enregistrer pour la facture #${invoice.billId} (max: ${invoice.amountDue} DNT)`, invoice.amountDue);
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
