import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MonthlyTransactionSummaryOutput } from '../models/transaction.model';


@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/transactions`;

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
