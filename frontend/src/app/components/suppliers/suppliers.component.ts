import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.css']
})
export class SuppliersComponent implements OnInit {
  suppliers: any[] = [];
  loading = true;
  searchText = '';
  kpis: any = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadSuppliers();
    this.loadKPIs();
  }

  loadSuppliers(): void {
    this.loading = true;
    this.apiService.getSuppliers().subscribe({
      next: (data) => {
        console.log('Fournisseurs reçus:', data?.length || 0, 'fournisseurs');
        this.suppliers = data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des fournisseurs:', err);
        this.suppliers = [];
        this.loading = false;
      }
    });
  }

  loadKPIs(): void {
    this.apiService.getSupplierKPIs().subscribe({
      next: (data) => {
        this.kpis = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des KPIs:', err);
      }
    });
  }

  getFilteredSuppliers(): any[] {
    if (!this.searchText || this.searchText.trim() === '') {
      return this.suppliers;
    }
    
    const searchLower = this.searchText.toLowerCase().trim();
    
    return this.suppliers.filter(s => {
      const nameMatch = s.supplier?.name && s.supplier.name.toLowerCase().includes(searchLower);
      const emailMatch = s.supplier?.email && s.supplier.email.toLowerCase().includes(searchLower);
      const phoneMatch = s.supplier?.phone && s.supplier.phone.toLowerCase().includes(searchLower);
      const contactMatch = s.supplier?.contactPerson && s.supplier.contactPerson.toLowerCase().includes(searchLower);
      
      return nameMatch || emailMatch || phoneMatch || contactMatch;
    });
  }

  getTotalPurchases(): number {
    return this.suppliers.reduce((sum, s) => sum + (s.totalPurchases || 0), 0);
  }

  getTotalAmount(): number {
    return this.suppliers.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  }

  getTotalProducts(): number {
    return this.suppliers.reduce((sum, s) => sum + (s.totalProductsSupplied || 0), 0);
  }
}
