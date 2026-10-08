import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { UserAuth, ShopProfile } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly apiUrl = environment.apiUrl

  private readonly authState = signal<UserAuth>({
    isAuthenticated: false,
    phoneOrEmail: '',
    shopProfile: {
      shopName: '',
      category: '',
      cityAddress: '',
      ownerName: '',
      phone: '',
      email: '',
    },
  });

  public readonly currentAuth = this.authState.asReadonly();

  constructor(private http: HttpClient) { }

  register(formData: FormData) {
    return this.http.post(`${this.apiUrl}/auth/register`, formData);
  }

  login(email: string, password: string) {
    return this.http.post(
      `${this.apiUrl}/auth/login`,
      { email, password, }
    );
  }

  logout(): void {
    this.authState.update((state) => ({
      ...state,
      isAuthenticated: false,
    }));
  }
}