import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginInput, AuthenticationResponse, UserInput, ForgotPasswordInput } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(credentials: LoginInput): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.saveTokens(response);
      })
    );
  }

  register(userData: UserInput): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => {
        this.saveTokens(response);
      })
    );
  }

  forgotPassword(data: ForgotPasswordInput): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/forgot-password`, data);
  }

  verifyEmail(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/forgot-password/verify-email`, { email });
  }

  refreshToken(): Observable<AuthenticationResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<AuthenticationResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap(response => {
        this.saveTokens(response);
      })
    );
  }

  logout(): void {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.post(`${this.apiUrl}/logout`, {}, { headers }).subscribe();

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('selectedAccountId');
    }
  }

  private saveTokens(response: AuthenticationResponse): void {
    if (typeof localStorage !== 'undefined') {
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      localStorage.removeItem('selectedAccountId');
    }
  }

  getToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
