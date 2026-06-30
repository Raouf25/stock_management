import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-customer-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="invoice-page-container">
      <!-- Header -->
      <div class="invoice-page-header">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <span style="font-size: 2rem;">✏️</span>
          <h1 class="invoice-page-title">Modifier le Client</h1>
        </div>
        <button (click)="goBack()" 
                style="padding: 0.75rem 1.5rem; background: var(--color-text-muted); color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
          ← Retour
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" style="text-align: center; padding: 3rem;">
        <div style="font-size: 2rem; margin-bottom: 1rem;">⏳</div>
        <p style="color: var(--color-text-muted);">Chargement des données du client...</p>
      </div>

      <!-- Formulaire -->
      <div class="invoice-card" *ngIf="!isLoading">
        <div class="invoice-card-header gradient-purple">
          <span style="font-size: 1rem;">📝</span>
          <span class="invoice-card-header-title">Informations Client #{{ customerId }}</span>
        </div>
        
        <div style="padding: 2rem;">
          <form [formGroup]="customerForm" (ngSubmit)="onSubmit()">
            <!-- Section: Informations de Base -->
            <div style="margin-bottom: 2rem;">
              <h3 style="color: var(--color-text-2); font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--color-border);">
                Informations de Base
              </h3>
              <div class="form-grid">
                <div class="form-field">
                  <label class="field-label">
                    Nom de l'Entreprise <span style="color: var(--color-danger);">*</span>
                  </label>
                  <input type="text" formControlName="name" class="form-input" placeholder="Ex: Société ABC">
                  <div *ngIf="customerForm.get('name')?.invalid && customerForm.get('name')?.touched" 
                       style="color: var(--color-danger); font-size: 0.75rem; margin-top: 0.25rem;">
                    Le nom est requis
                  </div>
                </div>

                <div class="form-field">
                  <label class="field-label">
                    Nom Complet du Contact
                  </label>
                  <input type="text" formControlName="fullName" class="form-input" placeholder="Ex: Ahmed Ben Ali">
                </div>

                <div class="form-field">
                  <label class="field-label">
                    Email <span style="color: var(--color-danger);">*</span>
                  </label>
                  <input type="email" formControlName="email" class="form-input" placeholder="contact@exemple.tn">
                  <div *ngIf="customerForm.get('email')?.invalid && customerForm.get('email')?.touched" 
                       style="color: var(--color-danger); font-size: 0.75rem; margin-top: 0.25rem;">
                    Email invalide
                  </div>
                </div>

                <div class="form-field">
                  <label class="field-label">
                    Téléphone <span style="color: var(--color-danger);">*</span>
                  </label>
                  <input type="tel" formControlName="phone" class="form-input" placeholder="+216 XX XXX XXX">
                  <div *ngIf="customerForm.get('phone')?.invalid && customerForm.get('phone')?.touched" 
                       style="color: var(--color-danger); font-size: 0.75rem; margin-top: 0.25rem;">
                    Le téléphone est requis
                  </div>
                </div>

                <div class="form-field">
                  <label class="field-label">Fax</label>
                  <input type="tel" formControlName="fax" class="form-input" placeholder="+216 XX XXX XXX">
                </div>

                <div class="form-field">
                  <label class="field-label">
                    Statut <span style="color: var(--color-danger);">*</span>
                  </label>
                  <select formControlName="status" class="form-input">
                    <option value="ACTIVE">Actif</option>
                    <option value="INACTIVE">Inactif</option>
                    <option value="BLOCKED">Bloqué</option>
                    <option value="PROSPECT">Prospect</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Section: Adresse -->
            <div style="margin-bottom: 2rem;">
              <h3 style="color: var(--color-text-2); font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--color-border);">
                Adresse
              </h3>
              <div class="form-grid">
                <div class="form-field full-width">
                  <label class="field-label">Adresse Complète</label>
                  <textarea formControlName="address" class="form-input" rows="3" 
                            placeholder="Ex: 123 Avenue Habib Bourguiba, Tunis"></textarea>
                </div>

                <div class="form-field">
                  <label class="field-label">Ville</label>
                  <input type="text" formControlName="city" class="form-input" placeholder="Ex: Tunis">
                </div>
              </div>
            </div>

            <!-- Section: Informations Fiscales -->
            <div style="margin-bottom: 2rem;">
              <h3 style="color: var(--color-text-2); font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--color-border);">
                Informations Fiscales
              </h3>
              <div class="form-grid">
                <div class="form-field">
                  <label class="field-label">Code TVA</label>
                  <input type="text" formControlName="tvaCode" class="form-input" placeholder="Ex: TN123456789">
                </div>

                <div class="form-field">
                  <label class="field-label">
                    CIN (Carte d'Identité Nationale)
                  </label>
                  <input type="text" formControlName="cin" class="form-input" 
                         placeholder="Ex: 01234567" maxlength="8"
                         pattern="[0-9]{8}">
                  <div *ngIf="customerForm.get('cin')?.invalid && customerForm.get('cin')?.touched" 
                       style="color: var(--color-danger); font-size: 0.75rem; margin-top: 0.25rem;">
                    Le CIN doit contenir 8 chiffres
                  </div>
                </div>

                <div class="form-field">
                  <label class="field-label">
                    Plaque d'Immatriculation
                  </label>
                  <input type="text" formControlName="licensePlate" class="form-input" 
                         placeholder="Ex: 123 تونس 4567">
                </div>
              </div>
            </div>

            <!-- Messages d'erreur et succès -->
            <div *ngIf="errorMessage" 
                 style="padding: 1rem; background: var(--color-danger-bg); border: 1px solid var(--color-danger); border-radius: 0.5rem; color: var(--color-danger-text); margin-bottom: 1rem;">
              {{ errorMessage }}
            </div>

            <div *ngIf="successMessage" 
                 style="padding: 1rem; background: var(--color-success-bg); border: 1px solid var(--color-success); border-radius: 0.5rem; color: var(--color-success-text); margin-bottom: 1rem;">
              {{ successMessage }}
            </div>

            <!-- Boutons d'action -->
            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
              <button type="button" (click)="goBack()" 
                      style="padding: 0.75rem 1.5rem; background: var(--color-surface-2); color: var(--color-text-2); border: 1px solid var(--color-border-strong); border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
                Annuler
              </button>
              <button type="submit" [disabled]="customerForm.invalid || isSubmitting"
                      style="padding: 0.75rem 2rem; background: linear-gradient(135deg, var(--color-warning) 0%, var(--color-warning) 100%); color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;"
                      [style.opacity]="customerForm.invalid || isSubmitting ? '0.5' : '1'"
                      [style.cursor]="customerForm.invalid || isSubmitting ? 'not-allowed' : 'pointer'">
                {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer les Modifications' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .invoice-page-container {
      padding: 2rem;
      background: var(--color-surface-2);
      min-height: 100vh;
    }

    .invoice-page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .invoice-page-title {
      font-size: 1.875rem;
      font-weight: 700;
      color: var(--color-text);
      margin: 0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .form-field {
      display: flex;
      flex-direction: column;
    }

    .form-field.full-width {
      grid-column: 1 / -1;
    }

    .field-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-2);
      margin-bottom: 0.5rem;
    }

    .form-input {
      padding: 0.75rem;
      border: 1px solid var(--color-border-strong);
      border-radius: 0.5rem;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--color-info);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-input:disabled {
      background: var(--color-surface-2);
      cursor: not-allowed;
    }

    textarea.form-input {
      resize: vertical;
      min-height: 80px;
    }
  `]
})
export class CustomerEditComponent implements OnInit {
  customerForm!: FormGroup;
  customerId!: number;
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.customerId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCustomer();
  }

  initForm(): void {
    this.customerForm = this.fb.group({
      name: ['', Validators.required],
      fullName: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      fax: [''],
      address: [''],
      city: [''],
      tvaCode: [''],
      cin: ['', [Validators.pattern('[0-9]{8}')]],
      licensePlate: [''],
      status: ['ACTIVE', Validators.required]
    });
  }

  loadCustomer(): void {
    this.apiService.getCustomerById(this.customerId).subscribe({
      next: (response: any) => {
        // L'API peut retourner CustomerWithStatsDTO ou juste Customer
        const customer = response.customer || response;
        
        this.customerForm.patchValue({
          name: customer.name || '',
          fullName: customer.fullName || '',
          email: customer.email || '',
          phone: customer.phone || '',
          fax: customer.fax || '',
          address: customer.address || '',
          city: customer.city || '',
          tvaCode: customer.tvaCode || '',
          cin: customer.cin || '',
          licensePlate: customer.licensePlate || '',
          status: customer.status || 'ACTIVE'
        });
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading customer:', error);
        this.errorMessage = 'Erreur lors du chargement du client.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.customerForm.invalid) {
      Object.keys(this.customerForm.controls).forEach(key => {
        this.customerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.apiService.updateCustomer(this.customerId, this.customerForm.value).subscribe({
      next: (response) => {
        this.successMessage = 'Client modifié avec succès!';
        this.isSubmitting = false;
        setTimeout(() => {
          this.router.navigate(['/customers']);
        }, 1500);
      },
      error: (error) => {
        console.error('Error updating customer:', error);
        this.errorMessage = 'Erreur lors de la modification du client. Veuillez réessayer.';
        this.isSubmitting = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/customers']);
  }
}
