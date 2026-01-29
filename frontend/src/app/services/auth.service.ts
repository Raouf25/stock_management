import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

// Types
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = this.getApiUrl() + '/auth';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_info';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private getApiUrl(): string {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    
    // En développement local (localhost ou 127.0.0.1)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8080/api';
    }
    
    // En Codespaces ou environnement de production
    // Le backend doit être accessible sur le même domaine
    // Pour Codespaces, on utilise le port 8080 proxié
    return `${protocol}//${hostname.replace('-4200.', '-8080.')}/api`;
  }

  // === Authentification ===

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, request).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, request).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // === Récupération de mot de passe ===

  forgotPassword(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/forgot-password`, { email });
  }

  validateResetToken(token: string): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.API_URL}/validate-reset-token?token=${token}`);
  }

  resetPassword(token: string, newPassword: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/reset-password`, { token, newPassword });
  }

  // === Getters ===

  get isAuthenticated(): boolean {
    return !!this.getToken();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // === Helpers privés ===

  private handleAuthResponse(response: AuthResponse): void {
    if (response.success && response.token && response.user) {
      localStorage.setItem(this.TOKEN_KEY, response.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
      this.currentUserSubject.next(response.user);
    }
  }

  private getStoredUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }
}
