export interface Customer {
  id: string;
  name: string;
  phone: string;
  initials: string;
  totalUdhaar: number;
  totalReceived: number;
  netBalance: number;
  status: 'Will Receive' | 'Overdue' | 'Settled';
  lastActivity: string;
  overdueDays?: number;
  address?: string;
  notes?: string;
  paymentFrequencyReliability?: number;
}

export interface AddCustomerPayload {
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  openingBalance?: number;
  balanceType?: 'udhaar' | 'advance';
}
