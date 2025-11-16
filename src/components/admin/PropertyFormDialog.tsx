import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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

interface PropertyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: any;
}

export const PropertyFormDialog = ({ open, onOpenChange, property }: PropertyFormDialogProps) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  const propertyType = watch('type');
  const operation = watch('operation');
  const status = watch('status');

  useEffect(() => {
    if (property) {
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
        zone: property.location?.zone,
        neighborhood: property.location?.neighborhood,
        address: property.location?.address,
        lat: property.location?.coordinates?.lat,
        lng: property.location?.coordinates?.lng,
        bedrooms: property.features?.bedrooms,
        bathrooms: property.features?.bathrooms,
        parking: property.features?.parking,
        constructionArea: property.features?.constructionArea,
        landArea: property.features?.landArea,
        imageUrls: property.property_images?.map((img: any) => img.image_url).join('\n'),
      });
    } else {
      reset({
        type: 'casa',
        operation: 'venta',
        status: 'disponible',
        featured: false,
      });
    }
  }, [property, reset]);

  const mutation = useMutation({
    mutationFn: async (formData: any) => {
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
        location: {
          zone: formData.zone,
          neighborhood: formData.neighborhood,
          address: formData.address,
          coordinates: {
            lat: parseFloat(formData.lat),
            lng: parseFloat(formData.lng),
          },
        },
        features: {
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: parseInt(formData.bathrooms),
          parking: formData.parking ? parseInt(formData.parking) : null,
          constructionArea: parseFloat(formData.constructionArea),
          landArea: formData.landArea ? parseFloat(formData.landArea) : null,
        },
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
      if (formData.imageUrls) {
        // Delete existing images if updating
        if (property) {
          await supabase
            .from('property_images')
            .delete()
            .eq('property_id', property.id);
        }

        // Insert new images
        const imageUrls = formData.imageUrls.split('\n').filter((url: string) => url.trim());
        if (imageUrls.length > 0) {
          const images = imageUrls.map((url: string, index: number) => ({
            property_id: propertyId,
            image_url: url.trim(),
            display_order: index,
          }));

          const { error } = await supabase
            .from('property_images')
            .insert(images);

          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast.success(property ? 'Propiedad actualizada' : 'Propiedad creada correctamente');
      onOpenChange(false);
      reset();
    },
    onError: (error: any) => {
      toast.error('Error: ' + error.message);
    },
  });

  const onSubmit = (data: any) => {
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
              <Input id="title_es" {...register('title_es')} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title_en">Título (Inglés)</Label>
              <Input id="title_en" {...register('title_en')} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description_es">Descripción (Español)</Label>
              <Textarea id="description_es" {...register('description_es')} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description_en">Descripción (Inglés)</Label>
              <Textarea id="description_en" {...register('description_en')} rows={3} />
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
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio</Label>
              <Input id="price" type="number" {...register('price')} required />
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
                <Input id="zone" {...register('zone')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Colonia</Label>
                <Input id="neighborhood" {...register('neighborhood')} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" {...register('address')} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lat">Latitud</Label>
                <Input id="lat" type="number" step="any" {...register('lat')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng">Longitud</Label>
                <Input id="lng" type="number" step="any" {...register('lng')} required />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Características</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Recámaras</Label>
                <Input id="bedrooms" type="number" {...register('bedrooms')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Baños</Label>
                <Input id="bathrooms" type="number" {...register('bathrooms')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parking">Estacionamientos</Label>
                <Input id="parking" type="number" {...register('parking')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="constructionArea">Área de construcción (m²)</Label>
                <Input id="constructionArea" type="number" {...register('constructionArea')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="landArea">Área de terreno (m²)</Label>
                <Input id="landArea" type="number" {...register('landArea')} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrls">URLs de Imágenes (una por línea)</Label>
            <Textarea
              id="imageUrls"
              {...register('imageUrls')}
              rows={5}
              placeholder="https://ejemplo.com/imagen1.jpg&#10;https://ejemplo.com/imagen2.jpg"
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
