# 🗄️ Guía de Configuración de Supabase - YR Inmobiliaria

Guía completa para trabajar con la base de datos de propiedades.

## 📊 Schema de Base de Datos

### Tablas Creadas

#### 1. `properties` - Tabla Principal de Propiedades

```sql
Columnas:
- id (UUID, primary key)
- title_es (TEXT) - Título en español
- title_en (TEXT) - Título en inglés
- description_es (TEXT) - Descripción en español
- description_en (TEXT) - Descripción en inglés
- type (property_type ENUM) - 'casa', 'departamento', 'local', 'oficina'
- operation (property_operation ENUM) - 'venta', 'renta'
- price (DECIMAL) - Precio en pesos mexicanos
- location (JSONB) - Información de ubicación
- features (JSONB) - Características de la propiedad
- amenities (TEXT[]) - Array de amenidades
- status (property_status ENUM) - 'disponible', 'vendida', 'rentada'
- featured (BOOLEAN) - Si es propiedad destacada
- created_at (TIMESTAMPTZ) - Fecha de creación
- updated_at (TIMESTAMPTZ) - Última actualización
- published_date (DATE) - Fecha de publicación
```

**Estructura de `location` (JSONB):**
```json
{
  "zone": "Centro Histórico",
  "neighborhood": "Jalatlaco",
  "address": "Calle Reforma 123",
  "coordinates": {
    "lat": 17.0654,
    "lng": -96.7236
  }
}
```

**Estructura de `features` (JSONB):**
```json
{
  "bedrooms": 3,
  "bathrooms": 2,
  "parking": 1,
  "constructionArea": 180,
  "landArea": 200
}
```

#### 2. `property_images` - Imágenes de Propiedades

```sql
Columnas:
- id (UUID, primary key)
- property_id (UUID, foreign key -> properties.id)
- image_url (TEXT) - URL de la imagen
- display_order (INTEGER) - Orden de visualización
- alt_text_es (TEXT) - Texto alternativo en español
- alt_text_en (TEXT) - Texto alternativo en inglés
- created_at (TIMESTAMPTZ)
```

### Índices Creados

Para optimizar las consultas:
- `idx_properties_type` - Buscar por tipo
- `idx_properties_operation` - Buscar por operación
- `idx_properties_status` - Filtrar por estado
- `idx_properties_featured` - Propiedades destacadas
- `idx_properties_price` - Ordenar/filtrar por precio
- `idx_properties_location` - Búsquedas geográficas (GIN index)

## 🔒 Seguridad (RLS)

### Políticas Actuales

**Lectura Pública:**
- Todos pueden ver las propiedades (sin autenticación)
- Todos pueden ver las imágenes de propiedades

**Próximas Políticas (Cuando agregues admin):**
```sql
-- Solo admins pueden insertar
CREATE POLICY "Only admins can insert properties"
  ON public.properties
  FOR INSERT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Solo admins pueden actualizar
CREATE POLICY "Only admins can update properties"
  ON public.properties
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Solo admins pueden eliminar
CREATE POLICY "Only admins can delete properties"
  ON public.properties
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
```

## 🔧 Uso en el Código

### 1. Cargar Propiedades

```typescript
import { useProperties } from '@/hooks/useProperties';

const Component = () => {
  const { data: properties, isLoading, error } = useProperties();
  
  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error al cargar propiedades</div>;
  
  return (
    <div>
      {properties.map(property => (
        <PropertyCard key={property.id} {...property} />
      ))}
    </div>
  );
};
```

### 2. Cargar Propiedad Individual

```typescript
import { useProperty } from '@/hooks/useProperties';

const PropertyDetail = () => {
  const { id } = useParams();
  const { data: property, isLoading } = useProperty(id);
  
  if (isLoading) return <LoadingSpinner />;
  if (!property) return <NotFound />;
  
  return <div>{property.title.es}</div>;
};
```

### 3. Filtrar Propiedades

```typescript
const { data: houses } = useProperties({
  type: 'casa',
  operation: 'venta',
  minPrice: 1000000,
  maxPrice: 5000000,
  featured: true,
});
```

## 📝 Poblar la Base de Datos

### Opción 1: Desde la Consola del Navegador

1. Abrir DevTools (F12)
2. Ir a la pestaña Console
3. Ejecutar:

```javascript
// Importar las funciones
import { seedProperties } from '@/utils/supabase-properties';
import { properties } from '@/data/properties';

// Poblar la base de datos
await seedProperties(properties);
```

### Opción 2: Página Temporal de Admin

Crear una página `/admin/seed` (temporal):

