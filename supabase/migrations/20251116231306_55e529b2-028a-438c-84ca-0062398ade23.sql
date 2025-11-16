-- Create site_settings table
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins can read/write
CREATE POLICY "Admins can view site settings"
ON public.site_settings
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert site settings"
ON public.site_settings
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site settings"
ON public.site_settings
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete site settings"
ON public.site_settings
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add update trigger
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial settings
INSERT INTO public.site_settings (setting_key, setting_value, category, description) VALUES
-- Contact Settings
('company_phone', '"(951) 123-4567"'::jsonb, 'contact', 'Teléfono principal de la empresa'),
('company_email', '"contacto@yrinmobiliaria.com"'::jsonb, 'contact', 'Correo electrónico de contacto'),
('whatsapp_number', '"5219511234567"'::jsonb, 'contact', 'Número de WhatsApp (formato internacional sin +)'),
('company_address', '"Calle Independencia 123, Centro Histórico, Oaxaca de Juárez, Oaxaca, México"'::jsonb, 'contact', 'Dirección física de la empresa'),

-- Business Settings
('business_hours', '"Lunes a Viernes: 9:00 AM - 6:00 PM\nSábados: 10:00 AM - 2:00 PM"'::jsonb, 'business', 'Horario de atención'),
('company_name', '"YR Inmobiliaria"'::jsonb, 'business', 'Nombre comercial de la empresa'),

-- Social Media Settings
('facebook_url', '"https://facebook.com"'::jsonb, 'social', 'URL de la página de Facebook'),
('instagram_url', '"https://instagram.com"'::jsonb, 'social', 'URL del perfil de Instagram');

-- Create index for faster lookups
CREATE INDEX idx_site_settings_category ON public.site_settings(category);
CREATE INDEX idx_site_settings_key ON public.site_settings(setting_key);