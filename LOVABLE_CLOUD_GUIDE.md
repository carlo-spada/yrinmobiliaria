# ☁️ Guía de Lovable Cloud - YR Inmobiliaria

Tu sitio ahora está conectado a **Lovable Cloud**, que proporciona toda la infraestructura backend necesaria sin configuración externa ni cuentas adicionales.

## 🎯 ¿Qué es Lovable Cloud?

Lovable Cloud es una plataforma backend completa que incluye:

- ✅ **Base de Datos PostgreSQL** - Para almacenar propiedades
- ✅ **Autenticación** - Sistema de login/logout (cuando lo necesites)
- ✅ **Storage** - Para subir imágenes y archivos
- ✅ **Edge Functions** - Para lógica de servidor (APIs, integraciones)
- ✅ **Real-time** - Actualizaciones en tiempo real (opcional)

Todo está listo para usar, sin necesidad de configurar servicios externos.

## 🗄️ Base de Datos de Propiedades

### Schema Implementado

Tu base de datos ya tiene estas tablas:

#### `properties` - Propiedades
Almacena toda la información de las propiedades inmobiliarias.

#### `property_images` - Imágenes
Múltiples imágenes por propiedad con orden de visualización.

### Cómo Poblar la Base de Datos

#### Opción 1: Página de Seed (Más Fácil)

1. **Visita:** `http://localhost:5173/admin/seed`
2. **Click:** "Poblar Base de Datos"
3. **Espera:** 10-20 segundos mientras se importan las propiedades
4. **Verifica:** Ve a `/propiedades` para ver las propiedades de Supabase

**IMPORTANTE:** Esta página es temporal. Elimínala antes de producción.

#### Opción 2: Desde el Dashboard de Cloud

1. **Abre** la pestaña "Cloud" en el editor de Lovable
2. **Navega** a Database → Tables → properties
3. **Click** en "Insert" para agregar propiedades manualmente
4. **Llena** los campos requeridos

#### Opción 3: SQL Directo

En Cloud → Database → SQL Editor:

```sql
-- Insertar propiedad
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
) RETURNING id;

-- Luego insertar imágenes (usa el ID de arriba)
INSERT INTO public.property_images (property_id, image_url, display_order)
VALUES 
  ('el-uuid-retornado', 'https://url-imagen-1.jpg', 0),
  ('el-uuid-retornado', 'https://url-imagen-2.jpg', 1);
```

## 🔄 Cómo Funciona el Sistema

### Doble Fuente de Datos

El sitio ahora usa un **sistema híbrido**:

1. **Primera prioridad:** Cargar desde Lovable Cloud (Supabase)
2. **Fallback:** Si no hay datos o hay error, usa mock data local

Esto significa:
- ✅ El sitio siempre funciona, incluso sin base de datos
- ✅ Puedes desarrollar localmente sin conexión
- ✅ Transición suave de mock a datos reales

### Flujo de Datos

```
Usuario visita /propiedades
    ↓
useProperties hook se ejecuta
    ↓
Intenta cargar desde Supabase
    ↓
┌─ ✅ Éxito → Muestra datos de Supabase
└─ ❌ Error → Muestra mock data (fallback)
```

### Verificar Fuente Actual

Abre la consola del navegador (F12):

```javascript
// Si ves este mensaje, está usando mock data:
"No properties in database, using mock data"

// Si NO ves el mensaje, está cargando desde Supabase ✓
```

## 📊 Gestionar Propiedades

### Ver Propiedades en la Base de Datos

1. **Cloud Tab** en Lovable
2. **Database** → **Tables** → **properties**
3. Verás todas las propiedades con opción de editar/eliminar

### Agregar Nueva Propiedad

**En Cloud Dashboard:**
1. Tables → properties → Insert
2. Llenar campos requeridos:
   - `title_es`, `title_en` (requeridos)
   - `type`: selecciona casa/departamento/local/oficina
   - `operation`: selecciona venta/renta
   - `price`: número sin comas (ej: 4500000)
   - `location`: JSON válido
   - `features`: JSON válido

**Ejemplo de location:**
```json
{"zone":"Centro Histórico","neighborhood":"Jalatlaco","address":"Calle 5 de Mayo 100","coordinates":{"lat":17.0654,"lng":-96.7236}}
```

**Ejemplo de features:**
```json
{"bedrooms":3,"bathrooms":2,"parking":1,"constructionArea":180,"landArea":200}
```

3. Luego agregar imágenes en `property_images`:
   - `property_id`: UUID de la propiedad creada
   - `image_url`: URL completa de la imagen
   - `display_order`: 0, 1, 2... (orden de visualización)

