import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSavedSearches } from '@/hooks/useSavedSearches';
import { PropertyFilters } from '@/types/property';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface SaveSearchDialogProps {
  filters: PropertyFilters;
}

export function SaveSearchDialog({ filters }: SaveSearchDialogProps) {
  const { t } = useTranslation();
  const { saveSearch } = useSavedSearches();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [searchName, setSearchName] = useState('');

  const handleSave = () => {
    if (!searchName.trim()) {
      toast({
        title: t('savedSearches.errorTitle', 'Error'),
        description: t('savedSearches.errorName', 'Debes ingresar un nombre para la búsqueda'),
        variant: 'destructive',
      });
      return;
    }

    saveSearch(searchName.trim(), filters);
    
    toast({
      title: t('savedSearches.saved', 'Búsqueda guardada'),
      description: t('savedSearches.savedDesc', 'Puedes acceder a ella desde tu lista de búsquedas guardadas'),
    });

    setSearchName('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Save className="mr-2 h-4 w-4" />
          {t('savedSearches.save', 'Guardar búsqueda')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('savedSearches.saveTitle', 'Guardar búsqueda')}</DialogTitle>
          <DialogDescription>
            {t('savedSearches.saveDesc', 'Dale un nombre a esta búsqueda para acceder rápidamente a ella en el futuro.')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="search-name">
              {t('savedSearches.nameLabel', 'Nombre de la búsqueda')}
            </Label>
            <Input
              id="search-name"
              placeholder={t('savedSearches.namePlaceholder', 'Ej: Casas en Centro Histórico')}
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('common.cancel', 'Cancelar')}
          </Button>
          <Button onClick={handleSave}>
            {t('savedSearches.save', 'Guardar búsqueda')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
