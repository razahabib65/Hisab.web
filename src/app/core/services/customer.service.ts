import { Injectable, signal, computed } from '@angular/core';
import { Customer, AddCustomerPayload } from '../models/customer.model';
import { Transaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly customersState = signal<Customer[]>([
    {
      id: 'cust-1',
      name: 'Ahmed Khan',
      phone: '0300 1234567',
      initials: 'AK',
      totalUdhaar: 25000,
      totalReceived: 10000,
      netBalance: 15000,
      status: 'Will Receive',
      lastActivity: 'Today, 02:45 PM',
      address: 'House #4, Street 12, Lahore',
      paymentFrequencyReliability: 92,
    },
    {
      id: 'cust-2',
      name: 'Tariq Mehmood',
      phone: '0321 9876543',
      initials: 'TM',
      totalUdhaar: 24000,
      totalReceived: 0,
      netBalance: 24000,
      status: 'Overdue',
      overdueDays: 15,
      lastActivity: 'Yesterday',
      address: 'Main Bazaar, Shop #8',
      paymentFrequencyReliability: 65,
    },
    {
      id: 'cust-3',
      name: 'Ali Traders (Hamza)',
      phone: '0333 4567890',
      initials: 'AT',
      totalUdhaar: 10200,
      totalReceived: 2000,
      netBalance: 8200,
      status: 'Will Receive',
      lastActivity: 'Today, 09:15 AM',
      address: 'Grain Market, Gate 2',
      paymentFrequencyReliability: 88,
    },
    {
      id: 'cust-4',
      name: 'Usman Karyana Store',
      phone: '0345 1122334',
      initials: 'UK',
      totalUdhaar: 15000,
      totalReceived: 0,
      netBalance: 15000,
      status: 'Will Receive',
      lastActivity: '3 days ago',
      address: 'Near Grand Mosque',
      paymentFrequencyReliability: 80,
    },
    {
      id: 'cust-5',
      name: 'Bilal Ahmed',
      phone: '0312 8899001',
      initials: 'BA',
      totalUdhaar: 5000,
      totalReceived: 5000,
      netBalance: 0,
      status: 'Settled',
      lastActivity: '5 days ago',
      address: 'Sector B, Model Town',
      paymentFrequencyReliability: 100,
    },
    {
      id: 'cust-6',
      name: 'Chaudhary Milk Shop',
      phone: '0301 5566778',
      initials: 'CM',
      totalUdhaar: 6800,
      totalReceived: 0,
      netBalance: 6800,
      status: 'Will Receive',
      lastActivity: '1 week ago',
      address: 'Chowk Yadgar',
      paymentFrequencyReliability: 75,
    },
  ]);

  private readonly transactionsState = signal<Transaction[]>([
    {
      id: 'tx-1',
      customerId: 'cust-1',
      customerName: 'Ahmed Khan',
      customerInitials: 'AK',
      title: 'Payment Received',
      subtitle: 'Cash In Counter • Yesterday, 02:30 PM',
      amount: 2000,
      type: 'PAYMENT',
      status: 'Cash Settled',
      timestamp: 'Today, 11:30 AM',
    },
    {
      id: 'tx-2',
      customerId: 'cust-1',
      customerName: 'Ahmed Khan',
      customerInitials: 'AK',
      title: 'Monthly Grocery',
      subtitle: 'Store Provisions • 15 Sep 2024',
      amount: 12000,
      type: 'UDHAAR',
      status: 'Debit Given',
      timestamp: '15 Sep 2024',
      voucherNo: '#442',
    },
    {
      id: 'tx-3',
      customerId: 'cust-3',
      customerName: 'Ali Traders',
      customerInitials: 'AT',
      title: 'Payment Received',
      subtitle: 'Cash In Counter • 09:15 AM',
      amount: 2000,
      type: 'PAYMENT',
      status: 'Cash Settled',
      timestamp: 'Today, 09:15 AM',
    },
    {
      id: 'tx-4',
      customerId: 'cust-4',
      customerName: 'Usman Store',
      customerInitials: 'US',
      title: 'Udhaar',
      subtitle: 'Grocery Order',
      amount: 3500,
      type: 'UDHAAR',
      status: 'Pending',
      timestamp: 'Yesterday',
    },
    {
      id: 'tx-5',
      customerId: 'cust-1',
      customerName: 'Ahmed Khan',
      customerInitials: 'AK',
      title: 'Direct Bank Transfer',
      subtitle: 'Meezan Bank Raast • 01 Sep 2024',
      amount: 8000,
      type: 'PAYMENT',
      status: 'Verified',
      timestamp: '01 Sep 2024',
    },
    {
      id: 'tx-6',
      customerId: 'cust-1',
      customerName: 'Ahmed Khan',
      customerInitials: 'AK',
      title: 'Opening Udhaar Balance',
      subtitle: 'Bahi-Khata Migration • 25 Aug 2024',
      amount: 8000,
      type: 'UDHAAR',
      status: 'Archived',
      timestamp: '25 Aug 2024',
    },
  ]);

  public readonly customers = this.customersState.asReadonly();
  public readonly transactions = this.transactionsState.asReadonly();

  public readonly totalReceivable = computed(() => {
    return this.customersState().reduce((sum, c) => sum + c.netBalance, 0);
  });

  public readonly totalUdhaar = computed(() => {
    return this.customersState().reduce((sum, c) => sum + c.totalUdhaar, 0);
  });

  public readonly totalReceived = computed(() => {
    return this.customersState().reduce((sum, c) => sum + c.totalReceived, 0);
  });

  public readonly totalPayable = signal<number>(14200);

  public getCustomerById(id: string): Customer | undefined {
    return this.customersState().find((c) => c.id === id);
  }

  public getTransactionsForCustomer(customerId: string): Transaction[] {
    return this.transactionsState().filter((t) => t.customerId === customerId);
  }

  public addCustomer(payload: AddCustomerPayload): Customer {
    const initials = payload.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const openingBal = payload.openingBalance || 0;
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name: payload.name,
      phone: payload.phone,
      initials,
      totalUdhaar: openingBal,
      totalReceived: 0,
      netBalance: openingBal,
      status: openingBal > 0 ? 'Will Receive' : 'Settled',
      lastActivity: 'Just now',
      address: payload.address,
      notes: payload.notes,
      paymentFrequencyReliability: 100,
    };

    this.customersState.update((list) => [newCustomer, ...list]);

    if (openingBal > 0) {
      this.transactionsState.update((txs) => [
        {
          id: `tx-${Date.now()}`,
          customerId: newCustomer.id,
          customerName: newCustomer.name,
          customerInitials: newCustomer.initials,
          title: 'Opening Balance',
          subtitle: 'Added during creation',
          amount: openingBal,
          type: 'UDHAAR',
          status: 'Debit Given',
          timestamp: 'Just now',
        },
        ...txs,
      ]);
    }

    return newCustomer;
  }

  public addTransaction(customerId: string, amount: number, type: 'UDHAAR' | 'PAYMENT', notes?: string): void {
    const customer = this.getCustomerById(customerId);
    if (!customer) return;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      customerId,
      customerName: customer.name,
      customerInitials: customer.initials,
      title: type === 'UDHAAR' ? 'New Udhaar' : 'Payment Received',
      subtitle: notes || (type === 'UDHAAR' ? 'Debit Given' : 'Cash In Counter'),
      amount,
      type,
      status: type === 'UDHAAR' ? 'Debit Given' : 'Cash Settled',
      timestamp: 'Just now',
    };

    this.transactionsState.update((txs) => [newTx, ...txs]);

    this.customersState.update((list) =>
      list.map((c) => {
        if (c.id === customerId) {
          const newUdhaar = type === 'UDHAAR' ? c.totalUdhaar + amount : c.totalUdhaar;
          const newReceived = type === 'PAYMENT' ? c.totalReceived + amount : c.totalReceived;
          const net = newUdhaar - newReceived;
          let status: Customer['status'] = 'Will Receive';
          if (net <= 0) status = 'Settled';
          return {
            ...c,
            totalUdhaar: newUdhaar,
            totalReceived: newReceived,
            netBalance: Math.max(0, net),
            status,
            lastActivity: 'Just now',
          };
        }
        return c;
      })
    );
  }
}
