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
      this.loadUserData();
      this.loadDashboardData(selectedAccountId);
      this.loadCards(selectedAccountId);
      this.loadInvoices(selectedAccountId);
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

  loadDashboardData(accountId: string): void {
    const today = new Date();
    const referenceMonth = today.toISOString().split('T')[0];

    this.dashboardService.getMonthlySummary(accountId, referenceMonth).subscribe({
      next: (data: MonthlyTransactionSummaryOutput) => {
        this.summary.income = data.totalCredits;
        this.summary.expenses = data.totalDebits;
        this.summary.balance = data.monthlyBalance;
        this.recentTransactions = data.transactions.slice(0, 6);
        this.loadCategoryChart(accountId);
      },
      error: (err) => {
        this.error = 'Erro ao carregar dados do dashboard.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    this.accountService.listAccounts().subscribe({
      next: (accounts) => {
        const selectedAccount = accounts.find(acc => acc.id === accountId);
        this.accountsBalance = selectedAccount?.currentBalance || 0;
        this.cdr.detectChanges();
      },
      error: () => {
        this.accountsBalance = 0;
        this.cdr.detectChanges();
      }
    });
  }

  loadCards(accountId: string): void {
    this.cardService.listByAccount(accountId).subscribe({
      next: (cards: CreditCardOutput[]) => {
        this.cards = cards;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cards = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadInvoices(accountId: string): void {
    this.invoiceService.getInvoicesByStatus(accountId, this.selectedInvoiceStatus).subscribe({
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

  changeInvoiceStatus(status: EInvoiceStatus): void {
    if (this.selectedInvoiceStatus === status) return;
    this.selectedInvoiceStatus = status;
    const selectedAccountId = this.accountService.getSelectedAccount();
    if (selectedAccountId) {
      this.loadInvoices(selectedAccountId);
    }
  }

  getCardName(cardId: string): string {
    return this.cards.find(c => c.id === cardId)?.cardName || 'Cartão';
  }

  loadCategoryChart(accountId: string): void {
    this.categoryService.getCategories(accountId).subscribe({
      next: (data: CategorySummaryOutput) => {
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

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar resumo de categorias', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
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
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  changeAccount(): void {
    this.router.navigate(['/account-selection']);
  }
}