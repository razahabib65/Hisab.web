import { Injectable, signal } from '@angular/core';
import { UserAuth, ShopProfile } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authState = signal<UserAuth>({
    isAuthenticated: true,
    phoneOrEmail: '0300 1234567',
    shopProfile: {
      shopName: 'Madina General Store',
      category: 'General Store / Karyana',
      cityAddress: 'Shop #14, Main Bazaar, Lahore',
      ownerName: 'Muhammad Raza',
      phone: '300 1234567',
      email: 'raza.madina@gmail.com',
    },
  });

  public readonly currentAuth = this.authState.asReadonly();

  public login(phoneOrEmail: string): void {
    this.authState.update((state) => ({
      ...state,
      isAuthenticated: true,
      phoneOrEmail,
    }));
  }

  public register(profile: ShopProfile): void {
    this.authState.set({
      isAuthenticated: true,
      phoneOrEmail: profile.phone,
      shopProfile: profile,
    });
  }

  public logout(): void {
    this.authState.update((state) => ({
      ...state,
      isAuthenticated: false,
    }));
  }
}
