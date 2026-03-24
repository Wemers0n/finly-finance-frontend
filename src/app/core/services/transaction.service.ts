import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BankTransactionInput, MonthlyTransactionSummaryOutput, TransactionOutput } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = 'http://localhost:8080/api/v1/transactions';

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

  getMonthlySummary(accountId: string, referenceMonth: string): Observable<MonthlyTransactionSummaryOutput> {
    const params = new HttpParams()
      .set('accountId', accountId)
      .set('referenceMonth', referenceMonth);
    
    return this.http.get<MonthlyTransactionSummaryOutput>(`${this.apiUrl}/summary/monthly`, { 
      headers: this.getHeaders(),
      params: params
    });
  }

  getAllByAccount(accountId: string): Observable<TransactionOutput[]> {
    return this.http.get<TransactionOutput[]>(`${this.apiUrl}/account/${accountId}`, { 
      headers: this.getHeaders() 
    });
  }

  createBankTransaction(input: BankTransactionInput): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/bank`, input, { 
      headers: this.getHeaders() 
    });
  }
}
