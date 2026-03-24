export enum EBalanceOperation {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT'
}

export enum EBankTransactionType {
  PIX = 'PIX',
  TRANSFER = 'TRANSFER',
  DEPOSIT = 'DEPOSIT'
}

export interface TransactionItem {
  transactionId: string;
  date: string;
  value: number;
  description: string;
  category: string;
  type: string;
  origin: string;
}

export interface MonthlyTransactionSummaryOutput {
  accountId: string;
  referenceMonth: string;
  totalDebits: number;
  totalCredits: number;
  totalTransactionsBank: number;
  totalTransactionsCard: number;
  monthlyBalance: number;
  transactions: TransactionItem[];
}

export interface BankTransactionInput {
  accountId: string;
  categoryName: string;
  value: number;
  operation: EBalanceOperation;
  transactionType: EBankTransactionType;
  description: string;
}

export interface TransactionOutput {
  id: string;
  date: string;
  value: number;
  description: string;
  category: string;
  type: string;
  origin: string;
  operation: string;
}
