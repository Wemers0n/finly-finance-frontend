import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { AccountService } from '../../core/services/account.service';
import { UserService, UserOutput } from '../../core/services/user.service';
import { CardService } from '../../core/services/card.service';
import { CreditCardOutput, CreditCardInput, EBrandCard } from '../../core/models/card.model';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  providers: [CurrencyPipe],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent implements OnInit {
  userName: string = 'Usuário';
  isSidebarCollapsed = false;
  loading = true;
  error: string | null = null;
  
  cards: CreditCardOutput[] = [];
  
  showModal = false;
  showDetailModal = false;
  selectedCard: CreditCardOutput | null = null;
  isCreating = false;

  // Form Data
  newCard: Partial<CreditCardInput> = {
    cardName: '',
    brand: EBrandCard.MASTERCARD,
    cardLimit: 0,
    closingDay: 1,
    dueDay: 10
  };

  brands = Object.values(EBrandCard);

  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private userService: UserService,
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
      this.loadCards(selectedAccountId);
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

  loadCards(accountId: string): void {
    this.loading = true;
    this.cardService.listByAccount(accountId).subscribe({
      next: (data) => {
        this.cards = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erro ao carregar cartões.';
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

  openModal(): void {
    this.showModal = true;
    const accountId = this.accountService.getSelectedAccount();
    this.newCard = {
      bankAccountId: accountId || '',
      cardName: '',
      brand: EBrandCard.MASTERCARD,
      cardLimit: 0,
      closingDay: 1,
      dueDay: 10
    };
  }

  closeModal(): void {
    this.showModal = false;
    this.cdr.detectChanges();
  }

  openDetailModal(card: CreditCardOutput): void {
    this.selectedCard = card;
    this.showDetailModal = true;
    this.cdr.detectChanges();
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedCard = null;
    this.cdr.detectChanges();
  }

  createCard(): void {
    if (!this.newCard.cardName || !this.newCard.cardLimit) return;

    this.isCreating = true;
    this.cardService.createCard(this.newCard as CreditCardInput).subscribe({
      next: () => {
        this.isCreating = false;
        this.closeModal();
        const accountId = this.accountService.getSelectedAccount();
        if (accountId) this.loadCards(accountId);
      },
      error: (err) => {
        this.isCreating = false;
        this.error = 'Erro ao cadastrar cartão.';
        this.cdr.detectChanges();
        setTimeout(() => this.error = null, 3000);
      }
    });
  }

  getBrandIcon(brand: string): string {
    switch (brand) {
      case 'MASTERCARD': return 'bi-credit-card-2-front-fill';
      case 'VISA': return 'bi-credit-card-2-back-fill';
      case 'ELO': return 'bi-credit-card-fill';
      default: return 'bi-credit-card';
    }
  }

  getAvailableLimit(card: CreditCardOutput): number {
    return card.cardLimit - card.usedLimit;
  }

  getLimitPercentage(card: CreditCardOutput): number {
    if (card.cardLimit === 0) return 0;
    return Math.round((card.usedLimit / card.cardLimit) * 100);
  }
}
