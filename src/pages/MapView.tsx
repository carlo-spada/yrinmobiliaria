import { Icon, LatLngBounds } from "leaflet";
import type { Marker as LeafletMarker } from "leaflet";
import {
  X,
  Menu,
  MapPin,
  Home,
  Building2,
  Store,
  Briefcase,
  ChevronRight,
  Loader2,
  Navigation,
  Maximize2,
  LandPlot,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useSearchParams, Link } from "react-router-dom";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "./MapView.css";
import { PageLayout } from "@/components/layout";
import { MapErrorBoundary } from "@/components/MapErrorBoundary";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select-enhanced";
import { Skeleton } from "@/components/ui/skeleton-loader";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProperties } from "@/hooks/useProperties";
import { useServiceZones } from "@/hooks/useServiceZones";
import { Property, PropertyType } from "@/types/property";
import { filterPropertiesByMap, isValidCoordinate, normalizeCoord } from "@/utils/mapUtils";
import { toLogPrice, fromLogPrice, formatMXN, MIN_PRICE, MAX_PRICE } from "@/utils/priceSliderHelpers";

// Property type colors
const propertyColors: Record<PropertyType, string> = {
  casa: "#C85A3C",
  departamento: "#2D5E4F",
  local: "#D4A574",
  oficina: "#B8956A",
  terrenos: "#8B7355",
};

// Pre-compute icons for each property type and selection state to avoid btoa() on every render
const iconCache = new Map<string, Icon>();

function getPropertyIcon(type: PropertyType, selected: boolean = false): Icon {
  const cacheKey = `${type}-${selected}`;
  let icon = iconCache.get(cacheKey);

  if (!icon) {
    const color = propertyColors[type];
    const scale = selected ? 1.3 : 1;
    icon = new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="${32 * scale}" height="${40 * scale}" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 24 16 24s16-13 16-24c0-8.837-7.163-16-16-16z"
                fill="${color}" stroke="${selected ? '#FFD700' : '#fff'}" stroke-width="${selected ? 3 : 2}"/>
          <circle cx="16" cy="16" r="6" fill="#fff"/>
        </svg>
      `)}`,
      iconSize: [32 * scale, 40 * scale],
      iconAnchor: [16 * scale, 40 * scale],
      popupAnchor: [0, -40 * scale],
    });
    iconCache.set(cacheKey, icon);
  }

  return icon;
}

// Component to handle map bounds changes and click-to-deselect
function MapBoundsTracker({
  onBoundsChange,
  onMapClick
}: {
  onBoundsChange: (bounds: LatLngBounds) => void;
  onMapClick: () => void;
}) {
  const map = useMapEvents({
    moveend: () => {
      onBoundsChange(map.getBounds());
    },
    zoomend: () => {
      onBoundsChange(map.getBounds());
    },
    click: () => {
      onMapClick();
    },
  });

  useEffect(() => {
    // Initial bounds
    onBoundsChange(map.getBounds());
  }, [map, onBoundsChange]);

  return null;
}

// Component to fly to specific coordinates
function FlyToLocation({
  center,
  zoom = 15
}: {
  center: [number, number] | null;
  zoom?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1 });
    }
  }, [center, zoom, map]);

  return null;
}

