import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BankAccountInput, BankAccountOutput } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = 'http://localhost:8080/api/v1/accounts';

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

  createAccount(accountData: BankAccountInput): Observable<void> {
    return this.http.post<void>(this.apiUrl, accountData, { headers: this.getHeaders() });
  }

  listAccounts(): Observable<BankAccountOutput[]> {
    return this.http.get<BankAccountOutput[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  setSelectedAccount(accountId: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('selectedAccountId', accountId);
    }
  }

  getSelectedAccount(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('selectedAccountId');
    }
    return null;
  }
}
