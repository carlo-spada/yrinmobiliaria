import { supabase } from '@/integrations/supabase/client';

const BUCKET_NAME = 'property-images';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export interface ImageUploadResult {
  url: string;
  path: string;
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
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
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
          reject(new Error('No se pudo crear el contexto del canvas'));
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
              reject(new Error('Error al optimizar la imagen'));
            }
          },
          'image/webp', // Convert to WebP for better compression
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Error al cargar la imagen'));
    };
    
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
  });
};

/**
 * Uploads an image to Supabase Storage
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
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = 'webp'; // Always use webp after optimization
    const fileName = propertyId 
      ? `${propertyId}/${timestamp}-${randomString}.${extension}`
      : `temp/${timestamp}-${randomString}.${extension}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, optimizedBlob, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);
    
    return {
      url: publicUrl,
      path: data.path
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Error al subir la imagen. Por favor intenta de nuevo.');
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
