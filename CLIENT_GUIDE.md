# 📖 Guía de Uso - YR Inmobiliaria

Guía completa para administradores y propietarios del sitio web.

## 📋 Tabla de Contenidos

1. [Agregar Propiedades](#agregar-propiedades)
2. [Editar Contenido Estático](#editar-contenido-estático)
3. [Personalizar Branding](#personalizar-branding)
4. [Configurar Formularios](#configurar-formularios)
5. [Integrar Google Analytics](#integrar-google-analytics)
6. [Configurar Mapa Real](#configurar-mapa-real)
7. [Gestión de Traducciones](#gestión-de-traducciones)
8. [Actualizar Imágenes](#actualizar-imágenes)

---

## 🏠 Agregar Propiedades

### Ubicación del Archivo
Las propiedades se encuentran en: `src/data/properties.ts`

### Estructura de una Propiedad

```typescript
{
  id: "prop-001",  // ID único, usar formato: prop-XXX
  title: {
    es: "Casa Colonial en Centro Histórico",
    en: "Colonial House in Historic Center"
  },
  description: {
    es: "Hermosa casa colonial completamente renovada...",
    en: "Beautiful fully renovated colonial house..."
  },
  type: "casa", // "casa" | "departamento" | "local" | "oficina"
  operation: "venta", // "venta" | "renta"
  price: 4500000, // Precio en pesos mexicanos
  location: {
    zone: "Centro Histórico",
    neighborhood: "Jalatlaco",
    address: "Calle Reforma 123",
    coordinates: {
      lat: 17.0654, // Latitud
      lng: -96.7236 // Longitud
    }
  },
  features: {
    bedrooms: 3,
    bathrooms: 2,
    parking: 1,
    constructionArea: 180, // m²
    landArea: 200 // m² (opcional)
  },
  amenities: [
    "Cocina integral",
    "Terraza",
    "Jardín",
    "Calentador solar"
  ],
  images: [
    "https://images.unsplash.com/photo-1...",
    "https://images.unsplash.com/photo-2...",
    "https://images.unsplash.com/photo-3..."
  ],
  status: "disponible", // "disponible" | "vendida" | "rentada"
  featured: true, // true para destacar en la página principal
  publishedDate: "2024-01-15"
}
```

### Pasos para Agregar una Propiedad

1. **Abrir el archivo** `src/data/properties.ts`

2. **Copiar la estructura** de una propiedad existente

3. **Modificar los datos:**
   - Cambiar ID único
   - Actualizar título y descripción en ambos idiomas
   - Ajustar precio y características
   - Agregar coordenadas reales (usa Google Maps)
   - Subir imágenes a un hosting (Cloudinary, Imgur, etc.)

4. **Obtener Coordenadas:**
   - Ir a [Google Maps](https://maps.google.com)
   - Buscar la dirección
   - Click derecho → "¿Qué hay aquí?"
   - Copiar las coordenadas (formato: 17.0654, -96.7236)

5. **Guardar y verificar** que el sitio se actualice

### Tips para Imágenes

- **Tamaño recomendado:** 1920x1080px (16:9)
- **Formato:** JPG o WebP
- **Peso máximo:** 500KB por imagen
- **Cantidad:** Mínimo 3, máximo 10 imágenes
- **Orden:** Primera imagen = portada

**Servicios gratuitos para hosting:**
- [Cloudinary](https://cloudinary.com/) - 25GB gratis
- [Imgur](https://imgur.com/) - Ilimitado
- [ImageKit](https://imagekit.io/) - 20GB gratis

---

## 📝 Editar Contenido Estático

### Página de Inicio

**Archivo:** `src/components/HeroSection.tsx`

Editar textos del hero:
```typescript
// Línea ~25
const heroTitle = language === 'es' 
  ? 'Tu próximo hogar te espera en Oaxaca'
  : 'Your next home awaits in Oaxaca';
```

**Archivo:** `src/components/StatsSection.tsx`

Cambiar estadísticas:
```typescript
const stats = [
  { number: "500+", label: { es: "Propiedades", en: "Properties" } },
  { number: "98%", label: { es: "Clientes Satisfechos", en: "Satisfied Clients" } },
  // ... agregar más estadísticas
];
```

### Página "Nosotros"

**Archivo:** `src/pages/About.tsx`

Actualizar contenido de la empresa en las líneas 30-100:
```typescript
const aboutContent = {
  history: "Nuestra historia comenzó en...",
  mission: "Conectar a las personas con...",
  vision: "Ser la inmobiliaria líder..."
};
```

### Footer

**Archivo:** `src/components/Footer.tsx`

Modificar información de contacto (líneas 15-30):
```typescript
const contactInfo = {
  address: "Calle Independencia 123, Centro",
  phone: "+52 (951) 123-4567",
  email: "contacto@yrinmobiliaria.com",
  schedule: "Lun-Vie: 9AM-6PM, Sáb: 10AM-2PM"
};
```

Actualizar redes sociales (líneas 40-50):
```typescript
const socialLinks = [
  { platform: 'facebook', url: 'https://facebook.com/yrinmobiliaria' },
  { platform: 'instagram', url: 'https://instagram.com/yrinmobiliaria' },
  // ...
];
```

---

## 🎨 Personalizar Branding

### Cambiar Colores

**Archivo:** `src/index.css`

Modificar la paleta de colores (líneas 10-45):

```css
:root {
  /* Color Principal (Botones, enlaces) */
  --primary: 12 54% 51%; /* HSL format */
  
  /* Color Secundario (Acentos) */
  --secondary: 159 35% 27%;
  
  /* Color de Acento (Destacados) */
  --accent: 35 54% 65%;
  
  /* Fondo General */
  --background: 35 44% 93%;
}
```

**Cómo convertir HEX a HSL:**
1. Ir a [color-calculator](https://www.colorhexa.com/)
2. Ingresar tu color HEX (ej: #C85A3C)
3. Copiar valores HSL (ej: 12° 54% 51%)
4. Formato en CSS: `12 54% 51%` (sin unidades)

### Cambiar Logo

**Archivo:** `src/components/Header.tsx`

Opción 1 - Logo de texto (actual):
```tsx
// Línea 62
<div className="w-12 h-12 bg-primary rounded-lg">
  <span className="text-2xl font-bold">YR</span>
</div>
```

Opción 2 - Imagen de logo:
```tsx
<img 
  src="/logo.png" 
  alt="YR Inmobiliaria" 
  className="h-12 w-auto"
/>
```

**Subir logo:**
1. Guardar logo en `public/logo.png`
2. Tamaño recomendado: 200x200px
3. Formato: PNG con transparencia

### Cambiar Tipografía

**Archivo:** `tailwind.config.ts`

Modificar fuentes (líneas 51-54):
```typescript
fontFamily: {
  sans: ['Tu Fuente', 'system-ui', 'sans-serif'],
  serif: ['Tu Fuente Serif', 'serif'],
},
```

**Agregar fuente de Google:**

En `index.html` (línea 6):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

## 📧 Configurar Formularios

### Paso 1: Crear Cuenta en EmailJS

1. Ir a [EmailJS.com](https://www.emailjs.com/)
2. Crear cuenta gratuita
3. Conectar tu correo (Gmail, Outlook, etc.)

### Paso 2: Crear Plantillas de Email

#### Plantilla de Contacto

1. Dashboard → Email Templates → Create New Template
2. Nombre: `contact_form`
3. Contenido:

```html
Asunto: Nuevo mensaje de {{from_name}}

De: {{from_name}}
Email: {{from_email}}
Teléfono: {{phone}}

Asunto: {{subject}}

Mensaje:
{{message}}
```

#### Plantilla de Visitas

1. Create New Template
2. Nombre: `schedule_visit`
3. Contenido:

```html
Asunto: Nueva solicitud de visita - {{property_name}}

Cliente: {{from_name}}
Email: {{from_email}}
Teléfono: {{phone}}

Propiedad: {{property_name}}
Fecha: {{visit_date}}
Hora: {{visit_time}}

Notas adicionales:
{{notes}}
```

### Paso 3: Obtener Credenciales

1. **Service ID:** Dashboard → Email Services → Tu servicio
2. **Template IDs:** Dashboard → Email Templates → Click en cada template
3. **Public Key:** Dashboard → Account → API Keys

### Paso 4: Configurar Variables de Entorno

Crear archivo `.env` en la raíz:

```env
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID_CONTACT=template_xyz789
VITE_EMAILJS_TEMPLATE_ID_SCHEDULE=template_def456
VITE_EMAILJS_PUBLIC_KEY=user_ABC123XYZ789
```

### Paso 5: Probar Formularios

1. Llenar formulario de contacto
2. Verificar que llegue el email
3. Revisar spam si no llega
4. Ajustar plantillas según necesidad

### Solución de Problemas

**Error: "Service not found"**
- Verificar VITE_EMAILJS_SERVICE_ID

**Error: "Template not found"**
- Verificar Template IDs

**Email no llega:**
- Verificar bandeja de spam
- Confirmar que el servicio de email esté activo
- Verificar límite de envíos (300/mes gratis)

---

## 📊 Integrar Google Analytics

### Paso 1: Crear Propiedad GA4

1. Ir a [Google Analytics](https://analytics.google.com/)
2. Admin → Create Property
3. Nombre: "YR Inmobiliaria"
4. Zona horaria: Mexico City
5. Industry: Real Estate
6. Crear "Web" data stream

### Paso 2: Obtener Measurement ID

1. Admin → Data Streams → Tu stream
2. Copiar Measurement ID (formato: `G-XXXXXXXXXX`)

### Paso 3: Configurar en el Proyecto

Agregar a `.env`:
```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Paso 4: Activar Analytics

**Archivo:** `src/main.tsx`

Descomentar líneas 8-20:
```typescript
// Google Analytics
if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID);
}
```

### Eventos Personalizados Implementados

El sitio ya registra estos eventos automáticamente:

- `view_property` - Ver detalle de propiedad
- `contact` - Contactar sobre propiedad
- `schedule_visit` - Agendar visita
- `search` - Buscar propiedades
- `add_to_favorites` - Agregar a favoritos
- `share` - Compartir propiedad

### Ver Reportes

1. Dashboard de Google Analytics
2. Reports → Engagement → Events
3. Ver eventos en tiempo real: Realtime → Overview

---

## 🗺️ Configurar Mapa Real

El sitio usa OpenStreetMap (gratis), pero puedes cambiar a Google Maps.

### Opción 1: Mantener OpenStreetMap (Gratis)

**Ya configurado**, no requiere API key.

Personalizar estilos en `src/pages/MapView.tsx`:

```typescript
// Cambiar estilo del mapa (línea 45)
const TILE_LAYER = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

// Opciones de estilos:
// Oscuro: https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/...
// Claro: https://{s}.basemaps.cartocdn.com/light_all/...
```

### Opción 2: Usar Google Maps

1. **Obtener API Key:**
   - Ir a [Google Cloud Console](https://console.cloud.google.com/)
   - APIs & Services → Credentials
   - Create Credentials → API Key
   - Habilitar "Maps JavaScript API"

2. **Instalar dependencia:**
```bash
npm install @react-google-maps/api
```

3. **Reemplazar componente** en `src/pages/MapView.tsx`:

```tsx
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const MapView = () => {
  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '600px' }}
        center={{ lat: 17.0654, lng: -96.7236 }}
        zoom={13}
      >
        {properties.map(property => (
          <Marker
            key={property.id}
            position={{
              lat: property.location.coordinates.lat,
              lng: property.location.coordinates.lng
            }}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};
```

4. **Agregar a `.env`:**
```env
VITE_GOOGLE_MAPS_KEY=AIzaSy...
```

---

## 🌍 Gestión de Traducciones

### Ubicación de Archivos

- **Español:** `public/locales/es/translation.json`
- **Inglés:** `public/locales/en/translation.json`

### Estructura

```json
{
  "nav": {
    "home": "Inicio",
    "properties": "Propiedades",
    "about": "Nosotros"
  },
  "hero": {
    "title": "Tu próximo hogar te espera",
    "subtitle": "Encuentra la propiedad perfecta"
  }
}
```

### Agregar Nueva Traducción

1. Agregar en ambos archivos (es/en)
2. Usar en componente:

```tsx
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { t } = useTranslation();
  return <h1>{t('hero.title')}</h1>;
};
```

### Cambiar Idioma por Defecto

**Archivo:** `src/i18n.ts` (línea 12):

```typescript
fallbackLng: 'es', // Cambiar a 'en' para inglés
```

---

## 🖼️ Actualizar Imágenes

### Hero Image

**Ubicación:** `src/assets/hero-oaxaca.jpg`

1. Reemplazar archivo con nueva imagen
2. Tamaño recomendado: 1920x1080px
3. Peso máximo: 800KB

### Imágenes de Propiedades

Ver sección [Agregar Propiedades](#agregar-propiedades)

### Optimizar Imágenes

**Herramientas recomendadas:**
- [TinyPNG](https://tinypng.com/) - Compresión online
- [Squoosh](https://squoosh.app/) - Optimización avanzada
- [ImageOptim](https://imageoptim.com/) - App para Mac

**Recomendaciones:**
- Formato WebP para mejor compresión
- Responsive: 320px, 768px, 1920px
- Calidad: 80% (balance calidad/tamaño)

---

## 🔧 Comandos Útiles

```bash
# Desarrollo local
npm run dev

# Build para producción
npm run build

# Preview build local
npm run preview

# Verificar errores
npm run lint
```

---

## 🆘 Soporte

**Errores comunes:**

1. **"Cannot find module..."**
   - Ejecutar: `npm install`

2. **"Port already in use"**
   - Cambiar puerto: `npm run dev -- --port 3001`

3. **"Environment variable not defined"**
   - Verificar archivo `.env`
   - Reiniciar servidor

4. **Imágenes no cargan**
   - Verificar URLs
   - Verificar CORS del hosting

**Recursos:**
- [Documentación React](https://react.dev/)
- [Documentación Vite](https://vitejs.dev/)
- [Documentación Tailwind](https://tailwindcss.com/)
- [Lovable Docs](https://docs.lovable.dev/)

---

**¿Necesitas ayuda?** Contacta al desarrollador o abre un issue en el repositorio.
