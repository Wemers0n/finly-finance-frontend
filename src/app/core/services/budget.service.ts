import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BudgetInput {
  accountId: string;
  categoryName: string;
  amountLimit: number;
  referenceMonth: string; // ISO date string YYYY-MM-DD
  alertPercentage: number;
  active: boolean;
}

export interface BudgetItem {
  budgetId: string;
  categoryId: string;
  categoryName: string;
  plannedAmount: number;
  currentSpent: number;
  remainingAmount: number;
  usagePercentage: number;
  alertPercentage: number;
  alertTriggered: boolean;
  exceeded: boolean;
}

export interface BudgetMonitoringOutput {
  accountId: string;
  referenceMonth: string;
  totalPlanned: number;
  totalCurrentSpent: number;
  totalRemaining: number;
  budgets: BudgetItem[];
}

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private apiUrl = `${environment.apiUrl}/budgets`;

  constructor(private http: HttpClient) {}

  createBudget(input: BudgetInput): Observable<void> {
    return this.http.post<void>(this.apiUrl, input);
  }

  updateBudget(budgetId: string, input: BudgetInput): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${budgetId}`, input);
  }
}
