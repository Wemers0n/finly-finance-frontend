import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { AccountService } from '../../core/services/account.service';
import { UserService, UserOutput } from '../../core/services/user.service';
import { CategoryService, CategoryItem, CategorySummaryOutput } from '../../core/services/category.service';
import { TransactionService } from '../../core/services/transaction.service';
import { TransactionItem } from '../../core/models/transaction.model';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  providers: [CurrencyPipe, DatePipe],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent implements OnInit {
  userName: string = 'Usuário';
  currentDate: Date = new Date();
  isSidebarCollapsed = false;
  loading = true;
  error: string | null = null;
  
  categories: CategoryItem[] = [];
  totalCategories = 0;
  transactions: TransactionItem[] = [];
  
  showModal = false;
  newCategoryName = '';
  isCreating = false;

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
      this.loadCategories(selectedAccountId);
      this.loadTransactions(selectedAccountId);
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

  loadCategories(accountId: string): void {
    this.loading = true;
    this.categoryService.getCategories(accountId).subscribe({
      next: (data: CategorySummaryOutput) => {
        this.categories = data.categories;
        this.totalCategories = data.totalCategories;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erro ao carregar categorias.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadTransactions(accountId: string): void {
    const today = new Date();
    const referenceMonth = today.toISOString().split('T')[0];

    this.transactionService.getMonthlySummary(accountId, referenceMonth).subscribe({
      next: (data) => {
        this.transactions = data.transactions;
        this.cdr.detectChanges();
      }
    });
  }

  getTransactionsByCategory(categoryName: string): TransactionItem[] {
    return this.transactions.filter(t => t.category === categoryName);
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
    this.newCategoryName = '';
  }

  closeModal(): void {
    this.showModal = false;
    this.newCategoryName = '';
    this.cdr.detectChanges();
  }

  createCategory(): void {
    if (!this.newCategoryName.trim()) return;

    const accountId = this.accountService.getSelectedAccount();
    if (!accountId) return;

    this.isCreating = true;
    this.categoryService.createCategory(accountId, this.newCategoryName).subscribe({
      next: () => {
        this.isCreating = false;
        this.closeModal();
        this.loadCategories(accountId);
      },
      error: (err) => {
        this.isCreating = false;
        this.error = 'Erro ao criar categoria. Talvez ela já exista?';
        this.cdr.detectChanges();
        setTimeout(() => this.error = null, 3000);
      }
    });
  }
}
