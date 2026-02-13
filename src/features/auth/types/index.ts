export interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'updated_at'>;
  token: string;
}

export interface UserPublic {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}
