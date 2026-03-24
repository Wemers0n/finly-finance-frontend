import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AccountService } from '../../core/services/account.service';
import { UserService, UserOutput } from '../../core/services/user.service';
import { DashboardService, MonthlyTransactionSummaryOutput, TransactionItem } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
  
  recentTransactions: TransactionItem[] = [];
  summary = {
    balance: 0,
    income: 0,
    expenses: 0
  };

  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private userService: UserService,
    private dashboardService: DashboardService,
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

    // Carregar saldo total da conta
    this.accountService.listAccounts().subscribe({
      next: (accounts) => {
        const selectedAccount = accounts.find(acc => acc.id === accountId);
        if (selectedAccount) {
          this.summary.balance = selectedAccount.currentBalance;
          this.cdr.detectChanges();
        }
      }
    });

    this.dashboardService.getMonthlySummary(accountId, referenceMonth).subscribe({
      next: (data: MonthlyTransactionSummaryOutput) => {
        this.summary.income = data.totalCredits;
        this.summary.expenses = data.totalDebits;
        this.recentTransactions = data.transactions.slice(0, 5);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erro ao carregar dados do dashboard.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
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
