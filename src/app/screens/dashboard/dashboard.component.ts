import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { AuthService } from '../../core/services/auth.service';
import { AccountService } from '../../core/services/account.service';
import { UserService, UserOutput } from '../../core/services/user.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { CategoryService, CategorySummaryOutput } from '../../core/services/category.service';
import { CardService } from '../../core/services/card.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { TransactionItem, MonthlyTransactionSummaryOutput } from '../../core/models/transaction.model';
import { CreditCardOutput } from '../../core/models/card.model';
import { InvoiceOutput, EInvoiceStatus } from '../../core/models/invoice.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  providers: [CurrencyPipe, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  userName: string = 'Usuário';
  currentDate: Date = new Date();
  isSidebarCollapsed = false;
  loading = true;
  error: string | null = null;

  accountsBalance: number = 0;
  recentTransactions: TransactionItem[] = [];
  summary = {
    balance: 0,
    income: 0,
    expenses: 0
  };

  cards: CreditCardOutput[] = [];
  openInvoices: InvoiceOutput[] = [];
  selectedInvoiceStatus: EInvoiceStatus = EInvoiceStatus.OPEN;
  invoiceStatusOptions = EInvoiceStatus;

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: {
            size: 11,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw as number;
            const total = (context.chart.data.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${percentage}%)`;
          }
        }
      }
    }
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#38bdf8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
        '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#06b6d4'
      ],
      hoverOffset: 4,
      borderWidth: 0
    }]
  };
  public pieChartType: ChartType = 'pie';

  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private userService: UserService,
    private dashboardService: DashboardService,
    private categoryService: CategoryService,
    private cardService: CardService,
    private invoiceService: InvoiceService,
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
      this.loadAllData(selectedAccountId);
    } else {
      this.loading = false;
    }
  }

  loadAllData(accountId: string): void {
    this.loading = true;
    const today = new Date();
    const referenceMonth = today.toISOString().split('T')[0];

    forkJoin({
      user: this.userService.getCurrentUser().pipe(catchError(() => of(null))),
      summary: this.dashboardService.getMonthlySummary(accountId, referenceMonth).pipe(catchError(() => of(null))),
      accounts: this.accountService.listAccounts().pipe(catchError(() => of([]))),
      cards: this.cardService.listByAccount(accountId).pipe(catchError(() => of([]))),
      invoices: this.invoiceService.getInvoicesByStatus(accountId, this.selectedInvoiceStatus).pipe(catchError(() => of([]))),
      categories: this.categoryService.getCategories(accountId).pipe(catchError(() => of(null)))
    }).subscribe({
      next: (result) => {
        // Process User
        if (result.user) {
          this.userName = result.user.firstname;
        }

        // Process Summary
        if (result.summary) {
          this.summary.income = result.summary.totalCredits;
          this.summary.expenses = result.summary.totalDebits;
          this.summary.balance = result.summary.monthlyBalance;
          this.recentTransactions = result.summary.transactions.slice(0, 6);
        }

        // Process Accounts Balance
        if (result.accounts) {
          const selectedAccount = result.accounts.find(acc => acc.id === accountId);
          this.accountsBalance = selectedAccount?.currentBalance || 0;
        }

        // Process Cards
        this.cards = result.cards;

        // Process Invoices
        this.openInvoices = result.invoices;

        // Process Categories (Chart)
        if (result.categories) {
          this.updateCategoryChart(result.categories);
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading dashboard data', err);
        this.error = 'Erro ao carregar dados do dashboard.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateCategoryChart(data: CategorySummaryOutput): void {
    const expenseCategories = data.categories
      .filter(c => c.name !== 'Depósitos' && c.totalSpent > 0)
      .sort((a, b) => b.totalSpent - a.totalSpent);

    if (expenseCategories.length > 0) {
      this.pieChartData = {
        labels: expenseCategories.map(c => c.name),
        datasets: [{
          ...this.pieChartData.datasets[0],
          data: expenseCategories.map(c => c.totalSpent),
          backgroundColor: [
            '#38bdf8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
            '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#06b6d4'
          ]
        }]
      };
    } else {
      this.pieChartData = {
        labels: ['Sem gastos'],
        datasets: [{
          ...this.pieChartData.datasets[0],
          data: [1],
          backgroundColor: ['#e5e7eb']
        }]
      };
    }
  }

  changeInvoiceStatus(status: EInvoiceStatus): void {
    if (this.selectedInvoiceStatus === status) return;
    this.selectedInvoiceStatus = status;
    const selectedAccountId = this.accountService.getSelectedAccount();
    if (selectedAccountId) {
      this.invoiceService.getInvoicesByStatus(selectedAccountId, this.selectedInvoiceStatus).subscribe({
        next: (invoices: InvoiceOutput[]) => {
          this.openInvoices = invoices;
          this.cdr.detectChanges();
        },
        error: () => {
          this.openInvoices = [];
          this.cdr.detectChanges();
        }
      });
    }
  }

  getCardName(cardId: string): string {
    return this.cards.find(c => c.id === cardId)?.cardName || 'Cartão';
  }

  getTransactionIcon(type: string): string {
    switch (type.toUpperCase()) {
      case 'DEPOSIT': return 'bi-cash-coin';
      case 'WITHDRAW': return 'bi-arrow-up-right-circle';
      case 'TRANSFER': return 'bi-arrow-left-right';
      case 'PAYMENT': return 'bi-credit-card';
      case 'PIX': return 'bi-lightning-fill';
      case 'CREDIT_CARD': return 'bi-credit-card-2-front-fill';
      default: return 'bi-wallet2';
    }
  }

  getTotalSpentOnCards(): number {
    return this.cards.reduce((sum, card) => sum + card.usedLimit, 0);
  }

  getTotalAvailableLimit(): number {
    return this.cards.reduce((sum, card) => sum + (card.cardLimit - card.usedLimit), 0);
  }

  getTotalLimit(): number {
    return this.cards.reduce((sum, card) => sum + card.cardLimit, 0);
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  changeAccount(): void {
    this.router.navigate(['/account-selection']);
  }
}