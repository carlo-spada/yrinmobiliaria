import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  includeFooter?: boolean;
  fullHeight?: boolean;
}

export function PageLayout({
  children,
  className,
  includeFooter = true,
  fullHeight = false
}: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* Fixed header spacer - ensures content never goes under header */}
      <div className="h-20 flex-shrink-0" aria-hidden="true" />

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