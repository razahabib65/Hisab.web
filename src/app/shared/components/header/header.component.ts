import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  public readonly pageTitle = input<string>('Home');
  public readonly showBackButton = input<boolean>(false);
  public readonly backUrl = input<string>('/home');

  public readonly backClicked = output<void>();

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  public readonly currentAuth = this.authService.currentAuth;

  public handleBack(): void {
    if (this.showBackButton()) {
      this.backClicked.emit();
      this.router.navigateByUrl(this.backUrl());
    }
  }
}
