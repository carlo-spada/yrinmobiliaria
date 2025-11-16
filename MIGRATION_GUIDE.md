# Sistema Bilingüe - Guía de Migración

Este proyecto ahora utiliza **react-i18next** para el manejo completo de traducciones en español e inglés.

## ✅ Cambios Implementados

### 1. Configuración i18next
- **Archivo**: `src/i18n.ts`
- Configuración de i18next con soporte para español e inglés
- Detección automática del idioma del navegador
- Persistencia en localStorage

### 2. Archivos de Traducción
Las traducciones están en archivos JSON:
- `public/locales/es/translation.json` - Español
- `public/locales/en/translation.json` - Inglés

### 3. Componentes Actualizados
Los siguientes componentes ya están migrados a react-i18next:
- ✅ `Header.tsx` - Navegación
- ✅ `Footer.tsx` - Pie de página
- ✅ `LanguageSelectorNew.tsx` - Selector de idioma con banderas

### 4. Selector de Idioma
Nuevo componente con dropdown que muestra banderas:
- 🇲🇽 Español
- 🇺🇸 English

## 📝 Cómo Usar en Componentes

### Antes (LanguageContext antiguo):
```tsx
import { useLanguage } from '@/utils/LanguageContext';

function MyComponent() {
  const { t, language } = useLanguage();
  return <h1>{t.nav.home}</h1>;
}
```

### Ahora (react-i18next):
```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  return <h1>{t('nav.home')}</h1>;
}
```

## 🔧 Funciones Principales

### Cambiar Idioma
```tsx
import { useTranslation } from 'react-i18next';

function LanguageButton() {
  const { i18n } = useTranslation();
  
  return (
    <button onClick={() => i18n.changeLanguage('en')}>
      Switch to English
    </button>
  );
}
```

### Obtener Idioma Actual
```tsx
const { i18n } = useTranslation();
const currentLang = i18n.language; // 'es' or 'en'
```

### Traducción con Interpolación
```tsx
// En translation.json:
{
  "welcome": "Bienvenido, {{name}}"
}

// En el componente:
t('welcome', { name: 'Juan' }) // "Bienvenido, Juan"
```

### Traducciones con Plurales
```tsx
// En translation.json:
{
  "item": "{{count}} propiedad",
  "item_plural": "{{count}} propiedades"
}

// En el componente:
t('item', { count: 1 }) // "1 propiedad"
t('item', { count: 5 }) // "5 propiedades"
```

## 📂 Estructura de Traducciones

```json
{
  "nav": {
    "home": "Inicio",
    "properties": "Propiedades"
  },
  "hero": {
    "title": "Título principal",
    "subtitle": "Subtítulo"
  }
}
```

Acceso en código:
```tsx
t('nav.home')      // "Inicio"
t('hero.title')    // "Título principal"
```

## 🌍 Componentes que Necesitan Migración

Los siguientes componentes aún usan el sistema antiguo y deben actualizarse:

### Páginas:
- ❌ `pages/Index.tsx`
- ❌ `pages/Properties.tsx`
- ❌ `pages/PropertyDetail.tsx`
- ❌ `pages/MapView.tsx`
- ❌ `pages/Contact.tsx`
- ❌ `pages/ScheduleVisit.tsx`
- ❌ `pages/About.tsx`

### Componentes:
- ❌ `components/HeroSection.tsx`
- ❌ `components/FeaturedProperties.tsx`
- ❌ `components/ZonesSection.tsx`
- ❌ `components/WhyChooseUs.tsx`
- ❌ `components/StatsSection.tsx`
- ❌ `components/FinalCTA.tsx`
- ❌ `components/PropertyCard.tsx`
- ❌ `components/PropertyFilters.tsx`

## 🔄 Pasos para Migrar un Componente

1. **Reemplazar import**:
   ```tsx
   // Antiguo
   import { useLanguage } from '@/utils/LanguageContext';
   
   // Nuevo
   import { useTranslation } from 'react-i18next';
   ```

2. **Actualizar hook**:
   ```tsx
   // Antiguo
   const { t, language } = useLanguage();
   
   // Nuevo
   const { t, i18n } = useTranslation();
   const language = i18n.language; // si necesitas el idioma actual
   ```

3. **Actualizar llamadas a traducciones**:
   ```tsx
   // Antiguo
   {t.nav.home}
   {t.hero?.title || 'Default'}
   
   // Nuevo
   {t('nav.home')}
   {t('hero.title')}
   ```

4. **Para propiedades con idiomas (title, description)**:
   ```tsx
   // Las propiedades ya tienen estructura bilingüe:
   property.title[i18n.language]  // Acceder al título en idioma actual
   property.description[i18n.language]  // Acceder a descripción
   ```

## 🎯 Ventajas de react-i18next

1. ✅ **Estándar de la industria** - Ampliamente usado y documentado
2. ✅ **Lazy loading** - Carga traducciones bajo demanda
3. ✅ **Interpolación** - Variables dinámicas en traducciones
4. ✅ **Pluralización** - Manejo automático de singular/plural
5. ✅ **Contexto** - Traducciones según contexto
6. ✅ **Namespaces** - Organización modular de traducciones
7. ✅ **TypeScript** - Soporte completo con tipos

## 🔍 Debugging

Para ver logs de i18next durante desarrollo:
```tsx
// En src/i18n.ts
i18n.init({
  // ...
  debug: true, // Cambiar a true
});
```

## 📚 Recursos

- [react-i18next Docs](https://react.i18next.com/)
- [i18next Docs](https://www.i18next.com/)
- [Guía de Migración oficial](https://react.i18next.com/latest/migrating-v9-to-v10)
