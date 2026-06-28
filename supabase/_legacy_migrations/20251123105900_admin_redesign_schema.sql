-- Create cms_pages table
CREATE TABLE IF NOT EXISTS public.cms_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    content JSONB DEFAULT '{}'::jsonb,
    is_published BOOLEAN DEFAULT false,
    last_agent_interaction TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(organization_id, slug)
);

-- Add RLS to cms_pages
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;

-- Policy: Admins and superadmins can manage cms_pages for their org
CREATE POLICY "Admins and superadmins can manage cms_pages"
    ON public.cms_pages
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.role_assignments ra
            WHERE ra.user_id = auth.uid()
            AND ra.organization_id = cms_pages.organization_id
            AND ra.role IN ('admin', 'superadmin')
        )
    );

-- Policy: Public can view published cms_pages
CREATE POLICY "Public can view published cms_pages"
    ON public.cms_pages
    FOR SELECT
    USING (is_published = true);

-- Update profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS professional_email TEXT,
ADD COLUMN IF NOT EXISTS email_preference TEXT CHECK (email_preference IN ('forward_to_personal', 'dedicated_inbox')),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;
