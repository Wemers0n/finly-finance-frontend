export enum EBrandCard {
  ELO = 'ELO',
  MASTERCARD = 'MASTERCARD',
  VISA = 'VISA'
}

export interface CreditCardOutput {
  id: string;
  cardName: string;
  brand: EBrandCard;
  cardLimit: number;
  usedLimit: number;
  closingDay: number;
  dueDay: number;
}

export interface CreditCardInput {
  bankAccountId: string;
  cardName: string;
  brand: EBrandCard;
  cardLimit: number;
  closingDay: number;
  dueDay: number;
}
