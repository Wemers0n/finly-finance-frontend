import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { AccountService } from '../../core/services/account.service';
import { UserService, UserOutput } from '../../core/services/user.service';
import { CategoryService, CategorySummaryOutput } from '../../core/services/category.service';
import { TransactionService } from '../../core/services/transaction.service';
import { CardService } from '../../core/services/card.service';
import { TransactionItem, EBalanceOperation, EBankTransactionType, BankTransactionInput, CardTransactionInput } from '../../core/models/transaction.model';
import { CreditCardOutput } from '../../core/models/card.model';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  providers: [CurrencyPipe, DatePipe],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.scss'
})
export class TransactionComponent implements OnInit {
  userName: string = 'Usuário';
  currentDate: Date = new Date();
  isSidebarCollapsed = false;
  loading = true;
  error: string | null = null;
  
  transactions: TransactionItem[] = [];
  categories: string[] = [];
  creditCards: CreditCardOutput[] = [];
  
  showModal = false;
  isCreating = false;
  transactionOrigin: 'BANK' | 'CARD' = 'BANK';

  // Form Data
  newTransaction: Partial<BankTransactionInput> = {
    categoryName: '',
    value: 0,
    operation: EBalanceOperation.DEBIT,
    transactionType: EBankTransactionType.PIX,
    description: ''
  };

  newCardTransaction: Partial<CardTransactionInput> = {
    cardId: '',
    categoryName: '',
    value: 0,
    totalInstallments: 1,
    description: ''
  };

  operations = Object.values(EBalanceOperation);
  types = Object.values(EBankTransactionType);

  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private userService: UserService,
    private categoryService: CategoryService,
    private transactionService: TransactionService,
    private cardService: CardService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const selectedAccountId = this.accountService.getSelectedAccount();
      if (!selectedAccountId) {
        this.router.navigate(['/account-selection']);
        return;
      }
      this.loadUserData();
      this.loadTransactions(selectedAccountId);
      this.loadCategories(selectedAccountId);
      this.loadCreditCards(selectedAccountId);
    } else {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  loadUserData(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user: UserOutput) => {
        this.userName = user.firstname;
        this.cdr.detectChanges();
      },
      error: () => {
        this.userName = 'Usuário';
        this.cdr.detectChanges();
      }
    });
  }

  loadTransactions(accountId: string): void {
    const today = new Date();
    const referenceMonth = today.toISOString().split('T')[0];

    this.loading = true;
    this.transactionService.getMonthlySummary(accountId, referenceMonth).subscribe({
      next: (data) => {
        this.transactions = data.transactions;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erro ao carregar transações.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadCategories(accountId: string): void {
    this.categoryService.getCategories(accountId).subscribe({
      next: (data: CategorySummaryOutput) => {
        this.categories = data.categories.map(c => c.name);
        this.cdr.detectChanges();
      }
    });
  }

  loadCreditCards(accountId: string): void {
    this.cardService.listByAccount(accountId).subscribe({
      next: (cards) => {
        this.creditCards = cards;
        this.cdr.detectChanges();
      }
    });
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    this.cdr.detectChanges();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  changeAccount(): void {
    this.router.navigate(['/account-selection']);
  }

  openModal(): void {
    this.showModal = true;
    this.transactionOrigin = 'BANK';
    const accountId = this.accountService.getSelectedAccount() || '';
    
    this.newTransaction = {
      accountId: accountId,
      categoryName: this.categories[0] || '',
      value: 0,
      operation: EBalanceOperation.DEBIT,
      transactionType: EBankTransactionType.PIX,
      description: ''
    };

    this.newCardTransaction = {
      cardId: this.creditCards[0]?.id || '',
      categoryName: this.categories[0] || '',
      value: 0,
      totalInstallments: 1,
      description: ''
    };
  }

  closeModal(): void {
    this.showModal = false;
    this.cdr.detectChanges();
  }

  onOperationChange(): void {
    if (this.newTransaction.operation === EBalanceOperation.CREDIT) {
      this.newTransaction.categoryName = 'Depósitos';
    } else if (this.newTransaction.categoryName === 'Depósitos') {
      this.newTransaction.categoryName = this.categories.find(c => c !== 'Depósitos') || '';
    }
  }

  createTransaction(): void {
    if (this.transactionOrigin === 'BANK') {
      this.createBankTransaction();
    } else {
      this.createCardTransaction();
    }
  }

  private createBankTransaction(): void {
    if (!this.newTransaction.categoryName || !this.newTransaction.value) return;

    this.isCreating = true;
    this.transactionService.createBankTransaction(this.newTransaction as BankTransactionInput).subscribe({
      next: () => {
        this.isCreating = false;
        this.closeModal();
        const accountId = this.accountService.getSelectedAccount();
        if (accountId) this.loadTransactions(accountId);
      },
      error: (err) => {
        this.isCreating = false;
        this.error = 'Erro ao realizar transação.';
        this.cdr.detectChanges();
        setTimeout(() => this.error = null, 3000);
      }
    });
  }

  private createCardTransaction(): void {
    if (!this.newCardTransaction.cardId || !this.newCardTransaction.categoryName || !this.newCardTransaction.value) return;

    this.isCreating = true;
    this.transactionService.createCardTransaction(this.newCardTransaction as CardTransactionInput).subscribe({
      next: () => {
        this.isCreating = false;
        this.closeModal();
        const accountId = this.accountService.getSelectedAccount();
        if (accountId) this.loadTransactions(accountId);
      },
      error: (err) => {
        this.isCreating = false;
        this.error = 'Erro ao realizar transação no cartão.';
        this.cdr.detectChanges();
        setTimeout(() => this.error = null, 3000);
      }
    });
  }

  getTransactionIcon(type: string): string {
    switch (type) {
      case 'PIX': return 'bi-lightning-fill';
      case 'TRANSFER': return 'bi-arrow-left-right';
      case 'DEPOSIT': return 'bi-cash-coin';
      case 'CREDIT_CARD': return 'bi-credit-card-2-front-fill';
      default: return 'bi-wallet2';
    }
  }
}
