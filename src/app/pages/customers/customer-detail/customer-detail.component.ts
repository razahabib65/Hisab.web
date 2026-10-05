import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterNavComponent } from '../../../shared/components/footer-nav/footer-nav.component';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer } from '../../../core/models/customer.model';
import { Transaction } from '../../../core/models/transaction.model';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent, FooterNavComponent],
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.scss'],
})
export class CustomerDetailComponent implements OnInit {
  public readonly customerId = signal<string>('cust-1');
  public readonly activeFilter = signal<'all' | 'udhaar' | 'payments'>('all');

  // Modal state
  public readonly showModal = signal<boolean>(false);
  public readonly modalType = signal<'UDHAAR' | 'PAYMENT'>('UDHAAR');
  public readonly modalAmount = signal<number | null>(null);
  public readonly modalNote = signal<string>('');
  public readonly modalSubmitted = signal<boolean>(false);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  public readonly customerService = inject(CustomerService);

  public readonly customer = computed<Customer | undefined>(() => {
    return this.customerService.getCustomerById(this.customerId());
  });

  public readonly allCustomerTransactions = computed<Transaction[]>(() => {
    return this.customerService.getTransactionsForCustomer(this.customerId());
  });

  public readonly transactions = computed<Transaction[]>(() => {
    const all = this.allCustomerTransactions();
    const filter = this.activeFilter();
    if (filter === 'udhaar') return all.filter((t) => t.type === 'UDHAAR');
    if (filter === 'payments') return all.filter((t) => t.type === 'PAYMENT');
    return all;
  });

  // Live preview: net balance after this transaction
  public readonly previewBalance = computed<number>(() => {
    const cust = this.customer();
    if (!cust) return 0;
    const amt = this.modalAmount() ?? 0;
    if (this.modalType() === 'UDHAAR') return cust.netBalance + amt;
    return Math.max(0, cust.netBalance - amt);
  });

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.customerId.set(id);
  }

  public setFilter(filter: 'all' | 'udhaar' | 'payments'): void {
    this.activeFilter.set(filter);
  }

  public openUdhaarModal(): void {
    this.modalType.set('UDHAAR');
    this.modalAmount.set(null);
    this.modalNote.set('');
    this.modalSubmitted.set(false);
    this.showModal.set(true);
  }

  public openPaymentModal(): void {
    this.modalType.set('PAYMENT');
    this.modalAmount.set(null);
    this.modalNote.set('');
    this.modalSubmitted.set(false);
    this.showModal.set(true);
  }

  public closeModal(): void {
    this.showModal.set(false);
  }

  public onAmountInput(value: string): void {
    const num = parseFloat(value);
    this.modalAmount.set(isNaN(num) || num <= 0 ? null : num);
  }

  public submitTransaction(): void {
    const cust = this.customer();
    const amt = this.modalAmount();
    if (!cust || !amt || amt <= 0) return;

    this.customerService.addTransaction(
      cust.id,
      amt,
      this.modalType(),
      this.modalNote().trim() || undefined
    );

    this.modalSubmitted.set(true);
    setTimeout(() => this.showModal.set(false), 1200);
  }

  public backToCustomers(): void {
    this.router.navigateByUrl('/customers');
  }
}
