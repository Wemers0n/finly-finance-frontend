import { Routes } from '@angular/router';
import { LoginComponent } from './screens/auth/login/login.component';
import { RegisterComponent } from './screens/auth/register/register.component';
import { RecoverEmailComponent } from './screens/auth/recover-email/recover-email.component';
import { ResetPasswordComponent } from './screens/auth/reset-password/reset-password.component';
import { AccountCreationComponent } from './screens/account/account-creation/account-creation.component';
import { AccountSelectionComponent } from './screens/account/account-selection/account-selection.component';
import { DashboardComponent } from './screens/dashboard/dashboard.component';
import { CategoryComponent } from './screens/category/category.component';
import { TransactionComponent } from './screens/transaction/transaction.component';
import { CardComponent } from './screens/card/card.component';
import { InvoiceComponent } from './screens/invoice/invoice.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'recover-email', component: RecoverEmailComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'account-setup', component: AccountCreationComponent },
  { path: 'account-selection', component: AccountSelectionComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'categories', component: CategoryComponent },
  { path: 'transactions', component: TransactionComponent },
  { path: 'cards', component: CardComponent },
  { path: 'cards/:cardId/invoices', component: InvoiceComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
