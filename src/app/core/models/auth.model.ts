export interface ShopProfile {
  shopName: string;
  category: string;
  cityAddress: string;
  ownerName: string;
  phone: string;
  email?: string;
  logoUrl?: string;
}

export interface UserAuth {
  isAuthenticated: boolean;
  phoneOrEmail: string;
  shopProfile: ShopProfile;
}
