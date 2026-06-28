import { zodResolver } from '@hookform/resolvers/zod';
import { FileLock2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { PageLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input-enhanced';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

const dataRightsSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido').max(100),
  email: z.string().trim().email('Email inválido').max(255),
  phone: z.string().trim().min(10, 'Teléfono inválido').max(15),
  right: z.string().min(1, 'Selecciona un derecho'),
  details: z.string().trim().min(10, 'Describe tu solicitud (mínimo 10 caracteres)').max(1000),
});

type DataRightsFormData = z.infer<typeof dataRightsSchema>;

export default function DataRights() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tr = t.legal.dataRights;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DataRightsFormData>({
    resolver: zodResolver(dataRightsSchema),
  });

  const right = watch('right');

  const rightOptions = [
    { value: 'acceso', label: tr.rightAccess },
    { value: 'rectificacion', label: tr.rightRectification },
    { value: 'cancelacion', label: tr.rightCancellation },
    { value: 'oposicion', label: tr.rightOpposition },
  ];

  const onSubmit = async (data: DataRightsFormData) => {
    setIsSubmitting(true);
    try {
      const rightLabel = rightOptions.find((o) => o.value === data.right)?.label ?? data.right;
      const { data: result, error: submitError } = await supabase.functions.invoke('submit-contact', {
        body: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          subject: `Solicitud ARCO - ${rightLabel}`,
          message: data.details,
        },
      });

      if (submitError) {
        throw new Error(submitError.message || 'Failed to submit request');
      }
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to submit request');
      }

      toast({ title: tr.successTitle, description: tr.successMessage });
      router.push('/');
    } catch (error) {
      logger.error('ARCO request submission failed', error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar la solicitud. Por favor intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 max-w-2xl py-8">
        <div className="mb-10 text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <FileLock2 className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">{tr.title}</h1>
          <p className="text-muted-foreground">{tr.subtitle}</p>
        </div>

        <Card className="p-6 mb-6 bg-card">
          <p className="text-sm text-muted-foreground leading-relaxed">{tr.intro}</p>
        </Card>

        <Card className="p-6 bg-card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Label htmlFor="name">{tr.nameLabel}</Label>
              <Input id="name" {...register('name')} placeholder={tr.namePlaceholder} error={errors.name?.message} />
            </div>

            <div>
              <Label htmlFor="email">{tr.emailLabel}</Label>
              <Input id="email" type="email" {...register('email')} placeholder={tr.emailPlaceholder} error={errors.email?.message} />
            </div>

            <div>
              <Label htmlFor="phone">{tr.phoneLabel}</Label>
              <Input id="phone" type="tel" {...register('phone')} placeholder={tr.phonePlaceholder} error={errors.phone?.message} />
            </div>

            <div>
              <Label htmlFor="right">{tr.rightLabel}</Label>
              <Select value={right} onValueChange={(value) => setValue('right', value)}>
                <SelectTrigger id="right">
                  <SelectValue placeholder={tr.rightPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {rightOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.right && <p className="text-sm text-destructive mt-1">{errors.right.message}</p>}
            </div>

            <div>
              <Label htmlFor="details">{tr.detailsLabel}</Label>
              <Textarea
                id="details"
                {...register('details')}
                placeholder={tr.detailsPlaceholder}
                rows={5}
                className="resize-none"
              />
              {errors.details && <p className="text-sm text-destructive mt-1">{errors.details.message}</p>}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? tr.submitting : tr.submit}
            </Button>
          </form>
        </Card>
      </div>
    </PageLayout>
  );
}
