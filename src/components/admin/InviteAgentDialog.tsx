import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useServiceZones } from "@/hooks/useServiceZones";
import { supabase } from "@/integrations/supabase/client";




const inviteSchema = z.object({
  email: z.string().email("Email inválido"),
  display_name: z.string().optional(),
  phone: z.string().optional(),
  service_zones: z.array(z.string()).optional(),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteAgentDialog({ open, onOpenChange }: InviteAgentDialogProps) {
  const { user, profile } = useAuth();
  const { zones } = useServiceZones();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      display_name: "",
      phone: "",
      service_zones: [],
    },
  });

  const onSubmit = async (data: InviteFormData) => {
    if (!user || !profile?.organization_id) return;

    setIsSubmitting(true);
    try {
      // Check if email already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', data.email)
        .single();

      if (existingProfile) {
        toast.error("Este correo ya está registrado");
        return;
      }

      // Check if already invited
      const { data: existingInvite } = await supabase
        .from('agent_invitations')
        .select('id')
        .eq('email', data.email)
        .eq('organization_id', profile.organization_id)
        .is('accepted_at', null)
        .single();

      if (existingInvite) {
        toast.error("Ya existe una invitación pendiente para este correo");
        return;
      }

      // Create invitation
      const { data: invitation, error: inviteError } = await supabase
        .from('agent_invitations')
        .insert({
          organization_id: profile.organization_id,
          email: data.email,
          display_name: data.display_name || null,
          phone: data.phone || null,
          service_zones: data.service_zones && data.service_zones.length > 0 ? data.service_zones : null,
          invited_by: user.id,
        })
        .select()
        .single();

      if (inviteError) throw inviteError;

      // Send invitation email
      const { error: emailError } = await supabase.functions.invoke('send-agent-invitation', {
        body: { invitation_id: invitation.id },
      });

      if (emailError) {
        console.error("Error sending email:", emailError);
        toast.error("Invitación creada pero hubo un error al enviar el correo");
      } else {
        toast.success(`Invitación enviada a ${data.email}`);
      }

      // Refresh agents list
      queryClient.invalidateQueries({ queryKey: ['agents'] });

      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating invitation:", error);
      toast.error("Error al crear la invitación");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invitar Agente</DialogTitle>
          <DialogDescription>
            Envía una invitación para que un agente se una a tu equipo.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="agente@ejemplo.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Juan Pérez"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="(951) 123-4567"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="service_zones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zonas de servicio (opcional)</FormLabel>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                    {zones?.map((zone) => (
                      <div key={zone.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={zone.id}
                          checked={field.value?.includes(zone.id)}
                          onCheckedChange={(checked) => {
                            const current = field.value || [];
                            const updated = checked
                              ? [...current, zone.id]
                              : current.filter((id) => id !== zone.id);
                            field.onChange(updated);
                          }}
                        />
                        <label
                          htmlFor={zone.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {zone.name_es}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Invitación
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
