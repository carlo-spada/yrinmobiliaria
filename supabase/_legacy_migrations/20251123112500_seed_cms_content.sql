-- Seed CMS Pages for YR Inmobiliaria

WITH org AS (
  SELECT id FROM organizations WHERE slug = 'yrinmobiliaria' LIMIT 1
)
INSERT INTO cms_pages (organization_id, slug, title, is_published, content)
SELECT 
  org.id,
  'about',
  'Sobre Nosotros',
  true,
  '{
    "hero": {
      "es": {
        "title": "Más que una inmobiliaria, tu aliado en Oaxaca",
        "subtitle": "Comprometidos con hacer realidad tu sueño de encontrar el hogar perfecto en la tierra que amamos."
      },
      "en": {
        "title": "More than a real estate agency, your ally in Oaxaca",
        "subtitle": "Committed to making your dream of finding the perfect home in the land we love come true."
      }
    },
    "story": {
      "es": {
        "title": "Nuestra Historia",
        "p1": "YR Inmobiliaria nació en diciembre de 2025, fundada por Yas Ruiz Vásquez y Carlo Spada Tello. Tras años colaborando con asesores, desarrolladores y familias en los Valles Centrales de Oaxaca, vimos una brecha: muchas personas buscando vender o comprar, pero pocas inmobiliarias usando datos y automatización para hacerlo más claro y confiable.",
        "p2": "Así surge YR: una firma que combina cercanía humana con enfoque tecnológico, para transacciones transparentes y decisiones mejor fundamentadas.",
        "p3": "Antes del lanzamiento oficial, el equipo ya había acompañado a decenas de familias y cientos de clientes en operaciones en los Valles Centrales. Hoy queremos consolidarnos en todo Oaxaca y, con el tiempo, llegar a más regiones de México.",
        "mission_title": "Nuestra misión",
        "mission_text": "Ayudar a familias e inversionistas a tomar decisiones inmobiliarias seguras en Oaxaca, combinando confianza y transparencia con el uso inteligente de tecnología e inteligencia artificial."
      },
      "en": {
        "title": "Our Story",
        "p1": "YR Inmobiliaria was founded in December 2025 by Yas Ruiz Vásquez and Carlo Spada Tello. After years working with advisors, developers, and families in Oaxaca’s Central Valleys, we saw a gap: many people buying or selling, but few agencies using data and automation to make it clearer and more trustworthy.",
        "p2": "YR was born to blend human closeness with a tech-forward approach, delivering transparent transactions and better-grounded decisions.",
        "p3": "Even before launch, the team had guided dozens of families and hundreds of clients in the Central Valleys. Now we aim to serve all of Oaxaca and, over time, more regions of Mexico.",
        "mission_title": "Our mission",
        "mission_text": "Help families and investors make safe real estate decisions in Oaxaca, combining trust and transparency with smart use of technology and AI."
      }
    }
  }'::jsonb
FROM org
ON CONFLICT (organization_id, slug) DO UPDATE 
SET content = EXCLUDED.content;

-- Terms of Service Seed
WITH org AS (
  SELECT id FROM organizations WHERE slug = 'yrinmobiliaria' LIMIT 1
)
INSERT INTO cms_pages (organization_id, slug, title, is_published, content)
SELECT 
  org.id,
  'terms',
  'Términos y Condiciones',
  true,
  '{
    "es": {
      "title": "Términos y Condiciones de Servicio",
      "lastUpdated": "Última actualización: Noviembre 2025",
      "intro": "Bienvenido a YR Inmobiliaria. Estos Términos y Condiciones rigen el uso de nuestro sitio web y servicios. Al acceder o utilizar nuestros servicios, usted acepta estar sujeto a estos términos."
    },
    "en": {
      "title": "Terms and Conditions of Service",
      "lastUpdated": "Last updated: November 2025",
      "intro": "Welcome to YR Inmobiliaria. These Terms and Conditions govern the use of our website and services. By accessing or using our services, you agree to be bound by these terms."
    }
  }'::jsonb
FROM org
ON CONFLICT (organization_id, slug) DO UPDATE 
SET content = EXCLUDED.content;

-- Privacy Policy Seed
WITH org AS (
  SELECT id FROM organizations WHERE slug = 'yrinmobiliaria' LIMIT 1
)
INSERT INTO cms_pages (organization_id, slug, title, is_published, content)
SELECT 
  org.id,
  'privacy',
  'Política de Privacidad',
  true,
  '{
    "es": {
      "title": "Política de Privacidad",
      "lastUpdated": "Última actualización: Noviembre 2025",
      "intro": "En YR Inmobiliaria, nos comprometemos a proteger su privacidad y garantizar la seguridad de su información personal. Esta Política de Privacidad describe cómo recopilamos, usamos, divulgamos y protegemos su información cuando utiliza nuestros servicios."
    },
    "en": {
      "title": "Privacy Policy",
      "lastUpdated": "Last updated: November 2025",
      "intro": "At YR Inmobiliaria, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy describes how we collect, use, disclose, and protect your information when you use our services."
    }
  }'::jsonb
FROM org
ON CONFLICT (organization_id, slug) DO UPDATE 
SET content = EXCLUDED.content;
