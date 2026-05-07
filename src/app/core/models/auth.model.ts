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

export interface AuthenticationResponse {
  token: string;
  refreshToken: string;
}

export interface ForgotPasswordInput {
  email: string;
  newPassword: string;
  confirmPassword: string;
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
  monthlyBalance: number;
}
