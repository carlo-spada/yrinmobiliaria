import {
  MapPin,
  Award,
  Linkedin,
  Instagram,
  Facebook,
  ArrowLeft,
  Briefcase,
  Calendar,
  ClipboardList,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';


import { OptimizedAvatar } from '@/components/OptimizedAvatar';
import { PropertyCard } from '@/components/PropertyCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAgentBySlug } from '@/hooks/useAgentBySlug';
import { useProperties } from '@/hooks/useProperties';
import { useAgentStats } from '@/hooks/usePublicAgents';
import { useServiceZones } from '@/hooks/useServiceZones';
import { resolveAgentZones } from '@/utils/serviceZones';


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

export default function AgentProfile() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { language } = useLanguage();
  const { data: agent, isLoading } = useAgentBySlug(slug || '');
  const { data: stats } = useAgentStats(agent?.id || '');
  const { data: allProperties = [] } = useProperties();
  const { zones } = useServiceZones();

  // `profiles.service_zones` guarda IDs de zona (uuid); se resuelven a su nombre
  // localizado y se omiten los IDs sin match (ver resolveAgentZones).
  const resolvedZones = useMemo(
    () => resolveAgentZones(zones, agent?.service_zones, language),
    [zones, agent?.service_zones, language]
  );

  // Filter properties by agent
  const agentProperties = allProperties.filter(
    (p) => p.agent_id === agent?.id && p.status === 'disponible'
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-96 w-full rounded-lg mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {language === 'es' ? 'Agente no encontrado' : 'Agent not found'}
          </h1>
          <Button onClick={() => router.push('/agentes')} variant="default">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {language === 'es' ? 'Ver todos los agentes' : 'View all agents'}
          </Button>
        </div>
      </div>
    );
  }

  const bio = language === 'es' ? agent.bio_es : agent.bio_en;
  const initials = agent.display_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  // Contact is now handled through property inquiries or the contact page
  // WhatsApp numbers are no longer publicly exposed for privacy

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/agentes')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {language === 'es' ? 'Volver a agentes' : 'Back to agents'}
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Agent Info */}
            <div className="lg:col-span-2">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <OptimizedAvatar
                  src={agent.photo_url}
                  alt={agent.display_name}
                  sizePx={160}
                  className="h-40 w-40 ring-4 ring-primary/20"
                  fallbackClassName="text-4xl font-semibold bg-primary/10 text-primary"
                  fallback={initials}
                />

                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">{agent.display_name}</h1>
                    {agent.agent_level && (
                      <Badge className={`${levelColors[agent.agent_level]} mb-2`}>
                        {levelLabels[agent.agent_level][language]}
                      </Badge>
                    )}
                  </div>

                  {/* Languages */}
                  <div className="space-y-2">
                    {agent.languages && agent.languages.length > 0 && (
                      <div className="flex items-center gap-2">
                        {agent.languages.includes('es') && <span>🇪🇸 Español</span>}
                        {agent.languages.includes('en') && <span>🇬🇧 English</span>}
                      </div>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-4">
                    {agent.agent_years_experience && (
                      <Badge variant="outline">
                        <Award className="mr-1 h-3 w-3" />
                        {agent.agent_years_experience}{' '}
                        {language === 'es' ? 'años de experiencia' : 'years experience'}
                      </Badge>
                    )}
                    {agent.agent_license_number && (
                      <Badge variant="outline">
                        {language === 'es' ? 'Lic.' : 'Lic.'} {agent.agent_license_number}
                      </Badge>
                    )}
                  </div>

                  {/* Social Links */}
                  <div className="flex gap-3">
                    {agent.linkedin_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={agent.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {agent.instagram_handle && (
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={`https://instagram.com/${agent.instagram_handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Instagram className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {agent.facebook_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={agent.facebook_url} target="_blank" rel="noopener noreferrer">
                          <Facebook className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Card (Desktop) */}
            <div className="hidden lg:block">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold">
                    {language === 'es' ? 'Contactar' : 'Contact'}
                  </h3>
                  <div className="space-y-2">
                    {agent.linkedin_url && (
                      <Button variant="outline" className="w-full" asChild>
                        <a href={agent.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="mr-2 h-4 w-4" />
                          LinkedIn
                        </a>
                      </Button>
                    )}
                    {agent.instagram_handle && (
                      <Button variant="outline" className="w-full" asChild>
                        <a
                          href={`https://instagram.com/${agent.instagram_handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Instagram className="mr-2 h-4 w-4" />
                          Instagram
                        </a>
                      </Button>
                    )}
                    {!agent.linkedin_url && !agent.instagram_handle && !agent.facebook_url && (
                      <p className="text-sm text-muted-foreground text-center">
                        {language === 'es'
                          ? 'Contacte a través de la propiedad de su interés'
                          : 'Contact through the property of interest'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            {bio && (
              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  {language === 'es' ? 'Acerca de' : 'About'}
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{bio}</p>
              </section>
            )}

            {/* Service Zones & Specialties */}
            <section className="grid md:grid-cols-2 gap-6">
              {resolvedZones.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    {language === 'es' ? 'Zonas de servicio' : 'Service zones'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {resolvedZones.map((zone) => (
                      <Badge key={zone.id} variant="outline">
                        {zone.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {agent.agent_specialty && agent.agent_specialty.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    {language === 'es' ? 'Especialidades' : 'Specialties'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {agent.agent_specialty.map((specialty, index) => (
                      <Badge key={index} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Stats Section */}
            {stats && (
              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  {language === 'es' ? 'Estadísticas' : 'Stats'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Briefcase className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-3xl font-bold">{stats.propertiesCount}</p>
                      <p className="text-sm text-muted-foreground">
                        {language === 'es' ? 'Propiedades activas' : 'Active properties'}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <ClipboardList className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-3xl font-bold">{stats.inquiriesCount}</p>
                      <p className="text-sm text-muted-foreground">
                        {language === 'es' ? 'Consultas atendidas' : 'Inquiries handled'}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-3xl font-bold">{stats.visitsCount}</p>
                      <p className="text-sm text-muted-foreground">
                        {language === 'es' ? 'Visitas programadas' : 'Visits scheduled'}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>
            )}

            {/* Agent's Properties */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">
                  {language === 'es'
                    ? `Propiedades de ${agent.display_name}`
                    : `${agent.display_name}'s Properties`}
                </h2>
                {agentProperties.length > 0 && (
                  <Link href={`/propiedades?agent=${agent.id}`}>
                    <Button variant="ghost" size="sm">
                      {language === 'es' ? 'Ver todas →' : 'View all →'}
                    </Button>
                  </Link>
                )}
              </div>

              {agentProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {agentProperties.slice(0, 4).map((property) => {
                    const title = property.title[language];
                    const image = property.images?.[0] || '';
                    const location = `${property.location.neighborhood || ''}, ${property.location.zone}`;

                    return (
                      <PropertyCard
                        key={property.id}
                        id={property.id}
                        image={image}
                        title={title}
                        price={`$${property.price.toLocaleString()}`}
                        location={location}
                        bedrooms={property.features.bedrooms}
                        bathrooms={property.features.bathrooms}
                        area={property.features.constructionArea}
                        featured={property.featured}
                        status={property.operation === 'venta' ? 'sale' : 'rent'}
                        variants={property.imageVariants?.[0]?.variants}
                      />
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {language === 'es'
                    ? 'Este agente aún no tiene propiedades listadas'
                    : 'This agent has no listed properties yet'}
                </p>
              )}
            </section>
          </div>

          {/* Sidebar - Contact Card (Mobile) */}
          <div className="lg:hidden">
            <Card className="sticky top-8">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">
                  {language === 'es' ? 'Contactar' : 'Contact'}
                </h3>
                <div className="space-y-2">
                  {agent.linkedin_url && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={agent.linkedin_url} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="mr-2 h-4 w-4" />
                        LinkedIn
                      </a>
                    </Button>
                  )}
                  {agent.instagram_handle && (
                    <Button variant="outline" className="w-full" asChild>
                      <a
                        href={`https://instagram.com/${agent.instagram_handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Instagram className="mr-2 h-4 w-4" />
                        Instagram
                      </a>
                    </Button>
                  )}
                  {agent.facebook_url && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={agent.facebook_url} target="_blank" rel="noopener noreferrer">
                        <Facebook className="mr-2 h-4 w-4" />
                        Facebook
                      </a>
                    </Button>
                  )}
                  {!agent.linkedin_url && !agent.instagram_handle && !agent.facebook_url && (
                    <p className="text-sm text-muted-foreground text-center">
                      {language === 'es'
                        ? 'Contacte a través de la propiedad de su interés'
                        : 'Contact through the property of interest'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
