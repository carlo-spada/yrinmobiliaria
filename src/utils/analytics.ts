// Google Analytics utilities
// GA4 is automatically initialized if VITE_GA_MEASUREMENT_ID env var is set

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// Initialize Google Analytics
export const initGA = () => {
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'undefined') {
    console.info('Google Analytics not configured. Add VITE_GA_MEASUREMENT_ID to enable tracking.');
    return;
  }

  // Load gtag.js script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: true,
    cookie_flags: 'SameSite=None;Secure',
  });

  console.info('Google Analytics initialized:', GA_MEASUREMENT_ID);
};

export const pageview = (url: string) => {
  if (!window.gtag) return;
  
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (!window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Specific event helpers
export const trackPropertyView = (propertyId: string, propertyName: string) => {
  event({
    action: 'view_property',
    category: 'Property',
    label: `${propertyId} - ${propertyName}`,
  });
};

export const trackPropertyContact = (propertyId: string, method: string) => {
  event({
    action: 'contact',
    category: 'Property',
    label: `${propertyId} - ${method}`,
  });
};

export const trackScheduleVisit = (propertyId: string) => {
  event({
    action: 'schedule_visit',
    category: 'Property',
    label: propertyId,
  });
};

export const trackSearch = (filters: Record<string, unknown>) => {
  event({
    action: 'search',
    category: 'Properties',
    label: JSON.stringify(filters),
  });
};

export const trackFormSubmission = (formName: string) => {
  event({
    action: 'form_submit',
    category: 'Form',
    label: formName,
  });
};

export const trackButtonClick = (buttonName: string, location: string) => {
  event({
    action: 'button_click',
    category: 'Engagement',
    label: `${buttonName} - ${location}`,
  });
};
