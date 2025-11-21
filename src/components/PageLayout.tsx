import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  includeFooter?: boolean;
  fullHeight?: boolean;
  fixedHeader?: boolean;
}

export function PageLayout({
  children,
  className,
  includeFooter = true,
  fullHeight = false,
  fixedHeader = true
}: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {fixedHeader ? (
        <>
          <Header />
          {/* Fixed header spacer - ensures content never goes under header */}
          <div className="h-20 flex-shrink-0" aria-hidden="true" />
        </>
      ) : (
        <div className="sticky top-0 z-50">
          <Header />
        </div>
      )}

      <main className={cn(
        "flex-1 flex flex-col",
        fullHeight ? "" : "pb-16",
        className
      )}>
        {children}
      </main>

      {includeFooter && <Footer />}
    </div>
  );
}