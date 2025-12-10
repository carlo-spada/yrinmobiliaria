import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { Footer } from '../Footer';
import { Header } from '../Header';

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
  fullHeight = false,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

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
