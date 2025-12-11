import { Upload, X, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { uploadImage, deleteImage, extractPathFromUrl } from '@/utils/imageUpload';
import { logger } from '@/utils/logger';

/** Upload result tracking for better error reporting */
interface UploadAttempt {
  file: File;
  success: boolean;
  result?: {
    url: string;
    path: string;
    variants?: {
      avif: Record<number, string>;
      webp: Record<number, string>;
    };
  };
  error?: string;
}


interface ImageUploadZoneProps {
  images: Array<{
    url: string;
    path?: string;
    variants?: {
      avif: Record<number, string>;
      webp: Record<number, string>;
    };
  }>;
  onImagesChange: (images: Array<{
    url: string;
    path?: string;
    variants?: {
      avif: Record<number, string>;
      webp: Record<number, string>;
    };
  }>) => void;
  propertyId?: string;
  maxImages?: number;
}

export const ImageUploadZone = ({
  images,
  onImagesChange,
  propertyId,
  maxImages = 10
}: ImageUploadZoneProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files);

    // Check if adding these files would exceed max
    if (images.length + fileArray.length > maxImages) {
      toast.error(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    setUploading(true);
    const attempts: UploadAttempt[] = [];

    try {
      // Upload files sequentially to avoid overwhelming the server
      // Continues even if individual uploads fail (graceful degradation)
      for (const file of fileArray) {
        try {
          const result = await uploadImage(file, propertyId);
          attempts.push({ file, success: true, result });
        } catch (error) {
          attempts.push({
            file,
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido',
          });
        }
      }

      // Collect successful uploads
      const successfulUploads = attempts
        .filter((a): a is UploadAttempt & { result: NonNullable<UploadAttempt['result']> } =>
          a.success && !!a.result
        )
        .map(a => a.result);

      // Update state with successful uploads
      if (successfulUploads.length > 0) {
        onImagesChange([...images, ...successfulUploads]);
      }

      // Show comprehensive feedback
      const failedAttempts = attempts.filter(a => !a.success);

      if (failedAttempts.length > 0 && successfulUploads.length > 0) {
        // Partial success
        toast.warning(
          `${successfulUploads.length} imagen(es) subida(s), ${failedAttempts.length} fallida(s)`,
          {
            duration: 10000,
            description: failedAttempts.map(f => `${f.file.name}: ${f.error}`).join('\n'),
          }
        );
      } else if (failedAttempts.length > 0) {
        // All failed
        toast.error(
          `Error al subir ${failedAttempts.length} imagen(es)`,
          {
            duration: 10000,
            description: failedAttempts.map(f => `${f.file.name}: ${f.error}`).join('\n'),
          }
        );
      } else if (successfulUploads.length > 0) {
        // All succeeded
        toast.success(`${successfulUploads.length} imagen(es) subida(s) correctamente`);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageToRemove = images[index];

    try {
      // Extract path from URL if it's a storage URL
      const path = imageToRemove.path || extractPathFromUrl(imageToRemove.url);

      // Only delete from storage if it's a storage URL
      if (path && imageToRemove.url.includes('supabase.co')) {
        await deleteImage(path);
      }

      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
      toast.success('Imagen eliminada');
    } catch (error) {
      toast.error('Error al eliminar la imagen', { duration: 10000 });
      logger.error('Failed to delete image:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
          ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileInput}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Subiendo y optimizando imágenes...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="h-12 w-12 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Arrastra imágenes aquí o haz clic para seleccionar
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG o WEBP • Máximo 10MB por imagen • Hasta {maxImages} imágenes
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted"
            >
              <img
                src={image.url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback for broken images
                  e.currentTarget.src = '';
                  e.currentTarget.classList.add('hidden');
                }}
              />

              {/* Overlay with delete button */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                      className="shadow-lg"
                      aria-label={`Eliminar imagen ${index + 1}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Eliminar imagen</TooltipContent>
                </Tooltip>
              </div>

              {/* Image number badge */}
              <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Helper text */}
      {images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {images.length} de {maxImages} imágenes • Las imágenes se optimizan automáticamente al formato WebP
        </p>
      )}
    </div>
  );
};
