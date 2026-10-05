export type TransactionType = 'UDHAAR' | 'PAYMENT';
export type TransactionStatus = 'Debit Given' | 'Cash Settled' | 'Pending' | 'Verified' | 'Archived' | 'Settled';

export interface Transaction {
  id: string;
  customerId: string;
  customerName: string;
  customerInitials: string;
  title: string;
  subtitle?: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  timestamp: string;
  voucherNo?: string;
}
