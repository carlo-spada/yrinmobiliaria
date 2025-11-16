# 🌍 Sistema Bilingüe YR Inmobiliaria

## ✨ Características Implementadas

- ✅ **react-i18next** configurado y funcionando
- ✅ Traducciones completas en español e inglés (archivos JSON)
- ✅ Selector de idioma con banderas 🇲🇽 🇺🇸 en el header
- ✅ Persistencia en localStorage
- ✅ Detección automática del idioma del navegador
- ✅ Componentes de ejemplo migrados (Header, Footer)

## 🚀 Inicio Rápido

### 1. El Selector de Idioma

El selector está visible en la esquina superior derecha del header:
- Click en el icono del globo 🌐
- Selecciona entre Español 🇲🇽 o English 🇺🇸
- El cambio es inmediato en toda la aplicación
- Tu preferencia se guarda automáticamente

### 2. Para Desarrolladores

#### Usar traducciones en un componente:

```tsx
import { useTranslation } from 'react-i18next';

function MiComponente() {
  const { t, i18n } = useTranslation();
  
  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <p>Idioma actual: {i18n.language}</p>
      
      {/* Para cambiar idioma */}
      <button onClick={() => i18n.changeLanguage('en')}>
        English
      </button>
    </div>
  );
}
```

#### Estructura de archivos:

```
public/
└── locales/
    ├── es/
    │   └── translation.json    ← Traducciones en español
    └── en/
        └── translation.json    ← Traducciones en inglés
```

#### Agregar nuevas traducciones:

1. Edita `public/locales/es/translation.json`:
```json
{
  "miSeccion": {
    "titulo": "Mi Título en Español"
  }
}
```

2. Edita `public/locales/en/translation.json`:
```json
{
  "miSeccion": {
    "titulo": "My Title in English"
  }
}
```

3. Úsala en tu componente:
```tsx
{t('miSeccion.titulo')}
```

## 📁 Archivos Clave

| Archivo | Descripción |
|---------|-------------|
| `src/i18n.ts` | Configuración de i18next |
| `src/main.tsx` | Importa i18n antes de renderizar |
| `public/locales/*/translation.json` | Archivos de traducción |
| `src/components/LanguageSelectorNew.tsx` | Selector de idioma |
| `MIGRATION_GUIDE.md` | Guía completa de migración |
| `I18N_IMPLEMENTATION.md` | Estado de implementación |

## 🔄 Migración de Componentes

### Patrón de migración:

#### ANTES (LanguageContext antiguo):
```tsx
import { useLanguage } from '@/utils/LanguageContext';

function MyComponent() {
  const { t, language } = useLanguage();
  return <h1>{t.nav.home}</h1>;
}
```

#### DESPUÉS (react-i18next):
```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  return <h1>{t('nav.home')}</h1>;
}
```

### Componentes ya migrados:
- ✅ `Header.tsx`
- ✅ `Footer.tsx`
- ✅ `LanguageSelectorNew.tsx`

### Componentes pendientes:
Ver lista completa en `I18N_IMPLEMENTATION.md`

## 🎯 Traducciones Disponibles

### Secciones completas en ambos idiomas:

- **Navegación** (nav): home, properties, map, about, contact
- **Hero**: título, subtítulo, búsqueda
- **Propiedades**: filtros, ordenamiento, paginación
- **Contacto**: formulario completo
- **Agendar cita**: formulario y confirmación
- **Mapa**: controles y leyenda
- **Detalle de propiedad**: todas las secciones
- **Nosotros**: historia, valores, equipo
- **Footer**: información de contacto

Total: **~150 strings traducidos** en ambos idiomas.

## 💡 Tips

1. **Acceder al idioma actual**:
   ```tsx
   const { i18n } = useTranslation();
   const lang = i18n.language; // 'es' o 'en'
   ```

2. **Contenido bilingüe de propiedades**:
   ```tsx
   const { i18n } = useTranslation();
   const title = property.title[i18n.language];
   const description = property.description[i18n.language];
   ```

3. **Debugging**:
   En `src/i18n.ts`, cambiar `debug: false` a `debug: true` para ver logs.

## 📖 Documentación Adicional

- **`MIGRATION_GUIDE.md`**: Guía paso a paso para migrar componentes
- **`I18N_IMPLEMENTATION.md`**: Estado detallado de la implementación
- [react-i18next Official Docs](https://react.i18next.com/)

## 🎨 Características del Selector

El selector de idioma incluye:
- Icono de globo terráqueo
- Dropdown con banderas
- Indicador visual del idioma activo (fondo gris)
- Cambio instantáneo
- Responsive (funciona en móvil)

## ⚡ Rendimiento

- Traducciones se cargan una sola vez al inicio
- Sin re-renders innecesarios
- localStorage evita recarga de preferencias
- ~2KB adicionales al bundle (gzip)

## 🔮 Próximas Mejoras Posibles

1. **URLs con prefijo de idioma**:
   - `/es/propiedades` vs `/en/properties`
   
2. **Meta tags SEO**:
   - Hreflang tags
   - Títulos y descripciones por idioma

3. **Interpolación avanzada**:
   - Fechas formateadas por idioma
   - Números y moneda localizados

4. **Más idiomas**:
   - Francés, alemán, etc.
   - Solo agregar archivo JSON

---

**¿Dudas?** Consulta `MIGRATION_GUIDE.md` o la documentación oficial de react-i18next.
