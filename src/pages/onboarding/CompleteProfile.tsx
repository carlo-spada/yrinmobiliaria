import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle, Upload } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as z from "zod";

import { ImageUploadZone } from "@/components/admin/ImageUploadZone";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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

const STEPS = [
  { id: 1, name: "Foto" },
  { id: 2, name: "Idiomas y Bio" },
  { id: 3, name: "Contacto" },
  { id: 4, name: "Zonas y Especialidades" },
  { id: 5, name: "Redes Sociales" },
];

export default function CompleteProfile() {
  const { user, profile } = useAuth();
  const { zones } = useServiceZones();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProfileFormData>({
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
  const progress = (currentStep / STEPS.length) * 100;

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...data,
          is_complete: true,
          completed_at: new Date().toISOString(),
        })
        .eq("user_id", user?.id ?? '');

      if (error) throw error;

      toast.success("¡Perfil completado exitosamente!");
      navigate("/agent/dashboard");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error al completar el perfil");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Completa tu perfil</h1>
            <p className="text-muted-foreground mb-4">
              Paso {currentStep} de {STEPS.length}: {STEPS[currentStep - 1].name}
            </p>
            <Progress value={progress} className="h-2" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Photo */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Avatar className="h-32 w-32 mx-auto mb-4">
                    <AvatarImage src={watchedValues.photo_url || undefined} />
                    <AvatarFallback>
                      <Upload className="h-12 w-12 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold mb-2">Foto de perfil</h2>
                  <p className="text-muted-foreground mb-4">
                    Sube una foto profesional que aparecerá en tu perfil público
                  </p>
                </div>
                <ImageUploadZone 
                  images={watchedValues.photo_url ? [{ url: watchedValues.photo_url }] : []}
                  onImagesChange={(imgs) => {
                    if (imgs.length > 0) {
                      handleImageUpload([new File([], imgs[0].url)]);
                    }
                  }}
                />
                {errors.photo_url && (
                  <p className="text-sm text-destructive">{errors.photo_url.message}</p>
                )}
              </div>
            )}

            {/* Step 2: Languages & Bio */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label className="mb-3 block">Idiomas que hablas *</Label>
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
                  {errors.languages && (
                    <p className="text-sm text-destructive mt-2">{errors.languages.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="bio_es">Biografía en Español *</Label>
                  <Textarea
                    id="bio_es"
                    placeholder="Describe tu experiencia, especialidades, etc. (mínimo 50 caracteres)"
                    rows={6}
                    {...register("bio_es")}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {watchedValues.bio_es?.length || 0} / 50 caracteres mínimos
                  </p>
                  {errors.bio_es && (
                    <p className="text-sm text-destructive mt-1">{errors.bio_es.message}</p>
                  )}
                </div>

                {watchedValues.languages?.includes("en") && (
                  <div>
                    <Label htmlFor="bio_en">Biografía en Inglés</Label>
                    <Textarea
                      id="bio_en"
                      placeholder="Describe your experience, specialties, etc."
                      rows={6}
                      {...register("bio_en")}
                    />
                    {errors.bio_en && (
                      <p className="text-sm text-destructive mt-1">{errors.bio_en.message}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Contact */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Información de contacto</h2>
                <p className="text-muted-foreground">Proporciona al menos uno (teléfono o WhatsApp)</p>
                
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(951) 123-4567"
                    {...register("phone")}
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp_number">WhatsApp</Label>
                  <Input
                    id="whatsapp_number"
                    type="tel"
                    placeholder="(951) 123-4567"
                    {...register("whatsapp_number")}
                  />
                </div>

                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>
            )}

            {/* Step 4: Zones & Specialties */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <Label className="mb-3 block">Zonas que cubres *</Label>
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
                        <label htmlFor={zone.id} className="cursor-pointer">
                          {zone.name_es}
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.service_zones && (
                    <p className="text-sm text-destructive mt-2">{errors.service_zones.message}</p>
                  )}
                </div>

                <div>
                  <Label className="mb-3 block">Especialidades (opcional)</Label>
                  <div className="space-y-2">
                    {["residential", "commercial", "luxury", "land"].map((specialty) => (
                      <div key={specialty} className="flex items-center space-x-2">
                        <Checkbox
                          id={specialty}
                          checked={watchedValues.agent_specialty?.includes(specialty)}
                          onCheckedChange={(checked) => {
                            const current = watchedValues.agent_specialty || [];
                            setValue("agent_specialty", checked
                              ? [...current, specialty]
                              : current.filter(s => s !== specialty)
                            );
                          }}
                        />
                        <label htmlFor={specialty} className="cursor-pointer capitalize">
                          {specialty === "residential" && "Residencial"}
                          {specialty === "commercial" && "Comercial"}
                          {specialty === "luxury" && "Propiedades de lujo"}
                          {specialty === "land" && "Terrenos"}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Social Links */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Redes sociales</h2>
                  <p className="text-muted-foreground">Opcional pero recomendado</p>
                </div>

                <div>
                  <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                  <Input
                    id="linkedin_url"
                    placeholder="https://linkedin.com/in/tu-perfil"
                    {...register("linkedin_url")}
                  />
                  {errors.linkedin_url && (
                    <p className="text-sm text-destructive mt-1">{errors.linkedin_url.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="instagram_handle">Instagram</Label>
                  <Input
                    id="instagram_handle"
                    placeholder="@tu_usuario"
                    {...register("instagram_handle")}
                  />
                </div>

                <div>
                  <Label htmlFor="facebook_url">Facebook URL</Label>
                  <Input
                    id="facebook_url"
                    placeholder="https://facebook.com/tu-perfil"
                    {...register("facebook_url")}
                  />
                  {errors.facebook_url && (
                    <p className="text-sm text-destructive mt-1">{errors.facebook_url.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Anterior
              </Button>

              {currentStep < STEPS.length ? (
                <Button type="button" onClick={nextStep}>
                  Siguiente
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Completar perfil
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
