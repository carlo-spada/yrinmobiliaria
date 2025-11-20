import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Grid, List, SlidersHorizontal, MapPin } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PropertyCard } from '@/components/PropertyCard';
import { PropertyGridSkeleton } from '@/components/ui/skeleton-loader';
import { PropertyFilters } from '@/components/PropertyFilters';
import { SaveSearchDialog } from '@/components/SaveSearchDialog';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Select } from '@/components/ui/select-enhanced';
import { useLanguage } from '@/utils/LanguageContext';
import { useProperties } from '@/hooks/useProperties';
import { EmptyPropertyList } from '@/components/EmptyPropertyList';
import { Property, PropertyFilters as PropertyFiltersType } from '@/types/property';

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'newest';
type ViewMode = 'grid' | 'list';

const ITEMS_PER_PAGE = 12;

export default function Properties() {
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Fetch properties from database
  const { data: allProperties = [], isLoading } = useProperties();

  // Parse filters from URL
  const filtersFromUrl: PropertyFiltersType = useMemo(() => {
    const filters: PropertyFiltersType = {};
    
    const type = searchParams.get('type');
    if (type) filters.type = type as any;
    
    const operation = searchParams.get('operation');
    if (operation) filters.operation = operation as any;
    
    const zone = searchParams.get('zone');
    if (zone) filters.zone = zone;
    
    const minPrice = searchParams.get('minPrice');
    if (minPrice) filters.minPrice = Number(minPrice);
    
    const maxPrice = searchParams.get('maxPrice');
    if (maxPrice) filters.maxPrice = Number(maxPrice);
    
    const minBedrooms = searchParams.get('minBedrooms');
    if (minBedrooms) filters.minBedrooms = Number(minBedrooms);
    
    const minBathrooms = searchParams.get('minBathrooms');
    if (minBathrooms) filters.minBathrooms = Number(minBathrooms);
    
    return filters;
  }, [searchParams]);

  const [filters, setFilters] = useState<PropertyFiltersType>(filtersFromUrl);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.type) params.set('type', filters.type);
    if (filters.operation) params.set('operation', filters.operation);
    if (filters.zone) params.set('zone', filters.zone);
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.minBedrooms) params.set('minBedrooms', filters.minBedrooms.toString());
    if (filters.minBathrooms) params.set('minBathrooms', filters.minBathrooms.toString());
    
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    let filtered = allProperties.filter(property => {
      // Status filter - only show available
      if (property.status !== 'disponible') return false;

      // Type filter
      if (filters.type && property.type !== filters.type) return false;

      // Operation filter
      if (filters.operation && property.operation !== filters.operation) return false;

      // Zone filter
      if (filters.zone && property.location.zone !== filters.zone) return false;

      // Price filter
      if (filters.minPrice && property.price < filters.minPrice) return false;
      if (filters.maxPrice && property.price > filters.maxPrice) return false;

      // Bedrooms filter
      if (filters.minBedrooms && (!property.features.bedrooms || property.features.bedrooms < filters.minBedrooms)) return false;

      // Bathrooms filter
      if (filters.minBathrooms && property.features.bathrooms < filters.minBathrooms) return false;

      return true;
    });

    // Sort
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
        break;
      case 'relevance':
      default:
        // Featured first, then by date
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
        });
    }

    return filtered;
  }, [filters, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);
  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProperties.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProperties, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  const sortOptions = [
    { value: 'relevance', label: t.properties?.sort?.relevance || 'Relevancia' },
    { value: 'price-asc', label: t.properties?.sort?.priceAsc || 'Precio (menor a mayor)' },
    { value: 'price-desc', label: t.properties?.sort?.priceDesc || 'Precio (mayor a menor)' },
    { value: 'newest', label: t.properties?.sort?.newest || 'Más recientes' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 lg:pt-24">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-24">
                <PropertyFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                      {t.properties?.title || 'Propiedades'}
                    </h1>
                    <p className="text-muted-foreground">
                      {filteredProperties.length} {t.properties?.results || 'resultados encontrados'}
                    </p>
                  </div>

                  {/* Mobile Filter Button */}
                  <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <SheetTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="lg:hidden"
                        aria-label={language === 'es' ? 'Abrir filtros' : 'Open filters'}
                      >
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        {t.properties?.filters || 'Filtros'}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 overflow-y-auto">
                      <PropertyFilters
                        filters={filters}
                        onFiltersChange={(newFilters) => {
                          setFilters(newFilters);
                          setIsFilterOpen(false);
                        }}
                        isMobile
                      />
                    </SheetContent>
                  </Sheet>
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <Select
                  label={language === 'es' ? 'Ordenar por' : 'Sort by'}
                  options={sortOptions}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full sm:w-64"
                />

                  <div className="flex gap-2">
                    <Link to="/mapa">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        title={t.nav.map}
                        aria-label={language === 'es' ? 'Ver propiedades en el mapa' : 'View properties on map'}
                      >
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setViewMode('grid')}
                      aria-label={language === 'es' ? 'Vista de cuadrícula' : 'Grid view'}
                      title={language === 'es' ? 'Vista de cuadrícula' : 'Grid view'}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setViewMode('list')}
                      aria-label={language === 'es' ? 'Vista de lista' : 'List view'}
                      title={language === 'es' ? 'Vista de lista' : 'List view'}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Properties Grid/List */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <PropertyGridSkeleton count={9} />
                </div>
              ) : paginatedProperties.length > 0 ? (
                <>
                  <div className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                      : 'flex flex-col gap-6'
                  }>
                    {paginatedProperties.map((property, index) => {
                      const statusMap: Record<string, 'sale' | 'rent' | 'sold'> = {
                        venta: 'sale',
                        renta: 'rent',
                        vendida: 'sold',
                        rentada: 'sold',
                      };
                      
                      const formatPrice = (price: number) => {
                        return new Intl.NumberFormat('es-MX', {
                          style: 'currency',
                          currency: 'MXN',
                          minimumFractionDigits: 0,
                        }).format(price);
                      };
                      
                      // Calculate global index for priority loading (first page, first 6 items)
                      const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;

                      return (
                        <PropertyCard
                          key={property.id}
                          id={property.id}
                          image={property.images[0]}
                          title={property.title[language]}
                          price={formatPrice(property.price)}
                          location={`${property.location.neighborhood}, ${property.location.zone}`}
                          bedrooms={property.features.bedrooms || 0}
                          bathrooms={property.features.bathrooms}
                          area={property.features.constructionArea}
                          featured={property.featured}
                          status={statusMap[property.operation] || 'sale'}
                          priority={currentPage === 1 && index < 6}
                        />
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        {t.properties?.previous || 'Anterior'}
                      </Button>
                      
                      <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => setCurrentPage(page)}
                            className="w-10"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        {t.properties?.next || 'Siguiente'}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <p className="text-xl text-muted-foreground mb-4">
                    {t.properties?.noResults || 'No se encontraron propiedades'}
                  </p>
                  <Button onClick={() => setFilters({})}>
                    {t.properties?.clearFilters || 'Limpiar filtros'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
