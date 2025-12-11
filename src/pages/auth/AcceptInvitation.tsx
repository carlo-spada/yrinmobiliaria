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
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { logger } from "@/utils/logger";

const passwordSchema = z.string()
  .min(12, "La contraseña debe tener al menos 12 caracteres")
  .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
  .regex(/[a-z]/, "Debe contener al menos una minúscula")
  .regex(/[0-9]/, "Debe contener al menos un número")
  .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial");

type AgentInvitation = Database['public']['Tables']['agent_invitations']['Row'] & {
  organization: Database['public']['Tables']['organizations']['Row'] | null;
};

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  useAuth(); // Initialize auth context
  const token = searchParams.get("token");

  const [invitation, setInvitation] = useState<AgentInvitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const validateInvitation = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("agent_invitations")
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq("token", token ?? '')
        .single();

      if (fetchError || !data) {
        setError("Invitación no encontrada");
        return;
      }

      // Check if expired
      if (new Date(data.expires_at) < new Date()) {
        setError("Esta invitación ha expirado");
        return;
      }

      // Check if already accepted
      if (data.accepted_at) {
        setError("Esta invitación ya ha sido aceptada");
        return;
      }

      setInvitation(data);
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
    if (!invitation) {
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
      // Sign up user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invitation.email,
        password: password,
        options: {
          data: {
            display_name: invitation.display_name || invitation.email.split("@")[0],
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("No user created");

      // Create profile with agent role
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          user_id: authData.user.id,
          organization_id: invitation.organization_id,
          display_name: invitation.display_name || invitation.email.split("@")[0],
          email: invitation.email,
          phone: invitation.phone,
          service_zones: invitation.service_zones,
          role: "agent",
          is_complete: false,
          invited_by: invitation.invited_by,
          invited_at: invitation.invited_at,
        });

      if (profileError) throw profileError;

      // Mark invitation as accepted
      const { error: updateError } = await supabase
        .from("agent_invitations")
        .update({
          accepted_at: new Date().toISOString(),
          accepted_by: authData.user.id,
        })
        .eq("id", invitation.id);

      if (updateError) throw updateError;

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
          <h1 className="text-2xl font-bold">Invitación a {invitation?.organization?.name}</h1>
          <p className="text-muted-foreground">
            Te invitaron para unirte al equipo como agente inmobiliario
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <h2 className="font-semibold mb-2">Información de la invitación:</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><strong>Email:</strong> {invitation?.email}</li>
              <li><strong>Organización:</strong> {invitation?.organization?.name}</li>
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
