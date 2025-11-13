import { Bed, Bath, Maximize, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PropertyCardProps {
  image: string;
  title: string;
  price: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  featured?: boolean;
  status?: 'sale' | 'rent' | 'sold';
  className?: string;
  onClick?: () => void;
}

export function PropertyCard({
  image,
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
}: PropertyCardProps) {
  const statusLabels = {
    sale: { es: 'En Venta', en: 'For Sale' },
    rent: { es: 'En Renta', en: 'For Rent' },
    sold: { es: 'Vendido', en: 'Sold' },
  };

  return (
    <Card
      className={cn(
        'group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
        className
      )}
      onClick={onClick}
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {featured && (
            <Badge variant="accent" className="shadow-lg">
              ⭐ Destacado
            </Badge>
          )}
          <Badge variant={status} className="shadow-lg">
            {statusLabels[status].es}
          </Badge>
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
          <div className="flex items-center gap-1.5 text-sm text-foreground">
            <Bed className="h-4 w-4 text-muted-foreground" />
            <span>{bedrooms}</span>
          </div>
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
  );
}
