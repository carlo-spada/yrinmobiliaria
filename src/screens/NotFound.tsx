import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { PageLayout } from '@/components/layout';
import { LocaleLink as Link } from '@/components/LocaleLink';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const NotFound = () => {
  const pathname = usePathname() ?? '';
  const { t } = useLanguage();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', pathname);
  }, [pathname]);

  return (
    <PageLayout>
      <div className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="text-center">
          <p className="mb-2 text-6xl font-bold text-primary">404</p>
          <h1 className="mb-3 text-2xl font-semibold">{t.notFound.heading}</h1>
          <p className="mb-8 text-muted-foreground">{t.notFound.message}</p>
          <Button asChild variant="primary">
            <Link href="/">{t.notFound.backHome}</Link>
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default NotFound;
