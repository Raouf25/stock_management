import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface Customer {
  customerId: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface Product {
  productId: number;
  reference: string;
  name: string;
  unitPrice: number;
  stock: number;
  imageUrl?: string;
}

interface InvoiceLineItem {
  productId: number;
  productName: string;
  reference: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  totalPrice: number;
}

@Component({
  selector: 'app-invoice-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './invoice-create.component.html',
  styleUrls: ['./invoice-create.component.css']
})
export class InvoiceCreateComponent implements OnInit {
  invoiceForm!: FormGroup;
  customers: Customer[] = [];
  products: Product[] = [];
  lineItems: InvoiceLineItem[] = [];
  
  loading: boolean = false;
  error: string = '';
  success: string = '';
  showProductSearch: boolean = false;
  filteredProducts: Product[] = [];
  searchProductTerm: string = '';
  
  // Calculation properties
  totalHT: number = 0;
  totalVAT: number = 0;
  totalTTC: number = 0;
  deposit: number = 0;
  netAmountDue: number = 0;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadCustomers();
    this.loadProducts();
  }

  initializeForm() {
    this.invoiceForm = this.formBuilder.group({
      customerId: [null, [Validators.required]],
      billDate: [this.getToday(), [Validators.required]],
      paymentTerms: ['30 jours', [Validators.required]],
      deposit: [0, [Validators.min(0)]]
    });
  }

  getToday(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  loadCustomers() {
    this.apiService.getCustomers().subscribe({
      next: (data) => {
        this.customers = data.map((c: any) => ({
          customerId: c.customerId,
          name: c.name,
          address: c.address,
          phone: c.phone,
          email: c.email
        }));
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.error = 'Erreur lors du chargement des clients';
      }
    });
  }

  loadProducts() {
    const defaultImage = 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=100&h=100&fit=crop';

    this.apiService.getProducts().subscribe({
      next: (data) => {
        this.products = data.map((p: any) => ({
          productId: p.idProduct ?? p.id,
          reference: p.reference,
          name: p.name,
          unitPrice: p.unitPriceSold ?? p.unitPrice ?? 0,
          stock: p.currentStockQuantity ?? p.stock ?? 0,
          imageUrl: p.imageUrl || defaultImage
        }));
        this.filteredProducts = this.products;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.error = 'Erreur lors du chargement des produits';
      }
    });
  }

  filterProducts() {
    if (this.searchProductTerm.trim() === '') {
      this.filteredProducts = this.products;
    } else {
      const term = this.searchProductTerm.toLowerCase();
      this.filteredProducts = this.products.filter(p =>
        p.name.toLowerCase().includes(term) ||
        String(p.reference).toLowerCase().includes(term)
      );
    }
  }

  addLineItem(product: Product) {
    // Check if product already exists in line items
    const existingItem = this.lineItems.find(item => item.productId === product.productId);
    if (existingItem) {
      existingItem.quantity += 1;
      const subtotal = existingItem.quantity * existingItem.unitPrice;
      const discountAmount = (subtotal * existingItem.discount) / 100;
      existingItem.totalPrice = subtotal - discountAmount;
    } else {
      this.lineItems.push({
        productId: product.productId,
        productName: product.name,
        reference: product.reference,
        unitPrice: product.unitPrice,
        quantity: 1,
        discount: 0,
        totalPrice: product.unitPrice
      });
    }
    this.calculateTotals();
  }

  // Vérifie si un produit est déjà dans le panier
  isProductInCart(productId: number): boolean {
    return this.lineItems.some(item => item.productId === productId);
  }

  // Retourne la quantité d'un produit dans le panier
  getProductQuantityInCart(productId: number): number {
    const item = this.lineItems.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  }

  // Retourne le stock disponible (stock initial - quantité dans le panier)
  getAvailableStock(product: Product): number {
    const quantityInCart = this.getProductQuantityInCart(product.productId);
    return product.stock - quantityInCart;
  }

  updateLineItemQuantity(index: number, quantity: number) {
    const quantityValue = isNaN(quantity) ? 1 : Math.max(1, Math.floor(quantity));
    if (quantityValue <= 0) {
      this.removeLineItem(index);
    } else {
      this.lineItems[index].quantity = quantityValue;
      const subtotal = quantityValue * this.lineItems[index].unitPrice;
      const discountAmount = (subtotal * (this.lineItems[index].discount || 0)) / 100;
      this.lineItems[index].totalPrice = subtotal - discountAmount;
      this.calculateTotals();
    }
  }

  updateLineItemDiscount(index: number, discount: number) {
    const discountValue = isNaN(discount) ? 0 : Math.max(0, Math.min(100, discount));
    this.lineItems[index].discount = discountValue;
    const subtotal = this.lineItems[index].quantity * this.lineItems[index].unitPrice;
    const discountAmount = (subtotal * discountValue) / 100;
    this.lineItems[index].totalPrice = subtotal - discountAmount;
    this.calculateTotals();
  }

  removeLineItem(index: number) {
    this.lineItems.splice(index, 1);
    this.calculateTotals();
  }

  calculateTotals() {
    // Calculate total HT (already includes per-item discounts)
    this.totalHT = this.lineItems.reduce((sum, item) => sum + item.totalPrice, 0);

    // Calculate VAT (19%)
    const VAT_RATE = 0.19;
    this.totalVAT = this.totalHT * VAT_RATE;

    // Calculate total TTC (total with tax)
    this.totalTTC = this.totalHT + this.totalVAT;

    // Get deposit
    this.deposit = this.invoiceForm.get('deposit')?.value || 0;

    // Calculate net amount due
    this.netAmountDue = this.totalTTC - this.deposit;
  }

  onDepositChange() {
    this.calculateTotals();
  }

  submitForm() {
    if (this.invoiceForm.invalid) {
      this.error = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    if (this.lineItems.length === 0) {
      this.error = 'Veuillez ajouter au moins un produit';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const customerId = this.invoiceForm.get('customerId')?.value;
    const deposit = this.invoiceForm.get('deposit')?.value || 0;

    const invoiceData = {
      customerId: customerId ? Number(customerId) : null,
      billDate: this.invoiceForm.get('billDate')?.value,
      paymentTerms: this.invoiceForm.get('paymentTerms')?.value,
      deposit: Number(deposit) || 0,
      products: this.lineItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0
      }))
    };

    this.apiService.createInvoice(invoiceData).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = 'Facture créée avec succès!';
        // Navigate back to invoices list after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/invoices']);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error creating invoice:', error);
        this.error = error.error?.message || 'Erreur lors de la création de la facture';
      }
    });
  }

  cancel() {
    this.router.navigate(['/invoices']);
  }
}
