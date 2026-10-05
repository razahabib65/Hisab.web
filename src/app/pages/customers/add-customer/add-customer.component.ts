import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterNavComponent } from '../../../shared/components/footer-nav/footer-nav.component';
import { CustomerService } from '../../../core/services/customer.service';

@Component({
  selector: 'app-add-customer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent, FooterNavComponent],
  templateUrl: './add-customer.component.html',
  styleUrls: ['./add-customer.component.scss'],
})
export class AddCustomerComponent {
  public readonly name = signal<string>('');
  public readonly phone = signal<string>('');
  public readonly enableOpeningBalance = signal<boolean>(false);
  public readonly openingBalance = signal<number>(0);
  public readonly balanceType = signal<'udhaar' | 'advance'>('udhaar');
  public readonly address = signal<string>('');
  public readonly notes = signal<string>('');

  private readonly customerService = inject(CustomerService);
  private readonly router = inject(Router);

  public readonly previewInitials = computed(() => {
    const val = this.name().trim();
    if (!val) return '?';
    return val
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  });

  public toggleOpeningBalance(): void {
    this.enableOpeningBalance.update((val) => !val);
  }

  public onSubmit(): void {
    if (!this.name().trim() || !this.phone().trim()) return;

    this.customerService.addCustomer({
      name: this.name().trim(),
      phone: `0${this.phone().trim()}`,
      address: this.address().trim(),
      notes: this.notes().trim(),
      openingBalance: this.enableOpeningBalance() ? this.openingBalance() : 0,
      balanceType: this.balanceType(),
    });

    this.router.navigateByUrl('/customers');
  }

  public onDiscard(): void {
    this.router.navigateByUrl('/customers');
  }
}
