import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BankAccountInput, BankAccountOutput } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = 'http://localhost:8080/api/v1/accounts';

  constructor(private http: HttpClient) {}

  createAccount(accountData: BankAccountInput): Observable<void> {
    return this.http.post<void>(this.apiUrl, accountData);
  }

  listAccounts(): Observable<BankAccountOutput[]> {
    return this.http.get<BankAccountOutput[]>(this.apiUrl);
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
