import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreditCardInput, CreditCardOutput } from '../models/card.model';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private apiUrl = 'http://localhost:8080/api/v1/cards';

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

  listByAccount(accountId: string): Observable<CreditCardOutput[]> {
    return this.http.get<CreditCardOutput[]>(`${this.apiUrl}/account/${accountId}`, {
      headers: this.getHeaders()
    });
  }

  createCard(input: CreditCardInput): Observable<void> {
    return this.http.post<void>(this.apiUrl, input, {
      headers: this.getHeaders()
    });
  }
}
