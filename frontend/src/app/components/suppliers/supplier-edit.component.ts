import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-supplier-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './supplier-edit.component.html',
  styleUrls: ['./supplier-edit.component.css']
})
export class SupplierEditComponent implements OnInit {
  supplier: any = null;
  loading = true;
  error: string | null = null;
  isSaving = false;

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
    } else {
      this.error = 'ID fournisseur manquant';
      this.loading = false;
    }
  }

  save(): void {
    if (!this.supplier) return;
    this.isSaving = true;
    this.apiService.updateSupplier(this.supplier.supplierId || this.supplier.id, this.supplier).subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/suppliers']);
      },
      error: (err) => {
        this.error = 'Erreur lors de la sauvegarde';
        this.isSaving = false;
      }
    });
  }
}
