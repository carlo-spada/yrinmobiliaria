import { useState, useRef, useEffect, useCallback, Fragment } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import { Icon, LatLngBounds } from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "./MapView.css";
import { useLanguage } from "@/utils/LanguageContext";
import { useProperties } from "@/hooks/useProperties";
import { Property, PropertyType } from "@/types/property";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select-enhanced";
import { Slider } from "@/components/ui/slider";
import { ResponsiveImage } from "@/components/ResponsiveImage";
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
  AlertCircle,
  Navigation,
} from "lucide-react";

// Property type colors
const propertyColors = {
  casa: "#C85A3C",
  departamento: "#2D5E4F",
  local: "#D4A574",
  oficina: "#B8956A",
};

// Create custom icons for each property type
const createCustomIcon = (type: PropertyType, selected: boolean = false) => {
  const color = propertyColors[type];
  const scale = selected ? 1.3 : 1;
  return new Icon({
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
};

// Helper to check if coordinates are valid (with string coercion)
const isValidCoordinate = (lat: any, lng: any): boolean => {
  // Coerce strings to numbers
  const numLat = typeof lat === "string" ? parseFloat(lat) : lat;
  const numLng = typeof lng === "string" ? parseFloat(lng) : lng;
  
  return (
    typeof numLat === "number" &&
    typeof numLng === "number" &&
    isFinite(numLat) &&
    isFinite(numLng) &&
    numLat >= -90 &&
    numLat <= 90 &&
    numLng >= -180 &&
    numLng <= 180
  );
};

// Normalize coordinates to numbers
const normalizeCoord = (value: any): number | null => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return typeof num === "number" && isFinite(num) ? num : null;
};

// Component to handle map bounds changes
function MapBoundsTracker({ 
  onBoundsChange 
}: { 
  onBoundsChange: (bounds: LatLngBounds) => void 
}) {
  const map = useMapEvents({
    moveend: () => {
      onBoundsChange(map.getBounds());
    },
    zoomend: () => {
      onBoundsChange(map.getBounds());
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
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get filters from URL
  const urlType = searchParams.get("type") || "all";
  const urlZone = searchParams.get("zone") || "all";
  const urlMinPrice = searchParams.get("minPrice") || "0";
  const urlMaxPrice = searchParams.get("maxPrice") || "10000000";
  const urlPropertyId = searchParams.get("propertyId");

  const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);
  
  // Bounds-aware property fetching with debounce
  const boundsFilter = mapBounds ? {
    minLat: mapBounds.getSouth(),
    maxLat: mapBounds.getNorth(),
    minLng: mapBounds.getWest(),
    maxLng: mapBounds.getEast(),
  } : undefined;

  const { data: allProperties = [], isLoading, error } = useProperties({ 
    featured: false,
    bounds: boundsFilter,
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(urlPropertyId);
  const [flyToCenter, setFlyToCenter] = useState<[number, number] | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    type: urlType as PropertyType | "all",
    zone: urlZone,
    priceRange: [parseInt(urlMinPrice), parseInt(urlMaxPrice)],
  });

  const listRef = useRef<HTMLDivElement>(null);

  const propertyTypeIcons = {
    casa: Home,
    departamento: Building2,
    local: Store,
    oficina: Briefcase,
  };

  // Filter properties with valid coordinates
  const validProperties = allProperties.filter(
    (p) =>
      p.location?.coordinates &&
      isValidCoordinate(p.location.coordinates.lat, p.location.coordinates.lng)
  );

  // Diagnostics: Log property counts
  useEffect(() => {
    console.warn(`[Map Diagnostics] Total properties: ${allProperties.length}, Valid coords: ${validProperties.length}, Filtered: ${filteredProperties.length}`);
    if (allProperties.length > validProperties.length) {
      console.warn(`[Map Diagnostics] ${allProperties.length - validProperties.length} properties have invalid/missing coordinates`);
    }
  }, [allProperties.length, validProperties.length]);

  // Apply filters
  const filteredProperties = validProperties.filter((p) => {
    if (filters.type !== "all" && p.type !== filters.type) return false;
    if (filters.zone !== "all" && p.location.zone !== filters.zone) return false;
    if (p.price < filters.priceRange[0] || p.price > filters.priceRange[1]) return false;
    return true;
  });

  const zones = Array.from(new Set(validProperties.map((p) => p.location.zone)));

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.type !== "all") params.set("type", filters.type);
    if (filters.zone !== "all") params.set("zone", filters.zone);
    if (filters.priceRange[0] !== 0) params.set("minPrice", filters.priceRange[0].toString());
    if (filters.priceRange[1] !== 10000000) params.set("maxPrice", filters.priceRange[1].toString());
    if (selectedPropertyId) params.set("propertyId", selectedPropertyId);
    
    setSearchParams(params, { replace: true });
  }, [filters, selectedPropertyId, setSearchParams]);

  // Handle property selection
  const handlePropertyClick = useCallback((property: Property) => {
    setSelectedPropertyId(property.id);
    
    if (
      property.location?.coordinates &&
      isValidCoordinate(property.location.coordinates.lat, property.location.coordinates.lng)
    ) {
      setFlyToCenter([property.location.coordinates.lat, property.location.coordinates.lng]);
    }

    // Scroll card into view
    setTimeout(() => {
      const cardElement = document.getElementById(`property-card-${property.id}`);
      if (cardElement && listRef.current) {
        cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  }, []);

  // Center on selected property from URL on mount
  useEffect(() => {
    if (urlPropertyId && filteredProperties.length > 0) {
      const property = filteredProperties.find((p) => p.id === urlPropertyId);
      if (property) {
        handlePropertyClick(property);
      }
    }
  }, [urlPropertyId, filteredProperties, handlePropertyClick]);

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
  const debounceRef = useRef<number>();
  const handleBoundsChange = useCallback((bounds: LatLngBounds) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    // Debounce to avoid excessive fetches during pan/zoom
    debounceRef.current = window.setTimeout(() => {
      setMapBounds(bounds);
      console.warn(`[Map Diagnostics] Bounds changed - fetching properties in viewport`);
    }, 400);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">
            {language === "es" ? "Cargando propiedades..." : "Loading properties..."}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-xl font-semibold mb-2">
            {language === "es" ? "Error al cargar propiedades" : "Error loading properties"}
          </h2>
          <p className="text-muted-foreground mb-4">
            {language === "es"
              ? "No pudimos cargar las propiedades. Por favor, intenta de nuevo más tarde."
              : "We couldn't load the properties. Please try again later."}
          </p>
          <Button onClick={() => window.location.reload()}>
            {language === "es" ? "Reintentar" : "Retry"}
          </Button>
        </div>
      </div>
    );
  }

  // Empty state for no valid properties
  if (validProperties.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
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
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-background border-b z-10 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">
          {language === "es" ? "Mapa de Propiedades" : "Properties Map"}
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUseMyLocation}
            className="hidden md:flex"
            title={language === "es" ? "Usar mi ubicación" : "Use my location"}
          >
            <Navigation className="h-4 w-4 mr-2" />
            {language === "es" ? "Mi ubicación" : "My location"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden"
          >
            {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <div
          className={`
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            fixed lg:relative z-20 h-full w-80 bg-background border-r
            transition-transform duration-300 ease-in-out
            flex flex-col
          `}
        >
          {/* Filters */}
          <div className="p-4 border-b space-y-4 overflow-y-auto">
            <h3 className="font-semibold text-sm">
              {language === "es" ? "Filtros" : "Filters"}
            </h3>

            <Select
              label={language === "es" ? "Tipo de propiedad" : "Property type"}
              options={[
                { value: "all", label: language === "es" ? "Todos" : "All" },
                { value: "casa", label: language === "es" ? "Casa" : "House" },
                { value: "departamento", label: language === "es" ? "Departamento" : "Apartment" },
                { value: "local", label: language === "es" ? "Local" : "Commercial" },
                { value: "oficina", label: language === "es" ? "Oficina" : "Office" },
              ]}
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
            />

            <Select
              label={language === "es" ? "Zona" : "Zone"}
              options={[
                { value: "all", label: language === "es" ? "Todas" : "All" },
                ...zones.map((zone) => ({ value: zone as string, label: zone as string })),
              ]}
              value={filters.zone}
              onChange={(e) => setFilters({ ...filters, zone: e.target.value })}
            />

            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === "es" ? "Rango de precio" : "Price range"}
              </label>
              <Slider
                min={0}
                max={10000000}
                step={100000}
                value={filters.priceRange}
                onValueChange={(value) => setFilters({ ...filters, priceRange: value })}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>${(filters.priceRange[0] / 1000000).toFixed(1)}M</span>
                <span>${(filters.priceRange[1] / 1000000).toFixed(1)}M</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() =>
                setFilters({
                  type: "all",
                  zone: "all",
                  priceRange: [0, 10000000],
                })
              }
            >
              {language === "es" ? "Limpiar filtros" : "Clear filters"}
            </Button>
          </div>

          {/* Legend */}
          <div className="p-4 border-b">
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
                      {type === "casa"
                        ? language === "es" ? "Casa" : "House"
                        : type === "departamento"
                        ? language === "es" ? "Departamento" : "Apartment"
                        : type === "local"
                        ? language === "es" ? "Local" : "Commercial"
                        : language === "es" ? "Oficina" : "Office"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Properties List */}
          <div className="flex-1 overflow-y-auto p-4" ref={listRef}>
            <h3 className="font-semibold text-sm mb-3">
              {filteredProperties.length}{" "}
              {language === "es" ? "propiedades" : "properties"}
            </h3>
            <div className="space-y-3">
              {filteredProperties.map((property) => {
                const Icon = propertyTypeIcons[property.type];
                const isSelected = selectedPropertyId === property.id;
                
                return (
                  <Card
                    key={property.id}
                    id={`property-card-${property.id}`}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => handlePropertyClick(property)}
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
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <MapContainer
            center={[17.0732, -96.7266]}
            zoom={12}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapBoundsTracker onBoundsChange={handleBoundsChange} />
            <FlyToLocation center={flyToCenter} />

            {/* Render markers directly without clustering for stability */}
            <Fragment>
              {filteredProperties.map((property) => {
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
                  icon={createCustomIcon(property.type, isSelected)}
                  eventHandlers={{
                    click: () => handlePropertyClick(property),
                  }}
                >
                  <Popup>
                    <div className="w-64">
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
            })}
            </Fragment>

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

          {/* Mobile overlay when sidebar is open */}
          {isSidebarOpen && (
            <div
              className="lg:hidden absolute inset-0 bg-black/50 z-10"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
