export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];

  if (!email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Invalid email format');
  }

  return { valid: errors.length === 0, errors };
}

export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];

  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) errors.push('Password must be at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('Password must contain an uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('Password must contain a lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('Password must contain a number');
  }

  return { valid: errors.length === 0, errors };
}

export function validateRegister(data: { email?: string; password?: string }): ValidationResult {
  const errors: string[] = [];

  const emailResult = validateEmail(data.email || '');
  const passwordResult = validatePassword(data.password || '');

  errors.push(...emailResult.errors, ...passwordResult.errors);

  return { valid: errors.length === 0, errors };
}

export function validateLogin(data: { email?: string; password?: string }): ValidationResult {
  const errors: string[] = [];

  if (!data.email) errors.push('Email is required');
  if (!data.password) errors.push('Password is required');

  return { valid: errors.length === 0, errors };
}
