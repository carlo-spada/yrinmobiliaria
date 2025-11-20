export type Language = 'es' | 'en';

export interface Translation {
  nav: {
    home: string;
    properties: string;
    map: string;
    about: string;
    contact: string;
    openMenu: string;
    closeMenu: string;
  };
  header: {
    scheduleVisit: string;
    changeLanguage: string;
    viewFavorites: string;
  };
  propertyTypes: {
    title: string;
    houses: string;
    apartments: string;
    commercial: string;
    viewAll: string;
  };
  hero: {
    title: string;
    subtitle: string;
    cta: string;
    searchPlaceholder: string;
    propertyType: string;
    zone: string;
    priceRange: string;
    search: string;
    allTypes: string;
    allZones: string;
  };
  featured: {
    title: string;
    subtitle: string;
    viewAll: string;
  };
  zones: {
    title: string;
    subtitle: string;
    properties: string;
  };
  whyUs: {
    title: string;
    subtitle: string;
    local: {
      title: string;
      description: string;
    };
    personalized: {
      title: string;
      description: string;
    };
    transparent: {
      title: string;
      description: string;
    };
  };
  stats: {
    title: string;
    propertiesSold: string;
    happyClients: string;
    yearsExperience: string;
  };
  finalCta: {
    title: string;
    subtitle: string;
    button: string;
  };
  properties: {
    title: string;
    results: string;
    filters: string;
    clearFilters: string;
    applyFilters: string;
    propertyType: string;
    operation: string;
    zone: string;
    priceRange: string;
    minPrice: string;
    maxPrice: string;
    bedrooms: string;
    bathrooms: string;
    any: string;
    noResults: string;
    featured: string;
    types: {
      casa: string;
      departamento: string;
      local: string;
      oficina: string;
    };
    operations: {
      venta: string;
      renta: string;
    };
    status: {
      sale: string;
      rent: string;
      sold: string;
    };
    sort: {
      relevance: string;
      priceAsc: string;
      priceDesc: string;
      newest: string;
    };
    previous: string;
    next: string;
  };
  footer: {
    description: string;
    quickLinks: string;
    zones: string;
    contact: string;
    address: string;
    phone: string;
    email: string;
    followUs: string;
    rights: string;
    privacy: string;
    terms: string;
  };
  favorites: {
    added: string;
    removed: string;
    add: string;
    remove: string;
  };
  contact: {
    title: string;
    subtitle: string;
    formTitle: string;
    formSubtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    subjectLabel: string;
    subjectPlaceholder: string;
    subjectInfo: string;
    subjectSell: string;
    subjectBuy: string;
    subjectRent: string;
    messageLabel: string;
    messagePlaceholder: string;
    send: string;
    sending: string;
    successTitle: string;
    successMessage: string;
    infoTitle: string;
    infoSubtitle: string;
    addressTitle: string;
    phoneTitle: string;
    emailTitle: string;
    hoursTitle: string;
    socialTitle: string;
    mapPlaceholder: string;
  };
  schedule: {
    title: string;
    subtitle: string;
    selectProperty: string;
    propertyLabel: string;
    propertyPlaceholder: string;
    selectDateTime: string;
    dateLabel: string;
    selectDate: string;
    timeLabel: string;
    contactInfo: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    notesLabel: string;
    notesPlaceholder: string;
    schedule: string;
    scheduling: string;
    successTitle: string;
    successMessage: string;
    confirmedTitle: string;
    confirmedSubtitle: string;
    contactLabel: string;
    addToCalendar: string;
    backToProperties: string;
  };
  admin: {
    dashboard: string;
    properties: string;
    zones: string;
    inquiries: string;
    visits: string;
    users: string;
    auditLogs: string;
    health: string;
    settings: string;
  };
}

export interface Translations {
  es: Translation;
  en: Translation;
}
