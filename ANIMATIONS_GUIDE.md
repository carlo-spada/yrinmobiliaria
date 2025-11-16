# 🎨 Guía de Animaciones YR Inmobiliaria

## ✨ Sistema de Animaciones Implementado

Se ha implementado un sistema completo de animaciones sutiles y profesionales usando **Framer Motion** para mejorar la experiencia de usuario sin distraer del contenido.

## 📦 Componentes de Animación Disponibles

### 1. FadeIn - Fade in con dirección
Animación de aparición gradual al entrar en el viewport.

```tsx
import { FadeIn } from '@/components/animations/FadeIn';

<FadeIn delay={0.2} direction="up">
  <h1>Título que aparece desde abajo</h1>
</FadeIn>

<FadeIn direction="left">
  <div>Contenido que aparece desde la izquierda</div>
</FadeIn>
```

**Props:**
- `delay` (number): Retraso en segundos (default: 0)
- `duration` (number): Duración de la animación (default: 0.5)
- `direction`: 'up' | 'down' | 'left' | 'right' | 'none'
- `className`: Clases CSS adicionales

### 2. StaggerContainer & StaggerItem - Efecto escalonado
Para animar listas o grids con delay entre elementos.

```tsx
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerContainer';

<StaggerContainer staggerDelay={0.1}>
  {properties.map(property => (
    <StaggerItem key={property.id}>
      <PropertyCard {...property} />
    </StaggerItem>
  ))}
</StaggerContainer>
```

**Props StaggerContainer:**
- `staggerDelay` (number): Delay entre cada hijo (default: 0.1)
- `className`: Clases CSS adicionales

### 3. PageTransition - Transiciones entre páginas
Transiciones suaves al cambiar de ruta + scroll to top automático.

```tsx
// Ya está implementado en App.tsx
<PageTransition>
  <Routes>
    {/* rutas */}
  </Routes>
</PageTransition>
```

**Características:**
- Fade in/out entre páginas
- Scroll automático al inicio en cada navegación
- Duración: 300ms con easing suave

### 4. SuccessAnimation - Animación de éxito
Checkmark animado para confirmaciones.

```tsx
import { SuccessAnimation } from '@/components/animations/SuccessAnimation';

<SuccessAnimation />
```

**Uso típico:**
- Después de enviar formularios
- Confirmación de reservas
- Operaciones exitosas

### 5. Skeleton Loaders - Estados de carga
Skeleton screens con efecto shimmer.

```tsx
import { Skeleton, PropertyCardSkeleton, PropertyGridSkeleton } from '@/components/ui/skeleton-loader';

// Skeleton individual
<Skeleton className="h-40 w-full" />

// Card completo
<PropertyCardSkeleton />

// Grid de múltiples cards
<PropertyGridSkeleton count={6} />
```

### 6. LoadingSpinner - Spinner personalizado
Spinner con colores de marca.

```tsx
import { LoadingSpinner, LoadingOverlay } from '@/components/ui/loading-spinner';

// Spinner simple
<LoadingSpinner size="md" />

// Overlay pantalla completa
<LoadingOverlay />
```

**Tamaños:**
- `sm`: 16px
- `md`: 32px
- `lg`: 48px

### 7. ProgressSteps - Indicador de pasos
Progress bar para formularios multi-paso.

```tsx
import { ProgressSteps } from '@/components/ui/progress-steps';

<ProgressSteps 
  steps={['Propiedad', 'Fecha', 'Datos', 'Confirmación']}
  currentStep={1}
/>
```

**Características:**
- Checkmark animado en pasos completados
- Indicador visual del paso actual
- Líneas de progreso animadas

### 8. ScrollToTop - Botón volver arriba
Botón flotante que aparece al hacer scroll.

```tsx
// Ya está implementado en App.tsx
<ScrollToTop />
```

**Características:**
- Aparece después de 300px de scroll
- Animación de entrada/salida
- Scroll suave al hacer click
- Posición: bottom-right

## 🎯 Hover Effects Implementados

### PropertyCard
```tsx
// Ya implementado en PropertyCard.tsx
- Elevación sutil al hover (translateY: -4px)
- Zoom en imagen (scale: 1.05)
- Shadow más pronunciada
- Overlay con gradiente
```

