import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Check, Clock } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input-enhanced';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useProperties } from '@/hooks/useProperties';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { logger } from '@/utils/logger';

const scheduleSchema = z.object({
  propertyId: z.string().min(1, 'Selecciona una propiedad'),
  name: z.string().trim().min(1, 'El nombre es requerido').max(100),
  email: z.string().trim().email('Email inválido').max(255),
  phone: z.string().trim().min(10, 'Teléfono inválido').max(15),
  date: z.date({
    message: 'Selecciona una fecha',
  }),
  timeSlot: z.string().min(1, 'Selecciona un horario'),
  notes: z.string().max(500, 'Las notas son muy largas').optional(),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

export default function ScheduleVisit() {
  const [searchParams] = useSearchParams();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { data: properties = [] } = useProperties();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmedData, setConfirmedData] = useState<ScheduleFormData | null>(null);

  const preSelectedPropertyId = searchParams.get('propertyId');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      propertyId: preSelectedPropertyId || '',
    },
  });

  const selectedDate = watch('date');
  const selectedPropertyId = watch('propertyId');
  const selectedTimeSlot = watch('timeSlot');

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);

  const timeSlots = [
    { value: '09:00', label: '9:00 AM', period: 'morning' },
    { value: '10:00', label: '10:00 AM', period: 'morning' },
    { value: '11:00', label: '11:00 AM', period: 'morning' },
    { value: '12:00', label: '12:00 PM', period: 'morning' },
    { value: '14:00', label: '2:00 PM', period: 'afternoon' },
    { value: '15:00', label: '3:00 PM', period: 'afternoon' },
    { value: '16:00', label: '4:00 PM', period: 'afternoon' },
    { value: '17:00', label: '5:00 PM', period: 'afternoon' },
  ];

  const onSubmit = async (data: ScheduleFormData) => {
    setIsSubmitting(true);
    
    try {
      // Submit via secure Edge Function with validation and rate limiting
      const { data: result, error: submitError } = await supabase.functions.invoke('submit-schedule-visit', {
        body: {
          propertyId: data.propertyId,
          name: data.name,
          email: data.email,
          phone: data.phone,
          date: format(data.date, 'yyyy-MM-dd'),
          timeSlot: data.timeSlot,
          notes: data.notes || null,
        },
      });

      if (submitError) {
        logger.error('Submission error', submitError);
        throw new Error(submitError.message || 'Failed to schedule visit');
      }

      if (!result?.success) {
        throw new Error(result?.error || 'Failed to schedule visit');
      }

      // Email notification is now sent by the Edge Function

      setConfirmedData(data);
      setIsConfirmed(true);
      
      toast({
        title: t.schedule?.successTitle || '¡Cita agendada!',
        description: t.schedule?.successMessage || 'Te enviaremos una confirmación por email.',
      });
    } catch (error) {
      logger.error('Visit scheduling failed', error);
      toast({
        title: 'Error',
        description: 'No se pudo agendar la cita. Por favor intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addToGoogleCalendar = () => {
    if (!confirmedData) return;

    const property = properties.find(p => p.id === confirmedData.propertyId);
    const dateTime = new Date(confirmedData.date);
    const [hours, minutes] = confirmedData.timeSlot.split(':');
    dateTime.setHours(parseInt(hours), parseInt(minutes));

    const endDateTime = new Date(dateTime);
    endDateTime.setHours(endDateTime.getHours() + 1);

    const title = encodeURIComponent(`Visita: ${property?.title[language] || 'Propiedad'}`);
    const details = encodeURIComponent(`Visita programada a la propiedad en ${property?.location.zone || 'Oaxaca'}`);
    const location = encodeURIComponent(property?.location.zone || 'Oaxaca, México');
    const startDate = dateTime.toISOString().replace(/-|:|\.\d+/g, '');
    const endDate = endDateTime.toISOString().replace(/-|:|\.\d+/g, '');

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startDate}/${endDate}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  if (isConfirmed && confirmedData) {
    const property = properties.find(p => p.id === confirmedData.propertyId);
    
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 flex items-center justify-center py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center space-y-8">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {t.schedule?.confirmedTitle || '¡Cita confirmada!'}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {t.schedule?.confirmedSubtitle || 'Te esperamos en la fecha y hora seleccionadas'}
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 space-y-4 text-left">
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">{t.schedule?.propertyLabel || 'Propiedad'}</h3>
                  <p className="text-muted-foreground">{property?.title[language]}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">{t.schedule?.dateLabel || 'Fecha'}</h3>
                  <p className="text-muted-foreground">{format(confirmedData.date, "EEEE, d 'de' MMMM, yyyy", { locale: es })}</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">{t.schedule?.timeLabel || 'Hora'}</h3>
                    <p className="text-muted-foreground">
                      {timeSlots.find(t => t.value === confirmedData.timeSlot)?.label}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">{t.schedule?.contactLabel || 'Contacto'}</h3>
                  <p className="text-muted-foreground">{confirmedData.name}</p>
                  <p className="text-muted-foreground">{confirmedData.email}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={addToGoogleCalendar} size="lg" className="gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  {t.schedule?.addToCalendar || 'Agregar a Google Calendar'}
                </Button>
                <Button variant="outline" size="lg" onClick={() => window.location.href = '/propiedades'}>
                  {t.schedule?.backToProperties || 'Ver más propiedades'}
                </Button>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                {t.schedule?.title || 'Agendar Visita'}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t.schedule?.subtitle || 'Programa una visita a la propiedad que te interesa'}
              </p>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Property Selection */}
                <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">
                    {t.schedule?.selectProperty || 'Selecciona la propiedad'}
                  </h2>
                  
                  <div>
                    <Label htmlFor="propertyId">{t.schedule?.propertyLabel || 'Propiedad'}</Label>
                    <Select
                      value={selectedPropertyId}
                      onValueChange={(value) => setValue('propertyId', value)}
                    >
                      <SelectTrigger id="propertyId">
                        <SelectValue placeholder={t.schedule?.propertyPlaceholder || 'Selecciona una propiedad'} />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.title[language]} - {property.location.zone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.propertyId && (
                      <p className="text-sm text-destructive mt-1">{errors.propertyId.message}</p>
                    )}
                  </div>

                  {selectedProperty && (
                    <div className="flex gap-4 p-4 bg-secondary/20 rounded-lg border border-border">
                      <img
                        src={selectedProperty.images[0]}
                        alt={selectedProperty.title[language]}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1 space-y-1">
                        <h3 className="font-semibold text-foreground">{selectedProperty.title[language]}</h3>
                        <p className="text-sm text-muted-foreground">{selectedProperty.location.zone}</p>
                        <p className="text-lg font-bold text-primary">${selectedProperty.price.toLocaleString('es-MX')}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Date & Time Selection */}
                <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    {t.schedule?.selectDateTime || 'Selecciona fecha y hora'}
                  </h2>

                  <div>
                    <Label>{t.schedule?.dateLabel || 'Fecha de visita'}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !selectedDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? (
                            format(selectedDate, "PPP", { locale: es })
                          ) : (
                            <span>{t.schedule?.selectDate || 'Selecciona una fecha'}</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => date && setValue('date', date)}
                          disabled={(date) =>
                            date < new Date() || date.getDay() === 0
                          }
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.date && (
                      <p className="text-sm text-destructive mt-1">{errors.date.message}</p>
                    )}
                  </div>

                  <div>
                    <Label>{t.schedule?.timeLabel || 'Horario'}</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot.value}
                          type="button"
                          variant={selectedTimeSlot === slot.value ? 'default' : 'outline'}
                          className="justify-start"
                          onClick={() => setValue('timeSlot', slot.value)}
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          {slot.label}
                        </Button>
                      ))}
                    </div>
                    {errors.timeSlot && (
                      <p className="text-sm text-destructive mt-1">{errors.timeSlot.message}</p>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    {t.schedule?.contactInfo || 'Información de contacto'}
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">{t.schedule?.nameLabel || 'Nombre completo'}</Label>
                      <Input
                        id="name"
                        {...register('name')}
                        placeholder={t.schedule?.namePlaceholder || 'Juan Pérez'}
                        error={errors.name?.message}
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">{t.schedule?.emailLabel || 'Email'}</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder={t.schedule?.emailPlaceholder || 'juan@ejemplo.com'}
                        error={errors.email?.message}
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">{t.schedule?.phoneLabel || 'Teléfono'}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        {...register('phone')}
                        placeholder={t.schedule?.phonePlaceholder || '(951) 123-4567'}
                        error={errors.phone?.message}
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">{t.schedule?.notesLabel || 'Notas adicionales (opcional)'}</Label>
                      <Textarea
                        id="notes"
                        {...register('notes')}
                        placeholder={t.schedule?.notesPlaceholder || 'Alguna preferencia o pregunta...'}
                        rows={4}
                        className="resize-none"
                      />
                      {errors.notes && (
                        <p className="text-sm text-destructive mt-1">{errors.notes.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (t.schedule?.scheduling || 'Agendando...') : (t.schedule?.schedule || 'Agendar visita')}
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
