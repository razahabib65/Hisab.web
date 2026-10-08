import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface BusinessProfile {
    id: string;
    businessName: string;
    businessType: string;
    address?: string;
    logo?: string | null;
    ownerName?: string;
    phone?: string;
    email?: string;
}

export interface UpdateBusinessRequest {
    businessName: string;
    businessType: string;
    address: string;
    logo?: string | null;
    ownerName: string;
    phone: string;
    email: string;
}

@Injectable({
    providedIn: 'root',
})
export class BusinessService {

    private readonly http = inject(HttpClient);

    private readonly apiUrl =
        `${environment.apiUrl}/Business`;

    private readonly businessState =
        signal<BusinessProfile | null>(null);

    public readonly business =
        this.businessState.asReadonly();

    public loadBusiness() {
        return this.http.get<BusinessProfile>(this.apiUrl);
    }

    public updateBusiness(
        request: UpdateBusinessRequest
    ) {
        return this.http.put(
            this.apiUrl,
            request
        );
    }
}