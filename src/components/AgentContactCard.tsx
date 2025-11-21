import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MessageCircle, ExternalLink } from 'lucide-react';
import { generateSlug } from '@/hooks/useAgentBySlug';
import { useLanguage } from '@/utils/LanguageContext';

interface PropertyAgent {
  id: string;
  display_name: string;
  photo_url: string | null;
  agent_level: 'junior' | 'associate' | 'senior' | 'partner' | null;
  whatsapp_number?: string | null;
  phone?: string | null;
  email?: string;
  bio_es?: string | null;
  bio_en?: string | null;
}

interface AgentContactCardProps {
  agent: PropertyAgent;
  propertyId?: string;
}

const levelLabels = {
  junior: { es: 'Junior', en: 'Junior' },
  associate: { es: 'Asociado', en: 'Associate' },
  senior: { es: 'Senior', en: 'Senior' },
  partner: { es: 'Socio', en: 'Partner' },
};

export function AgentContactCard({ agent, propertyId }: AgentContactCardProps) {
  const { language } = useLanguage();
  const slug = generateSlug(agent.display_name);
  const bio = language === 'es' ? agent.bio_es : agent.bio_en;
  const truncatedBio = bio ? (bio.length > 150 ? bio.substring(0, 150) + '...' : bio) : null;

  const initials = agent.display_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const handleWhatsApp = () => {
    if (agent.whatsapp_number) {
      const message = language === 'es' 
        ? `Hola ${agent.display_name}, estoy interesado en una propiedad`
        : `Hi ${agent.display_name}, I'm interested in a property`;
      window.open(`https://wa.me/${agent.whatsapp_number}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  return (
    <Card className="sticky top-8">
      <CardContent className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">
          {language === 'es' ? 'Tu Agente' : 'Your Agent'}
        </h3>

        {/* Agent Info */}
        <div className="flex items-start gap-4">
          <Avatar className="h-24 w-24 ring-2 ring-primary/20">
            <AvatarImage src={agent.photo_url || ''} alt={agent.display_name} />
            <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-foreground">{agent.display_name}</h4>
            {agent.agent_level && (
              <Badge variant="secondary" className="mt-1">
                {levelLabels[agent.agent_level][language]}
              </Badge>
            )}
          </div>
        </div>

        {/* Bio */}
        {truncatedBio && (
          <p className="text-sm text-muted-foreground">{truncatedBio}</p>
        )}

        {/* Contact Buttons */}
        <div className="space-y-2">
          <Button
            variant="default"
            className="w-full"
            onClick={() => {
              // TODO: Open contact form dialog with agent pre-filled
              window.location.href = `/contacto?agent=${agent.id}${propertyId ? `&property=${propertyId}` : ''}`;
            }}
          >
            <Mail className="mr-2 h-4 w-4" />
            {language === 'es' ? 'Enviar mensaje' : 'Send message'}
          </Button>

          {propertyId && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                window.location.href = `/agendar?property=${propertyId}`;
              }}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              {language === 'es' ? 'Agendar visita' : 'Schedule visit'}
            </Button>
          )}

          {agent.whatsapp_number && (
            <Button variant="outline" className="w-full" onClick={handleWhatsApp}>
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
          )}

          {agent.phone && (
            <Button variant="outline" className="w-full" asChild>
              <a href={`tel:${agent.phone}`}>
                <Phone className="mr-2 h-4 w-4" />
                {language === 'es' ? 'Llamar' : 'Call'}
              </a>
            </Button>
          )}
        </div>

        {/* View Profile */}
        <Link to={`/agentes/${slug}`} className="block">
          <Button variant="ghost" className="w-full">
            {language === 'es' ? 'Ver perfil completo' : 'View full profile'}
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
