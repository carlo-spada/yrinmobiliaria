import { Property } from "@/types/property";

export const properties: Property[] = [
  {
    id: "prop-001",
    title: {
      es: "Casa Colonial en Centro Histórico",
      en: "Colonial House in Historic Center",
    },
    description: {
      es: "Hermosa casa colonial completamente restaurada en el corazón del Centro Histórico de Oaxaca. Arquitectura tradicional con techos altos, patios interiores y acabados de lujo. A pasos de Santo Domingo y el Zócalo.",
      en: "Beautiful fully restored colonial house in the heart of Oaxaca's Historic Center. Traditional architecture with high ceilings, interior patios, and luxury finishes. Steps away from Santo Domingo and the Zócalo.",
    },
    type: "casa",
    operation: "venta",
    price: 8500000,
    location: {
      zone: "Centro Histórico",
      neighborhood: "Centro",
      address: "Calle Macedonio Alcalá 305",
      coordinates: { lat: 17.0654, lng: -96.7236 },
    },
    features: {
      bedrooms: 4,
      bathrooms: 3,
      parking: 1,
      constructionArea: 320,
      landArea: 280,
    },
    amenities: [
      "Cocina equipada",
      "Terraza",
      "Jardín interior",
      "Cantera original",
      "Pisos de barro",
      "Vigas de madera",
    ],
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
    ],
    status: "disponible",
    featured: true,
    publishedDate: "2024-01-15",
  },
  {
    id: "prop-002",
    title: {
      es: "Departamento Moderno en Reforma",
      en: "Modern Apartment in Reforma",
    },
    description: {
      es: "Departamento contemporáneo de 2 recámaras en zona Reforma. Excelente ubicación cerca de plazas comerciales, restaurantes y servicios. Amplio balcón con vista panorámica. Incluye estacionamiento techado.",
      en: "Contemporary 2-bedroom apartment in Reforma area. Excellent location near shopping malls, restaurants, and services. Spacious balcony with panoramic views. Includes covered parking.",
    },
    type: "departamento",
    operation: "renta",
    price: 12000,
    location: {
      zone: "Reforma",
      neighborhood: "Reforma",
      address: "Av. Ferrocarril 1120",
      coordinates: { lat: 17.0589, lng: -96.7164 },
    },
    features: {
      bedrooms: 2,
      bathrooms: 2,
      parking: 1,
      constructionArea: 95,
    },
    amenities: [
      "Elevador",
      "Seguridad 24/7",
      "Gimnasio",
      "Área de juegos",
      "Cocina integral",
      "Closets",
    ],
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200",
    ],
    status: "disponible",
    featured: false,
    publishedDate: "2024-02-20",
  },
  {
    id: "prop-003",
    title: {
      es: "Residencia de Lujo en San Felipe del Agua",
      en: "Luxury Residence in San Felipe del Agua",
    },
    description: {
      es: "Espectacular residencia de lujo en la zona más exclusiva de Oaxaca. Diseño arquitectónico único con amplios espacios, jardines maduros y vista a la ciudad. Acabados premium y tecnología de punta.",
      en: "Spectacular luxury residence in Oaxaca's most exclusive area. Unique architectural design with spacious areas, mature gardens, and city views. Premium finishes and cutting-edge technology.",
    },
    type: "casa",
    operation: "venta",
    price: 15800000,
    location: {
      zone: "San Felipe del Agua",
      neighborhood: "San Felipe",
      address: "Camino a San Felipe 845",
      coordinates: { lat: 17.0889, lng: -96.7311 },
    },
    features: {
      bedrooms: 5,
      bathrooms: 4,
      parking: 3,
      constructionArea: 480,
      landArea: 650,
    },
    amenities: [
      "Alberca",
      "Jardín amplio",
      "Terraza techada",
      "Cuarto de servicio",
      "Bodega",
      "Sistema de seguridad",
      "Paneles solares",
      "Cocina gourmet",
    ],
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200",
    ],
    status: "disponible",
    featured: true,
    publishedDate: "2024-01-10",
  },
  {
    id: "prop-004",
    title: {
      es: "Local Comercial en Zona Centro",
      en: "Commercial Space in Downtown Area",
    },
    description: {
      es: "Excelente local comercial en esquina con alta afluencia de personas. Ideal para restaurante, cafetería o boutique. Dos niveles, baños completos y área de almacén. Listo para operar.",
      en: "Excellent corner commercial space with high foot traffic. Ideal for restaurant, café, or boutique. Two levels, full bathrooms, and storage area. Ready to operate.",
    },
    type: "local",
    operation: "renta",
    price: 28000,
    location: {
      zone: "Centro Histórico",
      neighborhood: "Centro",
      address: "García Vigil 407",
      coordinates: { lat: 17.0643, lng: -96.7248 },
    },
    features: {
      bathrooms: 2,
      constructionArea: 140,
    },
    amenities: [
      "Dos niveles",
      "Fachada amplia",
      "Instalación eléctrica trifásica",
      "Bodega",
      "Área de cocina",
      "Ventanas amplias",
    ],
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200",
    ],
    status: "disponible",
    featured: false,
    publishedDate: "2024-03-01",
  },
  {
    id: "prop-005",
    title: {
      es: "Oficina Ejecutiva en Torre Corporativa",
      en: "Executive Office in Corporate Tower",
    },
    description: {
      es: "Oficina ejecutiva amueblada en moderna torre corporativa. Recepción, sala de juntas, tres cubículos y área privada. Excelente iluminación natural y vista panorámica. Incluye servicios y mantenimiento.",
      en: "Furnished executive office in modern corporate tower. Reception, meeting room, three cubicles, and private area. Excellent natural lighting and panoramic views. Services and maintenance included.",
    },
    type: "oficina",
    operation: "renta",
    price: 18500,
    location: {
      zone: "Reforma",
      neighborhood: "Reforma",
      address: "Blvd. Eduardo Vasconcelos 617",
      coordinates: { lat: 17.0621, lng: -96.7189 },
    },
    features: {
      bathrooms: 2,
      parking: 2,
      constructionArea: 110,
    },
    amenities: [
      "Aire acondicionado",
      "Internet de alta velocidad",
      "Elevadores",
      "Seguridad",
      "Estacionamiento visitantes",
      "Recepción común",
      "Cafetería",
    ],
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200",
      "https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=1200",
    ],
    status: "disponible",
    featured: false,
    publishedDate: "2024-02-28",
  },
  {
    id: "prop-006",
    title: {
      es: "Casa Campestre en Valles Centrales",
      en: "Country House in Central Valleys",
    },
    description: {
      es: "Hermosa casa campestre rodeada de naturaleza en los Valles Centrales. Perfecta para escapada de fin de semana o residencia permanente. Amplios jardines, huerto y vistas espectaculares a las montañas.",
      en: "Beautiful country house surrounded by nature in the Central Valleys. Perfect for weekend getaway or permanent residence. Spacious gardens, orchard, and spectacular mountain views.",
    },
    type: "casa",
    operation: "venta",
    price: 4200000,
    location: {
      zone: "Valles Centrales",
      neighborhood: "San Pablo Etla",
      address: "Carretera a Etla Km 12",
      coordinates: { lat: 17.1956, lng: -96.7864 },
    },
    features: {
      bedrooms: 3,
      bathrooms: 2,
      parking: 2,
      constructionArea: 180,
      landArea: 1200,
    },
    amenities: [
      "Jardín amplio",
      "Huerto",
      "Asador",
      "Pozo de agua",
      "Cisterna",
      "Terraza",
      "Árboles frutales",
    ],
    images: [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200",
      "https://images.unsplash.com/photo-1600563438938-a9a27216b4f5?w=1200",
    ],
    status: "disponible",
    featured: true,
    publishedDate: "2024-01-25",
  },
  {
    id: "prop-007",
    title: {
      es: "Departamento Tipo Loft en Zona Norte",
      en: "Loft-Style Apartment in North Zone",
    },
    description: {
      es: "Moderno loft de concepto abierto en desarrollo nuevo. Diseño minimalista con techos dobles, cocina integral y balcón. Cerca de universidades y centros comerciales. Ideal para jóvenes profesionistas.",
      en: "Modern open-concept loft in new development. Minimalist design with double-height ceilings, integrated kitchen, and balcony. Near universities and shopping centers. Ideal for young professionals.",
    },
    type: "departamento",
    operation: "renta",
    price: 9500,
    location: {
      zone: "Zona Norte",
      neighborhood: "Lomas de San Javier",
      address: "Av. Universidad 340",
      coordinates: { lat: 17.0712, lng: -96.7398 },
    },
    features: {
      bedrooms: 1,
      bathrooms: 1,
      parking: 1,
      constructionArea: 65,
    },
    amenities: [
      "Techos altos",
      "Cocina equipada",
      "Balcón",
      "Área de lavandería",
      "Gym compartido",
      "Roof garden",
    ],
    images: [
      "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200",
      "https://images.unsplash.com/photo-1600566752229-250ed79470a3?w=1200",
    ],
    status: "disponible",
    featured: false,
    publishedDate: "2024-03-05",
  },
  {
    id: "prop-008",
    title: {
      es: "Casa Tradicional en Xochimilco",
      en: "Traditional House in Xochimilco",
    },
    description: {
      es: "Acogedora casa tradicional oaxaqueña en tranquila colonia familiar. Patio central, corredores amplios y espacios bien distribuidos. Perfecta para familias que buscan tranquilidad cerca de la ciudad.",
      en: "Cozy traditional Oaxacan house in quiet family neighborhood. Central patio, spacious corridors, and well-distributed spaces. Perfect for families seeking tranquility near the city.",
    },
    type: "casa",
    operation: "venta",
    price: 3800000,
    location: {
      zone: "Zona Norte",
      neighborhood: "Xochimilco",
      address: "Calle Laureles 125",
      coordinates: { lat: 17.0756, lng: -96.7289 },
    },
    features: {
      bedrooms: 3,
      bathrooms: 2,
      parking: 2,
      constructionArea: 165,
      landArea: 200,
    },
    amenities: [
      "Patio",
      "Cochera techada",
      "Piso de barro",
      "Cocina amplia",
      "Lavandería",
      "Área de tendido",
    ],
    images: [
      "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1200",
      "https://images.unsplash.com/photo-1600563440091-36f8e6057c8a?w=1200",
      "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=1200",
    ],
    status: "disponible",
    featured: false,
    publishedDate: "2024-02-10",
  },
  {
    id: "prop-009",
    title: {
      es: "Penthouse con Vista Panorámica",
      en: "Penthouse with Panoramic View",
    },
    description: {
      es: "Exclusivo penthouse en el último piso con terraza privada de 80m². Vista 360° de la ciudad y las montañas. Acabados de primera calidad, cocina de diseñador y sistema domótico completo.",
      en: "Exclusive penthouse on top floor with 80m² private terrace. 360° views of the city and mountains. Top-quality finishes, designer kitchen, and complete home automation system.",
    },
    type: "departamento",
    operation: "venta",
    price: 12500000,
    location: {
      zone: "Reforma",
      neighborhood: "Reforma",
      address: "Av. Símbolos Patrios 1205",
      coordinates: { lat: 17.0634, lng: -96.7142 },
    },
    features: {
      bedrooms: 3,
      bathrooms: 3,
      parking: 2,
      constructionArea: 220,
    },
    amenities: [
      "Terraza privada",
      "Jacuzzi",
      "BBQ área",
      "Domótica",
      "Pisos de mármol",
      "Walk-in closet",
      "Cuarto de TV",
      "Bodega privada",
    ],
    images: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200",
      "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?w=1200",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200",
    ],
    status: "disponible",
    featured: true,
    publishedDate: "2024-01-05",
  },
  {
    id: "prop-010",
    title: {
      es: "Local con Bodega en Periférico",
      en: "Commercial Space with Warehouse on Ring Road",
    },
    description: {
      es: "Amplio local comercial con bodega anexa sobre Periférico. Excelente visibilidad y acceso. Ideal para showroom, tienda de autopartes o negocio que requiera almacenaje. Tres frentes.",
      en: "Spacious commercial space with attached warehouse on Ring Road. Excellent visibility and access. Ideal for showroom, auto parts store, or business requiring storage. Three frontages.",
    },
    type: "local",
    operation: "venta",
    price: 5600000,
    location: {
      zone: "Zona Norte",
      neighborhood: "Volcanes",
      address: "Periférico Norte 2340",
      coordinates: { lat: 17.0845, lng: -96.7456 },
    },
    features: {
      bathrooms: 2,
      parking: 4,
      constructionArea: 280,
      landArea: 350,
    },
    amenities: [
      "Bodega amplia",
      "Tres frentes",
      "Rampa de carga",
      "Oficina",
      "Medio baño",
      "Estacionamiento",
      "Alta visibilidad",
    ],
    images: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200",
    ],
    status: "disponible",
    featured: false,
    publishedDate: "2024-02-15",
  },
];

// Helper functions for filtering properties
export const getPropertyById = (id: string): Property | undefined => {
  return properties.find((property) => property.id === id);
};

export const getPropertiesByZone = (zone: string): Property[] => {
  return properties.filter((property) => property.location.zone === zone);
};

export const getFeaturedProperties = (): Property[] => {
  return properties.filter((property) => property.featured && property.status === "disponible");
};

export const getAvailableProperties = (): Property[] => {
  return properties.filter((property) => property.status === "disponible");
};
