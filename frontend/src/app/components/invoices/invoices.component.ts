import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface Invoice {
  billId: number;
  billDate: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  clientFax: string;
  clientEmail: string;
  totalAmount: number;
  deposit: number;
  amountDue: number;
  products: Array<{
    reference: number;
    productName: string;
    productDescription: string | null;
    unitPrice: number;
    quantity: number;
    totalProductPrice: number;
  }>;
  paymentStatus: string;
}

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.css']
})
export class InvoicesComponent implements OnInit {
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  searchTerm: string = '';
  startDate: string = '';
  endDate: string = '';
  sortField: 'date' | 'amount' | 'amountDue' = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';
  loading: boolean = false;
  error: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.loading = true;
    this.error = '';
    
    this.apiService.getAllBills().subscribe({
      next: (data) => {
        this.invoices = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des factures:', err);
        this.error = 'Impossible de charger les factures. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.invoices];

    // Filtre par terme de recherche (client)
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(inv => 
        inv.clientName.toLowerCase().includes(term) ||
        inv.billId.toString().includes(term)
      );
    }

    // Filtre par date
    if (this.startDate) {
      filtered = filtered.filter(inv => new Date(inv.billDate) >= new Date(this.startDate));
    }
    if (this.endDate) {
      filtered = filtered.filter(inv => new Date(inv.billDate) <= new Date(this.endDate));
    }

    // Tri
    filtered.sort((a, b) => {
      let comparison = 0;
      if (this.sortField === 'date') {
        comparison = new Date(a.billDate).getTime() - new Date(b.billDate).getTime();
      } else if (this.sortField === 'amount') {
        comparison = a.totalAmount - b.totalAmount;
      } else {
        comparison = a.amountDue - b.amountDue;
      }
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    this.filteredInvoices = filtered;
  }

  setSortField(field: 'date' | 'amount' | 'amountDue') {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'desc';
    }
    this.applyFilters();
  }

  clearFilters() {
    this.searchTerm = '';
    this.startDate = '';
    this.endDate = '';
    this.applyFilters();
  }

  downloadInvoice(invoiceId: number) {
    this.apiService.downloadInvoicePDF(invoiceId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `facture-${invoiceId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement de la facture:', err);
        alert('Erreur lors du téléchargement de la facture');
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-TN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return `${amount.toFixed(3)} DNT`;
  }

  getTotalProducts(invoice: Invoice): number {
    return invoice.products.reduce((sum, bp) => sum + bp.quantity, 0);
  }

  getTotalAmount(): number {
    return this.filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  }

  getTotalAmountDue(): number {
    return this.filteredInvoices.reduce((sum, inv) => sum + inv.amountDue, 0);
  }

  getPaymentStatusClass(invoice: Invoice): string {
    if (invoice.amountDue === 0) {
      return 'paid';
    } else if (invoice.amountDue < invoice.totalAmount) {
      return 'partial';
    } else {
      return 'unpaid';
    }
  }

  getAmountDueClass(invoice: Invoice): string {
    if (invoice.amountDue === 0) {
      return 'paid';
    } else if (invoice.amountDue > 0) {
      return 'pending';
    }
    return 'paid';
  }

  getAmountDueIcon(invoice: Invoice): string {
    if (invoice.amountDue === 0) {
      return 'bi-check-circle-fill text-success';
    } else if (invoice.amountDue > 0) {
      return 'bi-exclamation-triangle-fill text-warning';
    }
    return 'bi-check-circle-fill text-success';
  }
}
