export interface AuthResponse {
  isSuccess: boolean;
  message: string;
  token: string;
  refreshToken: string;
  expiresAtUtc: string | null;
}

export interface CurrentUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  roles: string[];
  stateAccount: string;
  barberShopId: number | null;
  barberId: number | null;
  customerId: number | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  role: 'Customer' | 'BarberShopOwner';
  nif?: string;
  address?: string;
  barberShopName?: string;
  barberShopAddress?: string;
}

export interface ProblemDetails {
  status?: number;
  title?: string;
  detail?: string;
  errorCode?: string;
  errors?: Record<string, string[]>;
}
