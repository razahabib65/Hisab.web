
import {
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { Router, RouterLink } from '@angular/router';

import { HeaderComponent } from '../../shared/components/header/header.component';

import { FooterNavComponent } from '../../shared/components/footer-nav/footer-nav.component';

import {
  DashboardService,
  DashboardTransaction,
} from '../../core/services/dashboard.service';

import { AuthService } from '../../core/services/auth.service';


@Component({
  selector: 'app-dashboard',

  standalone: true,

  imports: [
    CommonModule,
    RouterLink,
    HeaderComponent,
    FooterNavComponent,
  ],

  templateUrl: './dashboard.component.html',

  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  private readonly dashboardService =
    inject(DashboardService);

  private readonly authService =
    inject(AuthService);

  private readonly router =
    inject(Router);


  // =========================
  // AUTH
  // =========================

  public readonly currentAuth =
    this.authService.currentAuth;


  // =========================
  // DASHBOARD DATA
  // =========================

  public readonly dashboard =
    this.dashboardService.dashboard;

  public readonly isLoading =
    this.dashboardService.isLoading;

  public readonly error =
    this.dashboardService.error;


  // =========================
  // DASHBOARD VALUES
  // =========================

  public readonly totalCustomers =
    computed(() =>
      this.dashboard().totalCustomers
    );

  public readonly totalUdhaar =
    computed(() =>
      this.dashboard().totalUdhaar
    );

  public readonly totalReceived =
    computed(() =>
      this.dashboard().totalReceived
    );

  public readonly netBalance = computed(
    () => this.dashboard().totalOutstanding
  );




  // =========================
  // RECENT ACTIVITY
  // =========================

  public readonly recentActivities =
    computed(() =>
      this.dashboard()
        .recentTransactions
        .map((transaction) =>
          this.mapTransaction(transaction)
        )
    );


  // =========================
  // INIT
  // =========================

  public ngOnInit(): void {
    this.dashboardService.loadDashboard();
  }

  public retryDashboard(): void {
    this.dashboardService.loadDashboard();
  }


  // =========================
  // NAVIGATION
  // =========================

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


  public openCustomerDetail(
    customerId: string
  ): void {

    this.router.navigate([
      '/customers',
      customerId,
    ]);

  }


  // =========================
  // TRANSACTION MAPPER
  // =========================

  private mapTransaction(
    transaction: DashboardTransaction
  ) {

    const isUdhaar =
      transaction.type === 'Udhaar';

    return {

      id: transaction.id,

      customerId:
        transaction.customerId,

      customerName:
        transaction.customerName,

      customerInitials:
        this.getInitials(
          transaction.customerName
        ),

      title:
        transaction.description ||
        (
          isUdhaar
            ? 'Credit given'
            : 'Payment received'
        ),

      amount:
        transaction.amount,

      type:
        isUdhaar
          ? 'UDHAAR'
          : 'PAYMENT',

      status:
        isUdhaar
          ? 'Udhaar'
          : 'Received',

      timestamp:
        this.formatDate(
          transaction.date
        ),
    };
  }


  // =========================
  // INITIALS
  // =========================

  private getInitials(
    name: string
  ): string {

    return name
      .trim()
      .split(/\s+/)
      .map(
        (part) =>
          part.charAt(0)
      )
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }


  // =========================
  // DATE FORMAT
  // =========================

  private formatDate(
    date: string
  ): string {

    if (!date) {
      return 'Recently';
    }

    const transactionDate =
      new Date(date);

    if (Number.isNaN(
      transactionDate.getTime()
    )) {
      return 'Recently';
    }

    return transactionDate.toLocaleDateString(
      'en-PK',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );
  }
}

