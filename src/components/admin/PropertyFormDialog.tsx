import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { logAuditEvent } from '@/utils/auditLog';
import { ImageUploadZone } from './ImageUploadZone';
import { useState } from 'react';
import { Database } from '@/integrations/supabase/types';

type PropertyWithRelations = Database['public']['Tables']['properties']['Row'] & {
  property_images?: Array<{ image_url: string; display_order: number }>;
  agent?: { id: string; display_name: string } | null;
};

type PropertyFormData = z.infer<typeof propertyFormSchema>;

// eslint-disable-next-line react-refresh/only-export-components
export const propertyFormSchema = z.object({
  title_es: z.string().min(1, 'Título en español es requerido').max(200, 'Título debe tener máximo 200 caracteres'),
  title_en: z.string().min(1, 'Título en inglés es requerido').max(200, 'Título debe tener máximo 200 caracteres'),
  description_es: z.string().max(2000, 'Descripción debe tener máximo 2000 caracteres').optional(),
  description_en: z.string().max(2000, 'Descripción debe tener máximo 2000 caracteres').optional(),
  type: z.enum(['casa', 'departamento', 'local', 'oficina', 'terrenos']),
  operation: z.enum(['venta', 'renta']),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Precio debe ser mayor a 0',
  }),
  status: z.enum(['disponible', 'vendida', 'rentada', 'pendiente']),
  featured: z.boolean(),
  zone: z.string().min(1, 'Zona es requerida').max(100),
  neighborhood: z.string().min(1, 'Colonia es requerida').max(100),
  address: z.string().min(1, 'Dirección es requerida').max(200),
  lat: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 15.6 && parseFloat(val) <= 18.7,
    {
      message: 'Las coordenadas deben estar dentro del estado de Oaxaca (lat: 15.6-18.7)',
    }
  ),
  lng: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= -98.6 && parseFloat(val) <= -93.8,
    {
      message: 'Las coordenadas deben estar dentro del estado de Oaxaca (lng: -98.6--93.8)',
    }
  ),
  bedrooms: z.string().refine((val) => val === '' || (!isNaN(parseInt(val)) && parseInt(val) >= 0 && parseInt(val) <= 50), {
    message: 'Recámaras debe estar entre 0 y 50',
  }).optional(),
  bathrooms: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0 && parseInt(val) <= 50, {
    message: 'Baños debe estar entre 0 y 50',
  }),
  parking: z.string().refine((val) => val === '' || (!isNaN(parseInt(val)) && parseInt(val) >= 0 && parseInt(val) <= 50), {
    message: 'Estacionamientos debe estar entre 0 y 50',
  }).optional(),
  constructionArea: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Área de construcción debe ser mayor a 0',
  }),
  landArea: z.string().refine((val) => val === '' || (!isNaN(parseFloat(val)) && parseFloat(val) > 0), {
    message: 'Área de terreno debe ser mayor a 0',
  }).optional(),
});

interface PropertyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: PropertyWithRelations;
}

