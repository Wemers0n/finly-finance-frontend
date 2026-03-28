import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CategoryItem {
  id: string;
  name: string;
  totalSpent: number;
  totalReceived: number;
}

export interface CategorySummaryOutput {
  firstname: string;
  totalCategories: number;
  categories: CategoryItem[];
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:8080/api/v1/categories';

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

  getCategories(accountId: string): Observable<CategorySummaryOutput> {
    return this.http.get<CategorySummaryOutput>(`${this.apiUrl}/${accountId}/summary`, {
      headers: this.getHeaders()
    });
  }

  createCategory(accountId: string, name: string): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/${accountId}`, { name }, {
      headers: this.getHeaders(),
      responseType: 'text' as 'json'
    });
  }
}
