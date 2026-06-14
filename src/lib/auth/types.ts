export interface AuthUser {
  userId: string; // Cognito sub (unique user ID)
  email?: string;
  phone?: string;
  name?: string;
}

export interface AuthResult {
  authenticated: boolean;
  user: AuthUser | null;
  error?: string;
}

export interface SignupRequest {
  email?: string;
  phone: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  username: string; // email or phone
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface VerifyOtpRequest {
  username: string;
  code: string;
}
