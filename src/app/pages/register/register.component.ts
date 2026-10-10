import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  public readonly shopName = signal<string>('');
  public readonly selectedCategory = signal<string>('General Store / Karyana');
  public readonly cityAddress = signal<string>('');
  public readonly ownerName = signal<string>('');
  public readonly mobileNumber = signal<string>('');
  public readonly emailAddress = signal<string>('');
  public readonly password = signal<string>('');
  public readonly confirmPassword = signal<string>('');
  public readonly agreeTerms = signal<boolean>(false);
  public readonly showPassword = signal<boolean>(false);
  public readonly isLoading = signal<boolean>(false);

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  public readonly categories = [
    'General Store / Karyana',
    'Wholesale & Traders',
    'Pharmacy / Medical',
    'Milk & Dairy',
    'Textiles / Cloth',
    'Other',
  ];

  public selectCategory(cat: string): void {
    this.selectedCategory.set(cat);
  }

  public toggleShowPassword(): void {
    this.showPassword.update((v) => !v);
  }

  public onRegister(): void {
    if (
      !this.shopName() ||
      !this.ownerName() ||
      !this.mobileNumber() ||
      !this.password() ||
      !this.confirmPassword() ||
      !this.agreeTerms()
    ) {
      this.toastService.warning('Missing Fields', 'Please fill all required fields and agree to Terms.');
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      this.toastService.warning('Password Mismatch', 'Passwords do not match. Please try again.');
      return;
    }

    this.isLoading.set(true);

    const formData = new FormData();

    formData.append('BusinessName', this.shopName());
    formData.append('BusinessType', this.selectedCategory());
    formData.append('Address', this.cityAddress());
    formData.append('OwnerName', this.ownerName());
    formData.append('Phone', this.mobileNumber());
    formData.append('Email', this.emailAddress());
    formData.append('Password', this.password());
    formData.append('ConfirmPassword', this.confirmPassword());

    console.log('Calling Register API...');

    this.authService.register(formData).subscribe({
      next: (response) => {
        console.log('REGISTER SUCCESS:', response);
        this.isLoading.set(false);
        this.router.navigateByUrl('/login');
      },

      error: (error) => {
        console.error('REGISTER ERROR:', error);
        this.isLoading.set(false);
        this.toastService.error(
          'Registration Failed',
          error?.error?.message || 'Please check your information and try again.'
        );
      },
    });
  }
}

