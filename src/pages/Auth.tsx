import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { z } from 'zod';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';
import { mapAuthError } from '@/utils/authErrors';
import { supabase } from '@/integrations/supabase/client';

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
  const [loading, setLoading] = useState(false);
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
      // Check for redirect parameter
      const redirectTo = searchParams.get('redirect');

      // Mark as redirected before navigating
      hasRedirected.current = true;

      // If there's a redirect parameter, use it (for admin/protected routes)
      if (redirectTo && redirectTo.startsWith('/')) {
        navigate(redirectTo, { replace: true });
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

    // Validate password strength for signup
    if (!isLogin) {
      const passwordValidation = passwordSchema.safeParse(password);
      if (!passwordValidation.success) {
        toast.error(passwordValidation.error.issues[0].message);
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
