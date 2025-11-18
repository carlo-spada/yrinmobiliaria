import emailjs from '@emailjs/browser';
import { logger } from './logger';

// EmailJS Configuration
// Sign up at https://www.emailjs.com/ to get your credentials
// Add these to your .env file:
// VITE_EMAILJS_SERVICE_ID=your_service_id
// VITE_EMAILJS_TEMPLATE_ID_CONTACT=your_contact_template_id
// VITE_EMAILJS_TEMPLATE_ID_SCHEDULE=your_schedule_template_id
// VITE_EMAILJS_PUBLIC_KEY=your_public_key

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_demo';
const TEMPLATE_ID_CONTACT = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CONTACT || 'template_contact';
const TEMPLATE_ID_SCHEDULE = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_SCHEDULE || 'template_schedule';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'demo_public_key';

// Initialize EmailJS
if (PUBLIC_KEY && PUBLIC_KEY !== 'demo_public_key') {
  emailjs.init(PUBLIC_KEY);
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface ScheduleFormData {
  propertyId: string;
  propertyName: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  timeSlot: string;
  notes?: string;
}

export const sendContactEmail = async (data: ContactFormData): Promise<boolean> => {
  try {
    // If EmailJS is not configured, simulate success in development
    if (!PUBLIC_KEY || PUBLIC_KEY === 'demo_public_key') {
      logger.info('EmailJS not configured - contact form simulated in dev');
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    }

    const result = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID_CONTACT,
      {
        from_name: data.name,
        from_email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        to_email: 'contacto@yrinmobiliaria.com', // Your business email
      }
    );

    logger.info('Contact email sent successfully');
    return result.status === 200;
  } catch (error) {
    logger.error('Error sending contact email', error);
    return false;
  }
};

export const sendScheduleEmail = async (data: ScheduleFormData): Promise<boolean> => {
  try {
    // If EmailJS is not configured, simulate success in development
    if (!PUBLIC_KEY || PUBLIC_KEY === 'demo_public_key') {
      logger.info('EmailJS not configured - schedule form simulated in dev');
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    }

    const result = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID_SCHEDULE,
      {
        from_name: data.name,
        from_email: data.email,
        phone: data.phone,
        property_id: data.propertyId,
        property_name: data.propertyName,
        visit_date: data.date,
        visit_time: data.timeSlot,
        notes: data.notes || 'Sin notas adicionales',
        to_email: 'contacto@yrinmobiliaria.com', // Your business email
      }
    );

    logger.info('Schedule email sent successfully');
    return result.status === 200;
  } catch (error) {
    logger.error('Error sending schedule email', error);
    return false;
  }
};
