import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import * as z from "zod";

import { ImageUploadZone } from "@/components/admin/ImageUploadZone";
import { ProfileCompletionGuard } from "@/components/auth/ProfileCompletionGuard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useServiceZones } from "@/hooks/useServiceZones";
import { supabase } from "@/integrations/supabase/client";


const profileSchema = z.object({
  photo_url: z.string().url("Foto de perfil requerida"),
  languages: z.array(z.string()).min(1, "Selecciona al menos un idioma"),
  bio_es: z.string().min(50, "La biografía debe tener al menos 50 caracteres"),
  bio_en: z.string().optional(),
  phone: z.string().optional(),
  whatsapp_number: z.string().optional(),
  service_zones: z.array(z.string()).min(1, "Selecciona al menos una zona"),
  agent_specialty: z.array(z.string()).optional(),
  linkedin_url: z.string().url("URL inválida").optional().or(z.literal("")),
  instagram_handle: z.string().optional(),
  facebook_url: z.string().url("URL inválida").optional().or(z.literal("")),
}).refine(data => data.phone || data.whatsapp_number, {
  message: "Proporciona al menos teléfono o WhatsApp",
  path: ["phone"],
});

type ProfileFormData = z.infer<typeof profileSchema>;

function EditProfileContent() {
  const { user, profile } = useAuth();
  const { zones } = useServiceZones();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      photo_url: profile?.photo_url || "",
      languages: profile?.languages || ["es"],
      bio_es: profile?.bio_es || "",
      bio_en: profile?.bio_en || "",
      phone: profile?.phone || "",
      whatsapp_number: profile?.whatsapp_number || "",
      service_zones: profile?.service_zones || [],
      agent_specialty: profile?.agent_specialty || [],
      linkedin_url: profile?.linkedin_url || "",
      instagram_handle: profile?.instagram_handle || "",
      facebook_url: profile?.facebook_url || "",
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    if (profile) {
      setValue("photo_url", profile.photo_url || "");
      setValue("languages", profile.languages || ["es"]);
      setValue("bio_es", profile.bio_es || "");
      setValue("bio_en", profile.bio_en || "");
      setValue("phone", profile.phone || "");
      setValue("whatsapp_number", profile.whatsapp_number || "");
      setValue("service_zones", profile.service_zones || []);
      setValue("agent_specialty", profile.agent_specialty || []);
      setValue("linkedin_url", profile.linkedin_url || "");
      setValue("instagram_handle", profile.instagram_handle || "");
      setValue("facebook_url", profile.facebook_url || "");
    }
  }, [profile, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("user_id", user?.id);

      if (error) throw error;

      toast.success("Perfil actualizado exitosamente");
      navigate("/agent/dashboard");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error al actualizar el perfil");
    }
  };

  const handleImageUpload = async (files: File[]) => {
    if (files.length === 0) return;

    try {
      const file = files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("property-images")
        .upload(`agent-photos/${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("property-images")
        .getPublicUrl(`agent-photos/${fileName}`);

      setValue("photo_url", publicUrl);
      toast.success("Foto subida exitosamente");
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Error al subir la foto", { duration: 10000 });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/agent/dashboard" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al panel
          </Link>
        </Button>

        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-6">Editar Perfil</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Photo */}
            <div className="space-y-4">
              <Label>Foto de perfil</Label>
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={watchedValues.photo_url || undefined} />
                  <AvatarFallback>{profile?.display_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <ImageUploadZone 
                  images={watchedValues.photo_url ? [{ url: watchedValues.photo_url }] : []}
                  onImagesChange={(imgs) => {
                    if (imgs.length > 0) {
                      handleImageUpload([new File([], imgs[0].url)]);
                    }
                  }}
                />
              </div>
              {errors.photo_url && (
                <p className="text-sm text-destructive">{errors.photo_url.message}</p>
              )}
            </div>

            {/* Languages & Bio */}
            <div className="space-y-4">
              <div>
                <Label className="mb-3 block">Idiomas</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lang-es"
                      checked={watchedValues.languages?.includes("es")}
                      onCheckedChange={(checked) => {
                        const current = watchedValues.languages || [];
                        setValue("languages", checked 
                          ? [...current, "es"]
                          : current.filter(l => l !== "es")
                        );
                      }}
                    />
                    <label htmlFor="lang-es" className="cursor-pointer">Español</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lang-en"
                      checked={watchedValues.languages?.includes("en")}
                      onCheckedChange={(checked) => {
                        const current = watchedValues.languages || [];
                        setValue("languages", checked 
                          ? [...current, "en"]
                          : current.filter(l => l !== "en")
                        );
                      }}
                    />
                    <label htmlFor="lang-en" className="cursor-pointer">Inglés</label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="bio_es">Biografía en Español</Label>
                <Textarea
                  id="bio_es"
                  rows={6}
                  {...register("bio_es")}
                />
                {errors.bio_es && (
                  <p className="text-sm text-destructive mt-1">{errors.bio_es.message}</p>
                )}
              </div>

              {watchedValues.languages?.includes("en") && (
                <div>
                  <Label htmlFor="bio_en">Biografía en Inglés</Label>
                  <Textarea
                    id="bio_en"
                    rows={6}
                    {...register("bio_en")}
                  />
                </div>
              )}
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="font-semibold">Contacto</h3>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" type="tel" {...register("phone")} />
              </div>
              <div>
                <Label htmlFor="whatsapp_number">WhatsApp</Label>
                <Input id="whatsapp_number" type="tel" {...register("whatsapp_number")} />
              </div>
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            {/* Zones */}
            <div>
              <Label className="mb-3 block">Zonas de servicio</Label>
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-4">
                {zones?.map((zone) => (
                  <div key={zone.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={zone.id}
                      checked={watchedValues.service_zones?.includes(zone.id)}
                      onCheckedChange={(checked) => {
                        const current = watchedValues.service_zones || [];
                        setValue("service_zones", checked
                          ? [...current, zone.id]
                          : current.filter(id => id !== zone.id)
                        );
                      }}
                    />
                    <label htmlFor={zone.id} className="cursor-pointer">{zone.name_es}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="font-semibold">Redes sociales</h3>
              <div>
                <Label htmlFor="linkedin_url">LinkedIn</Label>
                <Input id="linkedin_url" {...register("linkedin_url")} />
              </div>
              <div>
                <Label htmlFor="instagram_handle">Instagram</Label>
                <Input id="instagram_handle" {...register("instagram_handle")} />
              </div>
              <div>
                <Label htmlFor="facebook_url">Facebook</Label>
                <Input id="facebook_url" {...register("facebook_url")} />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/agent/dashboard")}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar cambios
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function EditProfile() {
  return (
    <ProfileCompletionGuard>
      <EditProfileContent />
    </ProfileCompletionGuard>
  );
}
