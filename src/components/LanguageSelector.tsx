import { Globe } from 'lucide-react';
import { useLanguage } from '@/utils/LanguageContext';
import { Button } from '@/components/ui/button';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
      className="gap-2"
    >
      <Globe className="h-4 w-4" />
      <span className="text-sm font-medium">{language.toUpperCase()}</span>
    </Button>
  );
}
