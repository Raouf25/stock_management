import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AppSettings {
  company_name: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  currency: string;
  tax_rate: string;
  invoice_prefix: string;
  email_notifications_enabled: string;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly apiUrl = `${environment.apiUrl}/settings`;

  constructor(private http: HttpClient) {}

  getSettings(): Observable<AppSettings> {
    return this.http.get<AppSettings>(this.apiUrl);
  }

  updateSettings(settings: AppSettings): Observable<AppSettings> {
    return this.http.put<AppSettings>(this.apiUrl, settings);
  }
}
