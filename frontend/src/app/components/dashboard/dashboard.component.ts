import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stockSummary: any[] = [];
  stockTotals: any = null;
  totalValue: number = 0;
  alerts: any[] = [];
  products: any[] = [];
  loading = true;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    
    // Charger les données
    this.apiService.getStockSummary().subscribe({
      next: (data) => {
        // L'API retourne maintenant {totals: {...}, products: [...]}
        this.stockTotals = data.totals;
        this.stockSummary = data.products || [];
      }
    });

    this.apiService.getStockTotalValue().subscribe({
      next: (data) => this.totalValue = data
    });

    this.apiService.getStockAlerts(20).subscribe({
      next: (data) => this.alerts = data
    });

    this.apiService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      }
    });
  }

  getLowStockPercentage(): number {
    if (this.stockSummary.length === 0) return 0;
    const lowStock = this.stockSummary.filter(p => p.currentQuantity < 50).length;
    return Math.round((lowStock / this.stockSummary.length) * 100);
  }
}
