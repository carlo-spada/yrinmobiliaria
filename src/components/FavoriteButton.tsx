import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  propertyId: string;
  variant?: 'icon' | 'button';
  className?: string;
}

export function FavoriteButton({ propertyId, variant = 'icon', className }: FavoriteButtonProps) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toast } = useToast();
  const { t } = useLanguage();
  const favorite = isFavorite(propertyId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toggleFavorite(propertyId);
    
    toast({
      title: favorite 
        ? (t.favorites?.removed || 'Eliminado de favoritos')
        : (t.favorites?.added || 'Agregado a favoritos'),
      duration: 2000,
    });
  };

  if (variant === 'button') {
    return (
      <Button
        variant={favorite ? 'default' : 'outline'}
        onClick={handleClick}
        className={className}
        aria-label={favorite ? (t.favorites?.remove || 'Remove from favorites') : (t.favorites?.add || 'Add to favorites')}
      >
        <Heart
          className={cn(
            'h-4 w-4 mr-2',
            favorite && 'fill-current'
          )}
          aria-hidden="true"
        />
        {favorite 
          ? (t.favorites?.remove || 'Remove from favorites')
          : (t.favorites?.add || 'Add to favorites')
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
      aria-label={favorite ? (t.favorites?.remove || 'Remove from favorites') : (t.favorites?.add || 'Add to favorites')}
      title={favorite ? (t.favorites?.remove || 'Remove from favorites') : (t.favorites?.add || 'Add to favorites')}
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
          aria-hidden="true"
        />
      </motion.div>
    </motion.button>
  );
}
