import { Bed, Bath, Maximize, MapPin, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { FavoriteButton } from '@/components/FavoriteButton';
import { ResponsiveImage } from '@/components/ResponsiveImage';
import { useLanguage } from '@/contexts/LanguageContext';

interface PropertyAgent {
  id: string;
  display_name: string;
  photo_url: string | null;
  agent_level: 'junior' | 'associate' | 'senior' | 'partner' | null;
}

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
  agent?: PropertyAgent;
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
  agent,
}: PropertyCardProps) {
  const { t, language } = useLanguage();

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/\s+/g, '-');

  const agentInitials = agent?.display_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const companyName = 'YR Inmobiliaria';

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

        {/* Agent Attribution */}
        {agent ? (
          <Link
            to={`/agentes/${generateSlug(agent.display_name)}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 pt-3 border-t border-border group/agent"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={agent.photo_url || ''} alt={agent.display_name} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {agentInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">
                {language === 'es' ? 'Agente:' : 'Agent:'}
              </p>
              <p className="text-sm font-medium text-foreground group-hover/agent:text-primary transition-colors truncate">
                {agent.display_name}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-2 pt-3 border-t border-border">
            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-primary">
                {companyName.substring(0, 2)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground truncate">
                {companyName}
              </p>
            </div>
          </div>
        )}
      </CardContent>
      </Card>
      </motion.div>
    </Link>
  );
}
