import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { AccountService } from '../../core/services/account.service';
import { UserService, UserOutput } from '../../core/services/user.service';
import { CardService } from '../../core/services/card.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { CreditCardOutput } from '../../core/models/card.model';
import { InvoiceOutput, EInvoiceStatus, PaymentInvoiceInput } from '../../core/models/invoice.model';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  providers: [CurrencyPipe, DatePipe],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.scss'
})
export class InvoiceComponent implements OnInit {
  userName: string = 'Usuário';
  isSidebarCollapsed = false;
  loading = true;
  error: string | null = null;
  
  card: CreditCardOutput | null = null;
  invoices: InvoiceOutput[] = [];
  selectedInvoice: InvoiceOutput | null = null;
  
  showDetailModal = false;
  showPaymentModal = false;
  isPaying = false;

  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private userService: UserService,
    private cardService: CardService,
    private invoiceService: InvoiceService,
    private router: Router,
    private route: ActivatedRoute,
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

      this.route.params.subscribe(params => {
        const cardId = params['cardId'];
        if (cardId) {
          this.loadUserData();
          this.loadCardAndInvoices(selectedAccountId, cardId);
        } else {
          this.router.navigate(['/cards']);
        }
      });
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

  loadCardAndInvoices(accountId: string, cardId: string): void {
    this.loading = true;
    this.cardService.listByAccount(accountId).subscribe({
      next: (cards) => {
        this.card = cards.find(c => c.id === cardId) || null;
        if (this.card) {
          this.loadInvoices(cardId);
        } else {
          this.router.navigate(['/cards']);
        }
      },
      error: () => {
        this.error = 'Erro ao carregar cartão.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadInvoices(cardId: string): void {
    this.invoiceService.listByCard(cardId).subscribe({
      next: (data) => {
        this.invoices = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Erro ao carregar faturas.';
        this.loading = false;
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

  openDetail(invoice: InvoiceOutput): void {
    this.selectedInvoice = invoice;
    this.showDetailModal = true;
    this.cdr.detectChanges();
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.selectedInvoice = null;
    this.cdr.detectChanges();
  }

  openPayment(invoice: InvoiceOutput): void {
    this.selectedInvoice = invoice;
    this.showPaymentModal = true;
    this.cdr.detectChanges();
  }

  closePayment(): void {
    this.showPaymentModal = false;
    this.cdr.detectChanges();
  }

  payInvoice(): void {
    if (!this.selectedInvoice) return;

    const accountId = this.accountService.getSelectedAccount();
    if (!accountId) return;

    this.isPaying = true;
    const input: PaymentInvoiceInput = { bankAccountId: accountId };

    this.invoiceService.payInvoice(this.selectedInvoice.id, input).subscribe({
      next: () => {
        this.isPaying = false;
        this.closePayment();
        this.closeDetail();
        if (this.card) this.loadInvoices(this.card.id);
      },
      error: (err) => {
        this.isPaying = false;
        this.error = 'Erro ao realizar pagamento da fatura.';
        this.cdr.detectChanges();
        setTimeout(() => this.error = null, 3000);
      }
    });
  }

  getStatusLabel(status: EInvoiceStatus): string {
    switch (status) {
      case EInvoiceStatus.OPEN: return 'Aberta';
      case EInvoiceStatus.CLOSED: return 'Fechada';
      case EInvoiceStatus.PAID: return 'Paga';
      case EInvoiceStatus.OVERDUE: return 'Atrasada';
      default: return status;
    }
  }

  getStatusClass(status: EInvoiceStatus): string {
    return status.toLowerCase();
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
