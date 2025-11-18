import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface WhatsAppButtonProps {
  message?: string;
  className?: string;
}

export function WhatsAppButton({ message, className }: WhatsAppButtonProps) {
  const { t } = useTranslation();
  const { getSetting } = useSiteSettings();
  
  const defaultMessage = t('whatsapp.defaultMessage', 'Hola, me interesa una propiedad de YR Inmobiliaria');
  // Use dynamic setting with fallback to env var only
  const phoneNumber = getSetting('whatsapp_number') || import.meta.env.VITE_WHATSAPP_NUMBER;
  
  // Don't render if no phone number configured
  if (!phoneNumber) {
    console.warn('WhatsApp phone number not configured');
    return null;
  }
  
  const handleClick = () => {
    const finalMessage = message || defaultMessage;
    
    // Validate message length for security
    if (finalMessage.length > 500) {
      console.warn('WhatsApp message exceeds maximum length');
      return;
    }
    
    const encodedMessage = encodeURIComponent(finalMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full p-4 shadow-lg transition-colors ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.3 }}
      aria-label={t('whatsapp.buttonLabel', 'Contact us via WhatsApp')}
      title={t('whatsapp.buttonLabel', 'Contact us via WhatsApp')}
    >
      <MessageCircle className="h-6 w-6" aria-hidden="true" />
      
      {/* Pulse animation */}
      <motion.span
        className="absolute inset-0 rounded-full bg-[#25D366]"
        animate={{
          scale: [1, 1.5, 1.5],
          opacity: [0.5, 0, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1,
        }}
      />
    </motion.button>
  );
}
