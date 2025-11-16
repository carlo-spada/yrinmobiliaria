import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/utils/LanguageContext';
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
} from 'lucide-react';

export default function About() {
  const { t, language } = useLanguage();

  const values = [
    {
      icon: Heart,
      title: language === 'es' ? 'Confianza' : 'Trust',
      description:
        language === 'es'
          ? 'Construimos relaciones duraderas basadas en la honestidad y el respeto mutuo con cada cliente.'
          : 'We build lasting relationships based on honesty and mutual respect with each client.',
    },
    {
      icon: Shield,
      title: language === 'es' ? 'Transparencia' : 'Transparency',
      description:
        language === 'es'
          ? 'Información clara y completa en cada transacción. Sin sorpresas, sin letra pequeña.'
          : 'Clear and complete information in every transaction. No surprises, no fine print.',
    },
    {
      icon: MapPin,
      title: language === 'es' ? 'Compromiso Local' : 'Local Commitment',
      description:
        language === 'es'
          ? 'Orgullosos de ser parte de Oaxaca. Conocemos cada rincón de nuestra ciudad y su gente.'
          : 'Proud to be part of Oaxaca. We know every corner of our city and its people.',
    },
  ];

  const team = [
    {
      name: 'Yolanda Ramírez',
      position: language === 'es' ? 'Directora General' : 'General Director',
      email: 'yolanda@yrinmobiliaria.com',
      bio:
        language === 'es'
          ? 'Con más de 15 años de experiencia en el sector inmobiliario de Oaxaca, Yolanda fundó YR Inmobiliaria con la visión de crear un servicio personalizado y de confianza.'
          : 'With over 15 years of experience in the Oaxaca real estate sector, Yolanda founded YR Real Estate with the vision of creating a personalized and trustworthy service.',
      image: 'https://ui-avatars.com/api/?name=Yolanda+Ramirez&background=C85A3C&color=fff&size=200',
    },
    {
      name: 'Roberto Martínez',
      position: language === 'es' ? 'Agente Senior' : 'Senior Agent',
      email: 'roberto@yrinmobiliaria.com',
      bio:
        language === 'es'
          ? 'Especialista en propiedades comerciales y residenciales de alto valor. Roberto conoce el mercado oaxaqueño como la palma de su mano.'
          : 'Specialist in commercial and high-value residential properties. Roberto knows the Oaxaca market like the back of his hand.',
      image: 'https://ui-avatars.com/api/?name=Roberto+Martinez&background=2D5E4F&color=fff&size=200',
    },
    {
      name: 'Carmen López',
      position: language === 'es' ? 'Agente Inmobiliario' : 'Real Estate Agent',
      email: 'carmen@yrinmobiliaria.com',
      bio:
        language === 'es'
          ? 'Experta en propiedades para familias y primeros compradores. Carmen se destaca por su paciencia y dedicación con cada cliente.'
          : 'Expert in family properties and first-time buyers. Carmen stands out for her patience and dedication to each client.',
      image: 'https://ui-avatars.com/api/?name=Carmen+Lopez&background=D4A574&color=fff&size=200',
    },
    {
      name: 'Miguel Hernández',
      position: language === 'es' ? 'Agente Inmobiliario' : 'Real Estate Agent',
      email: 'miguel@yrinmobiliaria.com',
      bio:
        language === 'es'
          ? 'Especializado en inversiones y propiedades para renta. Miguel ayuda a los inversionistas a maximizar el retorno de sus propiedades.'
          : 'Specialized in investments and rental properties. Miguel helps investors maximize the return on their properties.',
      image: 'https://ui-avatars.com/api/?name=Miguel+Hernandez&background=C85A3C&color=fff&size=200',
    },
  ];

  const benefits = [
    {
      icon: Award,
      title: language === 'es' ? 'Experiencia en mercado oaxaqueño' : 'Experience in Oaxaca market',
      description:
        language === 'es'
          ? 'Más de 10 años asesorando en compra, venta y renta de propiedades en toda la región.'
          : 'Over 10 years advising on buying, selling and renting properties throughout the region.',
    },
    {
      icon: Users,
      title: language === 'es' ? 'Atención personalizada' : 'Personalized attention',
      description:
        language === 'es'
          ? 'Cada cliente es único. Adaptamos nuestro servicio a tus necesidades específicas.'
          : 'Each client is unique. We adapt our service to your specific needs.',
    },
    {
      icon: Building,
      title: language === 'es' ? 'Base de datos amplia' : 'Extensive database',
      description:
        language === 'es'
          ? 'Acceso a cientos de propiedades exclusivas en las mejores zonas de Oaxaca.'
          : 'Access to hundreds of exclusive properties in the best areas of Oaxaca.',
    },
    {
      icon: FileCheck,
      title: language === 'es' ? 'Acompañamiento legal' : 'Legal support',
      description:
        language === 'es'
          ? 'Te guiamos en todo el proceso legal y documentación necesaria para una transacción segura.'
          : 'We guide you through the entire legal process and necessary documentation for a secure transaction.',
    },
    {
      icon: Languages,
      title: language === 'es' ? 'Servicio bilingüe' : 'Bilingual service',
      description:
        language === 'es'
          ? 'Atendemos en español e inglés para mejor servicio a clientes nacionales e internacionales.'
          : 'We serve in Spanish and English for better service to national and international clients.',
    },
  ];

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
                {language === 'es'
                  ? 'Más que una inmobiliaria, tu aliado en Oaxaca'
                  : 'More than a real estate agency, your ally in Oaxaca'}
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {language === 'es'
                  ? 'Comprometidos con hacer realidad tu sueño de encontrar el hogar perfecto en la tierra que amamos.'
                  : 'Committed to making your dream of finding the perfect home in the land we love come true.'}
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
                    {language === 'es' ? 'Nuestra Historia' : 'Our Story'}
                  </h2>
                  <div className="h-1 w-20 bg-primary rounded" />
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    {language === 'es'
                      ? 'YR Inmobiliaria nació hace más de 10 años del sueño de una familia oaxaqueña apasionada por su tierra. Yolanda Ramírez, fundadora de la empresa, identificó la necesidad de un servicio inmobiliario que realmente entendiera las particularidades del mercado local y pusiera al cliente en el centro de cada transacción.'
                      : 'YR Real Estate was born over 10 years ago from the dream of an Oaxacan family passionate about their land. Yolanda Ramírez, founder of the company, identified the need for a real estate service that truly understood the particularities of the local market and put the client at the center of every transaction.'}
                  </p>
                  <p>
                    {language === 'es'
                      ? 'Desde entonces, hemos ayudado a cientos de familias a encontrar su hogar ideal, y a inversionistas a descubrir las mejores oportunidades en el mercado inmobiliario oaxaqueño. Nuestro conocimiento profundo de la ciudad, desde el Centro Histórico hasta las zonas residenciales emergentes, nos permite ofrecer un servicio personalizado y de alto valor.'
                      : 'Since then, we have helped hundreds of families find their ideal home, and investors discover the best opportunities in the Oaxaca real estate market. Our deep knowledge of the city, from the Historic Center to emerging residential areas, allows us to offer personalized and high-value service.'}
                  </p>
                  <p>
                    {language === 'es'
                      ? 'Hoy, YR Inmobiliaria se ha consolidado como una de las agencias más confiables de la región, manteniendo siempre nuestros valores fundacionales: honestidad, cercanía y compromiso con nuestra comunidad.'
                      : 'Today, YR Real Estate has established itself as one of the most trusted agencies in the region, always maintaining our founding values: honesty, closeness and commitment to our community.'}
                  </p>
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

              <div className="grid md:grid-cols-3 gap-8">
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

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
