import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  public readonly phoneOrEmail = signal<string>('0300 1234567');
  public readonly password = signal<string>('');
  public readonly showPassword = signal<boolean>(false);
  public readonly rememberShop = signal<boolean>(true);
  public readonly selectedLanguage = signal<'en' | 'ur'>('en');

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  public togglePasswordVisibility(): void {
    this.showPassword.update((val) => !val);
  }

  public setLanguage(lang: 'en' | 'ur'): void {
    this.selectedLanguage.set(lang);
  }

  public onLogin(): void {
    this.authService.login(this.phoneOrEmail());
    this.router.navigateByUrl('/dashboard');
  }
}
