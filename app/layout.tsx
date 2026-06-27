import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { cookies } from 'next/headers';

import '@/index.css';

import type { Language } from '@/types';

import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yrinmobiliaria.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'YR Inmobiliaria - Bienes Raíces en Oaxaca',
    template: '%s | YR Inmobiliaria',
  },
  description:
    'Expertos en bienes raíces en Oaxaca, México. Encuentra tu hogar perfecto con más de 10 años de experiencia.',
  authors: [{ name: 'YR Inmobiliaria' }],
  openGraph: {
    type: 'website',
    siteName: 'YR Inmobiliaria',
    title: 'YR Inmobiliaria - Bienes Raíces en Oaxaca',
    description:
      'Expertos en bienes raíces en Oaxaca con más de 10 años de experiencia. Encuentra tu hogar perfecto.',
    images: ['/hero-desktop-1280.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@YRInmobiliaria',
    images: ['/hero-desktop-1280.webp'],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('locale')?.value as Language) || 'es';

  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <Providers initialLanguage={locale}>{children}</Providers>
      </body>
    </html>
  );
}
