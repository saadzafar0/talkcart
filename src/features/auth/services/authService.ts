import { createServerSupabase } from '@/lib/supabase/server';
import { hashPassword, comparePassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/jwt';
import { RegisterRequest, LoginRequest, AuthResponse, UserPublic } from '../types';
import { validateRegister, validateLogin } from '../utils/validators';
import { AppError, ConflictError, ValidationError } from '@/lib/api/errors';

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const validation = validateRegister(data);
    if (!validation.valid) {
      throw new ValidationError(validation.errors.join(', '));
    }

    const supabase = createServerSupabase();

    // Check if user exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', data.email)
      .single();

    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const password_hash = await hashPassword(data.password);

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: data.email,
        password_hash,
        full_name: data.full_name || null,
        phone: data.phone || null,
      })
      .select('id, email, full_name, phone, role, created_at')
      .single();

    if (error || !user) {
      throw new AppError('Failed to create user', 500);
    }

    const token = await signToken({ userId: user.id, email: user.email, role: user.role });

    return { user, token };
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const validation = validateLogin(data);
    if (!validation.valid) {
      throw new ValidationError(validation.errors.join(', '));
    }

    const supabase = createServerSupabase();

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, phone, role, password_hash, created_at')
      .eq('email', data.email)
      .single();

    if (error || !user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isValid = await comparePassword(data.password, user.password_hash);
    if (!isValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = await signToken({ userId: user.id, email: user.email, role: user.role });

    const { password_hash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  },

  async getMe(userId: string): Promise<UserPublic> {
    const supabase = createServerSupabase();

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, phone, role, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new AppError('User not found', 404);
    }

    return user;
  },
};
