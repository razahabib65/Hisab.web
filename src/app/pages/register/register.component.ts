import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

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

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

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
    if (!this.shopName() || !this.ownerName() || !this.mobileNumber() || !this.password()) {
      return;
    }

    this.authService.register({
      shopName: this.shopName(),
      category: this.selectedCategory(),
      cityAddress: this.cityAddress(),
      ownerName: this.ownerName(),
      phone: `0${this.mobileNumber()}`,
      email: this.emailAddress() || undefined,
    });

    this.router.navigateByUrl('/dashboard');
  }
}
