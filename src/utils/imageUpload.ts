import { supabase } from '@/integrations/supabase/client';

const BUCKET_NAME = 'property-images';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export interface ImageUploadResult {
  url: string;
  path: string;
  variants?: {
    avif: Record<number, string>;
    webp: Record<number, string>;
  };
}

/**
 * Validates image file before upload
 */
export const validateImage = (file: File): string | null => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Solo se permiten imágenes JPG, PNG o WEBP';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'La imagen no debe superar los 10MB';
  }
  return null;
};

/**
 * Compresses and optimizes image before upload
 */
export const optimizeImage = (file: File, maxWidth = 1920, maxHeight = 1920, quality = 0.85): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          // Check if image has valid dimensions
          if (width === 0 || height === 0) {
            reject(new Error('La imagen no tiene dimensiones válidas. Intenta con otra imagen.'));
            return;
          }

          // Calculate new dimensions maintaining aspect ratio
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Error del navegador: No se pudo procesar la imagen. Intenta actualizar la página.'));
            return;
          }

          // Enable image smoothing for better quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Error al optimizar la imagen. El archivo puede estar dañado. Intenta con otra imagen.'));
              }
            },
            'image/webp', // Convert to WebP for better compression
            quality
          );
        } catch (err) {
          reject(new Error('Error al procesar la imagen. Verifica que el archivo no esté dañado.'));
        }
      };

      img.onerror = () => reject(new Error('Error al cargar la imagen. El archivo puede estar dañado o tener un formato inválido.'));
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo. Por favor intenta de nuevo.'));
  });
};

/**
 * Type for Supabase storage errors
 */
interface StorageError {
  message?: string;
  error?: string;
  statusCode?: string | number;
}

/**
 * Translates Supabase storage errors to user-friendly Spanish messages
 */
const getStorageErrorMessage = (error: StorageError | Error | unknown): string => {
  // Handle standard Error objects
  if (error instanceof Error) {
    return `Error al subir la imagen: ${error.message}`;
  }

  // Handle Supabase storage errors
  const storageError = error as StorageError;
  const errorMessage = storageError?.message?.toLowerCase() || '';
  const errorCode = storageError?.error || storageError?.statusCode || '';

  // Specific error cases
  if (errorMessage.includes('bucket') && errorMessage.includes('not found')) {
    return 'Error de configuración: El almacenamiento de imágenes no está configurado correctamente. Contacta al administrador.';
  }

  if (errorMessage.includes('permission') || errorMessage.includes('denied') || errorCode === '403') {
    return 'No tienes permisos para subir imágenes. Verifica que hayas iniciado sesión correctamente.';
  }

  if (errorMessage.includes('quota') || errorMessage.includes('storage limit')) {
    return 'Se ha alcanzado el límite de almacenamiento. Contacta al administrador.';
  }

  if (errorMessage.includes('already exists') || errorCode === '409') {
    return 'Esta imagen ya existe. Por favor intenta con otra imagen o renómbrala.';
  }

  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'Error de conexión. Verifica tu conexión a internet e intenta de nuevo.';
  }

  if (errorMessage.includes('timeout')) {
    return 'La carga de la imagen tardó demasiado. Intenta con una imagen más pequeña.';
  }

  if (errorMessage.includes('invalid') || errorMessage.includes('malformed')) {
    return 'El archivo de imagen está dañado o es inválido. Intenta con otra imagen.';
  }

  // If we have a Supabase error message, show it
  if (storageError?.message && typeof storageError.message === 'string') {
    return `Error al subir la imagen: ${storageError.message}`;
  }

  // Generic fallback
  return 'Error al subir la imagen. Por favor intenta de nuevo o contacta al administrador si el problema persiste.';
};

/**
 * Uploads an image to Supabase Storage and generates optimized variants
 */
export const uploadImage = async (file: File, propertyId?: string): Promise<ImageUploadResult> => {
  // Validate file
  const validationError = validateImage(file);
  if (validationError) {
    throw new Error(validationError);
  }

  try {
    // Optimize image
    const optimizedBlob = await optimizeImage(file);

    // Generate unique filename and image ID
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const imageId = `${timestamp}-${randomString}`;
    const extension = 'webp'; // Always use webp after optimization
    const fileName = propertyId
      ? `${propertyId}/${imageId}.${extension}`
      : `temp/${imageId}.${extension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, optimizedBlob, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase storage error:', error);
      throw new Error(getStorageErrorMessage(error));
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    // Generate optimized variants using edge function (only for property images)
    let variants;
    if (propertyId) {
      try {
        const { data: variantsData, error: variantsError } = await supabase.functions.invoke(
          'optimize-property-image',
          {
            body: {
              propertyId,
              imageId,
              imagePath: data.path
            }
          }
        );

        if (variantsError) {
          console.warn('Failed to generate variants, will use transform fallback:', variantsError);
        } else if (variantsData?.variants) {
          variants = variantsData.variants;
          console.log('Generated image variants:', variants);
        }
      } catch (err) {
        console.warn('Error calling optimization function, will use transform fallback:', err);
      }
    }

    return {
      url: publicUrl,
      path: data.path,
      variants
    };
  } catch (error) {
    // If the error is already from our validation or storage error handler, re-throw it
    if (error instanceof Error) {
      throw error;
    }

    // For unexpected errors, log and provide generic message
    console.error('Unexpected error uploading image:', error);
    throw new Error('Error inesperado al subir la imagen. Por favor intenta de nuevo o contacta al administrador.');
  }
};

/**
 * Deletes an image from Supabase Storage
 */
export const deleteImage = async (path: string): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Error al eliminar la imagen');
  }
};

/**
 * Deletes multiple images from Supabase Storage
 */
export const deleteImages = async (paths: string[]): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(paths);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting images:', error);
    throw new Error('Error al eliminar las imágenes');
  }
};

/**
 * Extracts storage path from public URL
 */
export const extractPathFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/property-images\/(.+)$/);
    return pathMatch ? pathMatch[1] : null;
  } catch {
    return null;
  }
};
