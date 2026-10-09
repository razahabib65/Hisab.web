import {
  Component,
  signal,
  computed,
  inject,
  OnInit,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';

import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterNavComponent } from '../../../shared/components/footer-nav/footer-nav.component';

import { CustomerService } from '../../../core/services/customer.service';
import { PdfStatementService } from '../../../core/services/pdf-statement.service';
import { BusinessService } from '../../../core/services/business.service';

interface DetailCustomer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  initials: string;
  totalUdhaar: number;
  totalReceived: number;
  netBalance: number;
  payable: number;
}

interface DetailTransaction {
  id: string;
  amount: number;
  type: 'UDHAAR' | 'PAYMENT';
  title: string;
  timestamp: string;
  description?: string;
  date: string;
}

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    HeaderComponent,
    FooterNavComponent,
  ],
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.scss'],
})
export class CustomerDetailComponent implements OnInit {

  public readonly customerId = signal<string>('');

  public readonly activeFilter =
    signal<'all' | 'udhaar' | 'payments'>('all');

  public readonly customer =
    signal<DetailCustomer | null>(null);

  public readonly allCustomerTransactions =
    signal<DetailTransaction[]>([]);

  public readonly loading =
    signal<boolean>(true);

  public readonly error =
    signal<string>('');

  // =========================
  // MODAL
  // =========================

  public readonly showModal =
    signal<boolean>(false);

  public readonly modalType =
    signal<'UDHAAR' | 'PAYMENT'>('UDHAAR');

  public readonly modalAmount =
    signal<number | null>(null);

  public readonly modalNote =
    signal<string>('');

  public readonly modalSubmitted =
    signal<boolean>(false);

  // =========================
  // FILTERED TRANSACTIONS
  // =========================

  public readonly transactions =
    computed<DetailTransaction[]>(() => {

      const all = this.allCustomerTransactions();

      const filter = this.activeFilter();

      if (filter === 'udhaar') {
        return all.filter(
          (tx) => tx.type === 'UDHAAR'
        );
      }

      if (filter === 'payments') {
        return all.filter(
          (tx) => tx.type === 'PAYMENT'
        );
      }

      return all;
    });

  // =========================
  // PREVIEW BALANCE
  // =========================

  public readonly previewBalance =
    computed<number>(() => {

      const cust = this.customer();

      if (!cust) {
        return 0;
      }

      const amount =
        this.modalAmount() ?? 0;

      if (this.modalType() === 'UDHAAR') {
        return cust.netBalance + amount;
      }

      return Math.max(
        0,
        cust.netBalance - amount
      );
    });

  // =========================
  // SERVICES
  // =========================

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly customerService =
    inject(CustomerService);

  private readonly pdfStatementService = 
    inject(PdfStatementService);

  private readonly businessService =
    inject(BusinessService);

  // =========================
  // INIT
  // =========================

  public ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('Customer ID not found.');
      this.loading.set(false);
      return;
    }

    this.customerId.set(id);

    this.loadCustomer(id);
  }

  // =========================
  // LOAD CUSTOMER
  // =========================

  private loadCustomer(id: string): void {

    this.loading.set(true);
    this.error.set('');

    this.customerService
      .getCustomerById(id)
      .subscribe({

        next: (response) => {

          console.log(
            'CUSTOMER DETAIL:',
            response
          );

          const totalUdhaar =
            response.totalUdhaar ?? 0;

          const totalReceived =
            response.totalReceived ?? 0;

          const payable =
            response.payable ??
            (totalUdhaar - totalReceived);

          this.customer.set({
            id: response.id,
            name: response.name,
            phone: response.phone,
            address: response.address,
            notes: response.notes,

            initials:
              this.getInitials(response.name),

            totalUdhaar,
            totalReceived,

            netBalance: payable,

            payable,
          });

          const mappedTransactions: DetailTransaction[] =
            response.transactions.map((tx) => ({
              id: tx.id,
              amount: tx.amount,
              type:
                tx.type === 'Udhaar'
                  ? ('UDHAAR' as const)
                  : ('PAYMENT' as const),
              title:
                tx.type === 'Udhaar'
                  ? 'Udhaar Given'
                  : 'Payment Received',
              timestamp: this.formatDate(tx.date),
              description: tx.description,
              date: tx.date,
            }));

          this.allCustomerTransactions.set(
            mappedTransactions
          );

          this.loading.set(false);
        },

        error: (error) => {

          console.error(
            'FAILED TO LOAD CUSTOMER:',
            error
          );

          this.customer.set(null);

          this.allCustomerTransactions.set([]);

          this.loading.set(false);

          this.error.set(
            error?.error?.message ||
            'Failed to load customer.'
          );
        },
      });
  }

  // =========================
  // FILTER
  // =========================

  public setFilter(
    filter: 'all' | 'udhaar' | 'payments'
  ): void {

    this.activeFilter.set(filter);
  }

  // =========================
  // UDHAAR MODAL
  // =========================

  public openUdhaarModal(): void {

    this.modalType.set('UDHAAR');

    this.modalAmount.set(null);

    this.modalNote.set('');

    this.modalSubmitted.set(false);

    this.showModal.set(true);
  }

  // =========================
  // PAYMENT MODAL
  // =========================

  public openPaymentModal(): void {

    this.modalType.set('PAYMENT');

    this.modalAmount.set(null);

    this.modalNote.set('');

    this.modalSubmitted.set(false);

    this.showModal.set(true);
  }

  // =========================
  // CLOSE MODAL
  // =========================

  public closeModal(): void {

    this.showModal.set(false);
  }

  // =========================
  // AMOUNT INPUT
  // =========================

  public onAmountInput(value: string): void {

    const num = parseFloat(value);

    this.modalAmount.set(
      isNaN(num) || num <= 0
        ? null
        : num
    );
  }

  // =========================
  // ADD TRANSACTION
  // =========================

  public submitTransaction(): void {

    const cust = this.customer();

    const amount = this.modalAmount();

    if (
      !cust ||
      !amount ||
      amount <= 0
    ) {
      return;
    }

    this.customerService
      .addTransaction(
        cust.id,
        amount,
        this.modalType(),
        this.modalNote().trim() || undefined
      )
      .subscribe({

        next: (response) => {

          console.log(
            'TRANSACTION ADDED:',
            response
          );

          this.modalSubmitted.set(true);

          // Reload customer + transactions
          this.loadCustomer(cust.id);

          setTimeout(() => {

            this.showModal.set(false);

            this.modalSubmitted.set(false);

          }, 1200);
        },

        error: (error) => {

          console.error(
            'TRANSACTION ERROR:',
            error
          );

          alert(
            error?.error?.message ||
            'Failed to add transaction.'
          );
        },
      });
  }

  // =========================
  // BACK
  // =========================

  public backToCustomers(): void {

    this.router.navigateByUrl('/customers');
  }

  // =========================
  // INITIALS
  // =========================

  private getInitials(name: string): string {

    return name
      .trim()
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  // =========================
  // DOWNLOAD STATEMENT
  // =========================

  public downloadStatement(): void {
    const cust = this.customer();
    const txs = this.allCustomerTransactions(); 
    if (!cust) return;

    this.businessService.loadBusiness().subscribe({
      next: (biz) => {
        this.pdfStatementService.generateStatement(biz, cust, txs);
      },
      error: () => {
        this.pdfStatementService.generateStatement(null, cust, txs);
      }
    });
  }

  // =========================
  // DATE FORMAT
  // =========================

  private formatDate(date: string): string {

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString(
      'en-PK',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      }
    );
  }
}