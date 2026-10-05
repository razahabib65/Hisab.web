import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterNavComponent } from '../../shared/components/footer-nav/footer-nav.component';
import { CustomerService } from '../../core/services/customer.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterNavComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  private readonly customerService = inject(CustomerService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public readonly currentAuth = this.authService.currentAuth;
  public readonly netBalance = this.customerService.totalReceivable;
  public readonly totalUdhaar = this.customerService.totalUdhaar;
  public readonly totalReceived = this.customerService.totalReceived;
  public readonly customerCount = computed(() => this.customerService.customers().length);
  public readonly recentActivities = this.customerService.transactions;

  public navigateToAddUdhaar(): void {
    this.router.navigateByUrl('/customers');
  }

  public navigateToReceivePayment(): void {
    this.router.navigateByUrl('/customers');
  }

  public navigateToAddCustomer(): void {
    this.router.navigateByUrl('/customers/add');
  }

  public navigateToCustomers(): void {
    this.router.navigateByUrl('/customers');
  }

  public openCustomerDetail(customerId: string): void {
    this.router.navigate(['/customers', customerId]);
  }
}
