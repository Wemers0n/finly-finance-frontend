import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserOutput {
  userId: string;
  firstname: string;
  lastname: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/v1/users';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    let token = null;
    if (typeof localStorage !== 'undefined') {
      token = localStorage.getItem('token');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getCurrentUser(): Observable<UserOutput> {
    return this.http.get<UserOutput>(`${this.apiUrl}/me`, { headers: this.getHeaders() });
  }
}
