import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    canActivate: [noAuthGuard],
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [noAuthGuard],
    loadComponent: () =>
      import('./pages/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'customers',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/customers/customers-list/customers-list.component').then(
        (m) => m.CustomersListComponent
      ),
  },
  {
    path: 'customers/add',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/customers/add-customer/add-customer.component').then(
        (m) => m.AddCustomerComponent
      ),

  },
  {
    path: 'customers/edit/:id',
    loadComponent: () =>
      import('./pages/customers/add-customer/add-customer.component')
        .then(m => m.AddCustomerComponent),
  },
  {
    path: 'customers/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/customers/customer-detail/customer-detail.component').then(
        (m) => m.CustomerDetailComponent
      ),
  },

  {
    path: 'reports/transactions',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/reports/transaction-report/transaction-report.component').then((m) => m.TransactionReportComponent),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/settings/settings.component').then((m) => m.SettingsComponent),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
