import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-supplier-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './supplier-create.component.html',
  styleUrls: ['./supplier-create.component.css']
})
export class SupplierCreateComponent {
  supplier: any = {
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    webSite: ''
  };
  isSaving = false;
  error: string | null = null;

  constructor(private apiService: ApiService, public router: Router) {}

  save(): void {
    this.isSaving = true;
    this.apiService.createSupplier(this.supplier).subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/suppliers']);
      },
      error: (err) => {
        this.error = 'Erreur lors de la création du fournisseur';
        this.isSaving = false;
      }
    });
  }
}
