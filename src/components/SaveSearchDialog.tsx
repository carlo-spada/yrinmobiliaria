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
import { useLanguage } from '@/utils/LanguageContext';

interface SaveSearchDialogProps {
  filters: PropertyFilters;
}

export function SaveSearchDialog({ filters }: SaveSearchDialogProps) {
  const { language } = useLanguage();
  const { saveSearch } = useSavedSearches();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [searchName, setSearchName] = useState('');

  const handleSave = () => {
    if (!searchName.trim()) {
      toast({
        title: language === 'es' ? 'Error' : 'Error',
        description: language === 'es' ? 'Debes ingresar un nombre para la búsqueda' : 'You must enter a name for the search',
        variant: 'destructive',
      });
      return;
    }

    saveSearch(searchName.trim(), filters);
    
    toast({
      title: language === 'es' ? 'Búsqueda guardada' : 'Search saved',
      description: language === 'es' ? 'Puedes acceder a ella desde tu lista de búsquedas guardadas' : 'You can access it from your saved searches list',
    });

    setSearchName('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Save className="mr-2 h-4 w-4" />
          {language === 'es' ? 'Guardar búsqueda' : 'Save search'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{language === 'es' ? 'Guardar búsqueda' : 'Save search'}</DialogTitle>
          <DialogDescription>
            {language === 'es' 
              ? 'Dale un nombre a esta búsqueda para acceder rápidamente a ella en el futuro.'
              : 'Give this search a name to quickly access it in the future.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="search-name">
              {language === 'es' ? 'Nombre de la búsqueda' : 'Search name'}
            </Label>
            <Input
              id="search-name"
              placeholder={language === 'es' ? 'Ej: Casas en Centro Histórico' : 'Ex: Houses in Historic Center'}
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {language === 'es' ? 'Cancelar' : 'Cancel'}
          </Button>
          <Button onClick={handleSave}>
            {language === 'es' ? 'Guardar búsqueda' : 'Save search'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
