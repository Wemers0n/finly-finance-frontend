import { Routes } from '@angular/router';
import { LoginComponent } from './screens/auth/login/login.component';
import { RegisterComponent } from './screens/auth/register/register.component';
import { AccountCreationComponent } from './screens/account/account-creation/account-creation.component';
import { AccountSelectionComponent } from './screens/account/account-selection/account-selection.component';
import { DashboardComponent } from './screens/dashboard/dashboard.component';
import { CategoryComponent } from './screens/category/category.component';
import { TransactionComponent } from './screens/transaction/transaction.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'account-setup', component: AccountCreationComponent },
  { path: 'account-selection', component: AccountSelectionComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'categories', component: CategoryComponent },
  { path: 'transactions', component: TransactionComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
