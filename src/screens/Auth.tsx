import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import { ConsentCheckbox } from '@/components/legal/ConsentCheckbox';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate, useSearchParams } from '@/lib/router-compat';
import { mapAuthError } from '@/utils/authErrors';
import { sanitizeRedirect } from '@/utils/safeRedirect';


const passwordSchema = z.string()
  .min(12, "La contraseña debe tener al menos 12 caracteres")
  .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
  .regex(/[a-z]/, "Debe contener al menos una minúscula")
  .regex(/[0-9]/, "Debe contener al menos un número")
  .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial");

const emailSchema = z.string().email("Email inválido");

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { role, loading: roleLoading } = useUserRole();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Prevent infinite redirect loop
    if (!user || hasRedirected.current || authLoading || roleLoading) {
      return;
    }

    const handleRedirect = () => {
      // Acepta el ?redirect= sólo si es una ruta interna de confianza (mismo
      // origen). Rechaza absolutas / protocol-relative (`//evil.com`) / backslash
      // para no convertirse en un open-redirect. Si no es de confianza, cae al
      // destino por rol más abajo.
      const safeRedirect = sanitizeRedirect(searchParams.get('redirect'));

      // Mark as redirected before navigating
      hasRedirected.current = true;

      if (safeRedirect) {
        navigate(safeRedirect, { replace: true });
        return;
      }

      // Redirect based on role hierarchy:
      // - Superadmin → /admin (full system access)
      // - Admin → /admin (org-scoped access)
      // - Agent → /admin (agent-scoped access)
      // - Regular user → /cuenta
      if (role === 'superadmin' || role === 'admin' || role === 'agent') {
        // Superadmins, Admins and Agents go to admin panel
        navigate('/admin', { replace: true });
      } else {
        // Regular users go to user dashboard
        navigate('/cuenta', { replace: true });
      }
    };

    handleRedirect();
  }, [user, authLoading, roleLoading, role, navigate, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    const emailValidation = emailSchema.safeParse(email);
    if (!emailValidation.success) {
      toast.error(emailValidation.error.issues[0].message);
      return;
    }

    // Validate password strength and data-processing consent for signup
    if (!isLogin) {
      const passwordValidation = passwordSchema.safeParse(password);
      if (!passwordValidation.success) {
        toast.error(passwordValidation.error.issues[0].message);
        return;
      }
      if (!consent) {
        toast.error(t.legal.consent.required);
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(mapAuthError(error));
        } else {
          toast.success('¡Sesión iniciada correctamente!');
          // Redirect will be handled by useEffect after user state updates
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          toast.error(mapAuthError(error));
        } else {
          toast.success('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.');
          // Redirect will be handled by useEffect after user state updates
        }
      }
    } catch (error) {
      toast.error(mapAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</CardTitle>
          <CardDescription>
            {isLogin
              ? 'Ingresa para ver tus favoritos y propiedades guardadas'
              : 'Crea una cuenta para guardar tus propiedades favoritas'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={12}
              />
              {!isLogin && password && (
                <PasswordStrengthIndicator password={password} />
              )}
            </div>
            {!isLogin && (
              <ConsentCheckbox checked={consent} onCheckedChange={setConsent} />
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
