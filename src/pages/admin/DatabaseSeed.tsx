import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { seedProperties, clearProperties } from '@/utils/supabase-properties';
import { properties as mockProperties } from '@/data/properties';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Database, Trash2, Upload, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';

export default function DatabaseSeed() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const handleSeed = async () => {
    setIsSeeding(true);
    setProgress(0);
    setStatus('idle');

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      const result = await seedProperties(mockProperties);

      clearInterval(interval);
      setProgress(100);

      if (result.success) {
        setStatus('success');
        toast({
          title: '✓ Base de datos poblada',
          description: `${mockProperties.length} propiedades fueron agregadas exitosamente.`,
        });
      } else {
        throw new Error('Seeding failed');
      }
    } catch (error) {
      console.error('Error seeding database:', error);
      setStatus('error');
      toast({
        title: '✗ Error al poblar',
        description: 'Ocurrió un error al agregar las propiedades. Revisa la consola.',
        variant: 'destructive',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClear = async () => {
    setIsClearing(true);

    try {
      const result = await clearProperties();

      if (result.success) {
        toast({
          title: '✓ Base de datos limpiada',
          description: 'Todas las propiedades fueron eliminadas.',
        });
      } else {
        throw new Error('Clear failed');
      }
    } catch (error) {
      console.error('Error clearing database:', error);
      toast({
        title: '✗ Error al limpiar',
        description: 'Ocurrió un error. Revisa la consola.',
        variant: 'destructive',
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Database Management</h1>
          <p className="text-muted-foreground">
            Herramientas de administración para gestionar la base de datos de propiedades
          </p>
        </div>

        {/* Warning Alert */}
        <Alert className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Página Temporal de Administración</AlertTitle>
          <AlertDescription>
            Esta página es solo para uso durante desarrollo. Elimínala antes de pasar a producción
            o protégela con autenticación de administrador.
          </AlertDescription>
        </Alert>

        {/* Seed Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Poblar Base de Datos
            </CardTitle>
            <CardDescription>
              Importa {mockProperties.length} propiedades de muestra desde el archivo de mock data
              a la base de datos de Supabase.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSeeding && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  {progress < 100 ? 'Agregando propiedades...' : 'Completado'}
                </p>
              </div>
            )}

            {status === 'success' && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>¡Éxito!</AlertTitle>
                <AlertDescription>
                  La base de datos ha sido poblada correctamente. Visita la página de propiedades
                  para ver los resultados.
                </AlertDescription>
              </Alert>
            )}

            {status === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Ocurrió un error al poblar la base de datos. Revisa la consola del navegador
                  para más detalles.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleSeed}
                disabled={isSeeding || isClearing}
                className="flex-1"
                size="lg"
              >
                <Database className="mr-2 h-4 w-4" />
                {isSeeding ? 'Poblando...' : 'Poblar Base de Datos'}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={isSeeding || isClearing}
                    size="lg"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpiar Todo
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Esto eliminará permanentemente TODAS las
                      propiedades y sus imágenes de la base de datos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClear}>
                      Sí, eliminar todo
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mock Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-2">{mockProperties.length}</p>
              <p className="text-sm text-muted-foreground">
                Propiedades disponibles en el archivo mock
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Base de Datos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Después de poblar, las propiedades se cargarán automáticamente desde Supabase
                en lugar del mock data.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Instrucciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-1">1. Poblar la base de datos</h4>
              <p className="text-muted-foreground">
                Click en "Poblar Base de Datos" para importar las propiedades de muestra.
                Este proceso puede tardar unos segundos.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-1">2. Verificar en Cloud</h4>
              <p className="text-muted-foreground">
                Ve a la pestaña "Cloud" → "Database" → "Tables" → "properties" para ver
                los datos importados.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-1">3. Agregar más propiedades</h4>
              <p className="text-muted-foreground">
                Usa el panel de Cloud para agregar nuevas propiedades manualmente, o actualiza
                el archivo `src/data/properties.ts` y vuelve a poblar.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-1">4. Eliminar esta página</h4>
              <p className="text-muted-foreground">
                Antes de ir a producción, elimina esta página o protégela con autenticación
                de administrador. Ubicación: `src/pages/admin/DatabaseSeed.tsx`
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
