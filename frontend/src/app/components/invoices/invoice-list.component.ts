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
          <div class="stat-number">{{ filteredInvoices.length }}</div>
          <div class="stat-label">Total Factures</div>
        </div>

        <!-- Montant Total -->
        <div class="invoice-stat-card border-green">
          <div class="stat-number">{{ getTotalAmount() | number:'1.3-3' }}</div>
          <div class="stat-label">Montant (DNT)</div>
        </div>

        <!-- Total Dû -->
        <div class="invoice-stat-card border-orange">
          <div class="stat-number">{{ getTotalDue() | number:'1.3-3' }}</div>
          <div class="stat-label">Total Dû (DNT)</div>
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
                (click)="openDrawer(invoice)"
                style="border-bottom: 1px solid #e5e7eb; transition: background 0.2s; cursor: pointer;"
                onmouseover="this.style.background='#f0f4ff'" onmouseout="this.style.background='white'">
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
                  <button (click)="openDrawer(invoice); $event.stopPropagation()" title="Voir"
                          style="width: 2rem; height: 2rem; border-radius: 0.375rem; border: 1px solid #bfdbfe; background: #eff6ff; color: #1e40af; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"
                          onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='#eff6ff'">👁️</button>
                  <button (click)="downloadPDF(invoice.billId); $event.stopPropagation()" title="Télécharger"
                          style="width: 2rem; height: 2rem; border-radius: 0.375rem; border: 1px solid #bbf7d0; background: #dcfce7; color: #166534; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"
                          onmouseover="this.style.background='#bbf7d0'" onmouseout="this.style.background='#dcfce7'">⬇️</button>
                  <button (click)="sendInvoiceByEmail(invoice); $event.stopPropagation()" [disabled]="sendingEmail === invoice.billId" title="Email"
                          style="width: 2rem; height: 2rem; border-radius: 0.375rem; border: 1px solid #a5f3fc; background: #cffafe; color: #155e75; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"
                          [style.opacity]="sendingEmail === invoice.billId ? '0.5' : '1'"
                          onmouseover="if(!this.disabled) this.style.background='#a5f3fc'" onmouseout="this.style.background='#cffafe'">
                    {{ sendingEmail === invoice.billId ? '⏳' : '✉️' }}
                  </button>
                  <button *ngIf="invoice.paymentStatus === 'UNPAID' || invoice.paymentStatus === 'PARTIALLY_PAID'"
                          (click)="openPaymentModal(invoice); $event.stopPropagation()" title="Paiement"
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
               (click)="openDrawer(invoice)"
               style="border-bottom: 1px solid #e5e7eb; padding: 1rem; background: white; cursor: pointer; transition: background 0.2s;"
               onmouseover="this.style.background='#f0f4ff'" onmouseout="this.style.background='white'">
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
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.25rem; border-top: 1px solid #e5e7eb; padding-top: 0.75rem;">
              <button (click)="downloadPDF(invoice.billId); $event.stopPropagation()" title="Télécharger"
                      style="width: 2rem; height: 2rem; border-radius: 0.375rem; border: 1px solid #bbf7d0; background: #dcfce7; color: #166534; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"
                      onmouseover="this.style.background='#bbf7d0'" onmouseout="this.style.background='#dcfce7'">⬇️</button>
              <button (click)="sendInvoiceByEmail(invoice); $event.stopPropagation()" [disabled]="sendingEmail === invoice.billId" title="Email"
                      style="width: 2rem; height: 2rem; border-radius: 0.375rem; border: 1px solid #a5f3fc; background: #cffafe; color: #155e75; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"
                      [style.opacity]="sendingEmail === invoice.billId ? '0.5' : '1'"
                      onmouseover="if(!this.disabled) this.style.background='#a5f3fc'" onmouseout="this.style.background='#cffafe'">
                {{ sendingEmail === invoice.billId ? '⏳' : '✉️' }}
              </button>
              <button *ngIf="invoice.paymentStatus === 'UNPAID' || invoice.paymentStatus === 'PARTIALLY_PAID'"
                      (click)="openPaymentModal(invoice); $event.stopPropagation()" title="Paiement"
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

    <!-- ===== DRAWER OVERLAY ===== -->
    <div *ngIf="drawerOpen"
         (click)="closeDrawer()"
         style="position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1000;
                animation: fadeIn 0.25s ease;">
    </div>

    <!-- ===== DRAWER PANEL ===== -->
    <div [class.drawer-open]="drawerOpen"
         class="invoice-drawer">

      <!-- Drawer Header -->
      <div style="padding: 1.25rem 1.5rem;
                  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
                  color: white; display: flex; align-items: center;
                  justify-content: space-between; flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-size: 1.75rem;">🧾</span>
          <div>
            <div style="font-size: 1.1rem; font-weight: 700; line-height: 1.2;">
              Facture #{{ selectedInvoice?.billId }}
            </div>
            <div style="font-size: 0.8rem; opacity: 0.85; margin-top: 0.1rem;">
              {{ selectedInvoice?.billDate | date:'dd/MM/yyyy' }}
            </div>
          </div>
        </div>
        <button (click)="closeDrawer()"
                style="background: rgba(255,255,255,0.2); border: none; color: white;
                       width: 2.25rem; height: 2.25rem; border-radius: 50%; cursor: pointer;
                       font-size: 1.1rem; display: flex; align-items: center; justify-content: center;
                       transition: background 0.2s;"
                onmouseover="this.style.background='rgba(255,255,255,0.35)'"
                onmouseout="this.style.background='rgba(255,255,255,0.2)'">✕</button>
      </div>

      <!-- Drawer Body -->
      <div style="padding: 1.5rem; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 1.25rem;">

        <!-- Statut -->
        <div style="text-align: center;">
          <span [ngClass]="getPaymentStatusClass(selectedInvoice?.paymentStatus)"
                style="padding: 0.5rem 2rem; border-radius: 999px; font-weight: 700;
                       font-size: 1rem; display: inline-block; letter-spacing: 0.5px;">
            {{ getPaymentStatusLabel(selectedInvoice?.paymentStatus) }}
          </span>
        </div>

        <!-- Client -->
        <div style="background: #f8fafc; border-radius: 0.75rem; padding: 1rem; border: 1px solid #e5e7eb;">
          <div style="font-size: 0.65rem; font-weight: 700; color: #6b7280;
                      text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.75rem;">
            👤 Informations client
          </div>
          <div style="font-weight: 700; color: #1f2937; font-size: 1rem; margin-bottom: 0.35rem;">
            {{ selectedInvoice?.clientName }}
          </div>
          <div style="color: #6b7280; font-size: 0.875rem; margin-bottom: 0.25rem;">
            📞 {{ selectedInvoice?.clientPhone || 'N/A' }}
          </div>
          <div style="color: #6b7280; font-size: 0.875rem;">
            ✉️ {{ selectedInvoice?.clientEmail || 'N/A' }}
          </div>
        </div>

        <!-- Montants -->
        <div style="background: #f8fafc; border-radius: 0.75rem; padding: 1rem; border: 1px solid #e5e7eb;">
          <div style="font-size: 0.65rem; font-weight: 700; color: #6b7280;
                      text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.75rem;">
            💰 Montants (DNT)
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; text-align: center;">
            <div style="background: white; border-radius: 0.5rem; padding: 0.75rem;
                        border: 1px solid #e5e7eb;">
              <div style="font-size: 0.7rem; color: #6b7280; margin-bottom: 0.35rem; font-weight: 500;">
                Montant total
              </div>
              <div style="font-weight: 700; color: #1f2937; font-size: 0.9rem;">
                {{ selectedInvoice?.totalAmount | number:'1.3-3' }}
              </div>
            </div>
            <div style="background: white; border-radius: 0.5rem; padding: 0.75rem;
                        border: 1px solid #e5e7eb;">
              <div style="font-size: 0.7rem; color: #6b7280; margin-bottom: 0.35rem; font-weight: 500;">
                Acompte
              </div>
              <div style="font-weight: 700; color: #0891b2; font-size: 0.9rem;">
                {{ selectedInvoice?.deposit | number:'1.3-3' }}
              </div>
            </div>
            <div style="background: white; border-radius: 0.5rem; padding: 0.75rem;
                        border: 1px solid #e5e7eb;">
              <div style="font-size: 0.7rem; color: #6b7280; margin-bottom: 0.35rem; font-weight: 500;">
                Restant dû
              </div>
              <div style="font-weight: 700; color: #16a34a; font-size: 0.9rem;">
                {{ selectedInvoice?.amountDue | number:'1.3-3' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Articles -->
        <div *ngIf="selectedInvoice?.billItems?.length > 0"
             style="background: #f8fafc; border-radius: 0.75rem; padding: 1rem; border: 1px solid #e5e7eb;">
          <div style="font-size: 0.65rem; font-weight: 700; color: #6b7280;
                      text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.75rem;">
            📦 Articles ({{ selectedInvoice?.billItems?.length }})
          </div>
          <div *ngFor="let item of selectedInvoice?.billItems; let last = last"
               [style.border-bottom]="last ? 'none' : '1px solid #e5e7eb'"
               style="display: flex; justify-content: space-between; align-items: center;
                      padding: 0.6rem 0; font-size: 0.875rem;">
            <div>
              <div style="font-weight: 600; color: #1f2937; margin-bottom: 0.15rem;">
                {{ item.productName }}
              </div>
              <div style="color: #6b7280; font-size: 0.8rem;">
                Qté : {{ item.quantity }} × {{ item.unitPrice | number:'1.3-3' }} DNT
              </div>
            </div>
            <div style="font-weight: 700; color: #4f46e5; white-space: nowrap; margin-left: 1rem;">
              {{ item.totalPrice | number:'1.3-3' }}
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div style="display: flex; flex-direction: column; gap: 0.625rem; margin-top: auto; padding-top: 0.5rem;">
          <button (click)="downloadPDF(selectedInvoice?.billId)"
                  style="width: 100%; padding: 0.8rem 1rem; border-radius: 0.5rem; border: none;
                         background: linear-gradient(135deg, #16a34a, #22c55e); color: white;
                         font-weight: 600; font-size: 0.9rem; cursor: pointer; display: flex;
                         align-items: center; justify-content: center; gap: 0.5rem;
                         transition: opacity 0.2s;"
                  onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
            ⬇️ Télécharger PDF
          </button>
          <button (click)="sendInvoiceByEmail(selectedInvoice)"
                  [disabled]="sendingEmail === selectedInvoice?.billId"
                  style="width: 100%; padding: 0.8rem 1rem; border-radius: 0.5rem; border: none;
                         background: linear-gradient(135deg, #0891b2, #06b6d4); color: white;
                         font-weight: 600; font-size: 0.9rem; cursor: pointer; display: flex;
                         align-items: center; justify-content: center; gap: 0.5rem;
                         transition: opacity 0.2s;"
                  [style.opacity]="sendingEmail === selectedInvoice?.billId ? '0.6' : '1'"
                  onmouseover="if(!this.disabled) this.style.opacity='0.9'"
                  onmouseout="this.style.opacity='1'">
            {{ sendingEmail === selectedInvoice?.billId ? '⏳ Envoi en cours...' : '✉️ Envoyer par email' }}
          </button>
          <button *ngIf="selectedInvoice?.paymentStatus === 'UNPAID' || selectedInvoice?.paymentStatus === 'PARTIALLY_PAID'"
                  (click)="openPaymentModal(selectedInvoice)"
                  style="width: 100%; padding: 0.8rem 1rem; border-radius: 0.5rem; border: none;
                         background: linear-gradient(135deg, #d97706, #f59e0b); color: white;
                         font-weight: 600; font-size: 0.9rem; cursor: pointer; display: flex;
                         align-items: center; justify-content: center; gap: 0.5rem;
                         transition: opacity 0.2s;"
                  onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
            💰 Enregistrer un paiement
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .invoice-drawer {
      position: fixed;
      top: 0;
      right: 0;
      height: 100vh;
      width: 440px;
      max-width: 95vw;
      background: white;
      z-index: 1001;
      box-shadow: -6px 0 32px rgba(0, 0, 0, 0.15);
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .invoice-drawer.drawer-open {
      transform: translateX(0);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    @media (max-width: 480px) {
      .invoice-drawer {
        width: 100vw;
        max-width: 100vw;
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

  sendingEmail: number | null = null;
  emailSuccess = '';
  emailError = '';

  // Drawer state
  selectedInvoice: any = null;
  drawerOpen = false;

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

  // ===== Drawer =====
  openDrawer(invoice: any): void {
    this.selectedInvoice = invoice;
    this.drawerOpen = true;
  }

  closeDrawer(): void {
    this.drawerOpen = false;
    setTimeout(() => {
      this.selectedInvoice = null;
    }, 300); // attend la fin de l'animation CSS
  }

  // Ancienne méthode redirigée vers le drawer
  viewInvoice(invoiceId: number): void {
    const invoice = this.invoices.find(inv => inv.billId === invoiceId);
    if (invoice) this.openDrawer(invoice);
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
          // Met à jour aussi la facture sélectionnée dans le drawer
          if (this.selectedInvoice?.billId === invoice.billId) {
            this.selectedInvoice = updatedInvoice;
          }
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