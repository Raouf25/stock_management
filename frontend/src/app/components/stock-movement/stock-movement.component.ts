import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-stock-movement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-movement.component.html',
  styleUrls: ['./stock-movement.component.css']
})
export class StockMovementComponent implements OnInit {
  movements: any[] = [];
  loading = true;
  selectedType = '';
  selectedSource = '';

  typeOptions = ['ENTREE', 'SORTIE'];
  sourceOptions = ['ACHAT', 'VENTE', 'AJUSTEMENT'];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadMovements();
  }

  loadMovements(): void {
    this.loading = true;
    this.apiService.getStockMovements().subscribe({
      next: (data) => {
        this.movements = this.filterMovements(data);
        this.loading = false;
      }
    });
  }

  filterMovements(data: any[]): any[] {
    return data.filter(m => {
      const typeMatch = !this.selectedType || m.type === this.selectedType;
      const sourceMatch = !this.selectedSource || m.source === this.selectedSource;
      return typeMatch && sourceMatch;
    });
  }

  onFilterChange(): void {
    this.loadMovements();
  }

  getMovementIcon(type: string): string {
    return type === 'ENTREE' ? '📥' : '📤';
  }

  getTotalQuantity(type: string): number {
    return this.movements
      .filter(m => m.type === type)
      .reduce((sum, m) => sum + (m.quantity || 0), 0);
  }
}
