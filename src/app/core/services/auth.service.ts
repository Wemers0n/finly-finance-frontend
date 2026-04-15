import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginInput, ResponseOutput, UserInput } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/v1/auth';

  constructor(private http: HttpClient) {}

  login(credentials: LoginInput): Observable<ResponseOutput> {
    return this.http.post<ResponseOutput>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.saveTokens(response);
      })
    );
  }

  register(userData: UserInput): Observable<ResponseOutput> {
    return this.http.post<ResponseOutput>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => {
        this.saveTokens(response);
      })
    );
  }

  refreshToken(): Observable<ResponseOutput> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<ResponseOutput>(`${this.apiUrl}/refresh?refreshToken=${refreshToken}`, {}).pipe(
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

  private saveTokens(response: ResponseOutput): void {
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
