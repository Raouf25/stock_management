import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="invoice-page-container">

      <div class="invoice-page-header">
        <span style="font-size: 2rem;">📁</span>
        <h1 class="invoice-page-title">Liste des Factures</h1>
      </div>

      <div class="invoice-stats-grid stats-3-cols">
        <div class="invoice-stat-card border-blue">
          <div class="stat-number">{{ filteredInvoices.length }}</div>
          <div class="stat-label">Total Factures</div>
        </div>
        <div class="invoice-stat-card border-green">
          <div class="stat-number">{{ getTotalAmount() | number:'1.3-3' }}</div>
          <div class="stat-label">Montant (DNT)</div>
        </div>
        <div class="invoice-stat-card border-orange">
          <div class="stat-number">{{ getTotalDue() | number:'1.3-3' }}</div>
          <div class="stat-label">Total Dû (DNT)</div>
        </div>
      </div>

      <div class="invoice-card">
        <div class="invoice-card-header gradient-purple">
          <div style="display:flex;align-items:center;gap:.5rem;color:white;">
            <span>🔍</span>
            <span class="invoice-card-header-title">Filtres</span>
          </div>
        </div>
        <div style="padding:.75rem 1rem;">
          <div style="display:grid;grid-template-columns:1fr;gap:.75rem;">
            <div style="display:flex;flex-direction:column;gap:.25rem;">
              <label style="font-size:.625rem;font-weight:600;color:#6b7280;text-transform:uppercase;">Statut</label>
              <select [(ngModel)]="filterStatus" (change)="applyFilters()"
                      style="height:2.25rem;width:100%;background:white;font-size:.875rem;padding:0 .5rem;border:1px solid #e5e7eb;border-radius:.375rem;outline:none;"
                      onfocus="this.style.borderColor='#6366f1'" onblur="this.style.borderColor='#e5e7eb'">
                <option value="">Tous les statuts</option>
                <option value="PAID">Payé</option>
                <option value="UNPAID">Impayé</option>
                <option value="PARTIALLY_PAID">Partiel</option>
              </select>
            </div>
            <div style="display:flex;flex-direction:column;gap:.25rem;">
              <label style="font-size:.625rem;font-weight:600;color:#6b7280;text-transform:uppercase;">Client</label>
              <input type="text" [(ngModel)]="filterClient" (keyup)="applyFilters()" placeholder="Rechercher..."
                     style="height:2.25rem;width:100%;background:white;font-size:.875rem;padding:0 .5rem;border:1px solid #e5e7eb;border-radius:.375rem;outline:none;"
                     onfocus="this.style.borderColor='#6366f1'" onblur="this.style.borderColor='#e5e7eb'">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;">
              <div style="display:flex;flex-direction:column;gap:.25rem;">
                <label style="font-size:.625rem;font-weight:600;color:#6b7280;text-transform:uppercase;">Date de</label>
                <input type="date" [(ngModel)]="filterDateFrom" (change)="applyFilters()"
                       style="height:2.25rem;width:100%;background:white;font-size:.875rem;padding:0 .5rem;border:1px solid #e5e7eb;border-radius:.375rem;outline:none;"
                       onfocus="this.style.borderColor='#6366f1'" onblur="this.style.borderColor='#e5e7eb'">
              </div>
              <div style="display:flex;flex-direction:column;gap:.25rem;">
                <label style="font-size:.625rem;font-weight:600;color:#6b7280;text-transform:uppercase;">Date à</label>
                <input type="date" [(ngModel)]="filterDateTo" (change)="applyFilters()"
                       style="height:2.25rem;width:100%;background:white;font-size:.875rem;padding:0 .5rem;border:1px solid #e5e7eb;border-radius:.375rem;outline:none;"
                       onfocus="this.style.borderColor='#6366f1'" onblur="this.style.borderColor='#e5e7eb'">
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="invoice-card">
        <div class="invoice-card-header gradient-blue">
          <div style="display:flex;align-items:center;gap:.5rem;color:white;">
            <span style="font-size:1.125rem;">📁</span>
            <span class="invoice-card-header-title">Liste des Factures ({{ filteredInvoices.length }})</span>
          </div>
        </div>

        <div class="desktop-table" style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
            <tr style="background:linear-gradient(135deg,#4f46e5 0%,#6366f1 100%);">
              <th style="color:white;font-weight:500;padding:.75rem 1rem;text-align:left;">N° FACTURE</th>
              <th style="color:white;font-weight:500;padding:.75rem 1rem;text-align:left;">DATE</th>
              <th style="color:white;font-weight:500;padding:.75rem 1rem;text-align:left;">CLIENT</th>
              <th style="color:white;font-weight:500;padding:.75rem 1rem;text-align:right;">MONTANT TOTAL</th>
              <th style="color:white;font-weight:500;padding:.75rem 1rem;text-align:right;">ACOMPTE</th>
              <th style="color:white;font-weight:500;padding:.75rem 1rem;text-align:right;">MONTANT DÛ</th>
              <th style="color:white;font-weight:500;padding:.75rem 1rem;text-align:center;">STATUT</th>
              <th style="color:white;font-weight:500;padding:.75rem 1rem;text-align:center;">ACTIONS</th>
            </tr>
            </thead>
            <tbody>
            <tr *ngFor="let invoice of filteredInvoices; trackBy: trackByInvoiceId"
                (click)="openDrawer(invoice)"
                style="border-bottom:1px solid #e5e7eb;transition:background .2s;cursor:pointer;"
                onmouseover="this.style.background='#f0f4ff'" onmouseout="this.style.background='white'">
              <td style="padding:.75rem 1rem;">
                  <span style="display:inline-block;padding:.25rem .75rem;background:#eff6ff;color:#1e40af;border:1px solid #bfdbfe;border-radius:.375rem;font-weight:600;font-size:.875rem;">
                    #{{ invoice.billId }}
                  </span>
              </td>
              <td style="padding:.75rem 1rem;color:#6b7280;">{{ invoice.billDate | date:'dd/MM/yyyy' }}</td>
              <td style="padding:.75rem 1rem;">
                <div style="font-weight:500;color:#1f2937;">{{ invoice.clientName }}</div>
                <div style="font-size:.875rem;color:#6b7280;">{{ invoice.clientPhone }}</div>
              </td>
              <td style="padding:.75rem 1rem;text-align:right;font-weight:500;color:#1f2937;">{{ invoice.totalAmount | number:'1.3-3' }}</td>
              <td style="padding:.75rem 1rem;text-align:right;color:#0891b2;">{{ (invoice.deposit || 0) | number:'1.3-3' }}</td>
              <td style="padding:.75rem 1rem;text-align:right;font-weight:500;color:#16a34a;">{{ invoice.amountDue | number:'1.3-3' }}</td>
              <td style="padding:.75rem 1rem;text-align:center;">
                  <span [ngClass]="getPaymentStatusClass(invoice.paymentStatus)"
                        style="padding:.375rem .75rem;border-radius:.375rem;font-weight:600;font-size:.875rem;display:inline-block;">
                    {{ getPaymentStatusLabel(invoice.paymentStatus) }}
                  </span>
              </td>
              <td style="padding:.75rem 1rem;">
                <div style="display:flex;align-items:center;justify-content:center;gap:.25rem;">
                  <button (click)="downloadPDF(invoice.billId); $event.stopPropagation()" title="Télécharger"
                          style="width:2rem;height:2rem;border-radius:.375rem;border:1px solid #bbf7d0;background:#dcfce7;color:#166534;cursor:pointer;font-size:.875rem;display:flex;align-items:center;justify-content:center;"
                          onmouseover="this.style.background='#bbf7d0'" onmouseout="this.style.background='#dcfce7'">⬇️</button>
                  <button (click)="sendInvoiceByEmail(invoice); $event.stopPropagation()" [disabled]="sendingEmail === invoice.billId" title="Email"
                          style="width:2rem;height:2rem;border-radius:.375rem;border:1px solid #a5f3fc;background:#cffafe;color:#155e75;cursor:pointer;font-size:.875rem;display:flex;align-items:center;justify-content:center;"
                          [style.opacity]="sendingEmail === invoice.billId ? '0.5' : '1'"
                          onmouseover="if(!this.disabled) this.style.background='#a5f3fc'" onmouseout="this.style.background='#cffafe'">
                    {{ sendingEmail === invoice.billId ? '⏳' : '✉️' }}
                  </button>
                  <button *ngIf="invoice.paymentStatus !== 'PAID'"
                          (click)="openPaymentModal(invoice); $event.stopPropagation()" title="Paiement"
                          style="width:2rem;height:2rem;border-radius:.375rem;border:1px solid #fcd34d;background:#fde047;color:white;cursor:pointer;font-size:.875rem;display:flex;align-items:center;justify-content:center;"
                          onmouseover="this.style.background='#facc15'" onmouseout="this.style.background='#fde047'">💰</button>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <div class="mobile-cards">
          <div *ngFor="let invoice of filteredInvoices; trackBy: trackByInvoiceId"
               (click)="openDrawer(invoice)"
               style="border-bottom:1px solid #e5e7eb;padding:1rem;background:white;cursor:pointer;transition:background .2s;"
               onmouseover="this.style.background='#f0f4ff'" onmouseout="this.style.background='white'">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:.75rem;">
              <div style="display:flex;align-items:center;gap:.5rem;">
                <span style="display:inline-block;padding:.25rem .75rem;background:#eff6ff;color:#1e40af;border:1px solid #bfdbfe;border-radius:.375rem;font-weight:600;font-size:.75rem;">
                  #{{ invoice.billId }}
                </span>
                <span style="color:#6b7280;font-size:.875rem;">{{ invoice.billDate | date:'dd/MM/yyyy' }}</span>
              </div>
              <span [ngClass]="getPaymentStatusClass(invoice.paymentStatus)"
                    style="padding:.25rem .75rem;border-radius:.375rem;font-weight:600;font-size:.75rem;display:inline-block;">
                {{ getPaymentStatusLabel(invoice.paymentStatus) }}
              </span>
            </div>
            <div style="margin-bottom:.75rem;">
              <div style="font-weight:600;color:#1f2937;font-size:.875rem;margin-bottom:.125rem;">{{ invoice.clientName }}</div>
              <div style="color:#6b7280;font-size:.875rem;">{{ invoice.clientPhone }}</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;margin-bottom:1rem;font-size:.875rem;">
              <div style="background:#f8fafc;padding:.5rem;border-radius:.5rem;text-align:center;">
                <div style="font-size:.75rem;color:#6b7280;margin-bottom:.125rem;">Total</div>
                <div style="font-weight:600;color:#1f2937;">{{ invoice.totalAmount | number:'1.3-3' }}</div>
              </div>
              <div style="background:#f8fafc;padding:.5rem;border-radius:.5rem;text-align:center;">
                <div style="font-size:.75rem;color:#6b7280;margin-bottom:.125rem;">Acompte</div>
                <div style="font-weight:600;color:#0891b2;">{{ (invoice.deposit || 0) | number:'1.3-3' }}</div>
              </div>
              <div style="background:#f8fafc;padding:.5rem;border-radius:.5rem;text-align:center;">
                <div style="font-size:.75rem;color:#6b7280;margin-bottom:.125rem;">Dû</div>
                <div style="font-weight:600;color:#16a34a;">{{ invoice.amountDue | number:'1.3-3' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="drawerOpen"
           (click)="closeDrawer()"
           style="position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:1000;animation:fadeIn .25s ease;">
      </div>

      <div [class.drawer-open]="drawerOpen" class="invoice-drawer">
        <div class="drawer-iframe-container" *ngIf="selectedInvoice">
          
          <div class="drawer-iframe-header">
            <div>
              <h3 style="margin:0; color:white; font-size:1.1rem;">Prévisualisation Facture #{{ selectedInvoice.billId }}</h3>
              <small style="color: #c4b5fd;">{{ selectedInvoice.clientName }}</small>
            </div>
            <button (click)="closeDrawer()" class="drawer-iframe-close-btn">✕</button>
          </div>

          <div class="drawer-iframe-body">
            <iframe 
              [src]="getInvoicePreviewUrl(selectedInvoice.billId)" 
              class="invoice-iframe-render"
              title="Rendu de la facture Thymeleaf">
            </iframe>
          </div>

          <div class="drawer-iframe-footer">
            <button (click)="downloadPDF(selectedInvoice.billId)" class="iframe-action-btn btn-pdf">⬇️ PDF</button>
            <button (click)="sendInvoiceByEmail(selectedInvoice)" [disabled]="sendingEmail === selectedInvoice.billId" class="iframe-action-btn btn-mail">
              {{ sendingEmail === selectedInvoice.billId ? '⏳ Envoi...' : '✉️ Email' }}
            </button>
            <button *ngIf="selectedInvoice.paymentStatus !== 'PAID'" (click)="openPaymentModal(selectedInvoice)" class="iframe-action-btn btn-pay-now">💰 Encaisser</button>
          </div>

        </div>
      </div>

    </div>
  `,
  styles: [`
    /* ── VOS STYLES STRUCTURELS ORIGINAUX DU DRAWER SONT EXTÉRIEUREMENT LES MÊMES ── */
    .invoice-drawer {
      position: fixed;
      top: 0; right: 0;
      height: 100vh;
      width: 820px;
      max-width: 96vw;
      background: #3D2D6E; /* Fond assorti à votre charte */
      z-index: 1001;
      box-shadow: -6px 0 40px rgba(61,45,110,.18);
      transform: translateX(100%);
      transition: transform .3s cubic-bezier(.4,0,.2,1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: 'Segoe UI', Inter, Arial, sans-serif;
    }
    .invoice-drawer.drawer-open { transform: translateX(0); }

    /* ── NOUVEAUX STYLES DE CONTRÔLE DE L'IFRAME SANS TOUCHER AUX TABLEAUX DU COMPOSANT ── */
    .drawer-iframe-container {
      display: flex;
      flex-direction: column;
      flex: 1;
      height: 100%;
      background: #f3f4f6;
    }
    
    .drawer-iframe-header {
      background: #3D2D6E;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .drawer-iframe-close-btn {
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.25);
      color: white;
      width: 2rem; height: 2rem;
      border-radius: 50%;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.9rem;
      transition: background 0.2s;
    }
    .drawer-iframe-close-btn:hover { background: rgba(255,255,255,0.35); }

    .drawer-iframe-body {
      flex: 1;
      overflow-y: auto; /* Permet le défilement vertical autonome */
      position: relative;
      background: #e9e6f0;
    }

    .invoice-iframe-render {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }

    .drawer-iframe-footer {
      display: flex;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: white;
      border-top: 1px solid #e5e7eb;
    }

    .iframe-action-btn {
      flex: 1;
      padding: 0.6rem 1rem;
      border-radius: 0.375rem;
      border: none;
      color: white;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      transition: opacity 0.2s;
    }
    .iframe-action-btn:hover { opacity: 0.9; }
    .iframe-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-pdf { background: linear-gradient(135deg, #16a34a, #22c55e); }
    .btn-mail { background: linear-gradient(135deg, #0891b2, #06b6d4); }
    .btn-pay-now { background: linear-gradient(135deg, #d97706, #f59e0b); }

    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @media (max-width: 768px) {
      .invoice-drawer { width: 100vw; max-width: 100vw; }
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

  // Drawer state
  selectedInvoice: any = null;
  drawerOpen = false;

  // Payment modal state
  paymentModalInvoice: any = null;
  paymentAmount: number = 0;
  paymentError: string = '';

  // Injection obligatoire du DomSanitizer pour l'iframe
  constructor(
      private apiService: ApiService,
      private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  getInvoiceItems(invoice: any): any[] {
    if (!invoice) return [];
    return invoice.products || invoice.billItems || invoice.items || [];
  }

  // ── Stats ──
  getTotalAmount(): number {
    return this.filteredInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  }
  getTotalDue(): number {
    return this.filteredInvoices.reduce((sum, inv) => sum + (inv.amountDue || 0), 0);
  }

  // ── Data ──
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
      if (this.filterStatus && invoice.paymentStatus !== this.filterStatus) return false;
      if (this.filterClient && !invoice.clientName?.toLowerCase().includes(this.filterClient.toLowerCase())) return false;
      const invoiceDate = new Date(invoice.billDate);
      if (this.filterDateFrom && invoiceDate < new Date(this.filterDateFrom)) return false;
      if (this.filterDateTo && invoiceDate > new Date(this.filterDateTo)) return false;
      return true;
    });
  }

  /**
   * Construit et sécurise l'URL du template Thymeleaf rendue par le contrôleur Spring Boot
   */
  getInvoicePreviewUrl(billId: number): SafeResourceUrl {
    const backendUrl = `${environment.apiUrl}/api/invoices/preview/${billId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(backendUrl);
  }

  // ── Status helpers ──
  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'PAID':           return 'bg-success';
      case 'UNPAID':         return 'bg-danger';
      case 'PARTIALLY_PAID': return 'bg-warning text-dark';
      default:               return 'bg-secondary';
    }
  }

  getPaymentStatusLabel(status: string): string {
    switch (status) {
      case 'PAID':           return 'Payé';
      case 'UNPAID':         return 'Impayé';
      case 'PARTIALLY_PAID': return 'Partiellement Payé';
      default:               return status || '—';
    }
  }

  getPaymentStatusKey(status: string): string {
    switch (status) {
      case 'PAID':           return 'paid';
      case 'UNPAID':         return 'unpaid';
      case 'PARTIALLY_PAID': return 'partial';
      default:               return 'default';
    }
  }

  trackByInvoiceId(index: number, invoice: any): number {
    return invoice.billId;
  }

  // ── Drawer ──
  openDrawer(invoice: any): void {
    this.selectedInvoice = invoice;
    this.drawerOpen = true;
  }

  closeDrawer(): void {
    this.drawerOpen = false;
    setTimeout(() => { this.selectedInvoice = null; }, 300);
  }

  // ── Actions ──
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
          setTimeout(() => (this.emailSuccess = ''), 5000);
        },
        error: (error: any) => {
          this.sendingEmail = null;
          this.emailError = `❌ Erreur lors de l'envoi : ${error.message || 'Erreur inconnue'}`;
          alert(this.emailError);
          console.error(error);
        }
      });
    }
  }

  openPaymentModal(invoice: any): void {
    this.paymentModalInvoice = invoice;
    this.paymentAmount = invoice.amountDue;
    this.paymentError = '';
    const amountDueFormatted = invoice.amountDue.toFixed(3);
    const montant = prompt(
        `Montant à enregistrer pour la facture #${invoice.billId} (max: ${amountDueFormatted} DNT)`,
        amountDueFormatted
    );
    if (montant !== null) {
      const value = Number(montant);
      if (isNaN(value) || value <= 0 || value > invoice.amountDue) {
        alert('Montant invalide ou supérieur au montant dû.');
        return;
      }
      this.registerPayment(invoice, value);
    }
  }

  registerPayment(invoice: any, amount: number): void {
    this.apiService.registerInvoicePayment(invoice.billId, amount).subscribe({
      next: (updatedInvoice: any) => {
        const idx = this.invoices.findIndex(inv => inv.billId === invoice.billId);
        if (idx !== -1) {
          this.invoices[idx] = updatedInvoice;
          if (this.selectedInvoice?.billId === invoice.billId) {
            this.selectedInvoice = updatedInvoice;
          }
          this.applyFilters();
        }
        alert('✅ Paiement enregistré avec succès !');
      },
      error: (error: any) => {
        alert('❌ Erreur lors de l\'enregistrement du paiement.');
        console.error(error);
      }
    });
  }
}