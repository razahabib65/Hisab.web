import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'customers',
    loadComponent: () =>
      import('./pages/customers/customers-list/customers-list.component').then(
        (m) => m.CustomersListComponent
      ),
  },
  {
    path: 'customers/add',
    loadComponent: () =>
      import('./pages/customers/add-customer/add-customer.component').then(
        (m) => m.AddCustomerComponent
      ),
  },
  {
    path: 'customers/:id',
    loadComponent: () =>
      import('./pages/customers/customer-detail/customer-detail.component').then(
        (m) => m.CustomerDetailComponent
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings.component').then((m) => m.SettingsComponent),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
