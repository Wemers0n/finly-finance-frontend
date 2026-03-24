export interface LoginInput {
  email: string;
  password: string;
}

export interface UserInput {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export interface ResponseOutput {
  token: string;
}

export enum EAccountType {
  CURRENT = 'CURRENT',
  SAVINGS = 'SAVINGS',
  INVESTMENT = 'INVESTMENT'
}

export interface BankAccountInput {
  accountType: EAccountType;
  accountName: string;
}

export interface BankAccountOutput {
  id: string;
  accountName: string;
  accountType: EAccountType;
  currentBalance: number;
}
