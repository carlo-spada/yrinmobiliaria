import { motion } from 'framer-motion';
import { Bed, Bath, Maximize, MapPin } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';


import { FavoriteButton } from '@/components/FavoriteButton';
import { OptimizedAvatar } from '@/components/OptimizedAvatar';
import { ResponsiveImage } from '@/components/ResponsiveImage';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { generateSlug } from '@/hooks/useAgentBySlug';
import { cn } from '@/lib/utils';

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

export const PropertyCard = memo(function PropertyCard({
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
  agent,
}: PropertyCardProps) {
  const { t, language } = useLanguage();

  const agentInitials = agent?.display_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const companyName = 'YR Inmobiliaria';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
    >
      <Card
        className={cn(
          'group relative cursor-pointer overflow-hidden transition-shadow duration-300 hover:shadow-xl',
          className
        )}
      >
        <Link
          href={`/propiedad/${id}`}
          onClick={onClick}
          aria-label={`View details for ${title}`}
          className="absolute inset-0 z-10 rounded-xl"
        />

        <div className="relative overflow-hidden aspect-[4/3]">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
            className="relative w-full h-full"
          >
            <ResponsiveImage
              src={image}
              alt={alt || `${title} - ${location}`}
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute top-4 left-4 z-20 flex gap-2">
            {featured && (
              <Badge variant="accent" className="shadow-lg">
                ⭐ {t.properties.featured}
              </Badge>
            )}
            <Badge variant={status} className="shadow-lg">
              {t.properties.status[status]}
            </Badge>
          </div>

          <div className="absolute top-4 right-4 z-20">
            <FavoriteButton propertyId={id} />
          </div>
        </div>

        <CardContent className="space-y-4 p-5">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-primary">{price}</span>
            <span className="text-sm text-muted-foreground">{status === 'rent' ? '/mes' : ''}</span>
          </div>

          <h3 className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm line-clamp-1">{location}</span>
          </div>

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

          {agent ? (
            <Link
              href={`/agentes/${generateSlug(agent.display_name)}`}
              className="relative z-20 flex items-center gap-2 pt-3 border-t border-border group/agent"
            >
              <OptimizedAvatar
                src={agent.photo_url}
                alt={agent.display_name}
                sizePx={32}
                className="h-8 w-8"
                fallbackClassName="text-xs bg-primary/10 text-primary"
                fallback={agentInitials}
              />
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
  );
});
