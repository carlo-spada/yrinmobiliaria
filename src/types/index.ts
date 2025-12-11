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
      terrenos: string;
    };
    operations: {
      venta: string;
      renta: string;
    };
    operationLabel: string;
    operationPlaceholder: string;
    status: {
      sale: string;
      rent: string;
      sold: string;
      pending: string;
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
    // Sidebar navigation
    dashboard: string;
    properties: string;
    zones: string;
    inquiries: string;
    visits: string;
    users: string;
    profile: string;
    auditLogs: string;
    health: string;
    settings: string;
    agents: string;
    organizations: string;
    // Common actions
    actions: {
      save: string;
      cancel: string;
      delete: string;
      edit: string;
      create: string;
      search: string;
      filter: string;
      close: string;
      confirm: string;
      reset: string;
      refresh: string;
      view: string;
      assign: string;
      invite: string;
    };
    // Common labels
    common: {
      loading: string;
      noData: string;
      status: string;
      date: string;
      time: string;
      name: string;
      email: string;
      phone: string;
      property: string;
      organization: string;
      role: string;
      active: string;
      inactive: string;
      total: string;
      assignOrg: string;
      noOrg: string;
    };
    // Dashboard page
    dashboardPage: {
      title: string;
      subtitle: string;
      totalProperties: string;
      totalInquiries: string;
      totalVisits: string;
      activityLogs: string;
      inSystem: string;
      received: string;
      scheduled: string;
      recentInquiries: string;
      upcomingVisits: string;
      noRecentInquiries: string;
      noUpcomingVisits: string;
      propertyLabel: string;
    };
    // Users page
    usersPage: {
      title: string;
      subtitle: string;
      tableHeaders: {
        user: string;
        roleAndTitle: string;
        contact: string;
        status: string;
        actions: string;
      };
      editDialog: {
        title: string;
        description: string;
        profileTab: string;
        accountTab: string;
        jobTitle: string;
        languages: string;
        bio: string;
        professionalEmail: string;
        emailPreference: string;
        forwardToPersonal: string;
        dedicatedInbox: string;
        userId: string;
        personalEmail: string;
        changeRole: string;
        currentRole: string;
        assignOrgLabel: string;
        onlySuperadmin: string;
        currentOrg: string;
        noLanguages: string;
        noName: string;
      };
      roles: {
        superadmin: string;
        admin: string;
        user: string;
      };
    };
    // Agents page
    agentsPage: {
      title: string;
      subtitle: string;
      inviteAgent: string;
      searchPlaceholder: string;
      noAgents: string;
      inviteFirst: string;
      stats: {
        properties: string;
        inquiries: string;
        visits: string;
      };
    };
    // Settings page
    settingsPage: {
      title: string;
      subtitle: string;
      tabs: {
        contact: string;
        business: string;
        social: string;
        organizations: string;
        permissions: string;
      };
      labels: {
        phone: string;
        email: string;
        whatsapp: string;
        address: string;
        companyName: string;
        businessHours: string;
        facebook: string;
        instagram: string;
      };
      organizations: {
        title: string;
        subtitle: string;
        newOrg: string;
        editOrg: string;
        createOrg: string;
        updateInfo: string;
        name: string;
        slug: string;
        contactEmail: string;
        domain: string;
        noOrgs: string;
        deleteConfirmTitle: string;
        deleteConfirmDesc: string;
        created: string;
        updated: string;
        deleted: string;
      };
      validation: {
        invalidEmail: string;
        invalidUrl: string;
        invalidWhatsapp: string;
        invalidPhone: string;
      };
    };
    // Inquiries page
    inquiriesPage: {
      title: string;
      subtitle: string;
      tableHeaders: {
        date: string;
        name: string;
        email: string;
        property: string;
        status: string;
        actions: string;
      };
      statuses: {
        new: string;
        contacted: string;
        resolved: string;
        archived: string;
      };
      generalInquiry: string;
      detailTitle: string;
      message: string;
      propertyOfInterest: string;
      noInquiries: string;
      inquiriesAppearHere: string;
      deleteConfirmTitle: string;
      deleteConfirmDesc: string;
      statusUpdated: string;
      deleted: string;
      deleteError: string;
    };
    // Visits page
    visitsPage: {
      title: string;
      subtitle: string;
      tableHeaders: {
        date: string;
        time: string;
        name: string;
        email: string;
        property: string;
        status: string;
        actions: string;
      };
      statuses: {
        pending: string;
        confirmed: string;
        completed: string;
        cancelled: string;
      };
      detailTitle: string;
      preferredDate: string;
      preferredTime: string;
      additionalMessage: string;
      noVisits: string;
      visitsAppearHere: string;
      deleteConfirmTitle: string;
      deleteConfirmDesc: string;
      statusUpdated: string;
      deleted: string;
      deleteError: string;
    };
    // Zones page
    zonesPage: {
      title: string;
      subtitle: string;
      newZone: string;
      editZone: string;
      tableHeaders: {
        nameEs: string;
        nameEn: string;
        order: string;
        status: string;
        actions: string;
      };
      form: {
        nameEs: string;
        nameEn: string;
        descriptionEs: string;
        descriptionEn: string;
        zoneImage: string;
        zoneImageDesc: string;
        displayOrder: string;
        activeZone: string;
      };
      noZones: string;
      createFirstZone: string;
      loadingZones: string;
      deleteConfirmTitle: string;
      deleteConfirmDesc: string;
      created: string;
      updated: string;
      deleted: string;
      saveError: string;
      deleteError: string;
    };
    // Audit Logs page
    auditLogsPage: {
      title: string;
      subtitle: string;
      tableHeaders: {
        dateTime: string;
        action: string;
        table: string;
        userId: string;
        details: string;
      };
      loadingLogs: string;
      noLogs: string;
      logsAppearHere: string;
      showingLast: string;
      system: string;
    };
    // Health page
    healthPage: {
      title: string;
      subtitle: string;
      runCheck: string;
      runningChecks: string;
      runCheckToSee: string;
      overallStatus: string;
      servicesMonitored: string;
      servicesChecked: string;
      avgResponseTime: string;
      statuses: {
        healthy: string;
        degraded: string;
        unhealthy: string;
      };
      services: {
        database: string;
        auth: string;
        rls: string;
        storage: string;
        storageRls: string;
        realtime: string;
      };
      issuesDetected: {
        title: string;
        description: string;
      };
    };
    // Delete confirmations
    deleteConfirm: {
      title: string;
      cannotUndo: string;
      deleting: string;
    };
  };
}

export interface Translations {
  es: Translation;
  en: Translation;
}
