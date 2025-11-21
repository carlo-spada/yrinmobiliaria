import { logger } from './logger';

/**
 * Maps detailed Supabase auth errors to generic user-friendly messages
 * to prevent information leakage and user enumeration attacks
 */
export const mapAuthError = (error: unknown): string => {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  // Log detailed error for debugging (only in development)
  logger.error('Auth error', error);

  // Invalid credentials - don't reveal if user exists or password is wrong
  if (
    message.includes('invalid') || 
    message.includes('not found') ||
    message.includes('incorrect') ||
    message.includes('wrong')
  ) {
    return 'Credenciales incorrectas. Verifica tu email y contraseña.';
  }

  // Rate limiting
  if (message.includes('rate limit') || message.includes('too many')) {
    return 'Demasiados intentos. Por favor, intenta de nuevo más tarde.';
  }

  // Email already exists
  if (message.includes('already') || message.includes('duplicate')) {
    return 'Esta cuenta ya existe. Intenta iniciar sesión.';
  }

  // Weak password
  if (message.includes('password') && (message.includes('weak') || message.includes('short'))) {
    return 'La contraseña no cumple con los requisitos de seguridad.';
  }

  // Email confirmation required
  if (message.includes('confirm') || message.includes('verification')) {
    return 'Por favor, confirma tu email para continuar.';
  }

  // Generic fallback
  return 'Error de autenticación. Si el problema persiste, contacta a soporte.';
};
