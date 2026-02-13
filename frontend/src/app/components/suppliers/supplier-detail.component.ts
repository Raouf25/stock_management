import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-supplier-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './supplier-detail.component.html'
})
export class SupplierDetailComponent implements OnInit {
  supplier: any = null;
  loading = true;
  error: string | null = null;
  purchases: any[] = [];
  purchasesLoading = false;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    public router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.apiService.getSupplierById(+id).subscribe({
        next: (data) => {
          this.supplier = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement du fournisseur';
          this.loading = false;
        }
      });
      this.loadPurchases(+id);
    } else {
      this.error = 'ID fournisseur manquant';
      this.loading = false;
    }
  }

  loadPurchases(supplierId: number): void {
    this.purchasesLoading = true;
    this.apiService.searchPurchases(undefined, undefined, supplierId).subscribe({
      next: (data: any[]) => {
        if (data && data.length > 0) {
          this.purchases = (data || []).map((achat: any) => ({ ...achat, showProducts: false }));
          this.purchasesLoading = false;
        } else {
          // Fallback si /search ne retourne rien
          this.apiService.getPurchasesBySupplier(supplierId).subscribe({
            next: (data2: any[]) => {
              this.purchases = (data2 || []).map((achat: any) => ({ ...achat, showProducts: false }));
              this.purchasesLoading = false;
            },
            error: () => {
              this.purchases = [];
              this.purchasesLoading = false;
            }
          });
        }
      },
      error: () => {
        // Fallback si /search échoue
        this.apiService.getPurchasesBySupplier(supplierId).subscribe({
          next: (data2: any[]) => {
            this.purchases = (data2 || []).map((achat: any) => ({ ...achat, showProducts: false }));
            this.purchasesLoading = false;
          },
          error: () => {
            this.purchases = [];
            this.purchasesLoading = false;
          }
        });
      }
    });
  }
}
