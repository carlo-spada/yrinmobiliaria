import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

const passwordSchema = z.string()
  .min(12, "La contraseña debe tener al menos 12 caracteres")
  .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
  .regex(/[a-z]/, "Debe contener al menos una minúscula")
  .regex(/[0-9]/, "Debe contener al menos un número")
  .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial");

// Single-tenant: invitations no longer carry an organization. The whole flow
// goes through the accept-agent-invitation edge function (service-role), since
// agent_invitations and role_assignments are admin-only via RLS and the invitee
// has no session yet.
interface InvitationPreview {
  email: string;
  display_name: string | null;
}

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [invitation, setInvitation] = useState<InvitationPreview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const validateInvitation = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase.functions.invoke(
        "accept-agent-invitation",
        { body: { token } }
      );

      if (fetchError || !data || data.error) {
        setError(data?.error || "Invitación no encontrada");
        return;
      }

      setInvitation({ email: data.email, display_name: data.display_name ?? null });
    } catch (err) {
      logger.error("Error validating invitation:", err);
      setError("Error al validar la invitación");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setError("Token de invitación no válido");
      setIsLoading(false);
      return;
    }

    validateInvitation();
  }, [token, validateInvitation]);

  const handleAccept = async () => {
    if (!invitation || !token) {
      toast.error("Invitación no válida");
      return;
    }

    const passwordValidation = passwordSchema.safeParse(password);
    if (!passwordValidation.success) {
      toast.error(passwordValidation.error.issues[0].message);
      return;
    }

    setIsProcessing(true);
    try {
      // Create the account + agent role server-side (service-role).
      const { data, error: acceptError } = await supabase.functions.invoke(
        "accept-agent-invitation",
        { body: { token, password } }
      );

      if (acceptError || !data || data.error) {
        throw new Error(data?.error || acceptError?.message || "Error al aceptar la invitación");
      }

      // Sign the freshly created agent in.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: invitation.email,
        password,
      });
      if (signInError) throw signInError;

      toast.success("¡Invitación aceptada! Completa tu perfil para comenzar.");
      navigate("/onboarding/complete-profile");
    } catch (err) {
      logger.error("Error accepting invitation:", err);
      const errorMessage = err instanceof Error ? err.message : "Error al aceptar la invitación";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Card className="w-full max-w-md p-8">
          <div className="text-center space-y-4">
            <XCircle className="h-16 w-16 mx-auto text-destructive" />
            <h1 className="text-2xl font-bold">Invitación no válida</h1>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => navigate("/")} className="w-full">
              Volver al inicio
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Card className="w-full max-w-md p-8">
        <div className="text-center space-y-2 mb-6">
          <CheckCircle2 className="h-16 w-16 mx-auto text-primary" />
          <h1 className="text-2xl font-bold">Invitación a YR Inmobiliaria</h1>
          <p className="text-muted-foreground">
            Te invitaron para unirte al equipo como agente inmobiliario
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <h2 className="font-semibold mb-2">Información de la invitación:</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><strong>Email:</strong> {invitation?.email}</li>
              {invitation?.display_name && (
                <li><strong>Nombre:</strong> {invitation.display_name}</li>
              )}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="font-semibold mb-4">Crear tu cuenta</h2>
            <div className="space-y-3">
              <div>
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={invitation?.email || ""}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 12 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isProcessing}
                  minLength={12}
                />
                {password && <PasswordStrengthIndicator password={password} />}
              </div>
            </div>
          </div>

          <Button
            onClick={handleAccept}
            disabled={isProcessing || password.length < 12}
            className="w-full"
          >
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear cuenta y continuar
          </Button>
        </div>
      </Card>
    </div>
  );
}
