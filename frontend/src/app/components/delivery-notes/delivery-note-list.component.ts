import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

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
           style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; border-radius: 0.5rem; text-decoration: none; font-weight: 600; transition: all 0.3s;">
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
              <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Statut</label>
              <select [(ngModel)]="filterStatus" (change)="applyFilters()"
                      style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem;">
                <option value="">Tous les statuts</option>
                <option value="PENDING">En attente</option>
                <option value="DELIVERED">Livré</option>
                <option value="CANCELLED">Annulé</option>
                <option value="INVOICED">Facturé</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">État Facturation</label>
              <select [(ngModel)]="filterInvoiced" (change)="applyFilters()"
                      style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem;">
                <option value="">Tous</option>
                <option value="true">Facturés</option>
                <option value="false">Non facturés</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Rechercher</label>
              <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()" 
                     placeholder="Numéro BL, client..."
                     style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem;">
            </div>
          </div>
        </div>
      </div>

      <!-- Conversion to Invoice -->
      <div *ngIf="selectedDeliveryNotes.length > 0" class="invoice-card" style="margin-bottom: 1.5rem; border: 2px solid #22c55e;">
        <div style="padding: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 700; font-size: 1.125rem; color: #111827;">
              {{ selectedDeliveryNotes.length }} BL sélectionné(s)
            </div>
            <div style="color: #6b7280; font-size: 0.875rem;">
              Total: {{ getSelectedTotal() | number:'1.3-3' }} DNT
            </div>
          </div>
          <div style="display: flex; gap: 1rem;">
            <button (click)="clearSelection()"
                    style="padding: 0.75rem 1.5rem; background: #f3f4f6; color: #374151; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer;">
              Annuler
            </button>
            <button (click)="convertToInvoice()" [disabled]="!canConvertToInvoice()"
                    [class.disabled]="!canConvertToInvoice()"
                    style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer;">
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
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">
                  <input type="checkbox" (change)="toggleSelectAll($event)" 
                         [checked]="areAllSelected()"
                         style="width: 1.25rem; height: 1.25rem; cursor: pointer;">
                </th>
                <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">Numéro BL</th>
                <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">Date</th>
                <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">Client</th>
                <th style="padding: 1rem; text-align: right; font-weight: 600; color: #374151;">Montant</th>
                <th style="padding: 1rem; text-align: center; font-weight: 600; color: #374151;">Statut</th>
                <th style="padding: 1rem; text-align: center; font-weight: 600; color: #374151;">Facturation</th>
                <th style="padding: 1rem; text-align: center; font-weight: 600; color: #374151;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let dn of filteredDeliveryNotes" 
                  style="border-bottom: 1px solid #e5e7eb; transition: background 0.2s;"
                  onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='white'">
                <td style="padding: 1rem;">
                  <input type="checkbox" [checked]="isSelected(dn.idDeliveryNote)" 
                         (change)="toggleSelect(dn)"
                         [disabled]="dn.invoiced"
                         style="width: 1.25rem; height: 1.25rem; cursor: pointer;">
                </td>
                <td style="padding: 1rem; font-weight: 600; color: #111827;">{{ dn.deliveryNoteNumber }}</td>
                <td style="padding: 1rem; color: #6b7280;">{{ dn.dateDelivery | date:'dd/MM/yyyy' }}</td>
                <td style="padding: 1rem; color: #111827;">{{ dn.customer.name }}</td>
                <td style="padding: 1rem; text-align: right; font-weight: 600; color: #111827;">
                  {{ dn.totalAmount | number:'1.3-3' }} DNT
                </td>
                <td style="padding: 1rem; text-align: center;">
                  <span [style.background]="getStatusColor(dn.status)" 
                        style="padding: 0.375rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; color: white;">
                    {{ getStatusLabel(dn.status) }}
                  </span>
                </td>
                <td style="padding: 1rem; text-align: center;">
                  <div *ngIf="dn.invoiced" style="display: flex; flex-direction: column; align-items: center; gap: 0.25rem;">
                    <span style="color: #22c55e; font-weight: 600;">✅ Facturé</span>
                    <span *ngIf="dn.bill?.idBill" style="font-size: 0.75rem; color: #6b7280;">Facture #{{ dn.bill?.idBill }}</span>
                  </div>
                  <span *ngIf="!dn.invoiced" style="color: #f59e0b; font-weight: 600;">⏳ Non facturé</span>
                </td>
                <td style="padding: 1rem;">
                  <div style="display: flex; gap: 0.5rem; justify-content: center;">
                    <button (click)="downloadPDF(dn.idDeliveryNote, dn.deliveryNoteNumber)"
                            title="Télécharger PDF"
                            style="padding: 0.5rem; background: #e0e7ff; color: #4338ca; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 600;">
                      📥
                    </button>
                    <button *ngIf="!dn.invoiced && dn.status === 'PENDING'" 
                            (click)="updateStatus(dn.idDeliveryNote, 'DELIVERED')"
                            title="Marquer comme livré"
                            style="padding: 0.5rem; background: #dbeafe; color: #1e40af; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 600;">
                      📦
                    </button>
                    <button *ngIf="!dn.invoiced" 
                            (click)="deleteDeliveryNote(dn.idDeliveryNote)"
                            title="Supprimer"
                            style="padding: 0.5rem; background: #fee2e2; color: #dc2626; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 600;">
                      🗑️
                    </button>
                    <button *ngIf="dn.invoiced && dn.bill" 
                            title="Voir facture"
                            style="padding: 0.5rem; background: #d1fae5; color: #065f46; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 600;">
                      📄
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredDeliveryNotes.length === 0">
                <td colspan="8" style="padding: 3rem; text-align: center; color: #9ca3af;">
                  <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
                  <p>Aucun bon de livraison trouvé</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Messages -->
      <div *ngIf="errorMessage" style="position: fixed; bottom: 1rem; right: 1rem; max-width: 400px; padding: 1rem; background: #fee2e2; color: #dc2626; border-radius: 0.5rem; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-left: 4px solid #dc2626;">
        {{ errorMessage }}
      </div>
      <div *ngIf="successMessage" style="position: fixed; bottom: 1rem; right: 1rem; max-width: 400px; padding: 1rem; background: #d1fae5; color: #065f46; border-radius: 0.5rem; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-left: 4px solid #10b981;">
        {{ successMessage }}
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
  
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private apiService: ApiService) {}

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
        console.error('Error loading delivery notes:', error);
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
        console.error('Error loading KPIs:', error);
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
        console.error('Error converting to invoice:', error);
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
        console.error('Error updating status:', error);
        this.showError('Erreur lors de la mise à jour du statut');
      }
    });
  }

  deleteDeliveryNote(id: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce bon de livraison ? Le stock sera restauré.')) {
      return;
    }

    this.apiService.deleteDeliveryNote(id).subscribe({
      next: () => {
        this.showSuccess('Bon de livraison supprimé avec succès');
        this.loadDeliveryNotes();
        this.loadKPIs();
      },
      error: (error: any) => {
        console.error('Error deleting delivery note:', error);
        this.showError('Erreur lors de la suppression');
      }
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
        console.error('Erreur lors du téléchargement PDF:', error);
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

  showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = '', 5000);
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => this.successMessage = '', 5000);
  }
}
