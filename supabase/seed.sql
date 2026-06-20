-- =============================================================================
-- YR Inmobiliaria — Datos de EJEMPLO (single-tenant)
-- =============================================================================
-- Arranque fresco (sin ETL del proyecto viejo). Son datos de muestra para que el
-- backend nuevo no esté vacío y se puedan validar queries/RLS. Se reemplazan por
-- los listados reales cuando Carlos/Yas los capturen en el panel.
-- =============================================================================

-- Zonas de servicio (Oaxaca)
insert into public.service_zones (name_es, name_en, active, display_order) values
  ('Centro Histórico',     'Historic Center',     true, 1),
  ('Reforma',              'Reforma',             true, 2),
  ('San Felipe del Agua',  'San Felipe del Agua', true, 3);

-- Configuración del sitio (clave/valor jsonb)
insert into public.site_settings (setting_key, setting_value, category, description) values
  ('business_name',   '"YR Inmobiliaria"'::jsonb,          'general', 'Nombre del negocio'),
  ('contact_email',   '"contacto@yrinmobiliaria.com"'::jsonb,'contact', 'Email de contacto'),
  ('whatsapp_number', '"5219511234567"'::jsonb,            'contact', 'WhatsApp del negocio');

-- Propiedades de ejemplo (agent_id null por ahora; status disponible = público)
insert into public.properties
  (id, title_es, title_en, description_es, description_en, type, operation, status, price, location, features, featured) values
  ('11111111-1111-1111-1111-111111111111',
   'Casa colonial en Centro Histórico', 'Colonial house in Historic Center',
   'Hermosa casa colonial restaurada a unos pasos del zócalo.', 'Beautiful restored colonial house steps from the zócalo.',
   'casa', 'venta', 'disponible', 3500000,
   '{"zone":"Centro Histórico","city":"Oaxaca de Juárez","state":"Oaxaca","lat":17.0654,"lng":-96.7237}'::jsonb,
   '{"bedrooms":3,"bathrooms":2,"area_m2":220}'::jsonb, true),
  ('22222222-2222-2222-2222-222222222222',
   'Departamento moderno en Reforma', 'Modern apartment in Reforma',
   'Departamento luminoso con amenidades en la colonia Reforma.', 'Bright apartment with amenities in Reforma.',
   'departamento', 'renta', 'disponible', 12000,
   '{"zone":"Reforma","city":"Oaxaca de Juárez","state":"Oaxaca","lat":17.0732,"lng":-96.7180}'::jsonb,
   '{"bedrooms":2,"bathrooms":1,"area_m2":85}'::jsonb, false),
  ('33333333-3333-3333-3333-333333333333',
   'Terreno en San Felipe del Agua', 'Land in San Felipe del Agua',
   'Terreno plano con servicios, ideal para construir.', 'Flat lot with utilities, ideal to build.',
   'terrenos', 'venta', 'disponible', 1800000,
   '{"zone":"San Felipe del Agua","city":"Oaxaca de Juárez","state":"Oaxaca","lat":17.1012,"lng":-96.7050}'::jsonb,
   '{"area_m2":500}'::jsonb, false);

-- Imágenes de ejemplo (URLs externas de muestra)
insert into public.property_images (property_id, image_url, display_order, alt_text_es) values
  ('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1280', 0, 'Casa colonial en Centro Histórico'),
  ('22222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1280', 0, 'Departamento moderno en Reforma'),
  ('33333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1280', 0, 'Terreno en San Felipe del Agua');
