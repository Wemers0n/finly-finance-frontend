import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
        if (response.token && typeof localStorage !== 'undefined') {
          localStorage.setItem('token', response.token.toString());
        }
      })
    );
  }

  register(userData: UserInput): Observable<ResponseOutput> {
    return this.http.post<ResponseOutput>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => {
        if (response.token && typeof localStorage !== 'undefined') {
          localStorage.setItem('token', response.token.toString());
        }
      })
    );
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
