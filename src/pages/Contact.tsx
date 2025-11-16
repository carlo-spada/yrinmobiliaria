import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MapPin, Clock, Facebook, Instagram, Send } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input-enhanced';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/utils/LanguageContext';
import { sendContactEmail } from '@/utils/emailService';
import { SuccessAnimation } from '@/components/animations/SuccessAnimation';
import { supabase } from '@/integrations/supabase/client';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo'),
  email: z.string().trim().email('Email inválido').max(255, 'El email es muy largo'),
  phone: z.string().trim().min(10, 'Teléfono inválido').max(15, 'Teléfono muy largo'),
  subject: z.string().min(1, 'Selecciona un asunto'),
  message: z.string().trim().min(10, 'El mensaje debe tener al menos 10 caracteres').max(1000, 'El mensaje es muy largo'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contact() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const subject = watch('subject');

  const onSubmit = async (data: ContactFormData) => {
    if (!data.name || !data.email || !data.phone || !data.subject || !data.message) return;
    
    setIsSubmitting(true);
    
    try {
      // First, save to database
      const { error: dbError } = await supabase
        .from('contact_inquiries')
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: `${data.subject}\n\n${data.message}`,
          status: 'new',
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to save inquiry');
      }

      // Then, send email
      const success = await sendContactEmail({
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
      });
      
      if (success) {
        toast({
          title: t.contact?.successTitle || '¡Mensaje enviado!',
          description: t.contact?.successMessage || 'Nos pondremos en contacto contigo pronto.',
        });
        reset();
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending contact form:', error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar el mensaje. Por favor intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: t.contact?.addressTitle || 'Dirección',
      content: 'Calle Independencia 123, Centro Histórico\nOaxaca de Juárez, Oaxaca, México',
    },
    {
      icon: Phone,
      title: t.contact?.phoneTitle || 'Teléfono',
      content: '+52 (951) 123-4567',
      link: 'tel:+529511234567',
    },
    {
      icon: Mail,
      title: t.contact?.emailTitle || 'Email',
      content: 'contacto@yrinmobiliaria.com',
      link: 'mailto:contacto@yrinmobiliaria.com',
    },
    {
      icon: Clock,
      title: t.contact?.hoursTitle || 'Horarios',
      content: 'Lunes a Viernes: 9:00 AM - 6:00 PM\nSábados: 10:00 AM - 2:00 PM',
    },
  ];

  const socialLinks = [
    {
      icon: Facebook,
      label: 'Facebook',
      url: 'https://facebook.com',
      color: 'hover:text-[#1877F2]',
    },
    {
      icon: Instagram,
      label: 'Instagram',
      url: 'https://instagram.com',
      color: 'hover:text-[#E4405F]',
    },
    {
      icon: Send,
      label: 'WhatsApp',
      url: 'https://wa.me/529511234567',
      color: 'hover:text-[#25D366]',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                {t.contact?.title || 'Contáctanos'}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t.contact?.subtitle || 'Estamos aquí para ayudarte a encontrar tu propiedad ideal'}
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Form Column */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    {t.contact?.formTitle || 'Envíanos un mensaje'}
                  </h2>
                  <p className="text-muted-foreground">
                    {t.contact?.formSubtitle || 'Completa el formulario y nos pondremos en contacto contigo'}
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div>
                    <Label htmlFor="name">{t.contact?.nameLabel || 'Nombre completo'}</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder={t.contact?.namePlaceholder || 'Juan Pérez'}
                      error={errors.name?.message}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">{t.contact?.emailLabel || 'Email'}</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder={t.contact?.emailPlaceholder || 'juan@ejemplo.com'}
                      error={errors.email?.message}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">{t.contact?.phoneLabel || 'Teléfono'}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...register('phone')}
                      placeholder={t.contact?.phonePlaceholder || '(951) 123-4567'}
                      error={errors.phone?.message}
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">{t.contact?.subjectLabel || 'Asunto'}</Label>
                    <Select value={subject} onValueChange={(value) => setValue('subject', value)}>
                      <SelectTrigger id="subject">
                        <SelectValue placeholder={t.contact?.subjectPlaceholder || 'Selecciona un asunto'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">{t.contact?.subjectInfo || 'Información general'}</SelectItem>
                        <SelectItem value="sell">{t.contact?.subjectSell || 'Vender mi propiedad'}</SelectItem>
                        <SelectItem value="buy">{t.contact?.subjectBuy || 'Comprar'}</SelectItem>
                        <SelectItem value="rent">{t.contact?.subjectRent || 'Rentar'}</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.subject && (
                      <p className="text-sm text-destructive mt-1">{errors.subject.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="message">{t.contact?.messageLabel || 'Mensaje'}</Label>
                    <Textarea
                      id="message"
                      {...register('message')}
                      placeholder={t.contact?.messagePlaceholder || 'Cuéntanos cómo podemos ayudarte...'}
                      rows={5}
                      className="resize-none"
                    />
                    {errors.message && (
                      <p className="text-sm text-destructive mt-1">{errors.message.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (t.contact?.sending || 'Enviando...') : (t.contact?.send || 'Enviar mensaje')}
                  </Button>
                </form>
              </div>

              {/* Info Column */}
              <div className="space-y-8">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    {t.contact?.infoTitle || 'Información de contacto'}
                  </h2>
                  <p className="text-muted-foreground">
                    {t.contact?.infoSubtitle || 'También puedes contactarnos directamente'}
                  </p>
                </div>

                <div className="space-y-6">
                  {contactInfo.map((info, index) => {
                    const Icon = info.icon;
                    const content = info.link ? (
                      <a
                        href={info.link}
                        className="text-muted-foreground hover:text-primary transition-colors whitespace-pre-line"
                      >
                        {info.content}
                      </a>
                    ) : (
                      <p className="text-muted-foreground whitespace-pre-line">{info.content}</p>
                    );

                    return (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <h3 className="font-semibold text-foreground">{info.title}</h3>
                          {content}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Social Media */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="font-semibold text-foreground">
                    {t.contact?.socialTitle || 'Síguenos en redes sociales'}
                  </h3>
                  <div className="flex gap-4">
                    {socialLinks.map((social) => {
                      const Icon = social.icon;
                      return (
                        <a
                          key={social.label}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground transition-colors ${social.color}`}
                          aria-label={social.label}
                        >
                          <Icon className="w-5 h-5" />
                        </a>
                      );
                    })}
                  </div>
                </div>

                {/* Map Placeholder */}
                <div className="aspect-video bg-secondary/30 rounded-lg flex items-center justify-center border border-border">
                  <div className="text-center space-y-2">
                    <MapPin className="w-12 h-12 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      {t.contact?.mapPlaceholder || 'Mapa de ubicación'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
