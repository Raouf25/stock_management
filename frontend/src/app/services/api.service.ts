import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) { }

  // === PRODUCTS ===
  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products`);
  }

  getProductById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/products/${id}`);
  }

  getProductsBySupplier(supplierId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products/supplier/${supplierId}`);
  }

  getStockSummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stock/summary`);
  }

  getStockAlerts(threshold: number = 10): Observable<any[]> {
    const params = new HttpParams().set('threshold', threshold.toString());
    return this.http.get<any[]>(`${this.apiUrl}/stock/alerts`, { params });
  }

  getStockTotalValue(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stock/total-value`);
  }

  // === PURCHASES ===
  getPurchases(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/purchases`);
  }

  getPurchaseById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/purchases/${id}`);
  }

  createPurchase(purchase: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/purchases`, purchase);
  }

  searchPurchases(dateFrom?: string, dateTo?: string, supplierId?: number): Observable<any[]> {
    let params = new HttpParams();
    if (dateFrom) params = params.set('dateFrom', dateFrom);
    if (dateTo) params = params.set('dateTo', dateTo);
    if (supplierId) params = params.set('supplierId', supplierId.toString());
    return this.http.get<any[]>(`${this.apiUrl}/purchases/search`, { params });
  }

  // === SALES ===
  getSales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sales`);
  }

  getSaleById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/sales/${id}`);
  }

  createSale(sale: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/sales`, sale);
  }

  searchSales(dateFrom?: string, dateTo?: string): Observable<any[]> {
    let params = new HttpParams();
    if (dateFrom) params = params.set('dateFrom', dateFrom);
    if (dateTo) params = params.set('dateTo', dateTo);
    return this.http.get<any[]>(`${this.apiUrl}/sales/search`, { params });
  }

  // === STOCK MOVEMENTS ===
  getStockMovements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stock-movements`);
  }

  getStockMovementById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stock-movements/${id}`);
  }

  getMovementsByType(type: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stock-movements/type/${type}`);
  }

  getMovementsBySource(source: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stock-movements/source/${source}`);
  }

  // === SUPPLIERS ===
  getSuppliers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/suppliers`);
  }

  // === CUSTOMERS ===
  getCustomers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/customers`);
  }

  // === INVOICES / BILLS ===
  getAllBills(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/bills`);
  }

  getBillById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/bills/${id}`);
  }

  createBill(bill: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bills`, bill);
  }

  // Method for creating invoices with comprehensive invoice data
  createInvoice(invoice: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bills/create`, invoice);
  }

  downloadInvoicePDF(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/bills/generate/${id}`, {
      responseType: 'blob'
    });
  }

  getInvoiceKPIs(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/bills/kpis`);
  }

  // Get all invoices (alias for getAllBills)
  getInvoices(): Observable<any[]> {
    return this.getAllBills();
  }
}
