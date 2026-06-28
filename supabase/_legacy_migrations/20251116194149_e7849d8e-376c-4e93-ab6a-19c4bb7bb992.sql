-- Create contact_inquiries table for form submissions
CREATE TABLE public.contact_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved', 'archived')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create scheduled_visits table for visit requests
CREATE TABLE public.scheduled_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  preferred_date date NOT NULL,
  preferred_time text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create service_zones table for zone management
CREATE TABLE public.service_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_es text NOT NULL,
  name_en text NOT NULL,
  description_es text,
  description_en text,
  active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_zones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contact_inquiries
CREATE POLICY "Admins can view all contact inquiries"
ON public.contact_inquiries FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can create contact inquiries"
ON public.contact_inquiries FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can update contact inquiries"
ON public.contact_inquiries FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete contact inquiries"
ON public.contact_inquiries FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for scheduled_visits
CREATE POLICY "Admins can view all scheduled visits"
ON public.scheduled_visits FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can create scheduled visits"
ON public.scheduled_visits FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can update scheduled visits"
ON public.scheduled_visits FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete scheduled visits"
ON public.scheduled_visits FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for service_zones
CREATE POLICY "Everyone can view active service zones"
ON public.service_zones FOR SELECT
USING (true);

CREATE POLICY "Admins can insert service zones"
ON public.service_zones FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update service zones"
ON public.service_zones FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete service zones"
ON public.service_zones FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Create indexes for better performance
CREATE INDEX idx_contact_inquiries_status ON public.contact_inquiries(status);
CREATE INDEX idx_contact_inquiries_created_at ON public.contact_inquiries(created_at DESC);
CREATE INDEX idx_scheduled_visits_status ON public.scheduled_visits(status);
CREATE INDEX idx_scheduled_visits_preferred_date ON public.scheduled_visits(preferred_date);
CREATE INDEX idx_service_zones_active ON public.service_zones(active);
CREATE INDEX idx_service_zones_display_order ON public.service_zones(display_order);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_contact_inquiries_updated_at
BEFORE UPDATE ON public.contact_inquiries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scheduled_visits_updated_at
BEFORE UPDATE ON public.scheduled_visits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_zones_updated_at
BEFORE UPDATE ON public.service_zones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();