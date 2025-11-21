import type { Property, PropertyType } from "@/types/property";

export type MapBoundsLike = {
  getSouth(): number;
  getNorth(): number;
  getWest(): number;
  getEast(): number;
};

export const isValidCoordinate = (lat: unknown, lng: unknown): boolean => {
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

export const normalizeCoord = (value: unknown): number | null => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return typeof num === "number" && isFinite(num) ? num : null;
};

export type MapFilters = {
  type: PropertyType | "all";
  zone: string;
  priceRange: [number, number];
};

export const filterPropertiesByMap = (
  properties: Property[],
  filters: MapFilters,
  mapBounds?: MapBoundsLike | null
): Property[] => {
  return properties.filter((p) => {
    if (!p.location || !p.location.zone) return false;
    if (typeof p.price !== "number" || isNaN(p.price)) return false;

    if (filters.type !== "all" && p.type !== filters.type) return false;
    if (filters.zone !== "all" && p.location.zone !== filters.zone) return false;
    if (p.price < filters.priceRange[0] || p.price > filters.priceRange[1]) return false;

    if (mapBounds) {
      const lat = normalizeCoord(p.location.coordinates.lat);
      const lng = normalizeCoord(p.location.coordinates.lng);
      if (lat === null || lng === null) return false;
      if (lat < mapBounds.getSouth() || lat > mapBounds.getNorth()) return false;
      if (lng < mapBounds.getWest() || lng > mapBounds.getEast()) return false;
    }

    return true;
  });
};
