
import {
  Component,
  signal,
  computed,
  inject,
  OnInit,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterNavComponent } from '../../../shared/components/footer-nav/footer-nav.component';

import { CustomerService } from '../../../core/services/customer.service';
import { ToastService } from '../../../core/services/toast.service';


@Component({
  selector: 'app-add-customer',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    HeaderComponent,
    FooterNavComponent,
  ],

  templateUrl: './add-customer.component.html',
  styleUrls: ['./add-customer.component.scss'],
})
export class AddCustomerComponent implements OnInit {

  // =====================================================
  // FORM FIELDS
  // =====================================================

  public readonly name =
    signal<string>('');

  public readonly phone =
    signal<string>('');

  public readonly enableOpeningBalance =
    signal<boolean>(false);

  public readonly openingBalance =
    signal<number>(0);

  public readonly balanceType =
    signal<'udhaar' | 'advance'>('udhaar');

  public readonly address =
    signal<string>('');

  public readonly notes =
    signal<string>('');


  // =====================================================
  // EDIT MODE
  // =====================================================

  public readonly isEditMode =
    signal<boolean>(false);

  public readonly customerId =
    signal<string | null>(null);

  public readonly isLoading =
    signal<boolean>(false);

  public readonly isSaving =
    signal<boolean>(false);


  // =====================================================
  // SERVICES
  // =====================================================

  private readonly customerService =
    inject(CustomerService);

  private readonly router =
    inject(Router);

  private readonly route =
    inject(ActivatedRoute);

  private readonly toastService =
    inject(ToastService);


  // =====================================================
  // INITIALIZE
  // =====================================================

  public ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');


    // No ID = Add mode
    if (!id) {

      this.isEditMode.set(false);

      return;
    }


    // ID exists = Edit mode
    this.isEditMode.set(true);

    this.customerId.set(id);

    this.loadCustomer(id);

  }


  // =====================================================
  // LOAD CUSTOMER FOR EDIT
  // =====================================================

  private loadCustomer(id: string): void {

    this.isLoading.set(true);


    this.customerService
      .getCustomerById(id)
      .subscribe({

        next: (customer) => {

          // ---------------------------------------------
          // Fill form fields
          // ---------------------------------------------

          this.name.set(
            customer.name ?? ''
          );

          this.phone.set(
            customer.phone ?? ''
          );

          this.address.set(
            customer.address ?? ''
          );

          this.notes.set(
            customer.notes ?? ''
          );


          // ---------------------------------------------
          // Opening balance
          // ---------------------------------------------

          const balance =
            customer.totalUdhaar ?? 0;


          if (balance > 0) {

            this.enableOpeningBalance.set(
              true
            );

            this.openingBalance.set(
              balance
            );

            this.balanceType.set(
              'udhaar'
            );

          }


          this.isLoading.set(false);

        },


        error: (error) => {

          console.error(
            'Failed to load customer:',
            error
          );


          this.isLoading.set(false);


          this.toastService.error(
            'Customer Load Failed',
            error?.error?.message ||
            'Unable to load customer.'
          );


          this.router.navigateByUrl(
            '/customers'
          );

        },

      });

  }


  // =====================================================
  // INITIALS
  // =====================================================

  public readonly previewInitials =
    computed(() => {

      const val =
        this.name()
          .trim();

      if (!val) {
        return '?';
      }


      return val
        .split(/\s+/)
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    });


  // =====================================================
  // OPENING BALANCE TOGGLE
  // =====================================================

  public toggleOpeningBalance(): void {

    this.enableOpeningBalance.update(
      (value) => !value
    );

  }


  // =====================================================
  // SUBMIT
  // =====================================================

  public onSubmit(): void {

    // Basic validation
    if (
      !this.name().trim() ||
      !this.phone().trim()
    ) {
      return;
    }


    // Prevent duplicate clicks
    if (this.isSaving()) {
      return;
    }


    // ===================================================
    // EDIT
    // ===================================================

    if (this.isEditMode()) {

      const id =
        this.customerId();


      if (!id) {
        return;
      }


      this.isSaving.set(true);


      this.customerService
        .updateCustomer(id, {

          name: this.name().trim(),

          phone: this.phone().trim(),

          address:
            this.address().trim(),

          notes:
            this.notes().trim(),

        })
        .subscribe({

          next: (response) => {

            console.log(
              'Customer updated successfully:',
              response
            );


            this.isSaving.set(false);


            this.toastService.success(
              'Customer Updated',
              `${this.name()} has been updated successfully.`
            );


            this.router.navigateByUrl(
              '/customers'
            );

          },


          error: (error) => {

            console.error(
              'Failed to update customer:',
              error
            );


            this.isSaving.set(false);


            this.toastService.error(
              'Update Failed',
              error?.error?.message ||
              'Failed to update customer. Please try again.'
            );

          },

        });


      return;
    }


    // ===================================================
    // ADD
    // ===================================================

    this.isSaving.set(true);


    this.customerService
      .addCustomer({

        name:
          this.name().trim(),

        phone:
          this.phone().trim(),

        address:
          this.address().trim(),

        notes:
          this.notes().trim(),

        openingBalance:
          this.enableOpeningBalance()
            ? this.openingBalance()
            : 0,

        balanceType:
          this.balanceType(),

      })
      .subscribe({

        next: (response) => {

          console.log(
            'Customer added successfully:',
            response
          );


          this.isSaving.set(false);


          this.toastService.success(
            'Customer Added',
            `${this.name()} has been added successfully.`
          );


          this.router.navigateByUrl(
            '/customers'
          );

        },


        error: (error) => {

          console.error(
            'Failed to add customer:',
            error
          );


          this.isSaving.set(false);


          this.toastService.error(
            'Add Customer Failed',
            error?.error?.message ||
            'Failed to add customer. Please try again.'
          );

        },

      });

  }


  // =====================================================
  // CANCEL
  // =====================================================

  public onDiscard(): void {

    this.router.navigateByUrl(
      '/customers'
    );

  }

}

