import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Customer, AddCustomerPayload } from '../models/customer.model';
import { Transaction } from '../models/transaction.model';
import { environment } from '../../../environments/environment';

export interface CustomerDetailsResponse {
  id: string;
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  totalUdhaar: number;
  totalReceived: number;
  payable: number;
  transactions: ApiTransaction[];
}

export interface ApiTransaction {
  id: string;
  amount: number;
  type: 'Udhaar' | 'Payment';
  description?: string;
  date: string;
}

export interface CustomersResponse {
  customers: any[];
  totalUdhaar: number;
  totalReceived: number;
  totalReceivable: number;
}

@Injectable({
  providedIn: 'root',
})
export class CustomerService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/Customer`;

  private readonly customersState = signal<Customer[]>([]);
  private readonly transactionsState = signal<Transaction[]>([]);

  public readonly customers = this.customersState.asReadonly();
  public readonly transactions = this.transactionsState.asReadonly();

  public readonly totalReceivable = signal<number>(0);
  public readonly totalUdhaar = signal<number>(0);
  public readonly totalReceived = signal<number>(0);
  public readonly totalPayable = signal<number>(0);

  public readonly isLoading = signal<boolean>(false);

  // =========================
  // GET ALL CUSTOMERS
  // =========================

  public loadCustomers(): void {
    this.isLoading.set(true);
    this.http
      .get<CustomersResponse>(this.apiUrl)
      .subscribe({

        next: (response) => {

          // Overall business totals
          this.totalUdhaar.set(
            response.totalUdhaar ?? 0
          );

          this.totalReceived.set(
            response.totalReceived ?? 0
          );

          this.totalReceivable.set(
            response.totalReceivable ?? 0
          );


          // Customers
          const customers = response.customers ?? [];

          const mappedCustomers: Customer[] =
            customers.map((customer: any) => ({

              id: customer.id,

              name: customer.name,

              phone: customer.phone,

              initials: this.getInitials(
                customer.name
              ),

              totalUdhaar:
                customer.totalUdhaar ?? 0,

              totalReceived:
                customer.totalReceived ?? 0,

              netBalance:
                (customer.totalUdhaar ?? 0) -
                (customer.totalReceived ?? 0),

              status:
                'Will Receive',

              lastActivity:
                'Recently',

              address:
                customer.address,

              notes:
                customer.notes,

              paymentFrequencyReliability:
                100,
            }));


          this.customersState.set(
            mappedCustomers
          );
          this.isLoading.set(false);
        },

        error: (error) => {

          console.error(
            'Failed to load customers:',
            error
          );
          this.isLoading.set(false);
        },
      });
  }


  // =========================
  // GET SINGLE CUSTOMER
  // =========================

  public getCustomerById(id: string) {

    return this.http.get<CustomerDetailsResponse>(
      `${this.apiUrl}/${id}`
    );

  }


  // =========================
  // ADD CUSTOMER
  // =========================

  public addCustomer(
    payload: AddCustomerPayload
  ) {

    return this.http.post<any>(
      this.apiUrl,
      {
        name: payload.name,
        phone: payload.phone,
        address: payload.address,
        notes: payload.notes,
      }
    );

  }


  // =========================
  // UPDATE CUSTOMER
  // =========================

  public updateCustomer(
    id: string,
    payload: Partial<AddCustomerPayload>
  ) {

    return this.http.put<any>(
      `${this.apiUrl}/${id}`,
      {
        name: payload.name,
        phone: payload.phone,
        address: payload.address,
        notes: payload.notes,
      }
    );

  }


  // =========================
  // DELETE CUSTOMER
  // =========================

  public deleteCustomer(id: string) {

    return this.http.delete<any>(
      `${this.apiUrl}/${id}`
    );

  }


  // =========================
  // ADD TRANSACTION
  // =========================

  public addTransaction(
    customerId: string,
    amount: number,
    type: 'UDHAAR' | 'PAYMENT',
    notes?: string
  ) {

    const apiType =
      type === 'UDHAAR'
        ? 'Udhaar'
        : 'Payment';

    return this.http.post<any>(
      `${this.apiUrl}/${customerId}/transaction`,
      {
        amount,
        type: apiType,
        description: notes ?? '',
      }
    );

  }


  // =========================
  // HELPERS
  // =========================

  private getInitials(name: string): string {

    return name
      .trim()
      .split(/\s+/)
      .map(
        (part) => part.charAt(0)
      )
      .join('')
      .substring(0, 2)
      .toUpperCase();

  }

}