```typescript
// src/pages/admin/Seed.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { seedProperties, clearProperties } from '@/utils/supabase-properties';
import { properties } from '@/data/properties';

export default function Seed() {
  const [status, setStatus] = useState('');

  const handleSeed = async () => {
    setStatus('Seeding...');
    const result = await seedProperties(properties);
    setStatus(result.success ? '✓ Done!' : '✗ Error');
  };

  const handleClear = async () => {
    if (!confirm('¿Estás seguro? Esto borrará TODAS las propiedades')) return;
    setStatus('Clearing...');
    const result = await clearProperties();
    setStatus(result.success ? '✓ Cleared!' : '✗ Error');
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Database Seeding</h1>
      <div className="space-x-4">
        <Button onClick={handleSeed}>Seed Properties</Button>
        <Button onClick={handleClear} variant="destructive">Clear All</Button>
      </div>
      {status && <p className="mt-4 text-lg">{status}</p>}
    </div>
  );
}
```

### Opción 3: SQL Directo

En el dashboard de Lovable Cloud (pestaña Cloud):

```sql
-- Insertar una propiedad
INSERT INTO public.properties (
  title_es, title_en, description_es, description_en,
  type, operation, price, location, features, amenities, featured
) VALUES (
  'Casa Colonial en Centro',
  'Colonial House in Downtown',
  'Hermosa casa colonial...',
  'Beautiful colonial house...',
  'casa',
  'venta',
  4500000,
  '{"zone": "Centro Histórico", "neighborhood": "Jalatlaco", "address": "Calle Reforma 123", "coordinates": {"lat": 17.0654, "lng": -96.7236}}'::jsonb,
  '{"bedrooms": 3, "bathrooms": 2, "parking": 1, "constructionArea": 180, "landArea": 200}'::jsonb,
  ARRAY['Cocina integral', 'Terraza', 'Jardín'],
  true
);

-- Obtener el ID de la propiedad insertada
-- Luego insertar imágenes
INSERT INTO public.property_images (property_id, image_url, display_order)
VALUES 
  ('uuid-de-la-propiedad', 'https://url-imagen-1.jpg', 0),
  ('uuid-de-la-propiedad', 'https://url-imagen-2.jpg', 1),
  ('uuid-de-la-propiedad', 'https://url-imagen-3.jpg', 2);
```

## 🔍 Consultas Útiles

### Ver todas las propiedades

```sql
SELECT 
  id,
  title_es,
  type,
  operation,
  price,
  status,
  featured
FROM public.properties
ORDER BY created_at DESC;
```

### Ver propiedades con imágenes

```sql
SELECT 
  p.*,
  array_agg(pi.image_url ORDER BY pi.display_order) as images
FROM public.properties p
LEFT JOIN public.property_images pi ON p.id = pi.property_id
GROUP BY p.id;
```

### Contar propiedades por tipo

```sql
SELECT type, COUNT(*) as count
FROM public.properties
WHERE status = 'disponible'
GROUP BY type;
```

### Propiedades más caras

```sql
SELECT title_es, price
FROM public.properties
WHERE status = 'disponible'
ORDER BY price DESC
LIMIT 10;
```

## 📱 Acceder a la Base de Datos

### Dashboard de Lovable Cloud

1. Click en pestaña **"Cloud"** en el editor
2. Selecciona **"Database"**
3. Aquí puedes:
   - Ver tablas y datos
   - Ejecutar consultas SQL
   - Ver RLS policies
   - Gestionar índices

### SQL Editor

Para consultas más complejas, usa el SQL editor en el dashboard.

## 🚨 Troubleshooting

### Las propiedades no se ven

1. Verificar que RLS permite lectura pública:
```sql
SELECT * FROM pg_policies WHERE tablename = 'properties';
```

2. Verificar que hay datos:
```sql
SELECT COUNT(*) FROM public.properties;
```

### Errores de inserción

1. Verificar enums:
```sql
SELECT enum_range(NULL::property_type);
SELECT enum_range(NULL::property_operation);
SELECT enum_range(NULL::property_status);
```

2. Verificar formato de JSONB:
```sql
-- Debe ser JSONB válido
SELECT '{"key": "value"}'::jsonb;
```

### Mock data sigue apareciendo

El código usa mock data como fallback si:
- No hay conexión a Supabase
- No hay datos en la base de datos
- Hay un error en la consulta

Verifica la consola del navegador para ver logs.

## 🔄 Actualizar Schema

Si necesitas agregar columnas o modificar el schema:

```sql
-- Agregar columna
ALTER TABLE public.properties
ADD COLUMN new_field TEXT;

-- Modificar columna
ALTER TABLE public.properties
ALTER COLUMN price TYPE DECIMAL(15,2);

-- Agregar índice
CREATE INDEX idx_properties_new_field 
ON public.properties(new_field);
```

## 📊 Monitoreo

### Ver queries activas

```sql
SELECT * FROM pg_stat_activity 
WHERE datname = current_database();
```

### Ver uso de índices

```sql
SELECT 
  schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE schemaname = 'public';
```

## 🔐 Backup

Lovable Cloud hace backups automáticos, pero puedes exportar datos:

```sql
-- Export to CSV (en dashboard)
COPY (SELECT * FROM public.properties) TO STDOUT WITH CSV HEADER;
```

---

**¿Necesitas ayuda?** Revisa los logs en la consola o contacta soporte de Lovable.

## 📖 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Lovable Cloud Docs](https://docs.lovable.dev/features/cloud)
