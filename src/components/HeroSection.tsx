import { Search } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';


import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select-enhanced';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/contexts/LanguageContext';
import { useServiceZones } from '@/hooks/useServiceZones';
import { toLogPrice, formatMXN, MIN_PRICE, MAX_PRICE } from '@/utils/priceSliderHelpers';

export function HeroSection() {
  const { t } = useLanguage();
  const router = useRouter();
  const { zones: dbZones } = useServiceZones();

  // Logarithmic slider values (0-100 range)
  const [sliderValues, setSliderValues] = useState<[number, number]>([0, 100]);
  
  // Convert to actual prices
  const priceRange: [number, number] = [
    toLogPrice(sliderValues[0]),
    toLogPrice(sliderValues[1])
  ];
  
  const [selectedType, setSelectedType] = useState('all');
  const [selectedOperation, setSelectedOperation] = useState('all');
  const [selectedZone, setSelectedZone] = useState('all');

  const propertyTypes = [
    { value: 'all', label: t.hero.allTypes },
    { value: 'casa', label: t.properties.types.casa },
    { value: 'departamento', label: t.properties.types.departamento },
    { value: 'local', label: t.properties.types.local },
    { value: 'oficina', label: t.properties.types.oficina },
    { value: 'terrenos', label: t.properties.types.terrenos },
  ];

  const operations = [
    { value: 'all', label: t.properties.operationPlaceholder },
    { value: 'venta', label: t.properties.operations.venta },
    { value: 'renta', label: t.properties.operations.renta },
  ];

  const zones = [
    { value: 'all', label: t.hero.allZones },
    ...dbZones,
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (selectedType !== 'all') {
      params.set('type', selectedType);
    }
    
    if (selectedOperation !== 'all') {
      params.set('operation', selectedOperation);
    }
    
    if (selectedZone !== 'all') {
      params.set('zone', selectedZone);
    }
    
    // Only set price params if not at extremes
    if (priceRange[0] > MIN_PRICE) {
      params.set('minPrice', priceRange[0].toString());
    }
    if (priceRange[1] < MAX_PRICE) {
      params.set('maxPrice', priceRange[1].toString());
    }
    
    router.push(`/propiedades?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay — LCP. `next/image` con priority preload +
          fill object-cover; el optimizador genera el set responsive AVIF/WebP. */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-desktop-1920.webp"
          alt="Oaxaca Real Estate - Beautiful colonial architecture and modern properties"
          fill
          priority
          sizes="100vw"
          quality={75}
          className="object-cover"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Select
                options={propertyTypes}
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-background"
                label={t.hero.propertyType}
                aria-label={t.hero.propertyType}
              />
              <Select
                options={operations}
                value={selectedOperation}
                onChange={(e) => setSelectedOperation(e.target.value)}
                className="bg-background"
                label={t.properties.operationLabel}
                aria-label={t.properties.operationLabel}
              />
              <Select
                options={zones}
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="bg-background"
                label={t.hero.zone}
                aria-label={t.hero.zone}
              />
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="hero-price-slider"
                  className="text-sm font-medium text-foreground"
                >
                  {t.hero.priceRange}
                </label>
                <span className="text-sm font-semibold text-primary">
                  {formatMXN(priceRange[0])} - {formatMXN(priceRange[1])}
                </span>
              </div>
              <Slider
                id="hero-price-slider"
                value={sliderValues}
                onValueChange={(value) => setSliderValues(value as [number, number])}
                min={0}
                max={100}
                step={1}
                className="w-full"
                aria-label={t.hero.priceRange}
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
