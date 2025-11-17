import { Search } from 'lucide-react';
import { useLanguage } from '@/utils/LanguageContext';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select-enhanced';
import { Slider } from '@/components/ui/slider';
import heroImage from '@/assets/hero-oaxaca.jpg';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function HeroSection() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [priceRange, setPriceRange] = useState([0]);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedZone, setSelectedZone] = useState('all');

  const propertyTypes = [
    { value: 'all', label: t.hero.allTypes },
    { value: 'casa', label: 'Casa' },
    { value: 'departamento', label: 'Departamento' },
    { value: 'local', label: 'Local' },
    { value: 'oficina', label: 'Oficina' },
  ];

  const zones = [
    { value: 'all', label: t.hero.allZones },
    { value: 'Centro Histórico', label: 'Centro Histórico' },
    { value: 'Reforma San Felipe', label: 'Reforma San Felipe' },
    { value: 'Zona Norte', label: 'Zona Norte' },
    { value: 'Valles Centrales', label: 'Valles Centrales' },
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (selectedType !== 'all') {
      params.set('type', selectedType);
    }
    
    if (selectedZone !== 'all') {
      params.set('zone', selectedZone);
    }
    
    if (priceRange[0] > 0) {
      params.set('maxPrice', (priceRange[0] * 100000).toString());
    }
    
    navigate(`/propiedades?${params.toString()}`);
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value * 100000);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Oaxaca Real Estate"
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Title and Subtitle */}
          <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
              {t.hero.title}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-white/90 leading-relaxed">
              {t.hero.subtitle}
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-background/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Select
                options={propertyTypes}
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-background"
              />
              <Select
                options={zones}
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="bg-background"
              />
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  {t.hero.priceRange}
                </label>
                <span className="text-sm font-semibold text-primary">
                  Hasta {formatPrice(priceRange[0])}
                </span>
              </div>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            <Button
              size="lg"
              variant="primary"
              className="w-full font-semibold gap-2"
              onClick={handleSearch}
            >
              <Search className="h-5 w-5" />
              {t.hero.search}
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative Element */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
}
