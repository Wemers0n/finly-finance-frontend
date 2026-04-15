import { TransactionOutput } from './transaction.model';

export enum EInvoiceStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE'
}

export interface InvoiceOutput {
  id: string;
  cardId: string;
  dueDate: string;
  closingDate: string;
  referenceMonth: string;
  totalAmount: number;
  amountPaid: number;
  remainingAmount: number;
  status: EInvoiceStatus;
  transactions: TransactionOutput[];
}

export interface PaymentInvoiceInput {
  bankAccountId: string;
}
