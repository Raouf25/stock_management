import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// ── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'USER' | 'ADMIN';

export interface UserSummary {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  lastLogin: string | null;
}

export interface UserCreate {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

export interface UserUpdate {
  email: string;
  fullName: string;
  role: UserRole;
}

export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private readonly apiUrl = environment.apiUrl + '/users';

  constructor(private http: HttpClient) {}

  getUsers(
    page: number,
    size: number,
    search?: string
  ): Observable<PageResult<UserSummary>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<PageResult<UserSummary>>(this.apiUrl, { params });
  }

  getUser(id: number): Observable<UserSummary> {
    return this.http.get<UserSummary>(`${this.apiUrl}/${id}`);
  }

  createUser(dto: UserCreate): Observable<UserSummary> {
    return this.http.post<UserSummary>(this.apiUrl, dto);
  }

  updateUser(id: number, dto: UserUpdate): Observable<UserSummary> {
    return this.http.put<UserSummary>(`${this.apiUrl}/${id}`, dto);
  }

  toggleStatus(id: number): Observable<UserSummary> {
    return this.http.patch<UserSummary>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  resetPassword(id: number, newPassword: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/reset-password`, { newPassword });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
