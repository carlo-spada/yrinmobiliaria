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
