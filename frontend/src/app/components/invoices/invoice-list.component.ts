import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { PaginatorComponent } from '../../shared/paginator.component';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

type ActiveTab = 'factures' | 'bl';

interface DeliveryNote {
  idDeliveryNote: number;
  deliveryNoteNumber: string;
  dateDelivery: string;
  customer: { customerId: number; name: string };
  totalAmount: number;
  discount: number;
  status: string;
  invoiced: boolean;
  bill?: { idBill: number };
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
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PaginatorComponent, StatusBadgeComponent],
  template: `
<div class="page">

  <!-- ══ EN-TÊTE ══════════════════════════════════════════════════════════ -->
  <div class="page-header">
    <h1 class="page-title">
      {{ activeTab === 'factures' ? 'Factures' : 'Bons de Livraison' }}
    </h1>
  </div>

  <!-- ══ TOGGLE ════════════════════════════════════════════════════════════ -->
  <div class="tab-bar">
    <button class="tab" [class.tab-on]="activeTab==='factures'" (click)="setTab('factures')">
      <span>📁</span> Factures
      <span class="tab-pill">{{ filteredInvoices.length }}</span>
    </button>
    <button class="tab" [class.tab-on]="activeTab==='bl'" (click)="setTab('bl')">
      <span>📦</span> Bons de Livraison
      <span class="tab-pill">{{ filteredDeliveryNotes.length }}</span>
    </button>
  </div>

  <!-- ══ KPIs FACTURES ════════════════════════════════════════════════════ -->
  <div *ngIf="activeTab==='factures'" class="kpi-row">
    <div class="kpi-card kpi-blue">
      <span class="kpi-val">{{ filteredInvoices.length }}</span>
      <span class="kpi-lbl">Total Factures</span>
    </div>
    <div class="kpi-card kpi-green">
      <span class="kpi-val">{{ getTotalAmount() | number:'1.3-3' }}</span>
      <span class="kpi-lbl">Montant Total (DNT)</span>
    </div>
    <div class="kpi-card kpi-orange">
      <span class="kpi-val">{{ getTotalDue() | number:'1.3-3' }}</span>
      <span class="kpi-lbl">Total Dû (DNT)</span>
    </div>
    <div class="kpi-card kpi-indigo">
      <span class="kpi-val">{{ getCountByStatus('PAID') }}</span>
      <span class="kpi-lbl">Payées</span>
    </div>
    <div class="kpi-card kpi-red">
      <span class="kpi-val">{{ getCountByStatus('UNPAID') }}</span>
      <span class="kpi-lbl">Impayées</span>
    </div>
  </div>

  <!-- ══ KPIs BL ══════════════════════════════════════════════════════════ -->
  <div *ngIf="activeTab==='bl'" class="kpi-row">
    <div class="kpi-card kpi-blue">
      <span class="kpi-val">{{ kpis.totalDeliveryNotes }}</span>
      <span class="kpi-lbl">Total BL</span>
    </div>
    <div class="kpi-card kpi-orange">
      <span class="kpi-val">{{ kpis.notInvoiced }}</span>
      <span class="kpi-lbl">Non Facturés</span>
    </div>
    <div class="kpi-card kpi-indigo">
      <span class="kpi-val">{{ kpis.pendingDelivery }}</span>
      <span class="kpi-lbl">En Attente</span>
    </div>
    <div class="kpi-card kpi-green">
      <span class="kpi-val">{{ kpis.totalAmountNotInvoiced | number:'1.3-3' }}</span>
      <span class="kpi-lbl">Montant Non Facturé (DNT)</span>
    </div>
  </div>

  <!-- ══ CARTE PRINCIPALE ══════════════════════════════════════════════════ -->
  <div class="main-card">

    <!-- ── Filtres Factures ──────────────────────────────────────────────── -->
    <div *ngIf="activeTab==='factures'" class="filter-bar">
      <div class="filter-group">
        <label class="filter-lbl">Statut</label>
        <select class="filter-ctrl" [(ngModel)]="filterStatus" (change)="applyInvoiceFilters()">
          <option value="">Tous</option>
          <option value="PAID">Payé</option>
          <option value="UNPAID">Impayé</option>
          <option value="PARTIALLY_PAID">Partiel</option>
        </select>
      </div>
      <div class="filter-group fg-wide">
        <label class="filter-lbl">Client</label>
        <input type="text" class="filter-ctrl" [(ngModel)]="filterClient"
               (keyup)="applyInvoiceFilters()" placeholder="Rechercher un client...">
      </div>
      <div class="filter-group">
        <label class="filter-lbl">Du</label>
        <input type="date" class="filter-ctrl" [(ngModel)]="filterDateFrom"
               (change)="applyInvoiceFilters()">
      </div>
      <div class="filter-group">
        <label class="filter-lbl">Au</label>
        <input type="date" class="filter-ctrl" [(ngModel)]="filterDateTo"
               (change)="applyInvoiceFilters()">
      </div>
      <button *ngIf="filterStatus||filterClient||filterDateFrom||filterDateTo"
              class="btn-reset" (click)="resetInvoiceFilters()">✕ Réinitialiser</button>
    </div>

    <!-- ── Filtres BL ────────────────────────────────────────────────────── -->
    <div *ngIf="activeTab==='bl'" class="filter-bar">
      <div class="filter-group">
        <label class="filter-lbl">Statut</label>
        <select class="filter-ctrl" [(ngModel)]="filterBLStatus" (change)="applyBLFilters()">
          <option value="">Tous</option>
          <option value="PENDING">En attente</option>
          <option value="DELIVERED">Livré</option>
          <option value="CANCELLED">Annulé</option>
          <option value="INVOICED">Facturé</option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-lbl">Facturation</label>
        <select class="filter-ctrl" [(ngModel)]="filterInvoiced" (change)="applyBLFilters()">
          <option value="">Tous</option>
          <option value="true">Facturés</option>
          <option value="false">Non facturés</option>
        </select>
      </div>
      <div class="filter-group fg-wide">
        <label class="filter-lbl">Recherche</label>
        <input type="text" class="filter-ctrl" [(ngModel)]="searchTerm"
               (ngModelChange)="applyBLFilters()" placeholder="N° BL, client...">
      </div>
      <button *ngIf="filterBLStatus||filterInvoiced||searchTerm"
              class="btn-reset" (click)="resetBLFilters()">✕ Réinitialiser</button>
    </div>

    <!-- ── Barre de sélection BL ─────────────────────────────────────────── -->
    <div *ngIf="activeTab==='bl' && selectedDeliveryNotes.length > 0" class="selection-bar">
      <div class="selection-info">
        <span class="selection-count">{{ selectedDeliveryNotes.length }} BL sélectionné(s)</span>
        <span class="selection-total">— {{ getSelectedTotal() | number:'1.3-3' }} DNT</span>
      </div>
      <div class="selection-actions">
        <button class="btn-sel-cancel" (click)="clearSelection()">Annuler</button>
        <button class="btn-sel-convert"
                (click)="convertToInvoice()"
                [disabled]="!canConvertToInvoice()"
                [class.disabled]="!canConvertToInvoice()">
          Convertir en Facture →
        </button>
      </div>
    </div>

    <!-- ════════ TABLE FACTURES (desktop) ════════ -->
    <div *ngIf="activeTab==='factures'" class="desktop-table">
      <table class="data-table">
        <thead>
          <tr>
            <th>N° FACTURE</th>
            <th>DATE</th>
            <th>CLIENT</th>
            <th class="ta-r">MONTANT TOTAL</th>
            <th class="ta-r">ACOMPTE</th>
            <th class="ta-r">MONTANT DÛ</th>
            <th class="ta-c">STATUT</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let inv of filteredInvoices; trackBy: trackByInvoiceId"
              class="data-row" (click)="openDrawer(inv)">
            <td><span class="id-badge">{{ inv.billId }}</span></td>
            <td class="td-muted">{{ inv.billDate | date:'dd/MM/yyyy' }}</td>
            <td>
              <div class="client-name">{{ inv.clientName }}</div>
              <div class="client-phone">{{ inv.clientPhone }}</div>
            </td>
            <td class="ta-r fw-600">{{ inv.totalAmount | number:'1.3-3' }}</td>
            <td class="ta-r c-cyan">{{ (inv.deposit || 0) | number:'1.3-3' }}</td>
            <td class="ta-r c-green fw-600">{{ inv.amountDue | number:'1.3-3' }}</td>
            <td class="ta-c">
              <app-status-badge [value]="inv.paymentStatus"></app-status-badge>
            </td>
          </tr>
          <tr *ngIf="filteredInvoices.length === 0">
            <td colspan="7" class="empty-state">
              <div class="empty-icon">📭</div>
              <p>Aucune facture trouvée</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ════════ TABLE FACTURES (mobile) ════════ -->
    <div *ngIf="activeTab==='factures'" class="mobile-cards">
      <div *ngFor="let inv of filteredInvoices; trackBy: trackByInvoiceId"
           class="mobile-row" (click)="openDrawer(inv)">
        <div class="mobile-row-top">
          <div class="mobile-row-left">
            <span class="id-badge">{{ inv.billId }}</span>
            <span class="td-muted">{{ inv.billDate | date:'dd/MM/yyyy' }}</span>
          </div>
          <span class="status-badge" [ngClass]="getPaymentStatusClass(inv.paymentStatus)">
            {{ getPaymentStatusLabel(inv.paymentStatus) }}
          </span>
        </div>
        <div class="client-name" style="margin:.5rem 0 .25rem;">{{ inv.clientName }}</div>
        <div class="client-phone" style="margin-bottom:.75rem;">{{ inv.clientPhone }}</div>
        <div class="mobile-grid-3">
          <div class="mg-cell"><span class="mg-lbl">Total</span><strong>{{ inv.totalAmount | number:'1.3-3' }}</strong></div>
          <div class="mg-cell"><span class="mg-lbl">Acompte</span><strong class="c-cyan">{{ (inv.deposit||0) | number:'1.3-3' }}</strong></div>
          <div class="mg-cell"><span class="mg-lbl">Dû</span><strong class="c-green">{{ inv.amountDue | number:'1.3-3' }}</strong></div>
        </div>
      </div>
      <div *ngIf="filteredInvoices.length === 0" class="empty-state">
        <div class="empty-icon">📭</div><p>Aucune facture trouvée</p>
      </div>
    </div>

    <!-- Pagination factures -->
    <app-paginator
      *ngIf="activeTab==='factures'"
      [page]="invoicePage"
      [pageSize]="invoicePageSize"
      [totalItems]="invoiceTotalItems"
      (pageChange)="onInvoicePageChange($event)"
      (pageSizeChange)="onInvoicePageSizeChange($event)">
    </app-paginator>

    <!-- ════════ TABLE BL (desktop) ════════ -->
    <div *ngIf="activeTab==='bl'" class="desktop-table">
      <table class="data-table">
        <thead>
          <tr>
            <th class="ta-c" style="width:48px;">
              <input type="checkbox" class="cb" (change)="toggleSelectAll($event)"
                     [checked]="areAllSelected()">
            </th>
            <th>NUMÉRO BL</th>
            <th>DATE</th>
            <th>CLIENT</th>
            <th class="ta-r">MONTANT</th>
            <th class="ta-c">STATUT</th>
            <th class="ta-c">FACTURATION</th>
            <th class="ta-c">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let dn of filteredDeliveryNotes" class="data-row" (click)="openBLDrawer(dn)">
            <td class="ta-c" (click)="$event.stopPropagation()">
              <input type="checkbox" class="cb" [checked]="isSelected(dn.idDeliveryNote)"
                     (change)="toggleSelect(dn)" [disabled]="dn.invoiced">
            </td>
            <td><span class="id-badge">{{ dn.deliveryNoteNumber }}</span></td>
            <td class="td-muted">{{ dn.dateDelivery | date:'dd/MM/yyyy' }}</td>
            <td class="client-name">{{ dn.customer.name }}</td>
            <td class="ta-r fw-600">{{ dn.totalAmount | number:'1.3-3' }} DNT</td>
            <td class="ta-c">
              <app-status-badge [value]="dn.status"></app-status-badge>
            </td>
            <td class="ta-c">
              <div *ngIf="dn.invoiced" class="invoiced-cell">
                <app-status-badge value="INVOICED"></app-status-badge>
                <span *ngIf="dn.bill?.idBill" class="td-muted" style="font-size:.75rem;">#{{ dn.bill?.idBill }}</span>
              </div>
              <app-status-badge *ngIf="!dn.invoiced" value="PENDING"></app-status-badge>
            </td>
            <td class="ta-c" (click)="$event.stopPropagation()">
              <div class="action-group">
                <button (click)="downloadBLPDF(dn.idDeliveryNote, dn.deliveryNoteNumber)"
                        class="act-btn act-dl" title="Télécharger PDF">📥</button>
                <button *ngIf="!dn.invoiced && dn.status==='PENDING'"
                        (click)="updateBLStatus(dn.idDeliveryNote,'DELIVERED')"
                        class="act-btn act-deliver" title="Marquer livré">📦</button>
                <button *ngIf="!dn.invoiced"
                        (click)="deleteBL(dn.idDeliveryNote)"
                        class="act-btn act-del" title="Supprimer">🗑️</button>
                <button *ngIf="dn.invoiced && dn.bill"
                        class="act-btn act-view" title="Voir facture">📄</button>
              </div>
            </td>
          </tr>
          <tr *ngIf="filteredDeliveryNotes.length === 0">
            <td colspan="8" class="empty-state">
              <div class="empty-icon">📭</div><p>Aucun bon de livraison trouvé</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ════════ TABLE BL (mobile) ════════ -->
    <div *ngIf="activeTab==='bl'" class="mobile-cards">
      <div *ngFor="let dn of filteredDeliveryNotes" class="mobile-row" (click)="openBLDrawer(dn)">
        <div class="mobile-row-top">
          <div class="mobile-row-left" (click)="$event.stopPropagation()">
            <input type="checkbox" class="cb" [checked]="isSelected(dn.idDeliveryNote)"
                   (change)="toggleSelect(dn)" [disabled]="dn.invoiced">
            <span class="id-badge">{{ dn.deliveryNoteNumber }}</span>
            <span class="td-muted">{{ dn.dateDelivery | date:'dd/MM/yyyy' }}</span>
          </div>
          <span class="status-pill" [style.background]="getBLStatusColor(dn.status)">
            {{ getBLStatusLabel(dn.status) }}
          </span>
        </div>
        <div class="client-name" style="margin:.5rem 0 .75rem;">{{ dn.customer.name }}</div>
        <div class="mobile-grid-2" style="margin-bottom:.75rem;">
          <div class="mg-cell"><span class="mg-lbl">Montant</span><strong>{{ dn.totalAmount | number:'1.3-3' }} DNT</strong></div>
          <div class="mg-cell">
            <span class="mg-lbl">Facturation</span>
            <strong *ngIf="dn.invoiced" class="c-green">✅ Facturé</strong>
            <strong *ngIf="!dn.invoiced" class="c-amber">⏳ Non facturé</strong>
          </div>
        </div>
        <div class="action-group" (click)="$event.stopPropagation()"
             style="justify-content:flex-end;border-top:1px solid var(--color-surface-2);padding-top:.75rem;">
          <button (click)="downloadBLPDF(dn.idDeliveryNote,dn.deliveryNoteNumber)"
                  class="act-btn act-dl" title="PDF">📥</button>
          <button *ngIf="!dn.invoiced && dn.status==='PENDING'"
                  (click)="updateBLStatus(dn.idDeliveryNote,'DELIVERED')"
                  class="act-btn act-deliver" title="Livré">📦</button>
          <button *ngIf="!dn.invoiced"
                  (click)="deleteBL(dn.idDeliveryNote)"
                  class="act-btn act-del" title="Supprimer">🗑️</button>
        </div>
      </div>
      <div *ngIf="filteredDeliveryNotes.length === 0" class="empty-state">
        <div class="empty-icon">📭</div><p>Aucun bon de livraison trouvé</p>
      </div>
    </div>

  </div>
  <!-- fin main-card -->

  <!-- ══ DRAWER FACTURE ════════════════════════════════════════════════════ -->
  <div *ngIf="drawerOpen" class="drawer-backdrop" (click)="closeDrawer()"></div>

  <div class="invoice-drawer" [class.drawer-open]="drawerOpen">
    <div class="drawer-iframe-container" *ngIf="selectedInvoice">
      <div class="drawer-head">
        <div>
          <h3 class="drawer-title">Facture #{{ selectedInvoice.billId }}</h3>
          <span class="drawer-sub">{{ selectedInvoice.clientName }}</span>
        </div>
        <button class="btn-close-drawer" (click)="closeDrawer()">✕</button>
      </div>
      <div class="drawer-body">
        <iframe [src]="iframeSrc"
                class="invoice-iframe" title="Prévisualisation"></iframe>
      </div>
      <div class="drawer-foot">
        <button (click)="downloadInvoicePDF(selectedInvoice.billId)" class="drawer-btn btn-dl-inv">⬇️ PDF</button>
        <button (click)="sendInvoiceByEmail(selectedInvoice)"
                [disabled]="sendingEmail === selectedInvoice.billId"
                class="drawer-btn btn-email">
          {{ sendingEmail === selectedInvoice.billId ? '⏳ Envoi...' : '✉️ Email' }}
        </button>
        <button *ngIf="selectedInvoice.paymentStatus !== 'PAID'"
                (click)="openPaymentModal(selectedInvoice)"
                class="drawer-btn btn-encaisse">💰 Encaisser</button>
      </div>
    </div>
  </div>

  <!-- ══ DRAWER BON DE LIVRAISON ══════════════════════════════════════════ -->
  <div *ngIf="blDrawerOpen" class="drawer-backdrop" (click)="closeBLDrawer()"></div>

  <div class="invoice-drawer" [class.drawer-open]="blDrawerOpen">
    <div class="drawer-iframe-container" *ngIf="selectedBL">
      <div class="drawer-head">
        <div>
          <h3 class="drawer-title">Bon de livraison #{{ selectedBL.deliveryNoteNumber }}</h3>
          <span class="drawer-sub">{{ selectedBL.customer?.name }}</span>
        </div>
        <button class="btn-close-drawer" (click)="closeBLDrawer()">✕</button>
      </div>
      <div class="drawer-body">
        <div *ngIf="!blIframeSrc" class="empty-state" style="color:#c4b5fd;">
          <div style="font-size:2rem;">⏳</div>
          <p>Chargement…</p>
        </div>
        <iframe *ngIf="blIframeSrc" [src]="blIframeSrc"
                class="invoice-iframe" title="Bon de livraison"></iframe>
      </div>
      <div class="drawer-foot">
        <button (click)="downloadBLPDF(selectedBL.idDeliveryNote, selectedBL.deliveryNoteNumber)"
                class="drawer-btn btn-dl-inv">⬇️ PDF</button>
        <button *ngIf="!selectedBL.invoiced && selectedBL.status==='PENDING'"
                (click)="updateBLStatus(selectedBL.idDeliveryNote,'DELIVERED'); closeBLDrawer()"
                class="drawer-btn btn-encaisse">📦 Marquer livré</button>
      </div>
    </div>
  </div>


</div>
  `,
  styles: [`
    /* ═══════════════ PAGE ═══════════════ */
    :host { display: block; }

    .page {
      background: var(--color-bg);
      min-height: 100vh;
      padding: 1.75rem 2rem;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      box-sizing: border-box;
    }

    /* ═══════════════ HEADER ═══════════════ */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-text);
      margin: 0;
    }
    .btn-create {
      display: inline-flex;
      align-items: center;
      gap: .4rem;
      padding: .6rem 1.25rem;
      background: linear-gradient(135deg, var(--color-primary-hover), var(--color-primary));
      color: var(--color-surface);
      border-radius: 10px;
      text-decoration: none;
      font-size: .875rem;
      font-weight: 600;
      transition: opacity .18s;
      box-shadow: 0 2px 8px rgba(79,70,229,.25);
    }
    .btn-create:hover { opacity: .88; }

    /* ═══════════════ TOGGLE TAB ═══════════════ */
    .tab-bar {
      display: flex;
      background: var(--color-surface);
      border-radius: 12px;
      border: 1px solid var(--color-border);
      padding: .35rem;
      gap: .35rem;
      width: fit-content;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 4px rgba(0,0,0,.04);
    }
    .tab {
      display: flex;
      align-items: center;
      gap: .5rem;
      border: none;
      background: transparent;
      padding: .6rem 1.25rem;
      border-radius: 8px;
      font-size: .875rem;
      font-weight: 600;
      color: var(--color-text-muted);
      cursor: pointer;
      transition: all .18s;
      white-space: nowrap;
    }
    .tab:hover { background: var(--color-bg); color: var(--color-text-2); }
    .tab-on { background: var(--color-primary-hover) !important; color: var(--color-surface) !important; }
    .tab-pill {
      background: rgba(255,255,255,.2);
      padding: .1rem .45rem;
      border-radius: 20px;
      font-size: .72rem;
      font-weight: 700;
    }
    .tab:not(.tab-on) .tab-pill { background: var(--color-surface-2); color: var(--color-text-muted); }

    /* ═══════════════ KPI ROW ═══════════════ */
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: .875rem;
      margin-bottom: 1.5rem;
    }
    .kpi-card {
      background: var(--color-surface);
      border-radius: 12px;
      border: 1px solid var(--color-border);
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: .3rem;
      box-shadow: 0 1px 3px rgba(0,0,0,.04);
      transition: transform .15s, box-shadow .15s;
    }
    .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,.07); }
    .kpi-val {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-text);
      line-height: 1.2;
    }
    .kpi-lbl {
      font-size: .7rem;
      font-weight: 600;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: .4px;
    }

    /* ═══════════════ MAIN CARD ═══════════════ */
    .main-card {
      background: var(--color-surface);
      border-radius: 12px;
      border: 1px solid var(--color-border);
      box-shadow: 0 1px 4px rgba(0,0,0,.04);
      overflow: hidden;
    }

    /* ═══════════════ FILTER BAR ═══════════════ */
    .filter-bar {
      display: flex;
      align-items: flex-end;
      gap: .875rem;
      padding: 1rem 1.25rem;
      background: var(--color-bg);
      border-bottom: 1px solid var(--color-surface-2);
      flex-wrap: wrap;
    }
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: .35rem;
      flex: 1;
      min-width: 120px;
    }
    .filter-group.fg-wide { flex: 2; min-width: 180px; }
    .filter-lbl {
      font-size: .7rem;
      font-weight: 700;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: .5px;
    }
    .filter-ctrl {
      height: 38px;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 0 .75rem;
      font-size: .85rem;
      background: var(--color-surface);
      color: var(--color-text);
      outline: none;
      transition: border-color .18s;
      width: 100%;
      box-sizing: border-box;
    }
    .filter-ctrl:focus { border-color: var(--color-primary-hover); box-shadow: 0 0 0 3px rgba(79,70,229,.08); }
    .btn-reset {
      height: 38px;
      padding: 0 .875rem;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      background: var(--color-surface);
      color: var(--color-text-muted);
      font-size: .8rem;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      align-self: flex-end;
      transition: all .15s;
    }
    .btn-reset:hover { border-color: var(--color-danger); color: var(--color-danger); background: var(--color-danger-bg); }

    /* ═══════════════ SELECTION BAR ═══════════════ */
    .selection-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: .75rem 1.25rem;
      background: var(--color-success-bg);
      border-bottom: 1px solid var(--color-success);
    }
    .selection-info { display: flex; align-items: center; gap: .5rem; }
    .selection-count { font-weight: 700; color: var(--color-success-text); }
    .selection-total { font-size: .875rem; color: var(--color-success); }
    .selection-actions { display: flex; gap: .75rem; }
    .btn-sel-cancel {
      padding: .45rem 1rem;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      background: var(--color-surface);
      color: var(--color-text-muted);
      font-size: .85rem;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-sel-convert {
      padding: .45rem 1rem;
      border: none;
      border-radius: 8px;
      background: linear-gradient(135deg,var(--color-success),var(--color-success));
      color: var(--color-surface);
      font-size: .85rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity .15s;
    }
    .btn-sel-convert:hover:not(.disabled) { opacity: .88; }
    .btn-sel-convert.disabled { opacity: .5; cursor: not-allowed; }

    /* ═══════════════ TABLE ═══════════════ */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: .875rem;
    }
    .data-table thead tr {
      background: var(--color-bg);
      border-bottom: 2px solid var(--color-border);
    }
    .data-table th {
      color: var(--color-text-muted);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .5px;
      font-size: .72rem;
      padding: .8rem 1rem;
      text-align: left;
      white-space: nowrap;
    }
    .data-table td { padding: .8rem 1rem; border-bottom: 1px solid var(--color-surface-2); vertical-align: middle; }
    .data-row { cursor: pointer; transition: background .12s; }
    .data-row:hover { background: var(--color-primary-muted) !important; }
    .data-row:last-child td { border-bottom: none; }

    .ta-r { text-align: right !important; }
    .ta-c { text-align: center !important; }
    .fw-600 { font-weight: 600; }
    .td-muted { color: var(--color-text-muted); font-size: .875rem; }
    .c-cyan  { color: var(--color-info) !important; }
    .c-green { color: var(--color-success) !important; }
    .c-amber { color: var(--color-warning) !important; }

    .client-name  { font-weight: 500; color: var(--color-text); }
    .client-phone { font-size: .8rem; color: var(--color-text-muted); }

    .id-badge {
      display: inline-block;
      padding: .2rem .6rem;
      background: var(--color-info-bg);
      color: var(--color-info-text);
      border: 1px solid var(--color-primary-light);
      border-radius: 6px;
      font-weight: 600;
      font-size: .8rem;
    }

    /* Status badges */
    .status-badge {
      display: inline-block;
      padding: .3rem .7rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: .78rem;
      white-space: nowrap;
    }
    .badge-paid   { background: var(--color-success-bg); color: var(--color-success-text); }
    .badge-unpaid { background: var(--color-danger-bg); color: var(--color-danger-text); }
    .badge-partial{ background: var(--color-warning-bg); color: var(--color-warning-text); }
    .badge-other  { background: var(--color-surface-2); color: var(--color-text-muted); }

    .status-pill {
      display: inline-block;
      padding: .3rem .7rem;
      border-radius: 9999px;
      font-size: .78rem;
      font-weight: 600;
      color: var(--color-surface);
      white-space: nowrap;
    }

    .invoiced-cell { display: flex; flex-direction: column; align-items: center; gap: .15rem; }

    /* Checkboxes */
    .cb { width: 1.1rem; height: 1.1rem; cursor: pointer; accent-color: var(--color-primary-hover); }

    /* Action buttons */
    .action-group { display: flex; gap: .35rem; justify-content: center; }
    .act-btn {
      width: 2rem; height: 2rem;
      border-radius: 6px; border: 1px solid transparent;
      cursor: pointer; font-size: .875rem;
      display: flex; align-items: center; justify-content: center;
      transition: opacity .15s;
    }
    .act-btn:hover { opacity: .75; }
    .act-dl      { background: var(--color-primary-light); border-color: var(--color-primary-light); }
    .act-deliver { background: var(--color-info-bg); border-color: var(--color-primary-light); }
    .act-del     { background: var(--color-danger-bg); border-color: var(--color-danger); }
    .act-view    { background: var(--color-success-bg); border-color: var(--color-success); }

    /* Empty state */
    .empty-state {
      padding: 3.5rem 1rem;
      text-align: center;
      color: var(--color-text-faint);
    }
    .empty-icon { font-size: 3.5rem; margin-bottom: .75rem; opacity: .6; }

    /* ═══════════════ MOBILE CARDS ═══════════════ */
    .mobile-row {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--color-surface-2);
      cursor: pointer;
      transition: background .12s;
    }
    .mobile-row:hover { background: var(--color-bg); }
    .mobile-row:last-child { border-bottom: none; }
    .mobile-row-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: .5rem;
    }
    .mobile-row-left { display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; }
    .mobile-grid-3 {
      display: grid; grid-template-columns: repeat(3,1fr); gap: .5rem;
    }
    .mobile-grid-2 {
      display: grid; grid-template-columns: repeat(2,1fr); gap: .5rem;
    }
    .mg-cell {
      background: var(--color-bg);
      padding: .5rem;
      border-radius: 8px;
      text-align: center;
      display: flex; flex-direction: column; gap: .1rem;
    }
    .mg-lbl { font-size: .7rem; color: var(--color-text-muted); }

    /* ═══════════════ DRAWER ═══════════════ */
    .drawer-backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.45);
      z-index: 1000;
      animation: fadeIn .25s ease;
    }
    .invoice-drawer {
      position: fixed; top: 0; right: 0;
      height: 100vh; width: 820px; max-width: 96vw;
      background: #3D2D6E;
      z-index: 1001;
      box-shadow: -6px 0 40px rgba(61,45,110,.2);
      transform: translateX(100%);
      transition: transform .3s cubic-bezier(.4,0,.2,1);
      display: flex; flex-direction: column;
      overflow: hidden;
    }
    .invoice-drawer.drawer-open { transform: translateX(0); }

    .drawer-iframe-container { display: flex; flex-direction: column; flex: 1; height: 100%; }
    .drawer-head {
      background: #3D2D6E;
      padding: 1rem 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,.1);
    }
    .drawer-title { margin: 0; color: var(--color-surface); font-size: 1.05rem; font-weight: 600; }
    .drawer-sub   { color: #c4b5fd; font-size: .825rem; }
    .btn-close-drawer {
      background: rgba(255,255,255,.12);
      border: 1px solid rgba(255,255,255,.2);
      color: var(--color-surface); width: 2rem; height: 2rem;
      border-radius: 50%; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: .9rem; transition: background .15s;
    }
    .btn-close-drawer:hover { background: rgba(255,255,255,.28); }

    .drawer-body { flex: 1; overflow-y: auto; background: var(--color-surface); }
    .invoice-iframe { width: 100%; height: 100%; border: none; display: block; }

    .drawer-foot {
      display: flex; gap: .5rem;
      padding: .75rem 1rem;
      background: var(--color-surface);
      border-top: 1px solid var(--color-border);
    }
    .drawer-btn {
      flex: 1; padding: .6rem; border-radius: 8px; border: none;
      color: var(--color-surface); font-weight: 600; font-size: .85rem;
      cursor: pointer; transition: opacity .15s;
    }
    .drawer-btn:hover { opacity: .88; }
    .drawer-btn:disabled { opacity: .5; cursor: not-allowed; }
    .btn-dl-inv   { background: linear-gradient(135deg,var(--color-success),var(--color-success)); }
    .btn-email    { background: linear-gradient(135deg,#0891b2,#06b6d4); }
    .btn-encaisse { background: linear-gradient(135deg,var(--color-warning),var(--color-warning)); }

    /* ═══════════════ RESPONSIVE ═══════════════ */
    .desktop-table { display: none; overflow-x: auto; }
    .mobile-cards  { display: block; }

    @media (min-width: 1024px) {
      .desktop-table { display: block; }
      .mobile-cards  { display: none;  }
    }

    @media (max-width: 768px) {
      .page { padding: 1rem; }
      .invoice-drawer { width: 100vw; max-width: 100vw; }
      .tab-bar { width: 100%; }
      .tab { flex: 1; justify-content: center; font-size: .8rem; padding: .55rem .75rem; }
      .filter-bar { gap: .625rem; }
      .filter-group { min-width: 100%; }
      .kpi-row { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class InvoiceListComponent implements OnInit {

  activeTab: ActiveTab = 'factures';

  // ── Factures ──────────────────────────────────────────────────────────────
  invoices:          any[] = [];
  filteredInvoices:  any[] = [];
  filterStatus    = '';
  filterClient    = '';
  filterDateFrom  = '';
  filterDateTo    = '';
  invoicePage         = 0;
  invoicePageSize     = 20;
  invoiceTotalItems   = 0;
  selectedInvoice: any       = null;
  drawerOpen                 = false;
  iframeSrc: SafeResourceUrl | null = null;
  sendingEmail: number | null = null;

  // ── BL ────────────────────────────────────────────────────────────────────
  deliveryNotes:         DeliveryNote[] = [];
  filteredDeliveryNotes: DeliveryNote[] = [];
  selectedDeliveryNotes: number[]       = [];
  selectedBL:    DeliveryNote | null    = null;
  blDrawerOpen                          = false;
  blIframeSrc:   SafeResourceUrl | null = null;
  private blBlobUrl: string | null      = null;

  kpis: DeliveryNoteKPIs = {
    totalDeliveryNotes: 0, notInvoiced: 0, pendingDelivery: 0,
    deliveredToday: 0, totalAmountNotInvoiced: 0,
    totalAmountPending: 0, averageDeliveryValue: 0
  };

  filterBLStatus = '';
  filterInvoiced = '';
  searchTerm     = '';

  constructor(
    private apiService:     ApiService,
    private sanitizer:      DomSanitizer,
    private toast:          ToastService,
    private confirmDialog:  ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
    this.loadDeliveryNotes();
    this.loadKPIs();
  }

  setTab(tab: ActiveTab): void { this.activeTab = tab; }

  // ══════════════════════════════════════════════════════════════════════════
  //  FACTURES
  // ══════════════════════════════════════════════════════════════════════════

  loadInvoices(): void {
    this.apiService.getAllBills(this.invoicePage, this.invoicePageSize).subscribe({
      next: (res) => {
        this.invoices         = res.content;
        this.invoiceTotalItems = res.totalElements;
        this.applyInvoiceFilters();
      },
      error: () => this.showError('Erreur lors du chargement des factures.')
    });
  }

  onInvoicePageChange(page: number): void {
    this.invoicePage = page;
    this.loadInvoices();
  }

  onInvoicePageSizeChange(size: number): void {
    this.invoicePageSize = size;
    this.invoicePage     = 0;
    this.loadInvoices();
  }

  applyInvoiceFilters(): void {
    this.filteredInvoices = this.invoices.filter(inv => {
      if (this.filterStatus && inv.paymentStatus !== this.filterStatus) return false;
      if (this.filterClient && !inv.clientName?.toLowerCase().includes(this.filterClient.toLowerCase())) return false;
      const d = new Date(inv.billDate);
      if (this.filterDateFrom && d < new Date(this.filterDateFrom)) return false;
      if (this.filterDateTo   && d > new Date(this.filterDateTo))   return false;
      return true;
    });
  }

  resetInvoiceFilters(): void {
    this.filterStatus = '';
    this.filterClient = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.applyInvoiceFilters();
  }

  getTotalAmount(): number { return this.filteredInvoices.reduce((s, i) => s + (i.totalAmount || 0), 0); }
  getTotalDue():    number { return this.filteredInvoices.reduce((s, i) => s + (i.amountDue || 0), 0); }
  getCountByStatus(status: string): number {
    return this.filteredInvoices.filter(i => i.paymentStatus === status).length;
  }

  private buildIframeSrc(billId: number): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `${environment.apiUrl}/invoices/preview/${billId}?t=${Date.now()}`
    );
  }

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'PAID':           return 'status-badge badge-paid';
      case 'UNPAID':         return 'status-badge badge-unpaid';
      case 'PARTIALLY_PAID': return 'status-badge badge-partial';
      default:               return 'status-badge badge-other';
    }
  }
  getPaymentStatusLabel(status: string): string {
    switch (status) {
      case 'PAID':           return 'Payé';
      case 'UNPAID':         return 'Impayé';
      case 'PARTIALLY_PAID': return 'Partiel';
      default:               return status || '—';
    }
  }

  trackByInvoiceId(_: number, inv: any): number { return inv.billId; }

  openDrawer(invoice: any): void {
    this.selectedInvoice = invoice;
    this.iframeSrc = this.buildIframeSrc(invoice.billId);
    this.drawerOpen = true;
  }
  closeDrawer(): void {
    this.drawerOpen = false;
    setTimeout(() => { this.selectedInvoice = null; }, 300);
  }

  openBLDrawer(dn: DeliveryNote): void {
    this.selectedBL   = dn;
    this.blIframeSrc  = null;
    this.blDrawerOpen = true;
    this.apiService.downloadDeliveryNotePDF(dn.idDeliveryNote).subscribe({
      next: (blob: Blob) => {
        if (this.blBlobUrl) window.URL.revokeObjectURL(this.blBlobUrl);
        this.blBlobUrl  = window.URL.createObjectURL(blob);
        this.blIframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(this.blBlobUrl);
      }
    });
  }
  closeBLDrawer(): void {
    this.blDrawerOpen = false;
    setTimeout(() => {
      this.selectedBL  = null;
      this.blIframeSrc = null;
      if (this.blBlobUrl) { window.URL.revokeObjectURL(this.blBlobUrl); this.blBlobUrl = null; }
    }, 300);
  }

  downloadInvoicePDF(id: number): void {
    this.apiService.downloadInvoicePDF(id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href = url; a.download = `facture-${id}.pdf`;
        a.click(); window.URL.revokeObjectURL(url);
      }
    });
  }

  sendInvoiceByEmail(invoice: any): void {
    if (!invoice.clientEmail) { this.toast.warning('Pas d\'email pour ce client.'); return; }
    this.confirmDialog.confirm({
      title:       'Envoyer par email',
      message:     `Envoyer la facture #${invoice.billId} à ${invoice.clientEmail} ?`,
      confirmText: 'Envoyer',
      danger:      false
    }).then(ok => {
      if (!ok) return;
      this.sendingEmail = invoice.billId;
      this.apiService.sendInvoiceByEmail(invoice.billId).subscribe({
        next: () => { this.sendingEmail = null; this.toast.success(`Facture envoyée à ${invoice.clientEmail}`); },
        error: () => { this.sendingEmail = null; this.toast.error('Erreur lors de l\'envoi.'); }
      });
    });
  }

  openPaymentModal(invoice: any): void {
    this.apiService.registerInvoicePayment(invoice.billId).subscribe({
      next: (updated: any) => {
        // 1. Nouvelle référence de tableau → force la détection de changement Angular
        this.invoices = this.invoices.map(inv =>
          inv.billId === invoice.billId ? updated : inv
        );
        this.applyInvoiceFilters();
        // 2. Mettre à jour le drawer
        this.selectedInvoice = { ...updated };
        // 3. Recharger l'iframe pour afficher "PAYÉ" dans le PDF
        this.iframeSrc = this.buildIframeSrc(invoice.billId);
        this.showSuccess(`Facture #${invoice.billId} marquée comme payée.`);
      },
      error: (err) => this.showError(err.error?.error ?? 'Erreur lors de l\'encaissement.')
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  BONS DE LIVRAISON
  // ══════════════════════════════════════════════════════════════════════════

  loadDeliveryNotes(): void {
    this.apiService.getAllDeliveryNotes().subscribe({
      next: (data: DeliveryNote[]) => { this.deliveryNotes = data; this.applyBLFilters(); },
      error: () => this.showError('Erreur lors du chargement des BL.')
    });
  }

  loadKPIs(): void {
    this.apiService.getDeliveryNoteKPIs().subscribe({
      next: (data: DeliveryNoteKPIs) => { this.kpis = data; }
    });
  }

  applyBLFilters(): void {
    this.filteredDeliveryNotes = this.deliveryNotes.filter(dn => {
      if (this.filterBLStatus && dn.status !== this.filterBLStatus) return false;
      if (this.filterInvoiced !== '' && dn.invoiced !== (this.filterInvoiced === 'true')) return false;
      if (this.searchTerm) {
        const t = this.searchTerm.toLowerCase();
        if (!dn.deliveryNoteNumber.toLowerCase().includes(t) &&
            !dn.customer.name.toLowerCase().includes(t)) return false;
      }
      return true;
    });
  }

  resetBLFilters(): void {
    this.filterBLStatus = '';
    this.filterInvoiced = '';
    this.searchTerm     = '';
    this.applyBLFilters();
  }

  toggleSelect(dn: DeliveryNote): void {
    if (dn.invoiced) return;
    const idx = this.selectedDeliveryNotes.indexOf(dn.idDeliveryNote);
    idx > -1
      ? this.selectedDeliveryNotes.splice(idx, 1)
      : this.selectedDeliveryNotes.push(dn.idDeliveryNote);
  }
  isSelected(id: number): boolean { return this.selectedDeliveryNotes.includes(id); }
  toggleSelectAll(event: any): void {
    this.selectedDeliveryNotes = event.target.checked
      ? this.filteredDeliveryNotes.filter(dn => !dn.invoiced).map(dn => dn.idDeliveryNote)
      : [];
  }
  areAllSelected(): boolean {
    const sel = this.filteredDeliveryNotes.filter(dn => !dn.invoiced);
    return sel.length > 0 && this.selectedDeliveryNotes.length === sel.length;
  }
  clearSelection(): void { this.selectedDeliveryNotes = []; }
  getSelectedTotal(): number {
    return this.deliveryNotes
      .filter(dn => this.selectedDeliveryNotes.includes(dn.idDeliveryNote))
      .reduce((s, dn) => s + dn.totalAmount, 0);
  }
  canConvertToInvoice(): boolean {
    if (!this.selectedDeliveryNotes.length) return false;
    const sel = this.deliveryNotes.filter(dn => this.selectedDeliveryNotes.includes(dn.idDeliveryNote));
    if (!sel.length) return false;
    const firstId = sel[0].customer.customerId;
    return sel.every(dn => dn.customer.customerId === firstId);
  }
  convertToInvoice(): void {
    if (!this.canConvertToInvoice()) {
      this.showError('Les BL doivent appartenir au même client.');
      return;
    }
    this.apiService.convertDeliveryNotesToInvoice(this.selectedDeliveryNotes).subscribe({
      next: () => {
        this.showSuccess('Facture créée depuis les BL sélectionnés.');
        this.selectedDeliveryNotes = [];
        this.loadInvoices();
        this.loadDeliveryNotes();
        this.loadKPIs();
      },
      error: () => this.showError('Erreur lors de la conversion.')
    });
  }

  updateBLStatus(id: number, status: string): void {
    this.apiService.updateDeliveryNoteStatus(id, status).subscribe({
      next: () => { this.showSuccess('Statut mis à jour.'); this.loadDeliveryNotes(); this.loadKPIs(); },
      error: () => this.showError('Erreur lors de la mise à jour.')
    });
  }

  deleteBL(id: number): void {
    this.confirmDialog.confirm({
      title:       'Supprimer le BL',
      message:     'Supprimer ce bon de livraison ? Le stock sera restauré.',
      confirmText: 'Supprimer',
      danger:      true
    }).then(ok => {
      if (!ok) return;
      this.apiService.deleteDeliveryNote(id).subscribe({
        next: () => { this.showSuccess('BL supprimé.'); this.loadDeliveryNotes(); this.loadKPIs(); },
        error: () => this.showError('Erreur lors de la suppression.')
      });
    });
  }

  downloadBLPDF(id: number, num: string): void {
    this.apiService.downloadDeliveryNotePDF(id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href = url; a.download = `${num}.pdf`;
        a.click(); window.URL.revokeObjectURL(url);
      },
      error: () => this.showError('Erreur téléchargement PDF.')
    });
  }

  getBLStatusColor(status: string): string {
    const map: Record<string, string> = {
      PENDING: '#f59e0b', DELIVERED: '#10b981',
      CANCELLED: '#ef4444', INVOICED: '#4f46e5'
    };
    return map[status] ?? '#6b7280';
  }
  getBLStatusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'En attente', DELIVERED: 'Livré',
      CANCELLED: 'Annulé',  INVOICED: 'Facturé'
    };
    return map[status] ?? status;
  }

  private showError(msg: string):   void { this.toast.error(msg); }
  private showSuccess(msg: string): void { this.toast.success(msg); }
}
