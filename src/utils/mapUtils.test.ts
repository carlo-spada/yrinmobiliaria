import { describe, expect, it } from "vitest";
import { filterPropertiesByMap, isValidCoordinate, normalizeCoord, type MapFilters } from "./mapUtils";
import type { Property } from "@/types/property";

describe("mapUtils", () => {
  it("validates numeric and string coordinates", () => {
    expect(isValidCoordinate(17.0, -96.7)).toBe(true);
    expect(isValidCoordinate("17.0", "-96.7")).toBe(true);
  });

  it("rejects out-of-range or non-numeric coordinates", () => {
    expect(isValidCoordinate(200, 0)).toBe(false);
    expect(isValidCoordinate(0, -500)).toBe(false);
    expect(isValidCoordinate("abc", "def")).toBe(false);
  });

  it("normalizes valid values and returns null for invalid", () => {
    expect(normalizeCoord("10.5")).toBe(10.5);
    expect(normalizeCoord(0)).toBe(0);
    expect(normalizeCoord("abc")).toBeNull();
    expect(normalizeCoord(undefined)).toBeNull();
  });

  it("filters properties by type/zone/price/operation and bounds", () => {
    const properties: Property[] = [
      {
        id: "1",
        title: { es: "Casa", en: "House" },
        description: { es: "", en: "" },
        type: "casa",
        operation: "venta",
        price: 5000000,
        location: {
          zone: "centro",
          neighborhood: "n1",
          address: "a1",
          coordinates: { lat: 17.0, lng: -96.7 },
        },
        features: { bathrooms: 2, constructionArea: 100 },
        amenities: [],
        images: [],
        status: "disponible",
        featured: false,
        publishedDate: "",
      },
      {
        id: "2",
        title: { es: "Depto", en: "Apt" },
        description: { es: "", en: "" },
        type: "departamento",
        operation: "renta",
        price: 12000000,
        location: {
          zone: "norte",
          neighborhood: "n2",
          address: "a2",
          coordinates: { lat: 15.0, lng: -90.0 },
        },
        features: { bathrooms: 1, constructionArea: 80 },
        amenities: [],
        images: [],
        status: "disponible",
        featured: false,
        publishedDate: "",
      },
    ];

    const filters: MapFilters = { type: "casa", zone: "centro", priceRange: [0, 6000000], operation: "venta" };
    const bounds = {
      getSouth: () => 16.0,
      getNorth: () => 18.0,
      getWest: () => -100,
      getEast: () => -95,
    };

    const filtered = filterPropertiesByMap(properties, filters, bounds);
    expect(filtered.map((p) => p.id)).toEqual(["1"]);
  });

  it("drops properties with invalid coordinates", () => {
    const properties: Property[] = [
      {
        id: "bad",
        title: { es: "Casa", en: "House" },
        description: { es: "", en: "" },
        type: "casa",
        operation: "venta",
        price: 1000000,
        location: {
          zone: "centro",
          neighborhood: "n1",
          address: "a1",
          coordinates: { lat: Number.NaN as unknown as number, lng: "bad" as unknown as number },
        },
        features: { bathrooms: 1, constructionArea: 80 },
        amenities: [],
        images: [],
        status: "disponible",
        featured: false,
        publishedDate: "",
      },
    ];

    const filters: MapFilters = { type: "all", zone: "all", priceRange: [0, 6000000] };
    const bounds = {
      getSouth: () => -90,
      getNorth: () => 90,
      getWest: () => -180,
      getEast: () => 180,
    };

    const filtered = filterPropertiesByMap(properties, filters, bounds);
    expect(filtered).toHaveLength(0);
  });

  it("filters by bounds edge inclusively", () => {
    const properties: Property[] = [
      {
        id: "edge",
        title: { es: "Casa", en: "House" },
        description: { es: "", en: "" },
        type: "casa",
        operation: "venta",
        price: 2000000,
        location: {
          zone: "centro",
          neighborhood: "n1",
          address: "a1",
          coordinates: { lat: 10, lng: -20 },
        },
        features: { bathrooms: 1, constructionArea: 50 },
        amenities: [],
        images: [],
        status: "disponible",
        featured: false,
        publishedDate: "",
      },
    ];
    const filters: MapFilters = { type: "all", zone: "all", priceRange: [0, 5000000], operation: "all" };
    const bounds = {
      getSouth: () => 10,
      getNorth: () => 11,
      getWest: () => -21,
      getEast: () => -20,
    };
    const filtered = filterPropertiesByMap(properties, filters, bounds);
    expect(filtered.map((p) => p.id)).toEqual(["edge"]);
  });
});
