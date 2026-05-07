import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-recover-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './recover-email.component.html',
  styleUrl: './recover-email.component.scss'
})
export class RecoverEmailComponent {
  emailForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onVerifyEmail(): void {
    if (this.emailForm.valid) {
      this.loading = true;
      this.error = null;
      const email = this.emailForm.value.email;
      this.cdr.detectChanges();

      this.authService.verifyEmail(email).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/reset-password'], { queryParams: { email } });
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.loading = false;
          console.error('Error verifying email:', err);
          
          if (err.status === 400 || err.status === 404) {
            this.error = 'E-mail não encontrado em nossa base de dados.';
          } else if (err.status === 403) {
            this.error = 'Acesso negado pelo servidor. Tente novamente mais tarde.';
          } else {
            this.error = 'Ocorreu um erro ao validar o e-mail. Tente novamente.';
          }
          this.cdr.detectChanges();
        }
      });
    }
  }
}
