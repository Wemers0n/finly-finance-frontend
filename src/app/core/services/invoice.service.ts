import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InvoiceOutput, PaymentInvoiceInput } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = 'http://localhost:8080/api/v1/invoices';

  constructor(private http: HttpClient) {}

  listByCard(cardId: string): Observable<InvoiceOutput[]> {
    return this.http.get<InvoiceOutput[]>(`${this.apiUrl}/card/${cardId}`);
  }

  getCurrentMonthInvoices(accountId: string): Observable<InvoiceOutput[]> {
    return this.http.get<InvoiceOutput[]>(`${this.apiUrl}/account/${accountId}/current-month`);
  }

  getById(invoiceId: string): Observable<InvoiceOutput> {
    return this.http.get<InvoiceOutput>(`${this.apiUrl}/${invoiceId}`);
  }

  payInvoice(invoiceId: string, input: PaymentInvoiceInput): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${invoiceId}/pay`, input);
  }
}
