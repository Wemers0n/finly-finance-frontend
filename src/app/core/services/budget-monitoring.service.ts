import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BudgetItem, BudgetMonitoringOutput } from './budget.service';

@Injectable({
  providedIn: 'root'
})
export class BudgetMonitoringService {
  private apiUrl = `${environment.apiUrl}/budgets/monitoring`;

  constructor(private http: HttpClient) {}

  getAccountMonitoring(accountId: string, referenceMonth: string): Observable<BudgetMonitoringOutput> {
    const params = new HttpParams()
      .set('accountId', accountId)
      .set('referenceMonth', referenceMonth);
    
    return this.http.get<BudgetMonitoringOutput>(this.apiUrl, { params });
  }

  getCategoryMonitoring(accountId: string, categoryName: string, referenceMonth: string): Observable<BudgetItem> {
    const params = new HttpParams()
      .set('accountId', accountId)
      .set('categoryName', categoryName)
      .set('referenceMonth', referenceMonth);
    
    return this.http.get<BudgetItem>(`${this.apiUrl}/category`, { params });
  }
}
