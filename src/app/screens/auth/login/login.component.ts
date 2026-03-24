import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AccountService } from '../../../core/services/account.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private accountService: AccountService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = null;
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.accountService.listAccounts().subscribe({
            next: (accounts) => {
              if (accounts && accounts.length > 0) {
                this.router.navigate(['/account-selection']);
              } else {
                this.router.navigate(['/account-setup']);
              }
            },
            error: () => {
              // Se houver erro ao listar, vamos para o setup por segurança
              this.router.navigate(['/account-setup']);
            }
          });
        },
        error: (err) => {
          this.error = 'Email ou senha inválidos';
          this.loading = false;
        }
      });
    }
  }
}
