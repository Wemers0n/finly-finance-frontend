import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { AccountService } from '../../core/services/account.service';
import { UserService, UserOutput } from '../../core/services/user.service';
import { CategoryService, CategorySummaryOutput } from '../../core/services/category.service';
import { TransactionService } from '../../core/services/transaction.service';
import { TransactionItem, EBalanceOperation, EBankTransactionType, BankTransactionInput } from '../../core/models/transaction.model';

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
  
  showModal = false;
  isCreating = false;

  // Form Data
  newTransaction: Partial<BankTransactionInput> = {
    categoryName: '',
    value: 0,
    operation: EBalanceOperation.DEBIT,
    transactionType: EBankTransactionType.PIX,
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
    this.newTransaction = {
      accountId: this.accountService.getSelectedAccount() || '',
      categoryName: this.categories[0] || '',
      value: 0,
      operation: EBalanceOperation.DEBIT,
      transactionType: EBankTransactionType.PIX,
      description: ''
    };
  }

  closeModal(): void {
    this.showModal = false;
    this.cdr.detectChanges();
  }

  createTransaction(): void {
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
