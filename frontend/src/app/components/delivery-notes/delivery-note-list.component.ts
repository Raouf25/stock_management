import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';

interface DeliveryNote {
  idDeliveryNote: number;
  deliveryNoteNumber: string;
  dateDelivery: string;
  customer: {
    customerId: number;
    name: string;
  };
  totalAmount: number;
  discount: number;
  status: string;
  invoiced: boolean;
  bill?: {
    idBill: number;
  };
}

interface DeliveryNoteKPIs {
  totalDeliveryNotes: number;
  notInvoiced: number;
  pendingDelivery: number;
  deliveredToday: number;
  totalAmountNotInvoiced: number;
  totalAmountPending: number;
  averageDeliveryValue: number;
}

@Component({
  selector: 'app-delivery-note-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="invoice-page-container">
      <!-- Header -->
      <div class="invoice-page-header">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <span style="font-size: 2rem;">📦</span>
          <h1 class="invoice-page-title">Bons de Livraison</h1>
        </div>
        <a routerLink="/delivery-notes/create" 
           style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, var(--color-success) 0%, var(--color-success) 100%); color: white; border-radius: 0.5rem; text-decoration: none; font-weight: 600; transition: all 0.3s;">
          + Nouveau BL
        </a>
      </div>

      <!-- KPIs -->
      <div class="invoice-stats-grid">
        <!-- Total BL -->
        <div class="invoice-stat-card border-green">
          <div class="stat-number">{{ kpis.totalDeliveryNotes }}</div>
          <div class="stat-label">Total BL</div>
        </div>

        <!-- Non Facturés -->
        <div class="invoice-stat-card border-orange">
          <div class="stat-number">{{ kpis.notInvoiced }}</div>
          <div class="stat-label">Non Facturés</div>
        </div>

        <!-- En Attente -->
        <div class="invoice-stat-card border-blue">
          <div class="stat-number">{{ kpis.pendingDelivery }}</div>
          <div class="stat-label">En Attente</div>
        </div>

        <!-- Montant Non Facturé -->
        <div class="invoice-stat-card border-green">
          <div class="stat-number">{{ kpis.totalAmountNotInvoiced | number:'1.3-3' }}</div>
          <div class="stat-label">Montant Non Facturé (DNT)</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="invoice-card" style="margin-bottom: 1.5rem;">
        <div class="invoice-card-header gradient-blue">
          <span style="font-size: 1rem;">🔍</span>
          <span class="invoice-card-header-title">Filtres</span>
        </div>
        <div style="padding: 1.5rem;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <div>
              <label style="display: block; font-weight: 600; color: var(--color-text-2); margin-bottom: 0.5rem;">Statut</label>
              <select [(ngModel)]="filterStatus" (change)="applyFilters()"
                      style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-border-strong); border-radius: 0.5rem;">
                <option value="">Tous les statuts</option>
                <option value="PENDING">En attente</option>
                <option value="DELIVERED">Livré</option>
                <option value="CANCELLED">Annulé</option>
                <option value="INVOICED">Facturé</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-weight: 600; color: var(--color-text-2); margin-bottom: 0.5rem;">État Facturation</label>
              <select [(ngModel)]="filterInvoiced" (change)="applyFilters()"
                      style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-border-strong); border-radius: 0.5rem;">
                <option value="">Tous</option>
                <option value="true">Facturés</option>
                <option value="false">Non facturés</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-weight: 600; color: var(--color-text-2); margin-bottom: 0.5rem;">Rechercher</label>
              <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()" 
                     placeholder="Numéro BL, client..."
                     style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-border-strong); border-radius: 0.5rem;">
            </div>
          </div>
        </div>
      </div>

      <!-- Conversion to Invoice -->
      <div *ngIf="selectedDeliveryNotes.length > 0" class="invoice-card" style="margin-bottom: 1.5rem; border: 2px solid var(--color-success);">
        <div style="padding: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 700; font-size: 1.125rem; color: var(--color-text);">
              {{ selectedDeliveryNotes.length }} BL sélectionné(s)
            </div>
            <div style="color: var(--color-text-muted); font-size: 0.875rem;">
              Total: {{ getSelectedTotal() | number:'1.3-3' }} DNT
            </div>
          </div>
          <div style="display: flex; gap: 1rem;">
            <button (click)="clearSelection()"
                    style="padding: 0.75rem 1.5rem; background: var(--color-surface-2); color: var(--color-text-2); border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer;">
              Annuler
            </button>
            <button (click)="convertToInvoice()" [disabled]="!canConvertToInvoice()"
                    [class.disabled]="!canConvertToInvoice()"
                    style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, var(--color-success) 0%, var(--color-success) 100%); color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer;">
              Convertir en Facture
            </button>
          </div>
        </div>
      </div>

      <!-- Delivery Notes List -->
      <div class="invoice-card">
        <div class="invoice-card-header gradient-purple">
          <span style="font-size: 1rem;">📋</span>
          <span class="invoice-card-header-title">Liste des BL ({{ filteredDeliveryNotes.length }})</span>
        </div>
        
        <!-- Desktop Table -->
        <div class="desktop-table" style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: linear-gradient(135deg, var(--color-primary-hover) 0%, var(--color-primary) 100%);">
                <th style="color: white; font-weight: 500; padding: 0.75rem 1rem; text-align: left;">
                  <input type="checkbox" (change)="toggleSelectAll($event)" 
                         [checked]="areAllSelected()"
                         style="width: 1.25rem; height: 1.25rem; cursor: pointer;">
                </th>
                <th style="color: white; font-weight: 500; padding: 0.75rem 1rem; text-align: left;">NUMÉRO BL</th>
                <th style="color: white; font-weight: 500; padding: 0.75rem 1rem; text-align: left;">DATE</th>
                <th style="color: white; font-weight: 500; padding: 0.75rem 1rem; text-align: left;">CLIENT</th>
                <th style="color: white; font-weight: 500; padding: 0.75rem 1rem; text-align: right;">MONTANT</th>
                <th style="color: white; font-weight: 500; padding: 0.75rem 1rem; text-align: center;">STATUT</th>
                <th style="color: white; font-weight: 500; padding: 0.75rem 1rem; text-align: center;">FACTURATION</th>
                <th style="color: white; font-weight: 500; padding: 0.75rem 1rem; text-align: center;">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let dn of filteredDeliveryNotes" 
                  style="border-bottom: 1px solid var(--color-border); transition: background 0.2s;"
                  onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
                <td style="padding: 0.75rem 1rem;">
                  <input type="checkbox" [checked]="isSelected(dn.idDeliveryNote)" 
                         (change)="toggleSelect(dn)"
                         [disabled]="dn.invoiced"
                         style="width: 1.25rem; height: 1.25rem; cursor: pointer;">
                </td>
                <td style="padding: 0.75rem 1rem;">
                  <span style="display: inline-block; padding: 0.25rem 0.75rem; background: var(--color-info-bg); color: var(--color-info-text); border: 1px solid var(--color-primary-light); border-radius: 0.375rem; font-weight: 600; font-size: 0.875rem;">
                    {{ dn.deliveryNoteNumber }}
                  </span>
                </td>
                <td style="padding: 0.75rem 1rem; color: var(--color-text-muted);">{{ dn.dateDelivery | date:'dd/MM/yyyy' }}</td>
                <td style="padding: 0.75rem 1rem; color: var(--color-text); font-weight: 500;">{{ dn.customer.name }}</td>
                <td style="padding: 0.75rem 1rem; text-align: right; font-weight: 600; color: var(--color-text);">
                  {{ dn.totalAmount | number:'1.3-3' }} DNT
                </td>
                <td style="padding: 0.75rem 1rem; text-align: center;">
                  <span [style.background]="getStatusColor(dn.status)" 
                        style="padding: 0.375rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; color: white;">
                    {{ getStatusLabel(dn.status) }}
                  </span>
                </td>
                <td style="padding: 0.75rem 1rem; text-align: center;">
                  <div *ngIf="dn.invoiced" style="display: flex; flex-direction: column; align-items: center; gap: 0.25rem;">
                    <span style="color: var(--color-success); font-weight: 600;">✅ Facturé</span>
                    <span *ngIf="dn.bill?.idBill" style="font-size: 0.75rem; color: var(--color-text-muted);">Facture #{{ dn.bill?.idBill }}</span>
                  </div>
                  <span *ngIf="!dn.invoiced" style="color: var(--color-warning); font-weight: 600;">⏳ Non facturé</span>
                </td>
                <td style="padding: 0.75rem 1rem;">
                  <div style="display: flex; gap: 0.25rem; justify-content: center;">
                    <button (click)="downloadPDF(dn.idDeliveryNote, dn.deliveryNoteNumber)"
                            title="Télécharger PDF"
                            style="width: 2rem; height: 2rem; border-radius: 0.375rem; border: 1px solid var(--color-primary-light); background: var(--color-primary-light); color: var(--color-primary-hover); cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: center;"
                            onmouseover="this.style.background='#c7d2fe'" onmouseout="this.style.background='#e0e7ff'">
                      📥
                    </button>
                    <button *ngIf="!dn.invoiced && dn.status === 'PENDING'" 
                            (click)="updateStatus(dn.idDeliveryNote, 'DELIVERED')"
                            title="Marquer comme livré"
                            style="width: 2rem; height: 2rem; border-radius: 0.375rem; border: 1px solid var(--color-primary-light); background: var(--color-info-bg); color: var(--color-info-text); cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: center;"
                            onmouseover="this.style.background='#bfdbfe'" onmouseout="this.style.background='#dbeafe'">
                      📦
                    </button>
                    <button *ngIf="!dn.invoiced" 
                            (click)="deleteDeliveryNote(dn.idDeliveryNote)"
                            title="Supprimer"
                            style="width: 2rem; height: 2rem; border-radius: 0.375rem; border: 1px solid #fecaca; background: var(--color-danger-bg); color: var(--color-danger); cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: center;"
                            onmouseover="this.style.background='#fecaca'" onmouseout="this.style.background='#fee2e2'">
                      🗑️
                    </button>
                    <button *ngIf="dn.invoiced && dn.bill" 
                            title="Voir facture"
                            style="width: 2rem; height: 2rem; border-radius: 0.375rem; border: 1px solid var(--color-success); background: var(--color-success-bg); color: var(--color-success-text); cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: center;"
                            onmouseover="this.style.background='#a7f3d0'" onmouseout="this.style.background='#d1fae5'">
                      📄
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredDeliveryNotes.length === 0">
                <td colspan="8" style="padding: 3rem; text-align: center; color: var(--color-text-faint);">
                  <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
                  <p>Aucun bon de livraison trouvé</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Mobile Cards -->
        <div class="mobile-cards">
          <div *ngFor="let dn of filteredDeliveryNotes"
               style="border-bottom: 1px solid var(--color-border); padding: 1rem; background: white;">
            <!-- Header: Checkbox + BL Number + Date + Status -->
            <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.75rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <input type="checkbox" [checked]="isSelected(dn.idDeliveryNote)" 
                       (change)="toggleSelect(dn)"
                       [disabled]="dn.invoiced"
                       style="width: 1.125rem; height: 1.125rem; cursor: pointer;">
                <span style="display: inline-block; padding: 0.25rem 0.75rem; background: var(--color-info-bg); color: var(--color-info-text); border: 1px solid var(--color-primary-light); border-radius: 0.375rem; font-weight: 600; font-size: 0.75rem;">
                  {{ dn.deliveryNoteNumber }}
                </span>
                <span style="color: var(--color-text-muted); font-size: 0.875rem;">{{ dn.dateDelivery | date:'dd/MM/yyyy' }}</span>
              </div>
              <span [style.background]="getStatusColor(dn.status)" 
                    style="padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; color: white;">
                {{ getStatusLabel(dn.status) }}
              </span>
            </div>
            
            <!-- Client Info -->
            <div style="margin-bottom: 0.75rem;">
              <div style="font-weight: 600; color: var(--color-text); font-size: 0.875rem;">{{ dn.customer.name }}</div>
            </div>
            
            <!-- Amount + Facturation Grid -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin-bottom: 1rem; font-size: 0.875rem;">
              <div style="background: var(--color-bg); padding: 0.5rem; border-radius: 0.5rem; text-align: center;">
                <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 0.125rem;">Montant</div>
                <div style="font-weight: 600; color: var(--color-text); font-size: 0.875rem;">{{ dn.totalAmount | number:'1.3-3' }} DNT</div>
              </div>
              <div style="background: var(--color-bg); padding: 0.5rem; border-radius: 0.5rem; text-align: center;">
                <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 0.125rem;">Facturation</div>
                <div *ngIf="dn.invoiced" style="font-weight: 600; color: var(--color-success); font-size: 0.875rem;">✅ Facturé</div>
                <div *ngIf="!dn.invoiced" style="font-weight: 600; color: var(--color-warning); font-size: 0.875rem;">⏳ Non facturé</div>
              </div>
            </div>
            
            <!-- Actions -->
            <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 0.25rem; border-top: 1px solid var(--color-border); padding-top: 0.75rem;">
              <button (click)="downloadPDF(dn.idDeliveryNote, dn.deliveryNoteNumber)"
                      title="Télécharger PDF"
                      style="width: 2rem; height: 2rem; border-radius: 0.375rem; border: 1px solid var(--color-primary-light); background: var(--color-primary-light); color: var(--color-primary-hover); cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: center;">
                📥
              </button>
              <button *ngIf="!dn.invoiced && dn.status === 'PENDING'" 
                      (click)="updateStatus(dn.idDeliveryNote, 'DELIVERED')"
                      title="Marquer comme livré"
                      style="width: 2rem; height: 2rem; border-radius: 0.375rem; border: 1px solid var(--color-primary-light); background: var(--color-info-bg); color: var(--color-info-text); cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: center;">
                📦
              </button>
              <button *ngIf="!dn.invoiced" 
                      (click)="deleteDeliveryNote(dn.idDeliveryNote)"
                      title="Supprimer"
                      style="width: 2rem; height: 2rem; border-radius: 0.375rem; border: 1px solid #fecaca; background: var(--color-danger-bg); color: var(--color-danger); cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: center;">
                🗑️
              </button>
              <button *ngIf="dn.invoiced && dn.bill" 
                      title="Voir facture"
                      style="width: 2rem; height: 2rem; border-radius: 0.375rem; border: 1px solid var(--color-success); background: var(--color-success-bg); color: var(--color-success-text); cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: center;">
                📄
              </button>
            </div>
          </div>
          
          <!-- Empty State -->
          <div *ngIf="filteredDeliveryNotes.length === 0" style="text-align: center; padding: 3rem 1rem; color: var(--color-text-faint);">
            <div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.5;">📭</div>
            <p style="font-size: 1.1rem; margin: 0;">Aucun bon de livraison trouvé</p>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .disabled {
      opacity: 0.5;
      cursor: not-allowed !important;
    }
  `]
})
export class DeliveryNoteListComponent implements OnInit {
  deliveryNotes: DeliveryNote[] = [];
  filteredDeliveryNotes: DeliveryNote[] = [];
  selectedDeliveryNotes: number[] = [];
  
  kpis: DeliveryNoteKPIs = {
    totalDeliveryNotes: 0,
    notInvoiced: 0,
    pendingDelivery: 0,
    deliveredToday: 0,
    totalAmountNotInvoiced: 0,
    totalAmountPending: 0,
    averageDeliveryValue: 0
  };

  filterStatus: string = '';
  filterInvoiced: string = '';
  searchTerm: string = '';
  
  constructor(private apiService: ApiService, private toast: ToastService, private confirmDialog: ConfirmDialogService) {}

  ngOnInit(): void {
    this.loadDeliveryNotes();
    this.loadKPIs();
  }

  loadDeliveryNotes(): void {
    this.apiService.getAllDeliveryNotes().subscribe({
      next: (data: DeliveryNote[]) => {
        this.deliveryNotes = data;
        this.applyFilters();
      },
      error: (error: any) => {
        this.showError('Erreur lors du chargement des bons de livraison');
      }
    });
  }

  loadKPIs(): void {
    this.apiService.getDeliveryNoteKPIs().subscribe({
      next: (data: DeliveryNoteKPIs) => {
        this.kpis = data;
      },
      error: (error: any) => {
      }
    });
  }

  applyFilters(): void {
    this.filteredDeliveryNotes = this.deliveryNotes.filter(dn => {
      let matches = true;
      
      if (this.filterStatus && dn.status !== this.filterStatus) {
        matches = false;
      }
      
      if (this.filterInvoiced !== '') {
        const invoicedFilter = this.filterInvoiced === 'true';
        if (dn.invoiced !== invoicedFilter) {
          matches = false;
        }
      }
      
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        matches = matches && (
          dn.deliveryNoteNumber.toLowerCase().includes(term) ||
          dn.customer.name.toLowerCase().includes(term)
        );
      }
      
      return matches;
    });
  }

  toggleSelect(dn: DeliveryNote): void {
    if (dn.invoiced) return;
    
    const index = this.selectedDeliveryNotes.indexOf(dn.idDeliveryNote);
    if (index > -1) {
      this.selectedDeliveryNotes.splice(index, 1);
    } else {
      this.selectedDeliveryNotes.push(dn.idDeliveryNote);
    }
  }

  isSelected(id: number): boolean {
    return this.selectedDeliveryNotes.includes(id);
  }

  toggleSelectAll(event: any): void {
    if (event.target.checked) {
      this.selectedDeliveryNotes = this.filteredDeliveryNotes
        .filter(dn => !dn.invoiced)
        .map(dn => dn.idDeliveryNote);
    } else {
      this.selectedDeliveryNotes = [];
    }
  }

  areAllSelected(): boolean {
    const selectableNotes = this.filteredDeliveryNotes.filter(dn => !dn.invoiced);
    return selectableNotes.length > 0 && 
           this.selectedDeliveryNotes.length === selectableNotes.length;
  }

  clearSelection(): void {
    this.selectedDeliveryNotes = [];
  }

  getSelectedTotal(): number {
    return this.deliveryNotes
      .filter(dn => this.selectedDeliveryNotes.includes(dn.idDeliveryNote))
      .reduce((sum, dn) => sum + dn.totalAmount, 0);
  }

  canConvertToInvoice(): boolean {
    if (this.selectedDeliveryNotes.length === 0) return false;
    
    const selectedNotes = this.deliveryNotes.filter(dn => 
      this.selectedDeliveryNotes.includes(dn.idDeliveryNote)
    );
    
    if (selectedNotes.length === 0) return false;
    
    // Check all have same customer
    const firstCustomerId = selectedNotes[0].customer.customerId;
    return selectedNotes.every(dn => dn.customer.customerId === firstCustomerId);
  }

  convertToInvoice(): void {
    if (!this.canConvertToInvoice()) {
      this.showError('Impossible de convertir : les BL doivent appartenir au même client');
      return;
    }

    this.apiService.convertDeliveryNotesToInvoice(this.selectedDeliveryNotes).subscribe({
      next: (response: any) => {
        this.showSuccess('Facture créée avec succès à partir des BL sélectionnés');
        this.selectedDeliveryNotes = [];
        this.loadDeliveryNotes();
        this.loadKPIs();
      },
      error: (error: any) => {
        this.showError('Erreur lors de la conversion en facture');
      }
    });
  }

  updateStatus(id: number, newStatus: string): void {
    this.apiService.updateDeliveryNoteStatus(id, newStatus).subscribe({
      next: () => {
        this.showSuccess('Statut mis à jour avec succès');
        this.loadDeliveryNotes();
        this.loadKPIs();
      },
      error: (error: any) => {
        this.showError('Erreur lors de la mise à jour du statut');
      }
    });
  }

  deleteDeliveryNote(id: number): void {
    this.confirmDialog.confirm({
      title:       'Supprimer le BL',
      message:     'Supprimer ce bon de livraison ? Le stock sera restauré.',
      confirmText: 'Supprimer',
      danger:      true
    }).then(ok => {
      if (!ok) return;
      this.apiService.deleteDeliveryNote(id).subscribe({
        next: () => {
          this.showSuccess('Bon de livraison supprimé avec succès');
          this.loadDeliveryNotes();
          this.loadKPIs();
        },
        error: () => {
          this.showError('Erreur lors de la suppression');
        }
      });
    });
  }

  downloadPDF(id: number, deliveryNoteNumber: string): void {
    this.apiService.downloadDeliveryNotePDF(id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${deliveryNoteNumber}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error: any) => {
        this.showError('Erreur lors du téléchargement du PDF');
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return '#f59e0b';
      case 'DELIVERED': return '#22c55e';
      case 'CANCELLED': return '#ef4444';
      case 'INVOICED': return '#3b82f6';
      default: return '#6b7280';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'DELIVERED': return 'Livré';
      case 'CANCELLED': return 'Annulé';
      case 'INVOICED': return 'Facturé';
      default: return status;
    }
  }

  showError(message: string):   void { this.toast.error(message); }
  showSuccess(message: string): void { this.toast.success(message); }
}
