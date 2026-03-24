import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TransactionItem {
  transactionId: string;
  date: string;
  value: number;
  category: string;
  type: string;
  origin: string;
}

export interface MonthlyTransactionSummaryOutput {
  accountId: string;
  referenceMonth: string;
  totalDebits: number;
  totalCredits: number;
  totalTransactionsBank: number;
  totalTransactionsCard: number;
  monthlyBalance: number;
  transactions: TransactionItem[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
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
}
