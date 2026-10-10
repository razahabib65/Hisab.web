import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  public readonly phoneOrEmail = signal<string>('');
  public readonly password = signal<string>('');
  public readonly showPassword = signal<boolean>(false);
  public readonly rememberShop = signal<boolean>(true);
  public readonly selectedLanguage = signal<'en' | 'ur'>('en');
  public readonly isLoading = signal<boolean>(false);

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  public togglePasswordVisibility(): void {
    this.showPassword.update((val) => !val);
  }

  public setLanguage(lang: 'en' | 'ur'): void {
    this.selectedLanguage.set(lang);
  }

  public onLogin(): void {
    if (!this.phoneOrEmail() || !this.password()) {
      this.toastService.warning('Missing Fields', 'Please enter your mobile/email and password.');
      return;
    }

    this.isLoading.set(true);
    this.authService.login(
      this.phoneOrEmail(),
      this.password()
    ).subscribe({
      next: (response: any) => {
        console.log('LOGIN SUCCESS:', response);

        // JWT token save
        localStorage.setItem('token', response.token);

        // User information save
        if (response.userId) {
          localStorage.setItem('userId', response.userId);
        }

        if (response.businessId) {
          localStorage.setItem('businessId', response.businessId);
        }

        this.isLoading.set(false);
        this.router.navigateByUrl('/dashboard');
      },

      error: (error) => {
        console.error('LOGIN ERROR:', error);
        this.isLoading.set(false);
        this.toastService.error(
          'Login Failed',
          error?.error?.message || 'Please check your credentials and try again.'
        );
      },
    });
  }
}
