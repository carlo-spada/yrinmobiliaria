import { motion } from 'framer-motion';
import { MapPin, Languages } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { generateSlug } from '@/hooks/useAgentBySlug';
import { PublicAgent } from '@/hooks/usePublicAgents';


interface AgentCardProps {
  agent: PublicAgent;
  propertiesCount?: number;
}

const levelColors = {
  junior: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  associate: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  senior: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  partner: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
};

const levelLabels = {
  junior: { es: 'Junior', en: 'Junior' },
  associate: { es: 'Asociado', en: 'Associate' },
  senior: { es: 'Senior', en: 'Senior' },
  partner: { es: 'Socio', en: 'Partner' },
};

export function AgentCard({ agent, propertiesCount = 0 }: AgentCardProps) {
  const { language } = useLanguage();
  const slug = generateSlug(agent.display_name);
  const bio = language === 'es' ? agent.bio_es : agent.bio_en;
  const truncatedBio = bio ? (bio.length > 100 ? bio.substring(0, 100) + '...' : bio) : null;

  const initials = agent.display_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <Link to={`/agentes/${slug}`}>
      <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
        <Card className="group cursor-pointer transition-shadow duration-300 hover:shadow-xl h-full">
          <CardContent className="p-6 space-y-4">
            {/* Avatar and Name */}
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20 ring-2 ring-primary/20">
                <AvatarImage src={agent.photo_url || ''} alt={agent.display_name} />
                <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {agent.display_name}
                </h3>
                {agent.agent_level && (
                  <Badge className={`mt-1 ${levelColors[agent.agent_level]}`}>
                    {levelLabels[agent.agent_level][language]}
                  </Badge>
                )}
              </div>
            </div>

            {/* Bio */}
            {truncatedBio && (
              <p className="text-sm text-muted-foreground line-clamp-3">{truncatedBio}</p>
            )}

            {/* Languages */}
            {agent.languages && agent.languages.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Languages className="h-4 w-4 text-muted-foreground" />
                <div className="flex gap-1">
                  {agent.languages.includes('es') && <span>🇪🇸</span>}
                  {agent.languages.includes('en') && <span>🇬🇧</span>}
                </div>
              </div>
            )}

            {/* Service Zones */}
            {agent.service_zones && agent.service_zones.length > 0 && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex flex-wrap gap-1">
                  {agent.service_zones.slice(0, 3).map((zone, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {zone}
                    </Badge>
                  ))}
                  {agent.service_zones.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{agent.service_zones.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Specialties */}
            {agent.agent_specialty && agent.agent_specialty.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {agent.agent_specialty.map((specialty, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>
            )}

            {/* Properties Count */}
            <div className="pt-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                {propertiesCount} {language === 'es' ? 'propiedades activas' : 'active properties'}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
