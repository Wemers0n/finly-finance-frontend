import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AccountService } from '../../../core/services/account.service';
import { EAccountType } from '../../../core/models/auth.model';

@Component({
  selector: 'app-account-creation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './account-creation.component.html',
  styleUrl: './account-creation.component.scss'
})
export class AccountCreationComponent {
  accountForm: FormGroup;
  error: string | null = null;
  loading = false;
  accountTypes = Object.values(EAccountType);

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private router: Router
  ) {
    this.accountForm = this.fb.group({
      accountName: ['', [Validators.required, Validators.maxLength(100)]],
      accountType: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.accountForm.valid) {
      this.loading = true;
      this.error = null;
      this.accountService.createAccount(this.accountForm.value).subscribe({
        next: () => {
          this.router.navigate(['/account-selection']);
        },
        error: (err) => {
          this.error = 'Ocorreu um erro ao criar sua conta bancária. Tente novamente.';
          this.loading = false;
        }
      });
    }
  }

  getAccountTypeLabel(type: string): string {
    switch (type) {
      case EAccountType.CURRENT: return 'Conta Corrente';
      case EAccountType.SAVINGS: return 'Conta Poupança';
      case EAccountType.INVESTMENT: return 'Conta Investimento';
      default: return type;
    }
  }
}
