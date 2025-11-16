import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/hooks/useFavorites';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface FavoriteButtonProps {
  propertyId: string;
  variant?: 'icon' | 'button';
  className?: string;
}

export function FavoriteButton({ propertyId, variant = 'icon', className }: FavoriteButtonProps) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toast } = useToast();
  const { t } = useTranslation();
  const favorite = isFavorite(propertyId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toggleFavorite(propertyId);
    
    toast({
      title: favorite 
        ? t('favorites.removed', 'Eliminado de favoritos')
        : t('favorites.added', 'Agregado a favoritos'),
      duration: 2000,
    });
  };

  if (variant === 'button') {
    return (
      <Button
        variant={favorite ? 'default' : 'outline'}
        onClick={handleClick}
        className={className}
      >
        <Heart
          className={cn(
            'h-4 w-4 mr-2',
            favorite && 'fill-current'
          )}
        />
        {favorite 
          ? t('favorites.remove', 'Eliminar de favoritos')
          : t('favorites.add', 'Agregar a favoritos')
        }
      </Button>
    );
  }

  return (
    <motion.button
      onClick={handleClick}
      className={cn(
        'p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors',
        className
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label={favorite ? t('favorites.remove', 'Eliminar de favoritos') : t('favorites.add', 'Agregar a favoritos')}
    >
      <motion.div
        initial={false}
        animate={favorite ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={cn(
            'h-5 w-5 transition-colors',
            favorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
          )}
        />
      </motion.div>
    </motion.button>
  );
}
