import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface TransactionReportItem {
  transactionId: string;
  customerId: string;
  customerName: string;
  phone: string;
  address: string | null;
  amount: number;
  type: 'Payment' | 'Udhaar';
  description: string | null;
  date: string;
}

export interface TransactionReportResponse {
  fromDate: string;
  toDate: string;
  totalReceived: number;
  totalUdhaarGiven: number;
  totalTransactions: number;
  transactions: TransactionReportItem[];
}

@Injectable({
  providedIn: 'root'
})
export class TransactionReportService {
  
  private readonly http = inject(HttpClient);
  
  private readonly apiUrl = `${environment.apiUrl}/TransactionReport`;

  private readonly reportState = signal<TransactionReportResponse | null>(null);
  
  public readonly report = this.reportState.asReadonly();
  public readonly isLoading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  public loadReport(fromDate: string, toDate: string, customerId?: string): void {
    
    this.isLoading.set(true);
    this.error.set(null);
    this.reportState.set(null);

    let params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate);

    if (customerId) {
      params = params.set('customerId', customerId);
    }

    this.http.get<TransactionReportResponse>(this.apiUrl, { params }).subscribe({
      next: (response) => {
        this.reportState.set(response);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load transaction report:', err);
        this.error.set('Failed to load transaction report.');
        this.isLoading.set(false);
      }
    });
  }
}
