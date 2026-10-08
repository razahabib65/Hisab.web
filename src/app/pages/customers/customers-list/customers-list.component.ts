
import {
  Component,
  signal,
  computed,
  inject,
  OnInit,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ToastService } from '../../../core/services/toast.service';

import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterNavComponent } from '../../../shared/components/footer-nav/footer-nav.component';

import { CustomerService } from '../../../core/services/customer.service';
import { Customer } from '../../../core/models/customer.model';

import { ConfirmModalComponent } from '../../confirm-modal/confirm-modal.component';


@Component({
  selector: 'app-customers-list',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    HeaderComponent,
    FooterNavComponent,
    ConfirmModalComponent,
  ],

  templateUrl: './customers-list.component.html',

  styleUrls: ['./customers-list.component.scss'],
})
export class CustomersListComponent implements OnInit {

  // =====================================================
  // SERVICES
  // =====================================================

  private readonly customerService =
    inject(CustomerService);

  private readonly router =
    inject(Router);

  private readonly toastService =
    inject(ToastService);


  // =====================================================
  // SEARCH
  // =====================================================

  public readonly searchQuery =
    signal<string>('');


  // =====================================================
  // FILTER
  // =====================================================

  public readonly activeFilter =
    signal<'all' | 'due' | 'settled'>('all');


  // =====================================================
  // DELETE MODAL
  // =====================================================

  public readonly showDeleteModal =
    signal<boolean>(false);

  public readonly customerToDelete =
    signal<Customer | null>(null);


  // =====================================================
  // CUSTOMERS
  // =====================================================

  public readonly allCustomers =
    this.customerService.customers;


  // =====================================================
  // TOTAL RECEIVABLE
  // =====================================================

  public readonly totalReceivable =
    this.customerService.totalReceivable;


  // =====================================================
  // LOAD CUSTOMERS
  // =====================================================

  public ngOnInit(): void {

    this.customerService.loadCustomers();

  }


  // =====================================================
  // FILTERED CUSTOMERS
  // =====================================================

  public readonly filteredCustomers =
    computed(() => {

      const query =
        this.searchQuery()
          .toLowerCase()
          .trim();

      const filter =
        this.activeFilter();


      return this.allCustomers().filter(
        (customer) => {

          const matchesQuery =
            customer.name
              .toLowerCase()
              .includes(query) ||

            customer.phone
              .toLowerCase()
              .includes(query);


          if (!matchesQuery) {
            return false;
          }


          if (filter === 'due') {

            return customer.netBalance > 0;

          }


          if (filter === 'settled') {

            return customer.netBalance === 0;

          }


          return true;

        }
      );

    });


  // =====================================================
  // DUE COUNT
  // =====================================================

  public readonly dueCount =
    computed(() => {

      return this.allCustomers()
        .filter(
          (customer) =>
            customer.netBalance > 0
        )
        .length;

    });


  // =====================================================
  // SETTLED COUNT
  // =====================================================

  public readonly settledCount =
    computed(() => {

      return this.allCustomers()
        .filter(
          (customer) =>
            customer.netBalance === 0
        )
        .length;

    });


  // =====================================================
  // CHANGE FILTER
  // =====================================================

  public setFilter(
    filter: 'all' | 'due' | 'settled'
  ): void {

    this.activeFilter.set(filter);

  }


  // =====================================================
  // ADD CUSTOMER
  // =====================================================

  public navigateToAddCustomer(): void {

    this.router.navigateByUrl(
      '/customers/add'
    );

  }


  // =====================================================
  // CUSTOMER DETAIL
  // =====================================================

  public openCustomerDetail(
    id: string
  ): void {

    this.router.navigate([
      '/customers',
      id,
    ]);

  }


  // =====================================================
  // EDIT CUSTOMER
  // =====================================================

  public editCustomer(
    id: string
  ): void {

    this.router.navigate([
      '/customers/edit',
      id,
    ]);

  }


  // =====================================================
  // OPEN DELETE MODAL
  // =====================================================

  public deleteCustomer(
    id: string
  ): void {

    const customer =
      this.allCustomers().find(
        (c) => c.id === id
      );


    if (!customer) {
      return;
    }


    this.customerToDelete.set(
      customer
    );


    this.showDeleteModal.set(
      true
    );

  }


  // =====================================================
  // CONFIRM DELETE
  // =====================================================

  public confirmDeleteCustomer(): void {

    const customer =
      this.customerToDelete();


    if (!customer) {
      return;
    }


    // Close modal
    this.showDeleteModal.set(
      false
    );


    this.customerService
      .deleteCustomer(customer.id)
      .subscribe({

        // ---------------------------------------------
        // SUCCESS
        // ---------------------------------------------

        next: () => {

          this.toastService.success(
            'Customer Deleted',
            `${customer.name} has been deleted successfully.`
          );


          this.customerToDelete.set(
            null
          );


          // Refresh customer list
          this.customerService
            .loadCustomers();

        },


        // ---------------------------------------------
        // ERROR
        // ---------------------------------------------

        error: (error) => {

          console.error(
            'Failed to delete customer:',
            error
          );


          this.toastService.error(
            'Delete Failed',
            error?.error?.message ||
            'Unable to delete customer. Please try again.'
          );


          this.customerToDelete.set(
            null
          );

        },

      });

  }


  // =====================================================
  // CANCEL DELETE
  // =====================================================

  public cancelDeleteCustomer(): void {

    this.showDeleteModal.set(
      false
    );


    this.customerToDelete.set(
      null
    );

  }

}

