'use client';

import Link from 'next/link';

import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface ConsentCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Mensaje de error a mostrar (ej. cuando no se aceptó y se intentó enviar). */
  error?: string;
  id?: string;
  className?: string;
}

/**
 * Casilla de consentimiento explícito para el tratamiento de datos personales
 * (LFPDPPP). Enlaza al Aviso de Privacidad y es bilingüe vía LanguageContext.
 * Reutilizable en formularios públicos (contacto, agendar visita, registro).
 */
export function ConsentCheckbox({
  checked,
  onCheckedChange,
  error,
  id = 'consent',
  className,
}: ConsentCheckboxProps) {
  const { t } = useLanguage();
  const consent = t.legal.consent;

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-start gap-2">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(value) => onCheckedChange(value === true)}
          className="mt-0.5"
          aria-invalid={!!error}
        />
        <label htmlFor={id} className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
          {consent.prefix}{' '}
          <Link href="/privacidad" className="text-primary underline hover:no-underline">
            {consent.privacyLink}
          </Link>{' '}
          {consent.suffix}
        </label>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