### Botones
```tsx
// Usar clases de transición de Tailwind
className="transition-all duration-300 hover:bg-primary/90"
```

## 💫 Parallax en Hero Sections

Para agregar parallax a imágenes de fondo:

```tsx
import { motion, useScroll, useTransform } from 'framer-motion';

function HeroWithParallax() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);

  return (
    <div className="relative h-screen overflow-hidden">
      <motion.div 
        style={{ y }}
        className="absolute inset-0"
      >
        <img src="/hero.jpg" className="w-full h-full object-cover" />
      </motion.div>
    </div>
  );
}
```

## 🔧 Configuración Técnica

### Instalación
```bash
npm install framer-motion@latest
```

### Configuración en tailwind.config.ts
```js
// Animación shimmer para skeleton loaders
keyframes: {
  shimmer: {
    '100%': {
      transform: 'translateX(100%)',
    },
  },
}
```

## 📝 Patrones de Uso

### 1. Páginas con Grid de Propiedades
```tsx
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerContainer';
import { PropertyGridSkeleton } from '@/components/ui/skeleton-loader';

function PropertiesPage() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PropertyGridSkeleton count={6} />
      </div>
    );
  }

  return (
    <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map(property => (
        <StaggerItem key={property.id}>
          <PropertyCard {...property} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
```

### 2. Formularios con Confirmación
```tsx
import { SuccessAnimation } from '@/components/animations/SuccessAnimation';
import { ProgressSteps } from '@/components/ui/progress-steps';

function ScheduleForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  if (isSuccess) {
    return (
      <div className="text-center space-y-6">
        <SuccessAnimation />
        <h2>¡Cita agendada exitosamente!</h2>
      </div>
    );
  }

  return (
    <>
      <ProgressSteps 
        steps={['Propiedad', 'Fecha', 'Datos']}
        currentStep={currentStep}
      />
      {/* Formulario */}
    </>
  );
}
```

### 3. Secciones con Fade In
```tsx
import { FadeIn } from '@/components/animations/FadeIn';

function AboutSection() {
  return (
    <section>
      <FadeIn direction="up">
        <h2>Sobre Nosotros</h2>
      </FadeIn>
      
      <FadeIn delay={0.2} direction="up">
        <p>Nuestra historia...</p>
      </FadeIn>

      <FadeIn delay={0.4} direction="up">
        <Button>Contactar</Button>
      </FadeIn>
    </section>
  );
}
```

## ⚡ Optimización y Performance

### Best Practices
1. **Use `whileInView` en lugar de `animate`** para elementos fuera del viewport inicial
2. **`viewport={{ once: true }}`** para evitar re-animaciones en scroll
3. **Lazy load de imágenes** con `loading="lazy"`
4. **Reducir motion** para usuarios con preferencia:

```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

<motion.div
  animate={prefersReducedMotion ? {} : { opacity: 1 }}
>
```

### Timing Recommendations
- **Fade in**: 0.3-0.5s
- **Stagger delay**: 0.05-0.15s
- **Hover effects**: 0.2-0.3s
- **Page transitions**: 0.3s

## 🎨 Easing Curves

Usa estos easing curves para diferentes efectos:

```tsx
// Smooth general
ease: [0.25, 0.4, 0.25, 1]

// Bounce subtle
ease: [0.34, 1.56, 0.64, 1]

// Elastic
type: 'spring',
stiffness: 200,
damping: 15
```

## 🚀 Próximas Mejoras

Ideas para expandir el sistema de animaciones:

1. **Micro-interacciones**:
   - Botón like con corazón animado
   - Share button con ripple effect
   - Input focus con highlight

2. **Loading States**:
   - Progress bar para uploads
   - Pulse en botones de submit
   - Skeleton para contenido dinámico

3. **Gestures**:
   - Swipe en móvil para galería
   - Pull to refresh
   - Drag and drop para ordenar

4. **Scroll-based**:
   - Números que cuentan (stats)
   - Progress bar de lectura
   - Parallax en múltiples capas

---

**Recuerda:** Todas las animaciones deben ser sutiles y no distraer del contenido. Si algo llama demasiado la atención, reduce la duración o el efecto.
