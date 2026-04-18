import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreditCardInput, CreditCardOutput } from '../models/card.model';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private apiUrl = `${environment.apiUrl}/cards`;

  constructor(private http: HttpClient) {}

  listByAccount(accountId: string): Observable<CreditCardOutput[]> {
    return this.http.get<CreditCardOutput[]>(`${this.apiUrl}/account/${accountId}`);
  }

  createCard(input: CreditCardInput): Observable<void> {
    return this.http.post<void>(this.apiUrl, input);
  }
}
