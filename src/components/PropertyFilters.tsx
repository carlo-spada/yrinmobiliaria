import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input-enhanced';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/utils/LanguageContext';
import { PropertyFilters as PropertyFiltersType, PropertyType, PropertyOperation } from '@/types/property';

interface PropertyFiltersProps {
  filters: PropertyFiltersType;
  onFiltersChange: (filters: PropertyFiltersType) => void;
  isMobile?: boolean;
}

const propertyTypes: PropertyType[] = ['casa', 'departamento', 'local', 'oficina'];
const operations: PropertyOperation[] = ['venta', 'renta'];
const zones = ['Centro Histórico', 'Reforma San Felipe', 'Zona Norte', 'Valles Centrales'];

export function PropertyFilters({ filters, onFiltersChange, isMobile }: PropertyFiltersProps) {
  const { t } = useLanguage();
  const [localFilters, setLocalFilters] = useState(filters);

  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || 10000000,
  ]);

  const handleTypeToggle = (type: PropertyType) => {
    const newFilters = { ...localFilters };
    if (newFilters.type === type) {
      delete newFilters.type;
    } else {
      newFilters.type = type;
    }
    setLocalFilters(newFilters);
    if (!isMobile) onFiltersChange(newFilters);
  };

  const handleOperationChange = (operation: PropertyOperation) => {
    const newFilters = { ...localFilters };
    if (newFilters.operation === operation) {
      delete newFilters.operation;
    } else {
      newFilters.operation = operation;
    }
    setLocalFilters(newFilters);
    if (!isMobile) onFiltersChange(newFilters);
  };

  const handleZoneChange = (zone: string) => {
    const newFilters = { ...localFilters };
    if (newFilters.zone === zone) {
      delete newFilters.zone;
    } else {
      newFilters.zone = zone;
    }
    setLocalFilters(newFilters);
    if (!isMobile) onFiltersChange(newFilters);
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
    const newFilters = { ...localFilters };
    newFilters.minPrice = value[0];
    newFilters.maxPrice = value[1];
    setLocalFilters(newFilters);
    if (!isMobile) onFiltersChange(newFilters);
  };

  const handleBedroomsChange = (bedrooms: number | undefined) => {
    const newFilters = { ...localFilters };
    if (bedrooms === undefined) {
      delete newFilters.minBedrooms;
    } else {
      newFilters.minBedrooms = bedrooms;
    }
    setLocalFilters(newFilters);
    if (!isMobile) onFiltersChange(newFilters);
  };

  const handleBathroomsChange = (bathrooms: number | undefined) => {
    const newFilters = { ...localFilters };
    if (bathrooms === undefined) {
      delete newFilters.minBathrooms;
    } else {
      newFilters.minBathrooms = bathrooms;
    }
    setLocalFilters(newFilters);
    if (!isMobile) onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    setPriceRange([0, 10000000]);
    onFiltersChange({});
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          {t.properties?.filters || 'Filters'}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="text-muted-foreground hover:text-foreground"
          aria-label={t.properties?.clearFilters || 'Clear all filters'}
        >
          <X className="h-4 w-4 mr-1" aria-hidden="true" />
          {t.properties?.clearFilters || 'Clear'}
        </Button>
      </div>

      <Separator />

      {/* Property Type */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          {t.properties?.propertyType || 'Property Type'}
        </Label>
        <div className="space-y-2" role="group" aria-label={t.properties?.propertyType || 'Property Type'}>
          {propertyTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${type}`}
                checked={localFilters.type === type}
                onCheckedChange={() => handleTypeToggle(type)}
                aria-label={`Filter by ${type}`}
              />
              <label
                htmlFor={`type-${type}`}
                className="text-sm text-foreground cursor-pointer capitalize"
              >
                {type}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Operation */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          {t.properties?.operation || 'Operation'}
        </Label>
        <div className="space-y-2" role="radiogroup" aria-label={t.properties?.operation || 'Operation'}>
          {operations.map((operation) => (
            <div key={operation} className="flex items-center space-x-2">
              <input
                type="radio"
                id={`operation-${operation}`}
                name="operation"
                checked={localFilters.operation === operation}
                onChange={() => handleOperationChange(operation)}
                className="w-4 h-4 text-primary"
                aria-label={`Filter by ${operation}`}
              />
              <label
                htmlFor={`operation-${operation}`}
                className="text-sm text-foreground cursor-pointer capitalize"
              >
                {operation}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Zone */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          {t.properties?.zone || 'Zona'}
        </Label>
        <div className="space-y-2">
          {zones.map((zone) => (
            <div key={zone} className="flex items-center space-x-2">
              <Checkbox
                id={`zone-${zone}`}
                checked={localFilters.zone === zone}
                onCheckedChange={() => handleZoneChange(zone)}
              />
              <label
                htmlFor={`zone-${zone}`}
                className="text-sm text-foreground cursor-pointer"
              >
                {zone}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-3">
        <Label htmlFor="price-slider" className="text-sm font-medium">
          {t.properties?.priceRange || 'Price Range'}
        </Label>
        <div className="space-y-4">
          <Slider
            id="price-slider"
            min={0}
            max={10000000}
            step={100000}
            value={priceRange}
            onValueChange={handlePriceChange}
            className="w-full"
            aria-label="Price range filter"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="min-price"
              type="number"
              label={t.properties?.minPrice || 'Minimum'}
              value={priceRange[0]}
              onChange={(e) => handlePriceChange([Number(e.target.value), priceRange[1]])}
              aria-label="Minimum price"
            />
            <Input
              id="max-price"
              type="number"
              label={t.properties?.maxPrice || 'Maximum'}
              value={priceRange[1]}
              onChange={(e) => handlePriceChange([priceRange[0], Number(e.target.value)])}
              aria-label="Maximum price"
            />
          </div>
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
          </p>
        </div>
      </div>

      <Separator />

      {/* Bedrooms */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          {t.properties?.bedrooms || 'Recámaras'}
        </Label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={localFilters.minBedrooms === undefined ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleBedroomsChange(undefined)}
          >
            {t.properties?.any || 'Cualquiera'}
          </Button>
          {[1, 2, 3, 4].map((num) => (
            <Button
              key={num}
              variant={localFilters.minBedrooms === num ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleBedroomsChange(num)}
            >
              {num}{num === 4 && '+'}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Bathrooms */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          {t.properties?.bathrooms || 'Baños'}
        </Label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={localFilters.minBathrooms === undefined ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleBathroomsChange(undefined)}
          >
            {t.properties?.any || 'Cualquiera'}
          </Button>
          {[1, 2, 3].map((num) => (
            <Button
              key={num}
              variant={localFilters.minBathrooms === num ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleBathroomsChange(num)}
            >
              {num}{num === 3 && '+'}
            </Button>
          ))}
        </div>
      </div>

      {/* Apply Button (Mobile only) */}
      {isMobile && (
        <>
          <Separator />
          <Button
            className="w-full"
            onClick={handleApplyFilters}
          >
            {t.properties?.applyFilters || 'Aplicar Filtros'}
          </Button>
        </>
      )}
    </div>
  );
}
