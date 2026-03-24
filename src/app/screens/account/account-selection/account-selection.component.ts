import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AccountService } from '../../../core/services/account.service';
import { BankAccountOutput, EAccountType } from '../../../core/models/auth.model';

@Component({
  selector: 'app-account-selection',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './account-selection.component.html',
  styleUrl: './account-selection.component.scss'
})
export class AccountSelectionComponent implements OnInit {
  accounts: BankAccountOutput[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private accountService: AccountService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadAccounts();
    } else {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  loadAccounts(): void {
    this.loading = true;
    this.accountService.listAccounts().subscribe({
      next: (data) => {
        this.accounts = data;
        this.loading = false;
        this.cdr.detectChanges();
        if (this.accounts.length === 0) {
          this.router.navigate(['/account-setup']);
        }
      },
      error: (err) => {
        this.error = 'Erro ao carregar contas. Tente novamente.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  selectAccount(accountId: string): void {
    this.accountService.setSelectedAccount(accountId);
    this.router.navigate(['/dashboard']);
  }

  getAccountTypeLabel(type: EAccountType): string {
    switch (type) {
      case EAccountType.CURRENT: return 'Conta Corrente';
      case EAccountType.SAVINGS: return 'Conta Poupança';
      case EAccountType.INVESTMENT: return 'Conta Investimento';
      default: return type;
    }
  }
}
