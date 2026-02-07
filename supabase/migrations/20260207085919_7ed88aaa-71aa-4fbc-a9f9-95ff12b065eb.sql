-- Create contact_settings table for company information
CREATE TABLE public.contact_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL DEFAULT '',
  email text,
  phone text,
  address text,
  working_hours text,
  google_maps_url text,
  facebook_url text,
  instagram_url text,
  twitter_url text,
  linkedin_url text,
  additional_info text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view active contact settings
CREATE POLICY "Anyone can view active contact settings"
  ON public.contact_settings
  FOR SELECT
  USING (is_active = true);

-- Admins can manage contact settings
CREATE POLICY "Admins can manage contact settings"
  ON public.contact_settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_contact_settings_updated_at
  BEFORE UPDATE ON public.contact_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();