import {
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterNavComponent } from '../../shared/components/footer-nav/footer-nav.component';

import {
  BusinessService,
  BusinessProfile,
  UpdateBusinessRequest,
} from '../../core/services/business.service';

import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HeaderComponent,
    FooterNavComponent,
  ],

  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {

  private readonly businessService =
    inject(BusinessService);

  private readonly toastService =
    inject(ToastService);

  // =========================
  // FORM DATA
  // =========================

  public businessName =
    signal<string>('');

  public category =
    signal<string>('');

  public address =
    signal<string>('');

  public ownerName =
    signal<string>('');

  public phone =
    signal<string>('');

  public email =
    signal<string>('');

  public logo =
    signal<string | null>(null);

  // =========================
  // UI STATE
  // =========================

  public isEditing =
    signal<boolean>(false);

  public isLoading =
    signal<boolean>(true);

  public isSaving =
    signal<boolean>(false);

  // =========================
  // CATEGORIES
  // =========================

  public categories = [
    'General Store / Karyana',
    'Wholesale & Traders',
    'Pharmacy / Medical',
    'Milk & Dairy',
    'Textiles / Cloth',
    'Mobile / Electronics',
    'Other',
  ];

  // =========================
  // ORIGINAL DATA
  // =========================

  private originalData: BusinessProfile | null = null;


  // =========================
  // INIT
  // =========================

  public ngOnInit(): void {
    this.loadBusiness();
  }


  // =========================
  // LOAD BUSINESS
  // =========================

  private loadBusiness(): void {

    this.isLoading.set(true);

    this.businessService
      .loadBusiness()
      .subscribe({

        next: (business) => {

          this.businessName.set(
            business.businessName ?? ''
          );

          this.category.set(
            business.businessType ?? ''
          );

          this.address.set(
            business.address ?? ''
          );

          this.ownerName.set(
            business.ownerName ?? ''
          );

          this.phone.set(
            business.phone ?? ''
          );

          this.email.set(
            business.email ?? ''
          );

          this.logo.set(
            business.logo ?? null
          );

          // Save original data
          this.originalData = {
            ...business,
          };

          this.isLoading.set(false);
        },

        error: (error) => {

          console.error(
            'Failed to load business profile:',
            error
          );

          this.isLoading.set(false);

          this.toastService.error(
            'Load Failed',
            error?.error?.message ||
            'Unable to load business profile.'
          );
        },
      });
  }


  // =========================
  // EDIT / CANCEL BUTTON
  // =========================

  public toggleEdit(): void {

    if (this.isEditing()) {

      this.cancelEdit();

      return;
    }

    // Save current values before editing
    this.originalData = {
      id: '',
      businessName: this.businessName(),
      businessType: this.category(),
      address: this.address(),
      logo: this.logo(),
      ownerName: this.ownerName(),
      phone: this.phone(),
      email: this.email(),
    };

    this.isEditing.set(true);
  }


  // =========================
  // CATEGORY
  // =========================

  public selectCategory(
    category: string
  ): void {

    if (!this.isEditing()) {
      return;
    }

    this.category.set(category);
  }


  // =========================
  // SAVE
  // =========================

  public saveSettings(): void {

    if (this.isSaving()) {
      return;
    }

    const request: UpdateBusinessRequest = {

      businessName:
        this.businessName().trim(),

      businessType:
        this.category().trim(),

      address:
        this.address().trim(),

      logo:
        this.logo(),

      ownerName:
        this.ownerName().trim(),

      phone:
        this.phone().trim(),

      email:
        this.email().trim(),
    };

    // Basic validation
    if (!request.businessName) {

      this.toastService.warning(
        'Business Name Required',
        'Please enter your business name.'
      );

      return;
    }

    if (!request.businessType) {

      this.toastService.warning(
        'Business Type Required',
        'Please select your business category.'
      );

      return;
    }

    if (!request.ownerName) {

      this.toastService.warning(
        'Owner Name Required',
        'Please enter owner name.'
      );

      return;
    }

    if (!request.phone) {

      this.toastService.warning(
        'Phone Required',
        'Please enter mobile number.'
      );

      return;
    }

    this.isSaving.set(true);

    this.businessService
      .updateBusiness(request)
      .subscribe({

        next: () => {

          this.isSaving.set(false);

          this.isEditing.set(false);

          this.toastService.success(
            'Profile Updated',
            'Business profile updated successfully.'
          );

          // Reload fresh data from database
          this.loadBusiness();
        },

        error: (error) => {

          console.error(
            'Failed to update business profile:',
            error
          );

          this.isSaving.set(false);

          this.toastService.error(
            'Update Failed',
            error?.error?.message ||
            'Unable to update business profile.'
          );
        },
      });
  }


  // =========================
  // CANCEL
  // =========================

  public cancelEdit(): void {

    if (this.originalData) {

      this.businessName.set(
        this.originalData.businessName ?? ''
      );

      this.category.set(
        this.originalData.businessType ?? ''
      );

      this.address.set(
        this.originalData.address ?? ''
      );

      this.ownerName.set(
        this.originalData.ownerName ?? ''
      );

      this.phone.set(
        this.originalData.phone ?? ''
      );

      this.email.set(
        this.originalData.email ?? ''
      );

      this.logo.set(
        this.originalData.logo ?? null
      );
    }

    this.isEditing.set(false);
  }


  // =========================
  // LOGOUT
  // =========================

  public logout(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('businessId');

    window.location.href = '/login';
  }
}