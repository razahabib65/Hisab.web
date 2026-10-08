
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface DashboardTransaction {
    id: string;
    customerId: string;
    customerName: string;
    amount: number;
    type: 'Udhaar' | 'Payment';
    description?: string;
    date: string;
}

export interface DashboardResponse {
    totalCustomers: number;
    totalUdhaar: number;
    totalReceived: number;
    totalReceivable: number;
    totalOutstanding: number;
    recentTransactions: DashboardTransaction[];
}

@Injectable({
    providedIn: 'root',
})
export class DashboardService {

    private readonly http = inject(HttpClient);

    private readonly apiUrl =
        `${environment.apiUrl}/Dashboard`;

    private readonly dashboardState =
        signal<DashboardResponse>({
            totalCustomers: 0,
            totalUdhaar: 0,
            totalReceived: 0,
            totalReceivable: 0,
            totalOutstanding: 0,
            recentTransactions: [],
        });

    public readonly dashboard =
        this.dashboardState.asReadonly();

    public readonly isLoading =
        signal<boolean>(false);

    public readonly error =
        signal<string | null>(null);


    // =========================
    // LOAD DASHBOARD
    // =========================

    public loadDashboard(): void {

        this.isLoading.set(true);
        this.error.set(null);

        this.http
            .get<DashboardResponse>(this.apiUrl)
            .subscribe({

                next: (response) => {

                    this.dashboardState.set({
                        totalCustomers:
                            response.totalCustomers ?? 0,

                        totalUdhaar:
                            response.totalUdhaar ?? 0,

                        totalReceived:
                            response.totalReceived ?? 0,

                        totalReceivable:
                            response.totalReceivable ?? 0,

                        totalOutstanding: response.totalOutstanding ?? 0,

                        recentTransactions:
                            response.recentTransactions ?? [],
                    });

                    this.isLoading.set(false);
                },

                error: (error) => {

                    console.error(
                        'Failed to load dashboard:',
                        error
                    );

                    this.error.set(
                        error?.error?.message ||
                        'Unable to load dashboard data.'
                    );

                    this.isLoading.set(false);
                },
            });
    }
}

