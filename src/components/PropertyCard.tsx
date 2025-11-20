import { Bed, Bath, Maximize, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { FavoriteButton } from '@/components/FavoriteButton';
import { ResponsiveImage } from '@/components/ResponsiveImage';
import { useLanguage } from '@/utils/LanguageContext';

interface PropertyCardProps {
  id: string;
  image: string;
  alt?: string;
  title: string;
  price: string;
  location: string;
  bedrooms?: number;
  bathrooms: number;
  area: number;
  featured?: boolean;
  status?: 'sale' | 'rent' | 'sold';
  className?: string;
  onClick?: () => void;
  priority?: boolean; // For LCP optimization - eager load above-fold images
  variants?: { // Image variants for optimization
    avif: Record<number, string>;
    webp: Record<number, string>;
  };
}

export function PropertyCard({
  id,
  image,
  alt,
  title,
  price,
  location,
  bedrooms,
  bathrooms,
  area,
  featured = false,
  status = 'sale',
  className,
  onClick,
  priority = false,
  variants,
}: PropertyCardProps) {
  const { t } = useLanguage();

  return (
    <Link to={`/propiedad/${id}`} onClick={onClick} aria-label={`View details for ${title}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
      >
        <Card
          className={cn(
            'group cursor-pointer overflow-hidden transition-shadow duration-300 hover:shadow-xl',
            className
          )}
        >
          <div className="relative overflow-hidden aspect-[4/3]">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
              className="w-full h-full"
          >
            <ResponsiveImage
              src={image}
              variants={variants}
              alt={alt || `${title} - ${location}`}
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="w-full h-full object-cover"
                width={400}
                height={300}
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {featured && (
            <Badge variant="accent" className="shadow-lg">
              ⭐ {t.properties.featured}
            </Badge>
          )}
          <Badge variant={status} className="shadow-lg">
            {t.properties.status[status]}
          </Badge>
        </div>

        {/* Favorite Button */}
        <div className="absolute top-4 right-4">
          <FavoriteButton propertyId={id} />
        </div>
      </div>

      <CardContent className="p-5 space-y-4">
        {/* Price */}
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-primary">{price}</span>
          <span className="text-sm text-muted-foreground">{status === 'rent' ? '/mes' : ''}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm line-clamp-1">{location}</span>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 pt-3 border-t border-border">
          {bedrooms && (
            <div className="flex items-center gap-1.5 text-sm text-foreground">
              <Bed className="h-4 w-4 text-muted-foreground" />
              <span>{bedrooms}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-sm text-foreground">
            <Bath className="h-4 w-4 text-muted-foreground" />
            <span>{bathrooms}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-foreground">
            <Maximize className="h-4 w-4 text-muted-foreground" />
            <span>{area} m²</span>
          </div>
        </div>
      </CardContent>
      </Card>
      </motion.div>
    </Link>
  );
}
