import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreditCardInput, CreditCardOutput } from '../models/card.model';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private apiUrl = 'http://localhost:8080/api/v1/cards';

  constructor(private http: HttpClient) {}

  listByAccount(accountId: string): Observable<CreditCardOutput[]> {
    return this.http.get<CreditCardOutput[]>(`${this.apiUrl}/account/${accountId}`);
  }

  createCard(input: CreditCardInput): Observable<void> {
    return this.http.post<void>(this.apiUrl, input);
  }
}
