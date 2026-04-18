import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InvoiceOutput, PaymentInvoiceInput } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = `${environment.apiUrl}/invoices`;

  constructor(private http: HttpClient) {}

  listByCard(cardId: string): Observable<InvoiceOutput[]> {
    return this.http.get<InvoiceOutput[]>(`${this.apiUrl}/card/${cardId}`);
  }

  getOpenInvoices(accountId: string): Observable<InvoiceOutput[]> {
    return this.http.get<InvoiceOutput[]>(`${this.apiUrl}/account/${accountId}/open`);
  }

  getInvoicesByStatus(accountId: string, status: string): Observable<InvoiceOutput[]> {
    return this.http.get<InvoiceOutput[]>(`${this.apiUrl}/account/${accountId}/status/${status}`);
  }

  getById(invoiceId: string): Observable<InvoiceOutput> {
    return this.http.get<InvoiceOutput>(`${this.apiUrl}/${invoiceId}`);
  }

  payInvoice(invoiceId: string, input: PaymentInvoiceInput): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${invoiceId}/pay`, input);
  }
}
