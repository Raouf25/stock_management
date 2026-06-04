import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit, AfterViewInit {
  @ViewChild('stockDistributionChart') stockDistributionChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') categoryChart!: ElementRef<HTMLCanvasElement>;

  products: any[] = [];
  loading = true;
  searchText = '';
  showOnlyInStock = false;

  // Charts
  private distributionChart: Chart | null = null;
  private catChart: Chart | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    // Charts will be created after data loads
  }

  private loadProducts(): void {
    this.loading = true;
    this.apiService.getProducts().subscribe({
      next: (data) => {
        this.products = data || [];
        this.loading = false;
        this.createCharts();
      },
      error: () => {
        this.products = [];
        this.loading = false;
      }
    });
  }

  getFilteredProducts(): any[] {
    let list = [...this.products];

    if (this.showOnlyInStock) {
      list = list.filter(p => (p.currentStockQuantity || 0) > 0);
    }

    const searchLower = this.searchText?.toLowerCase().trim();
    if (searchLower) {
      list = list.filter(p =>
          (p.name && p.name.toLowerCase().includes(searchLower)) ||
          (p.designation && p.designation.toLowerCase().includes(searchLower)) ||
          (p.category && p.category.toLowerCase().includes(searchLower))
      );
    }

    return list;
  }

  getTotalStock(): number {
    return this.products.reduce((sum, p) => sum + (p.currentStockQuantity || 0), 0);
  }

  getTotalValue(): number {
    return this.products.reduce((sum, p) => sum + (p.currentStockValue || 0), 0);
  }

  getLowStockCount(): number {
    return this.products.filter(p => (p.currentStockQuantity || 0) < 50).length;
  }

  getAverageCMP(): number {
    if (this.products.length === 0) return 0;
    const total = this.products.reduce((sum, p) => sum + (p.cmp || 0), 0);
    return total / this.products.length;
  }

  createCharts(): void {
    if (this.products.length === 0) return;

    setTimeout(() => {
      this.createStockDistributionChart();
      this.createCategoryDistributionChart();
    }, 100);
  }

  createStockDistributionChart(): void {
    if (!this.stockDistributionChart?.nativeElement) return;

    const ctx = this.stockDistributionChart.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.distributionChart) {
      this.distributionChart.destroy();
    }

    // Sort by stock quantity and take top 15
    const topProducts = [...this.products]
        .sort((a, b) => (b.currentStockQuantity || 0) - (a.currentStockQuantity || 0))
        .slice(0, 15);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: topProducts.map(p => p.name?.substring(0, 15) || 'Sans nom'),
        datasets: [{
          label: 'Quantité en Stock',
          data: topProducts.map(p => p.currentStockQuantity || 0),
          backgroundColor: topProducts.map(p =>
              (p.currentStockQuantity || 0) < 50 ? 'rgba(231, 76, 60, 0.8)' : 'rgba(52, 152, 219, 0.8)'
          ),
          borderColor: topProducts.map(p =>
              (p.currentStockQuantity || 0) < 50 ? 'rgba(231, 76, 60, 1)' : 'rgba(52, 152, 219, 1)'
          ),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          title: {
            display: true,
            text: 'Top 15 - Stock par Produit'
          }
        },
        scales: {
          x: {
            beginAtZero: true
          }
        }
      }
    };

    this.distributionChart = new Chart(ctx, config);
  }

  createCategoryDistributionChart(): void {
    if (!this.categoryChart?.nativeElement) return;

    const ctx = this.categoryChart.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.catChart) {
      this.catChart.destroy();
    }

    // Group by category
    const categoryData: { [key: string]: { count: number, value: number } } = {};

    this.products.forEach(product => {
      const category = product.range || product.gamme || product.category || 'Non défini';
      if (!categoryData[category]) {
        categoryData[category] = { count: 0, value: 0 };
      }
      categoryData[category].count += 1;
      categoryData[category].value += product.currentStockValue || 0;
    });

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: Object.keys(categoryData),
        datasets: [{
          label: 'Valeur par Gamme (DNT)',
          data: Object.values(categoryData).map(d => d.value),
          backgroundColor: [
            'rgba(102, 126, 234, 0.8)',
            'rgba(46, 204, 113, 0.8)',
            'rgba(231, 76, 60, 0.8)',
            'rgba(241, 196, 15, 0.8)',
            'rgba(155, 89, 182, 0.8)',
            'rgba(52, 152, 219, 0.8)',
            'rgba(230, 126, 34, 0.8)'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'right'
          },
          title: {
            display: true,
            text: 'Valeur du Stock par Gamme'
          }
        }
      }
    };

    this.catChart = new Chart(ctx, config);
  }
}