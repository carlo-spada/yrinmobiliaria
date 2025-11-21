import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Prevent infinite redirect loop
    if (!user || hasRedirected.current || authLoading) {
      return;
    }

    const checkUserRole = async () => {
      try {
        // Check user's role from role_assignments table
        const { data: roleData } = await supabase
          .from('role_assignments')
          .select('role')
          .eq('user_id', user.id)
          .single();

        // Mark as redirected before navigating
        hasRedirected.current = true;

        if (roleData) {
          // Redirect based on role
          if (roleData.role === 'admin' || roleData.role === 'superadmin') {
            navigate('/admin', { replace: true });
          } else {
            // Check if user has agent profile
            const { data: profileData } = await supabase
              .from('profiles')
              .select('agent_level')
              .eq('user_id', user.id)
              .single();

            if (profileData?.agent_level) {
              navigate('/agent/dashboard', { replace: true });
            } else {
              navigate('/cuenta', { replace: true });
            }
          }
        } else {
          // No role assigned, treat as regular user
          navigate('/cuenta', { replace: true });
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        hasRedirected.current = false; // Reset on error
      }
    };

    checkUserRole();
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    const emailValidation = emailSchema.safeParse(email);
    if (!emailValidation.success) {
      toast.error(emailValidation.error.errors[0].message);
      return;
    }

    // Validate password strength for signup
    if (!isLogin) {
      const passwordValidation = passwordSchema.safeParse(password);
      if (!passwordValidation.success) {
        toast.error(passwordValidation.error.errors[0].message);
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