export const PropertyFormDialog = ({ open, onOpenChange, property }: PropertyFormDialogProps) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(propertyFormSchema),
  });

  const [images, setImages] = useState<Array<{ 
    url: string; 
    path?: string;
    variants?: {
      avif: Record<number, string>;
      webp: Record<number, string>;
    };
  }>>([]);

  const propertyType = watch('type');
  const operation = watch('operation');
  const status = watch('status');
  const zone = watch('zone');

  // Fetch available zones from database
  const { data: zones = [], isLoading: zonesLoading } = useQuery({
    queryKey: ['service-zones-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_zones')
        .select('name_es')
        .eq('active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    if (property) {
      const location = property.location as { zone?: string; neighborhood?: string; address?: string; coordinates?: { lat: number; lng: number } } | null;
      const features = property.features as { bedrooms?: number; bathrooms?: number; parking?: number; constructionArea?: number; landArea?: number } | null;
      
      reset({
        title_es: property.title_es,
        title_en: property.title_en,
        description_es: property.description_es,
        description_en: property.description_en,
        type: property.type,
        operation: property.operation,
        price: property.price,
        status: property.status,
        featured: property.featured,
        zone: location?.zone,
        neighborhood: location?.neighborhood,
        address: location?.address,
        lat: location?.coordinates?.lat,
        lng: location?.coordinates?.lng,
        bedrooms: features?.bedrooms,
        bathrooms: features?.bathrooms,
        parking: features?.parking,
        constructionArea: features?.constructionArea,
        landArea: features?.landArea,
      });
      
      // Load existing images
      if (property.property_images && Array.isArray(property.property_images)) {
        setImages(property.property_images.map((img) => ({ url: img.image_url })));
      }
    } else {
      reset({
        type: 'casa',
        operation: 'venta',
        status: 'disponible',
        featured: false,
      });
      setImages([]);
    }
  }, [property, reset]);

  const mutation = useMutation({
    mutationFn: async (formData: PropertyFormData) => {
      // Validate that zone exists in service_zones table
      const { data: zoneExists, error: zoneError } = await supabase
        .from('service_zones')
        .select('id')
        .eq('name_es', formData.zone)
        .eq('active', true)
        .maybeSingle();
      
      if (zoneError) {
        throw new Error('Error al validar la zona');
      }
      
      if (!zoneExists) {
        throw new Error('La zona seleccionada no existe o no está activa. Por favor actualiza la página.');
      }
      
      // Validate that we have at least one image
      if (images.length === 0) {
        throw new Error('Debes subir al menos una imagen');
      }

      // Get YR organization ID
      const { data: yrOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', 'yr-inmobiliaria')
        .single();
      
      if (!yrOrg) {
        throw new Error('Organization not found');
      }

      // Get current user's profile to auto-assign as agent (only for new properties)
      let agentId = null;
      
      if (!property) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();
          
          agentId = profile?.id || null;
        }
      }

      const propertyData = {
        title_es: formData.title_es,
        title_en: formData.title_en,
        description_es: formData.description_es,
        description_en: formData.description_en,
        type: formData.type,
        operation: formData.operation,
        price: parseFloat(formData.price),
        status: formData.status,
        featured: formData.featured,
        organization_id: yrOrg.id,
        ...(agentId && { agent_id: agentId }),
        location: {
          zone: formData.zone,
          neighborhood: formData.neighborhood || '',
          address: formData.address || '',
          coordinates: {
            lat: parseFloat(formData.lat),
            lng: parseFloat(formData.lng),
          },
        },
        features: {
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseFloat(formData.bathrooms),
          parking: parseInt(formData.parking),
          constructionArea: formData.constructionArea ? parseFloat(formData.constructionArea) : null,
          landArea: formData.landArea ? parseFloat(formData.landArea) : null,
        },
        image_variants: images.map((img, index) => ({
          id: img.path || `image-${index}`,
          variants: img.variants || { avif: {}, webp: {} },
          alt_es: `${formData.title_es} - Imagen ${index + 1}`,
          alt_en: `${formData.title_en} - Image ${index + 1}`,
          order: index,
        })),
      };

      let propertyId = property?.id;

      if (property) {
        const { error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', property.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('properties')
          .insert([propertyData])
          .select()
          .single();

        if (error) throw error;
        propertyId = data.id;
      }

      // Handle images
      // Delete existing images if updating
      if (property) {
        await supabase
          .from('property_images')
          .delete()
          .eq('property_id', property.id);
      }

      // Insert all images
      if (images.length > 0) {
        const imageRecords = images.map((image, index) => ({
          property_id: propertyId,
          image_url: image.url,
          display_order: index,
          alt_text_es: `${formData.title_es} - Imagen ${index + 1}`,
          alt_text_en: `${formData.title_en} - Image ${index + 1}`,
        }));

        const { error } = await supabase
          .from('property_images')
          .insert(imageRecords);

        if (error) throw error;
      }

      // Log audit event
      await logAuditEvent({
        action: property ? 'UPDATE_PROPERTY' : 'CREATE_PROPERTY',
        table_name: 'properties',
        record_id: propertyId,
        changes: {
          title: formData.title_es,
          type: formData.type,
          operation: formData.operation,
          price: formData.price
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast.success(property ? 'Propiedad actualizada' : 'Propiedad creada correctamente');
      onOpenChange(false);
      reset();
      setImages([]);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error('Error: ' + errorMessage);
    },
  });

  const onSubmit = (data: PropertyFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {property ? 'Editar Propiedad' : 'Nueva Propiedad'}
          </DialogTitle>
          <DialogDescription>
            Completa la información de la propiedad
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title_es">Título (Español)</Label>
              <Input id="title_es" {...register('title_es')} />
              {errors.title_es && <p className="text-sm text-destructive">{errors.title_es.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="title_en">Título (Inglés)</Label>
              <Input id="title_en" {...register('title_en')} />
              {errors.title_en && <p className="text-sm text-destructive">{errors.title_en.message as string}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description_es">Descripción (Español)</Label>
              <Textarea id="description_es" {...register('description_es')} rows={3} />
              {errors.description_es && <p className="text-sm text-destructive">{errors.description_es.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description_en">Descripción (Inglés)</Label>
              <Textarea id="description_en" {...register('description_en')} rows={3} />
              {errors.description_en && <p className="text-sm text-destructive">{errors.description_en.message as string}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={propertyType} onValueChange={(value) => setValue('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casa">Casa</SelectItem>
                  <SelectItem value="departamento">Departamento</SelectItem>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="oficina">Oficina</SelectItem>
                  <SelectItem value="terrenos">Terrenos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="operation">Operación</Label>
              <Select value={operation} onValueChange={(value) => setValue('operation', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="venta">Venta</SelectItem>
                  <SelectItem value="renta">Renta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={status} onValueChange={(value) => setValue('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponible">Disponible</SelectItem>
                  <SelectItem value="vendida">Vendida</SelectItem>
                  <SelectItem value="rentada">Rentada</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio</Label>
              <Input id="price" type="number" {...register('price')} />
              {errors.price && <p className="text-sm text-destructive">{errors.price.message as string}</p>}
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <input
                type="checkbox"
                id="featured"
                {...register('featured')}
                className="h-4 w-4"
              />
              <Label htmlFor="featured">Destacada</Label>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Ubicación</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zone">Zona</Label>
                <Select value={zone} onValueChange={(value) => setValue('zone', value)} disabled={zonesLoading || zones.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder={zonesLoading ? "Cargando zonas..." : zones.length === 0 ? "No hay zonas disponibles" : "Selecciona una zona"} />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((z) => (
                      <SelectItem key={z.name_es} value={z.name_es}>
                        {z.name_es}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.zone && <p className="text-sm text-destructive">{errors.zone.message as string}</p>}
                {zones.length === 0 && !zonesLoading && (
                  <p className="text-xs text-muted-foreground">Primero debes crear zonas en la sección de Zonas</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Colonia</Label>
                <Input id="neighborhood" {...register('neighborhood')} />
                {errors.neighborhood && <p className="text-sm text-destructive">{errors.neighborhood.message as string}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" {...register('address')} />
              {errors.address && <p className="text-sm text-destructive">{errors.address.message as string}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lat">Latitud</Label>
                <Input id="lat" type="number" step="any" {...register('lat')} />
                {errors.lat && <p className="text-sm text-destructive">{errors.lat.message as string}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng">Longitud</Label>
                <Input id="lng" type="number" step="any" {...register('lng')} />
                {errors.lng && <p className="text-sm text-destructive">{errors.lng.message as string}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Características</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Recámaras</Label>
                <Input id="bedrooms" type="number" {...register('bedrooms')} />
                {errors.bedrooms && <p className="text-sm text-destructive">{errors.bedrooms.message as string}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Baños</Label>
                <Input id="bathrooms" type="number" {...register('bathrooms')} />
                {errors.bathrooms && <p className="text-sm text-destructive">{errors.bathrooms.message as string}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="parking">Estacionamientos</Label>
                <Input id="parking" type="number" {...register('parking')} />
                {errors.parking && <p className="text-sm text-destructive">{errors.parking.message as string}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="constructionArea">Área de construcción (m²)</Label>
                <Input id="constructionArea" type="number" {...register('constructionArea')} />
                {errors.constructionArea && <p className="text-sm text-destructive">{errors.constructionArea.message as string}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="landArea">Área de terreno (m²)</Label>
                <Input id="landArea" type="number" {...register('landArea')} />
                {errors.landArea && <p className="text-sm text-destructive">{errors.landArea.message as string}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Imágenes de la Propiedad</Label>
            <ImageUploadZone
              images={images}
              onImagesChange={setImages}
              propertyId={property?.id}
              maxImages={10}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : property ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
