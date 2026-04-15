import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MonthlyTransactionSummaryOutput } from '../models/transaction.model';


@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8080/api/v1/transactions';

  constructor(private http: HttpClient) {}

  getMonthlySummary(accountId: string, referenceMonth: string): Observable<MonthlyTransactionSummaryOutput> {
    const params = new HttpParams()
      .set('accountId', accountId)
      .set('referenceMonth', referenceMonth);
    
    return this.http.get<MonthlyTransactionSummaryOutput>(`${this.apiUrl}/summary/monthly`, { 
      params: params
    });
  }
}