### Editar Propiedad

1. Cloud → Database → properties
2. Click en la fila que quieres editar
3. Modificar campos
4. Guardar

Los cambios aparecerán inmediatamente en el sitio.

### Eliminar Propiedad

1. Cloud → Database → properties
2. Seleccionar la fila
3. Click en Delete
4. Las imágenes asociadas se eliminarán automáticamente

## 🖼️ Gestión de Imágenes

### Subir Imágenes

**Opción 1: URLs Externas (Más Fácil)**
- Sube a Cloudinary, Imgur, etc.
- Usa las URLs en `property_images`

**Opción 2: Storage de Cloud (Recomendado)**

Próximamente crearemos un bucket de storage:
```sql
-- Crear bucket (futuro)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-images', 'property-images', true);
```

Luego podrás subir imágenes directamente desde el dashboard.

### Optimizar Imágenes

Antes de subir:
1. Redimensionar a 1920x1080px máximo
2. Comprimir con [TinyPNG](https://tinypng.com/)
3. Convertir a WebP para mejor rendimiento

## 🔍 Consultas Útiles

### Ver todas las propiedades

```sql
SELECT id, title_es, type, operation, price, status
FROM public.properties
ORDER BY created_at DESC;
```

### Ver propiedades con conteo de imágenes

```sql
SELECT 
  p.title_es,
  p.price,
  COUNT(pi.id) as image_count
FROM public.properties p
LEFT JOIN public.property_images pi ON p.id = pi.property_id
GROUP BY p.id, p.title_es, p.price;
```

### Propiedades destacadas

```sql
SELECT title_es, price
FROM public.properties
WHERE featured = true AND status = 'disponible';
```

### Propiedades por zona

```sql
SELECT 
  location->>'zone' as zona,
  COUNT(*) as total
FROM public.properties
WHERE status = 'disponible'
GROUP BY location->>'zone';
```

## 🔐 Seguridad

### Políticas Actuales (RLS)

- ✅ **Lectura pública:** Cualquiera puede ver propiedades
- ❌ **Escritura:** Nadie puede agregar/editar (protección)

### Cuando Agregues Admin

Necesitarás:
1. Sistema de autenticación
2. Tabla de roles de usuario
3. Políticas de RLS para admin

```sql
-- Permitir que admins inserten propiedades
CREATE POLICY "Admins can insert properties"
  ON public.properties
  FOR INSERT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
```

## 🚀 Siguientes Pasos

### Inmediato (Haz esto ahora)

1. ✅ **Poblar la base de datos** via `/admin/seed`
2. ✅ **Verificar** que las propiedades carguen desde Supabase
3. ✅ **Probar filtros** en `/propiedades`
4. ✅ **Ver detalles** de una propiedad

### Próximamente

1. ⬜ **Storage bucket** para subir imágenes
2. ⬜ **Sistema de autenticación** para admin
3. ⬜ **Panel de administración** para CRUD
4. ⬜ **Gestión de consultas** (leads)
5. ⬜ **Analytics** en Cloud

## 💡 Tips

### Desarrollo Local

El sitio funciona perfectamente sin poblar Supabase:
- Usa mock data automáticamente
- No requiere conexión a internet
- Rápido para desarrollo

### Testing

Para testing, mantén el mock data:
- Es instantáneo
- No consume recursos
- Datos consistentes

### Producción

En producción, asegúrate de:
- Poblar la base de datos con propiedades reales
- Eliminar `/admin/seed` route
- Verificar RLS policies
- Backup regular de datos

## 📚 Recursos

- **Dashboard de Cloud:** Click en "Cloud" tab en Lovable
- **Documentación:** [docs.lovable.dev/features/cloud](https://docs.lovable.dev/features/cloud)
- **Ver Schema:** Cloud → Database → Schema
- **Ver Logs:** Cloud → Logs
- **Consultas SQL:** Cloud → Database → SQL Editor

## 🆘 Troubleshooting

### Problema: Las propiedades no cargan desde Supabase

**Solución:**
1. Verifica que la base de datos esté poblada (Cloud → Database)
2. Revisa la consola del navegador para errores
3. Verifica variables de entorno en `.env`

### Problema: Error de RLS

**Solución:**
```sql
-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'properties';

-- Reactivar si es necesario
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
```

### Problema: Imágenes no aparecen

**Solución:**
1. Verifica que `property_images` tenga datos
2. Verifica que las URLs sean accesibles
3. Verifica CORS de los dominios de imágenes

---

**¿Preguntas?** Consulta [SUPABASE_SETUP.md](SUPABASE_SETUP.md) para más detalles técnicos.
