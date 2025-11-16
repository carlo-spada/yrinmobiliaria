import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/PropertyCard';
import { Input } from '@/components/ui/input-enhanced';
import { Select } from '@/components/ui/select-enhanced';
import { Badge } from '@/components/ui/badge';
import { Search, Heart } from 'lucide-react';

const ComponentShowcase = () => {
  const [email, setEmail] = useState('');
  const [propertyType, setPropertyType] = useState('all');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Page Title */}
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Sistema de Componentes</h1>
            <p className="text-lg text-muted-foreground">
              Componentes reutilizables de YR Inmobiliaria
            </p>
          </div>

          {/* Buttons Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Botones</h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">
                Botón Primary
              </Button>
              <Button variant="secondary">
                Botón Secondary
              </Button>
              <Button variant="outline">
                Botón Outline
              </Button>
              <Button variant="ghost">
                Botón Ghost
              </Button>
              <Button variant="primary" size="lg">
                Botón Grande
              </Button>
              <Button variant="secondary" size="sm">
                Botón Pequeño
              </Button>
              <Button variant="primary" disabled>
                Deshabilitado
              </Button>
            </div>
          </section>

          {/* Badges Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Badges</h2>
            <div className="flex flex-wrap gap-3">
              <Badge variant="accent">⭐ Destacado</Badge>
              <Badge variant="sale">En Venta</Badge>
              <Badge variant="rent">En Renta</Badge>
              <Badge variant="sold">Vendido</Badge>
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </section>

          {/* Forms Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Formularios</h2>
            <div className="max-w-2xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre completo"
                  placeholder="Juan Pérez"
                />
                <Input
                  label="Correo electrónico"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              
              <Input
                label="Teléfono"
                type="tel"
                placeholder="+52 951 000 0000"
              />

              <Input
                floatingLabel
                label="Email con label flotante"
                type="email"
                placeholder="email@ejemplo.com"
              />

              <Select
                label="Tipo de propiedad"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                options={[
                  { value: 'all', label: 'Todas las propiedades' },
                  { value: 'house', label: 'Casa' },
                  { value: 'apartment', label: 'Departamento' },
                  { value: 'land', label: 'Terreno' },
                  { value: 'commercial', label: 'Comercial' },
                ]}
              />

              <div className="flex gap-3">
                <Button variant="primary" className="flex-1">
                  <Search className="h-4 w-4" />
                  Buscar Propiedades
                </Button>
                <Button variant="outline">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </section>

          {/* Property Cards Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Tarjetas de Propiedades</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <PropertyCard
                id="showcase-1"
                image="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"
                title="Casa Colonial en el Centro Histórico"
                price="$4,500,000 MXN"
                location="Centro, Oaxaca de Juárez"
                bedrooms={3}
                bathrooms={2}
                area={180}
                featured
                status="sale"
              />
              <PropertyCard
                id="showcase-2"
                image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"
                title="Departamento Moderno con Vista"
                price="$12,000 MXN"
                location="Reforma, Oaxaca"
                bedrooms={2}
                bathrooms={1}
                area={85}
                status="rent"
              />
              <PropertyCard
                id="showcase-3"
                image="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"
                title="Residencia de Lujo"
                price="$8,900,000 MXN"
                location="San Felipe del Agua"
                bedrooms={4}
                bathrooms={3}
                area={280}
                featured
                status="sold"
              />
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ComponentShowcase;
