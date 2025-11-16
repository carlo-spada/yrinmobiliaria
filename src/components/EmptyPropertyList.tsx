import { useLanguage } from '@/utils/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyPropertyListProps {
  message?: string;
}

export function EmptyPropertyList({ message }: EmptyPropertyListProps) {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();

  const content = {
    es: {
      title: 'No hay propiedades disponibles',
      description: 'Actualmente no hay propiedades para mostrar.',
      adminDescription: 'Comienza agregando tu primera propiedad desde el panel de administración.',
      publicDescription: 'Vuelve pronto para ver las nuevas propiedades que agregamos.',
      addProperty: 'Agregar Propiedad',
      goToAdmin: 'Ir al Panel de Administración',
    },
    en: {
      title: 'No properties available',
      description: 'There are currently no properties to display.',
      adminDescription: 'Start by adding your first property from the admin panel.',
      publicDescription: 'Check back soon to see new properties we add.',
      addProperty: 'Add Property',
      goToAdmin: 'Go to Admin Panel',
    }
  };

  const lang = t.nav ? 'es' : 'en';
  const text = content[lang];

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Building2 className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <h3 className="text-xl font-semibold mb-2">
          {message || text.title}
        </h3>
        
        <p className="text-muted-foreground mb-6 max-w-sm">
          {isAdmin ? text.adminDescription : text.publicDescription}
        </p>

        {isAdmin && (
          <div className="flex gap-3">
            <Link to="/admin/properties">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {text.addProperty}
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