export default function MapView() {
  const { language, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: allProperties = [], isLoading } = useProperties({ featured: false });
  const { zones: dbZones } = useServiceZones();
  const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);

  // URL params
  const urlType = searchParams.get("type") || "all";
  const urlZone = searchParams.get("zone") || "all";
  const urlMinPrice = searchParams.get("minPrice") || MIN_PRICE.toString();
  const urlMaxPrice = searchParams.get("maxPrice") || MAX_PRICE.toString();
  const urlPropertyId = searchParams.get("propertyId") || null;

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(urlPropertyId);
  const [flyToCenter, setFlyToCenter] = useState<[number, number] | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const openPopupRef = useRef<LeafletMarker | null>(null);

  // Logarithmic slider values
  const [sliderValues, setSliderValues] = useState<[number, number]>([
    fromLogPrice(parseInt(urlMinPrice)),
    fromLogPrice(parseInt(urlMaxPrice)),
  ]);

  // Filters
  const [filters, setFilters] = useState({
    type: urlType as PropertyType | "all",
    zone: urlZone,
    priceRange: [toLogPrice(sliderValues[0]), toLogPrice(sliderValues[1])] as [number, number],
  });

  const listRef = useRef<HTMLDivElement>(null);

  const propertyTypeIcons = {
    casa: Home,
    departamento: Building2,
    local: Store,
    oficina: Briefcase,
    terrenos: LandPlot,
  };

  // Filter properties with valid coordinates
  const validProperties = useMemo(() => {
    return allProperties.filter(
      (p) =>
        p.location?.coordinates &&
        isValidCoordinate(p.location.coordinates.lat, p.location.coordinates.lng)
    );
  }, [allProperties]);

  // Diagnostics: Log property counts
  useEffect(() => {
    console.warn(`[Map Diagnostics] Total properties: ${allProperties.length}, Valid coords: ${validProperties.length}`);
    if (allProperties.length > validProperties.length) {
      console.warn(`[Map Diagnostics] ${allProperties.length - validProperties.length} properties have invalid/missing coordinates`);
    }
  }, [allProperties.length, validProperties.length]);

  // Apply filters (including bounds filtering client-side)
  const filteredProperties = useMemo(() => {
    return filterPropertiesByMap(validProperties, filters, mapBounds);
  }, [validProperties, filters, mapBounds]);


  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.type !== "all") params.set("type", filters.type);
    if (filters.zone !== "all") params.set("zone", filters.zone);
    if (filters.priceRange[0] !== MIN_PRICE) params.set("minPrice", filters.priceRange[0].toString());
    if (filters.priceRange[1] !== MAX_PRICE) params.set("maxPrice", filters.priceRange[1].toString());
    if (selectedPropertyId) params.set("propertyId", selectedPropertyId);

    setSearchParams(params, { replace: true });
  }, [filters, selectedPropertyId, setSearchParams]);

  // Handle property selection
  const handlePropertyClick = useCallback((property: Property, markerRef?: LeafletMarker | null) => {
    // Close previous popup if exists
    if (openPopupRef.current && openPopupRef.current !== markerRef) {
      openPopupRef.current.closePopup();
    }

    setSelectedPropertyId(property.id);

    if (
      property.location?.coordinates &&
      isValidCoordinate(property.location.coordinates.lat, property.location.coordinates.lng)
    ) {
      setFlyToCenter([property.location.coordinates.lat, property.location.coordinates.lng]);
    }

    // Store the marker ref to open its popup
    if (markerRef) {
      openPopupRef.current = markerRef;
      // Open popup after a short delay to ensure flyTo completes
      setTimeout(() => {
        markerRef.openPopup();
      }, 100);
    }

    // Scroll card into view
    setTimeout(() => {
      const cardElement = document.getElementById(`property-card-${property.id}`);
      if (cardElement && listRef.current) {
        cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  }, []);

  // Compute initial flyTo center for URL property (only computed once when properties load)
  const initialPropertyCenter = useMemo(() => {
    if (urlPropertyId && filteredProperties.length > 0) {
      const property = filteredProperties.find((p) => p.id === urlPropertyId);
      if (property?.location?.coordinates &&
        isValidCoordinate(property.location.coordinates.lat, property.location.coordinates.lng)) {
        return [property.location.coordinates.lat, property.location.coordinates.lng] as [number, number];
      }
    }
    return null;
  }, [urlPropertyId, filteredProperties]);

  // Track if we've centered on the initial property (use state, not ref)
  const [hasInitialCentered, setHasInitialCentered] = useState(false);

  // Derive effective fly-to center: user-triggered flyTo > initial property center (first time only)
  const effectiveFlyToCenter = useMemo(() => {
    if (flyToCenter) return flyToCenter;
    if (!hasInitialCentered && initialPropertyCenter) {
      // Mark as centered after this render via microtask
      queueMicrotask(() => setHasInitialCentered(true));
      return initialPropertyCenter;
    }
    return null;
  }, [flyToCenter, hasInitialCentered, initialPropertyCenter]);

  // Get user location
  const handleUseMyLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(coords);
          setFlyToCenter(coords);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  // Debounced bounds change handler
  const debounceRef = useRef<number | undefined>(undefined);
  const handleBoundsChange = useCallback((bounds: LatLngBounds): void => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    // Debounce to avoid excessive re-renders during pan/zoom
    debounceRef.current = window.setTimeout(() => {
      setMapBounds(bounds);
    }, 400);
  }, []);

  // Handle map click to deselect and close popup
  const handleMapClick = useCallback(() => {
    setSelectedPropertyId(null);
    if (openPopupRef.current) {
      openPopupRef.current.closePopup();
      openPopupRef.current = null;
    }
  }, []);

  // Handle reset view to show all properties
  const handleResetView = useCallback(() => {
    if (filteredProperties.length > 0) {
      const bounds = new LatLngBounds(
        filteredProperties.map(p => [
          normalizeCoord(p.location.coordinates.lat)!,
          normalizeCoord(p.location.coordinates.lng)!
        ])
      );
      setFlyToCenter([bounds.getCenter().lat, bounds.getCenter().lng]);
    }
  }, [filteredProperties]);

  // Clear specific filter
  const clearFilter = useCallback((filterType: 'type' | 'zone' | 'price') => {
    if (filterType === 'type') {
      setFilters({ ...filters, type: "all" });
    } else if (filterType === 'zone') {
      setFilters({ ...filters, zone: "all" });
    } else if (filterType === 'price') {
      setFilters({ ...filters, priceRange: [0, 100000000] });
    }
  }, [filters]);

  // Get active filters for badges
  const activeFilters = useMemo(() => {
    const badges = [];
    if (filters.type !== "all") {
      badges.push({
        type: 'type' as const,
        label: filters.type === "casa"
          ? language === "es" ? "Casa" : "House"
          : filters.type === "departamento"
            ? language === "es" ? "Departamento" : "Apartment"
            : filters.type === "local"
              ? language === "es" ? "Local" : "Commercial"
              : language === "es" ? "Oficina" : "Office"
      });
    }
    if (filters.zone !== "all") {
      badges.push({ type: 'zone' as const, label: filters.zone });
    }
    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 100000000) {
      badges.push({
        type: 'price' as const,
        label: `$${(filters.priceRange[0] / 1000000).toFixed(1)}M - $${(filters.priceRange[1] / 1000000).toFixed(1)}M`
      });
    }
    return badges;
  }, [filters, language]);

  // Memoized markers for performance
  const markers = useMemo(() => {
    return filteredProperties.map((property) => {
      // Normalize and validate coordinates
      const lat = normalizeCoord(property.location.coordinates.lat);
      const lng = normalizeCoord(property.location.coordinates.lng);

      if (!lat || !lng || !isValidCoordinate(lat, lng)) {
        return null;
      }

      const isSelected = selectedPropertyId === property.id;

      return (
        <Marker
          key={property.id}
          position={[lat, lng]}
          icon={getPropertyIcon(property.type, isSelected)}
          eventHandlers={{
            click: (e) => {
              // Close previous popup before opening new one
              if (openPopupRef.current && openPopupRef.current !== e.target) {
                openPopupRef.current.closePopup();
              }
              openPopupRef.current = e.target;
              handlePropertyClick(property, e.target);
            },
          }}
          ref={(ref) => {
            // Auto-open popup for selected property from URL
            if (isSelected && ref && urlPropertyId === property.id) {
              setTimeout(() => {
                ref.openPopup();
                openPopupRef.current = ref;
              }, 500);
            }
          }}
        >
          <Popup
            autoPan={true}
            keepInView={true}
            closeButton={true}
            autoClose={true}
            closeOnClick={true}
          >
            <div className="w-64 p-2">
              <ResponsiveImage
                src={property.images[0]}
                variants={property.imageVariants?.[0]?.variants}
                alt={
                  property.imagesAlt?.[0]?.[language] || property.title[language]
                }
                className="w-full h-32 object-cover rounded mb-2"
              />
              <h3 className="font-semibold text-sm mb-1">
                {property.title[language]}
              </h3>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {property.location.neighborhood}, {property.location.zone}
              </p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-primary">
                  ${property.price.toLocaleString()}
                </span>
                <Badge
                  variant={
                    property.operation === "venta" ? "default" : "secondary"
                  }
                >
                  {property.operation === "venta"
                    ? language === "es" ? "Venta" : "Sale"
                    : language === "es" ? "Renta" : "Rent"}
                </Badge>
              </div>
              <Link to={`/propiedad/${property.id}`}>
                <Button variant="primary" size="sm" className="w-full">
                  {language === "es" ? "Ver detalles" : "View details"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </Popup>
        </Marker>
      );
    }).filter(Boolean);
  }, [filteredProperties, selectedPropertyId, language, handlePropertyClick, urlPropertyId]);

  // Loading state
  if (isLoading) {
    return (
      <PageLayout includeFooter={false} fullHeight>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">
              {language === "es" ? "Cargando propiedades..." : "Loading properties..."}
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }


  // Empty state for no valid properties
  if (validProperties.length === 0) {
    return (
      <PageLayout includeFooter={false} fullHeight>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">
              {language === "es" ? "No hay propiedades disponibles" : "No properties available"}
            </h2>
            <p className="text-muted-foreground mb-4">
              {language === "es"
                ? "No encontramos propiedades con ubicaciones válidas en este momento."
                : "We couldn't find properties with valid locations at this time."}
            </p>
            <Button asChild>
              <Link to="/propiedades">
                {language === "es" ? "Ver todas las propiedades" : "View all properties"}
              </Link>
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <MapErrorBoundary language={language}>
      <PageLayout includeFooter={false} fullHeight={false}>
        {/* Main container - proper height calculation excluding header, prevent page scroll */}
        <div className="flex flex-col h-[calc(100vh-5rem)] overflow-hidden">
          {/* Map controls bar - auto-hide on hover */}
          <div
            className="bg-background border-b px-4 py-3 flex items-center justify-between relative flex-shrink-0
                       lg:opacity-0 lg:hover:opacity-100 lg:focus-within:opacity-100 transition-opacity duration-300
                       h-12 sm:h-14 lg:h-14"
          >
            <h1 className="text-base sm:text-lg lg:text-xl font-bold">
              {language === "es" ? "Mapa de Propiedades" : "Properties Map"}
            </h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetView}
                className="hidden md:flex"
                title={language === "es" ? "Centrar vista" : "Reset view"}
                aria-label={language === "es" ? "Centrar vista en el mapa" : "Reset map view"}
              >
                <Maximize2 className="h-4 w-4 mr-2" aria-hidden="true" />
                {language === "es" ? "Centrar" : "Reset"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUseMyLocation}
                className="hidden md:flex"
                title={language === "es" ? "Usar mi ubicación" : "Use my location"}
                aria-label={language === "es" ? "Usar mi ubicación actual" : "Use my current location"}
              >
                <Navigation className="h-4 w-4 mr-2" aria-hidden="true" />
                {language === "es" ? "Mi ubicación" : "My location"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden"
                aria-label={isSidebarOpen ? (language === "es" ? "Cerrar lista de propiedades" : "Close property list") : (language === "es" ? "Abrir lista de propiedades" : "Open property list")}
              >
                {isSidebarOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
              </Button>
            </div>
          </div>

          {/* Content area: Sidebar + Map */}
          <div className="flex-1 flex flex-col lg:flex-row min-h-0">
            {/* Sidebar - Mobile: collapsible drawer, Desktop: fixed width column */}
            <div
              className={`
                ${isSidebarOpen ? "flex" : "hidden"} lg:flex
                flex-col bg-background
                w-full h-52 sm:h-64
                lg:w-80 lg:h-auto
                lg:border-r
                flex-shrink-0
              `}
            >
              {/* Filters Section */}
              <div className="p-4 border-b space-y-4 flex-shrink-0 overflow-y-auto">
                {/* Active filters badges */}
                {activeFilters.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.map((filter) => (
                      <Badge
                        key={filter.type}
                        variant="secondary"
                        className="flex items-center gap-1 cursor-pointer hover:bg-secondary/80"
                        onClick={() => clearFilter(filter.type)}
                      >
                        {filter.label}
                        <X className="h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                )}
                <h3 className="font-semibold text-sm">
                  {language === "es" ? "Filtros" : "Filters"}
                </h3>

                <Select
                  label={t.properties.propertyType}
                  options={[
                    { value: "all", label: t.hero.allTypes },
                    { value: "casa", label: t.properties.types.casa },
                    { value: "departamento", label: t.properties.types.departamento },
                    { value: "local", label: t.properties.types.local },
                    { value: "oficina", label: t.properties.types.oficina },
                    { value: "terrenos", label: t.properties.types.terrenos },
                  ]}
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value as PropertyType | 'all' })}
                />

                <Select
                  label={t.properties.zone}
                  options={[
                    { value: "all", label: t.hero.allZones },
                    ...dbZones,
                  ]}
                  value={filters.zone}
                  onChange={(e) => setFilters({ ...filters, zone: e.target.value })}
                />

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t.properties.priceRange}
                  </label>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={sliderValues}
                    onValueChange={(value) => {
                      setSliderValues(value as [number, number]);
                      setFilters({
                        ...filters,
                        priceRange: [toLogPrice(value[0]), toLogPrice(value[1])]
                      });
                    }}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatMXN(filters.priceRange[0])}</span>
                    <span>{formatMXN(filters.priceRange[1])}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setSliderValues([0, 100]);
                    setFilters({
                      type: "all",
                      zone: "all",
                      priceRange: [MIN_PRICE, MAX_PRICE],
                    });
                  }}
                >
                  {t.properties.clearFilters}
                </Button>
              </div>

              {/* Legend Section */}
              <div className="p-4 border-b flex-shrink-0">
                <h3 className="font-semibold text-sm mb-3">
                  {language === "es" ? "Leyenda" : "Legend"}
                </h3>
                <div className="space-y-2">
                  {Object.entries(propertyColors).map(([type, color]) => {
                    const Icon = propertyTypeIcons[type as PropertyType];
                    return (
                      <div key={type} className="flex items-center gap-2 text-sm">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <Icon className="h-4 w-4" />
                        <span className="capitalize">
                          {t.properties.types[type as keyof typeof t.properties.types]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Properties List - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 min-h-0" ref={listRef}>
                <div className="mb-3">
                  <h3 className="font-semibold text-sm">
                    {isLoading
                      ? (language === "es" ? "Cargando..." : "Loading...")
                      : language === "es"
                        ? `Mostrando ${filteredProperties.length} de ${validProperties.length} propiedades`
                        : `Showing ${filteredProperties.length} of ${validProperties.length} properties`}
                  </h3>
                </div>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((unused, i) => (
                      <div key={i} className="bg-card rounded-lg border border-border p-3">
                        <Skeleton className="h-24 w-full mb-2 rounded" />
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : filteredProperties.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">
                      {language === "es"
                        ? "No se encontraron propiedades con los filtros actuales."
                        : "No properties found with current filters."}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFilters({
                          type: "all",
                          zone: "all",
                          priceRange: [0, 100000000],
                        })
                      }
                    >
                      {language === "es" ? "Limpiar filtros" : "Clear filters"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProperties.map((property) => {
                      const Icon = propertyTypeIcons[property.type];
                      const isSelected = selectedPropertyId === property.id;

                      return (
                        <Card
                          key={property.id}
                          id={`property-card-${property.id}`}
                          className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? "ring-2 ring-primary" : ""
                            }`}
                          onClick={() => {
                            handlePropertyClick(property);
                          }}
                        >
                          <CardContent className="p-3">
                            <div className="flex gap-3">
                              <ResponsiveImage
                                src={property.images[0]}
                                variants={property.imageVariants?.[0]?.variants}
                                alt={
                                  property.imagesAlt?.[0]?.[language] || property.title[language]
                                }
                                className="w-20 h-20 object-cover rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                                  {property.title[language]}
                                </h4>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                  <MapPin className="h-3 w-3" />
                                  {property.location.zone}
                                </p>
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-bold text-primary">
                                    ${property.price.toLocaleString()}
                                  </p>
                                  <Icon
                                    className="h-4 w-4"
                                    style={{ color: propertyColors[property.type] }}
                                  />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Map Container - Fills remaining space */}
            <div className="flex-1 min-h-0 min-w-0">
              <MapContainer
                center={[17.0732, -96.7266]}
                zoom={10}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapBoundsTracker onBoundsChange={handleBoundsChange} onMapClick={handleMapClick} />
                <FlyToLocation center={effectiveFlyToCenter} />

                {/* Conditional clustering: only use clustering if >20 properties */}
                {filteredProperties.length > 20 ? (
                  <MarkerClusterGroup
                    chunkedLoading={false}
                    maxClusterRadius={50}
                    spiderfyOnMaxZoom={true}
                    showCoverageOnHover={false}
                    zoomToBoundsOnClick={true}
                  >
                    {markers}
                  </MarkerClusterGroup>
                ) : (
                  markers
                )}

                {/* User location marker */}
                {userLocation && (
                  <Marker
                    position={userLocation}
                    icon={new Icon({
                      iconUrl: `data:image/svg+xml;base64,${btoa(`
                        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="#fff" stroke-width="3"/>
                        </svg>
                      `)}`,
                      iconSize: [24, 24],
                      iconAnchor: [12, 12],
                    })}
                  />
                )}
              </MapContainer>
            </div>
          </div>
        </div>
      </PageLayout>
    </MapErrorBoundary>
  );
}
