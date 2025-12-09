import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import {
  Heart,
  Shield,
  MapPin,
  Users,
  Award,
  FileCheck,
  Languages,
  Building,
  Mail,
  Calendar,
  Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Language } from '@/types';
import type { Database } from '@/integrations/supabase/types';

type CmsJsonContent = Database['public']['Tables']['cms_pages']['Row']['content'];

type CmsAboutContent = CmsJsonContent & {
  hero?: Record<Language, { title: string; subtitle: string }>;
  story?: Record<
    Language,
    {
      title: string;
      p1: string;
      p2: string;
      p3: string;
      mission_title: string;
      mission_text: string;
    }
  >;
};

export default function About() {
  const { t, language } = useLanguage();

  const { data: cmsContent, isLoading } = useQuery({
    queryKey: ['cms-about'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_pages')
        .select('content')
        .eq('slug', 'about')
        .maybeSingle<{ content: CmsAboutContent | null }>();

      if (error) throw error;
      return data?.content ?? null;
    }
  });

  const values = [
    {
      icon: Heart,
      title: language === 'es' ? 'Confianza' : 'Trust',
      description:
        language === 'es'
          ? 'Relaciones duraderas basadas en honestidad y respeto. Acompañamos de principio a fin.'
          : 'Lasting relationships built on honesty and respect. We stay with you from start to finish.',
    },
    {
      icon: Shield,
      title: language === 'es' ? 'Transparencia' : 'Transparency',
      description:
        language === 'es'
          ? 'Información clara en cada etapa. Sin letra pequeña, sin sorpresas.'
          : 'Clear information at every stage. No fine print, no surprises.',
    },
    {
      icon: MapPin,
      title: language === 'es' ? 'Compromiso Local' : 'Local Commitment',
      description:
        language === 'es'
          ? 'Somos de Oaxaca, conocemos sus barrios y buscamos que el crecimiento beneficie a la gente de aquí.'
          : 'We are from Oaxaca, know its neighborhoods, and work to ensure growth benefits locals.',
    },
    {
      icon: Users,
      title: language === 'es' ? 'Innovación' : 'Innovation',
      description:
        language === 'es'
          ? 'Usamos tecnología e IA para decisiones basadas en datos y procesos más claros.'
          : 'We use technology and AI for data-driven decisions and clearer processes.',
    },
  ];

  const team = [
    {
      name: 'Yas Ruiz Vásquez',
      position: language === 'es' ? 'Co-fundadora · Asesora inmobiliaria' : 'Co-founder · Real estate advisor',
      email: 'contacto@yrinmobiliaria.com',
      bio:
        language === 'es'
          ? 'Yas es co-fundadora de YR Inmobiliaria y asesora en los Valles Centrales de Oaxaca desde 2019. Acompaña a familias e inversionistas con conocimiento local, seguimiento cercano y procesos claros.'
          : 'Yas is co-founder of YR Inmobiliaria and an advisor in Oaxaca’s Central Valleys since 2019. She guides families and investors with local insight, close follow-up, and clear processes.',
      image: 'https://ui-avatars.com/api/?name=Yas+Ruiz&background=C85A3C&color=fff&size=200',
    },
    {
      name: 'Carlo Spada Tello',
      position: language === 'es' ? 'Co-fundador · Estrategia digital y datos' : 'Co-founder · Digital strategy & data',
      email: 'carlo@yrinmobiliaria.com',
      bio:
        language === 'es'
          ? 'Carlo es co-fundador y responsable de la estrategia digital y de datos. Diseña procesos claros y confiables usando tecnología e IA para decisiones mejor fundamentadas.'
          : 'Carlo is co-founder and leads digital and data strategy. He designs clearer, more reliable processes using technology and AI for better-grounded decisions.',
      image: 'https://ui-avatars.com/api/?name=Carlo+Spada&background=2D5E4F&color=fff&size=200',
    },
  ];

  const benefits = [
    {
      icon: Award,
      title: language === 'es' ? 'Plataforma clara y moderna' : 'Clear, modern platform',
      description:
        language === 'es'
          ? 'Propiedades bien presentadas, información organizada y procesos digitales que ahorran tiempo.'
          : 'Well-presented listings, organized info, and digital flows that save time.',
    },
    {
      icon: Users,
      title: language === 'es' ? 'Asesoría cercana y honesta' : 'Close, honest guidance',
      description:
        language === 'es'
          ? 'Te acompañamos como si la operación fuera nuestra, compartiendo lo bueno y los matices.'
          : 'We guide you as if it were our own deal, sharing the good and the tradeoffs.',
    },
    {
      icon: Building,
      title: language === 'es' ? 'Red de aliados profesionales' : 'Network of professionals',
      description:
        language === 'es'
          ? 'Notarios, abogados y especialistas respaldan cada operación para seguridad jurídica.'
          : 'Notaries, lawyers, and specialists back each transaction for legal certainty.',
    },
    {
      icon: FileCheck,
      title: language === 'es' ? 'Enfoque local, visión grande' : 'Local focus, big vision',
      description:
        language === 'es'
          ? 'Nacimos en los Valles Centrales y queremos consolidarnos en todo Oaxaca y más allá.'
          : 'Born in the Central Valleys, aiming to serve all of Oaxaca and beyond.',
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Use CMS content if available, otherwise fallback to hardcoded
  const heroContent = cmsContent?.hero?.[language] || {
    title: language === 'es'
      ? 'Más que una inmobiliaria, tu aliado en Oaxaca'
      : 'More than a real estate agency, your ally in Oaxaca',
    subtitle: language === 'es'
      ? 'Comprometidos con hacer realidad tu sueño de encontrar el hogar perfecto en la tierra que amamos.'
      : 'Committed to making your dream of finding the perfect home in the land we love come true.'
  };

  const storyContent = cmsContent?.story?.[language] || {
    title: language === 'es' ? 'Nuestra Historia' : 'Our Story',
    p1: language === 'es'
      ? 'YR Inmobiliaria nació en diciembre de 2025, fundada por Yas Ruiz Vásquez y Carlo Spada Tello. Tras años colaborando con asesores, desarrolladores y familias en los Valles Centrales de Oaxaca, vimos una brecha: muchas personas buscando vender o comprar, pero pocas inmobiliarias usando datos y automatización para hacerlo más claro y confiable.'
      : 'YR Inmobiliaria was founded in December 2025 by Yas Ruiz Vásquez and Carlo Spada Tello. After years working with advisors, developers, and families in Oaxaca’s Central Valleys, we saw a gap: many people buying or selling, but few agencies using data and automation to make it clearer and more trustworthy.',
    p2: language === 'es'
      ? 'Así surge YR: una firma que combina cercanía humana con enfoque tecnológico, para transacciones transparentes y decisiones mejor fundamentadas.'
      : 'YR was born to blend human closeness with a tech-forward approach, delivering transparent transactions and better-grounded decisions.',
    p3: language === 'es'
      ? 'Antes del lanzamiento oficial, el equipo ya había acompañado a decenas de familias y cientos de clientes en operaciones en los Valles Centrales. Hoy queremos consolidarnos en todo Oaxaca y, con el tiempo, llegar a más regiones de México.'
      : 'Even before launch, the team had guided dozens of families and hundreds of clients in the Central Valleys. Now we aim to serve all of Oaxaca and, over time, more regions of Mexico.',
    mission_title: language === 'es' ? 'Nuestra misión' : 'Our mission',
    mission_text: language === 'es'
      ? 'Ayudar a familias e inversionistas a tomar decisiones inmobiliarias seguras en Oaxaca, combinando confianza y transparencia con el uso inteligente de tecnología e inteligencia artificial.'
      : 'Help families and investors make safe real estate decisions in Oaxaca, combining trust and transparency with smart use of technology and AI.'
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200')] bg-cover bg-center" />
          </div>

          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <Badge variant="outline" className="mb-4">
                {language === 'es' ? 'Sobre Nosotros' : 'About Us'}
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                {heroContent.title}
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {heroContent.subtitle}
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div className="space-y-6">
                <div className="space-y-3">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    {storyContent.title}
                  </h2>
                  <div className="h-1 w-20 bg-primary rounded" />
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>{storyContent.p1}</p>
                  <p>{storyContent.p2}</p>
                  <p>{storyContent.p3}</p>
                  <div className="rounded-xl border border-border bg-card/60 p-4">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {storyContent.mission_title}
                    </h3>
                    <p>{storyContent.mission_text}</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=600&fit=crop"
                    alt="Oaxaca"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-6 rounded-xl shadow-lg">
                  <div className="text-4xl font-bold">10+</div>
                  <div className="text-sm">
                    {language === 'es' ? 'Años de experiencia' : 'Years of experience'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {language === 'es' ? 'Nuestros Valores' : 'Our Values'}
                </h2>
                <p className="text-muted-foreground">
                  {language === 'es'
                    ? 'Los principios que guían cada una de nuestras acciones y decisiones.'
                    : 'The principles that guide each of our actions and decisions.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {values.map((value, index) => {
                  const Icon = value.icon;
                  return (
                    <Card key={index} className="border-2 hover:border-primary transition-colors">
                      <CardContent className="p-6 text-center space-y-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                          <Icon className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">{value.title}</h3>
                        <p className="text-muted-foreground">{value.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Our Team */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {language === 'es' ? 'Conoce a Nuestro Equipo' : 'Meet Our Team'}
                </h2>
                <p className="text-muted-foreground">
                  {language === 'es'
                    ? 'Profesionales comprometidos con ayudarte a encontrar tu propiedad ideal.'
                    : 'Professionals committed to helping you find your ideal property.'}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 justify-items-center max-w-3xl mx-auto">
                {team.map((member, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow">
                    <CardContent className="p-0">
                      <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6 space-y-3">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                          <p className="text-sm text-primary font-medium">{member.position}</p>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">{member.bio}</p>
                        <a
                          href={`mailto:${member.email}`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{member.email}</span>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {language === 'es' ? '¿Por Qué Elegirnos?' : 'Why Choose Us?'}
                </h2>
                <p className="text-muted-foreground">
                  {language === 'es'
                    ? 'Razones que nos hacen la mejor opción para tu próxima inversión inmobiliaria.'
                    : 'Reasons that make us the best option for your next real estate investment.'}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div
                      key={index}
                      className="flex gap-4 p-6 bg-card border border-border rounded-lg hover:border-primary transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">{benefit.title}</h3>
                        <p className="text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  {language === 'es'
                    ? '¿Listo para trabajar con nosotros?'
                    : 'Ready to work with us?'}
                </h2>
                <p className="text-xl text-muted-foreground">
                  {language === 'es'
                    ? 'Empieza tu búsqueda hoy o agenda una cita para conocernos mejor.'
                    : 'Start your search today or schedule an appointment to get to know us better.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/agendar">
                  <Button size="lg" className="gap-2">
                    <Calendar className="w-5 h-5" />
                    {language === 'es' ? 'Agendar Cita' : 'Schedule Appointment'}
                  </Button>
                </Link>
                <Link to="/propiedades">
                  <Button variant="outline" size="lg" className="gap-2">
                    <Building className="w-5 h-5" />
                    {language === 'es' ? 'Ver Propiedades' : 'View Properties'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
