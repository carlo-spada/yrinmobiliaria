'use client';

import NextLink from 'next/link';
import { forwardRef, type ComponentPropsWithoutRef } from 'react';

import { useLanguage } from '@/contexts/LanguageContext';
import { localizedHref } from '@/lib/i18n';

type LocaleLinkProps = ComponentPropsWithoutRef<typeof NextLink>;

/**
 * `next/link` consciente del idioma. En inglés antepone `/en` a los `href`
 * internos públicos (vía `localizedHref`), dejando intactos externos, anclas y
 * rutas privadas. Así un mismo componente compartido enlaza al árbol correcto
 * sin tocar cada call-site. Los componentes públicos importan ESTO en vez de
 * `next/link`; las pantallas privadas siguen con `next/link` nativo.
 */
export const LocaleLink = forwardRef<HTMLAnchorElement, LocaleLinkProps>(function LocaleLink(
  { href, ...rest },
  ref,
) {
  const { language } = useLanguage();
  const localized = typeof href === 'string' ? localizedHref(href, language) : href;
  return <NextLink ref={ref} href={localized} {...rest} />;
});
