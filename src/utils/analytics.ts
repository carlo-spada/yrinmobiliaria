// Google Analytics utilities
// To enable GA, add your measurement ID to the environment variables
// and uncomment the initialization code in main.tsx

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string,
      config?: any
    ) => void;
    dataLayer?: any[];
  }
}

export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

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

export const trackSearch = (filters: any) => {
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
