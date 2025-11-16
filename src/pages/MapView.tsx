import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapView.css";
import { useLanguage } from "@/utils/LanguageContext";
import { getAvailableProperties } from "@/data/properties";
import { Property, PropertyType } from "@/types/property";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select-enhanced";
import { Slider } from "@/components/ui/slider";
import {
  X,
  Menu,
  MapPin,
  Home,
  Building2,
  Store,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

// Property type colors
const propertyColors = {
  casa: "#C85A3C",
  departamento: "#2D5E4F",
  local: "#D4A574",
  oficina: "#B8956A",
};

// Create custom icons for each property type
const createCustomIcon = (type: PropertyType) => {
  const color = propertyColors[type];
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 24 16 24s16-13 16-24c0-8.837-7.163-16-16-16z" 
              fill="${color}" stroke="#fff" stroke-width="2"/>
        <circle cx="16" cy="16" r="6" fill="#fff"/>
      </svg>
    `)}`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
};

// Component to fly to specific coordinates
function FlyToLocation({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15, { duration: 1 });
  }, [center, map]);
  return null;
}

export default function MapView() {
  const { language, t } = useLanguage();
  const [properties] = useState(getAvailableProperties());
  const [filteredProperties, setFilteredProperties] = useState(properties);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [flyToCenter, setFlyToCenter] = useState<[number, number] | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    type: "all" as PropertyType | "all",
    zone: "all",
    priceRange: [0, 10000000],
  });

  const mapRef = useRef(null);

  // Apply filters
  useEffect(() => {
    let filtered = properties;

    if (filters.type !== "all") {
      filtered = filtered.filter((p) => p.type === filters.type);
    }

    if (filters.zone !== "all") {
      filtered = filtered.filter((p) => p.location.zone === filters.zone);
    }

    filtered = filtered.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    setFilteredProperties(filtered);
  }, [filters, properties]);

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setFlyToCenter([property.location.coordinates.lat, property.location.coordinates.lng]);
  };

  const zones = Array.from(new Set(properties.map((p) => p.location.zone)));

  const propertyTypeIcons = {
    casa: Home,
    departamento: Building2,
    local: Store,
    oficina: Briefcase,
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-background border-b z-10 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">
          {language === "es" ? "Mapa de Propiedades" : "Properties Map"}
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden"
        >
          {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
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
                ...zones.map((zone) => ({ value: zone, label: zone })),
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

            {/* Reset Filters */}
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
                        ? language === "es"
                          ? "Casa"
                          : "House"
                        : type === "departamento"
                        ? language === "es"
                          ? "Departamento"
                          : "Apartment"
                        : type === "local"
                        ? language === "es"
                          ? "Local"
                          : "Commercial"
                        : language === "es"
                        ? "Oficina"
                        : "Office"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Properties List */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="font-semibold text-sm mb-3">
              {filteredProperties.length}{" "}
              {language === "es" ? "propiedades" : "properties"}
            </h3>
            <div className="space-y-3">
              {filteredProperties.map((property) => {
                const Icon = propertyTypeIcons[property.type];
                return (
                  <Card
                    key={property.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedProperty?.id === property.id
                        ? "ring-2 ring-primary"
                        : ""
                    }`}
                    onClick={() => handlePropertyClick(property)}
                  >
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        <img
                          src={property.images[0]}
                          alt={property.title[language]}
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
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <>
              {filteredProperties.map((property) => (
                <Marker
                  key={property.id}
                  position={[
                    property.location.coordinates.lat,
                    property.location.coordinates.lng,
                  ]}
                  icon={createCustomIcon(property.type)}
                  eventHandlers={{
                    click: () => handlePropertyClick(property),
                  }}
                >
                  <Popup>
                    <div className="w-64">
                      <img
                        src={property.images[0]}
                        alt={property.title[language]}
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
                            ? language === "es"
                              ? "Venta"
                              : "Sale"
                            : language === "es"
                            ? "Renta"
                            : "Rent"}
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
              ))}
              {flyToCenter && <FlyToLocation center={flyToCenter} />}
            </>
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
