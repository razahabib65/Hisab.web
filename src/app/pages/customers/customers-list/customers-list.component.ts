import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterNavComponent } from '../../../shared/components/footer-nav/footer-nav.component';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer } from '../../../core/models/customer.model';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent, FooterNavComponent],
  templateUrl: './customers-list.component.html',
  styleUrls: ['./customers-list.component.scss'],
})
export class CustomersListComponent {
  public readonly searchQuery = signal<string>('');
  public readonly activeFilter = signal<'all' | 'due' | 'settled'>('all');

  private readonly customerService = inject(CustomerService);
  private readonly router = inject(Router);

  public readonly totalReceivable = this.customerService.totalReceivable;
  public readonly allCustomers = this.customerService.customers;

  public readonly filteredCustomers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const filter = this.activeFilter();

    return this.allCustomers().filter((c) => {
      const matchesQuery =
        c.name.toLowerCase().includes(query) || c.phone.includes(query);

      if (!matchesQuery) return false;

      if (filter === 'due') return c.netBalance > 0;
      if (filter === 'settled') return c.netBalance === 0;

      return true;
    });
  });

  public readonly dueCount = computed(() => {
    return this.allCustomers().filter((c) => c.netBalance > 0).length;
  });

  public readonly settledCount = computed(() => {
    return this.allCustomers().filter((c) => c.netBalance === 0).length;
  });

  public setFilter(filter: 'all' | 'due' | 'settled'): void {
    this.activeFilter.set(filter);
  }

  public navigateToAddCustomer(): void {
    this.router.navigateByUrl('/customers/add');
  }

  public openCustomerDetail(id: string): void {
    this.router.navigate(['/customers', id]);
  }
}
