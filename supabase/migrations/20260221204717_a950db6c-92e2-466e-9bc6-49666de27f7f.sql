
-- Create enums
CREATE TYPE public.app_status AS ENUM ('new', 'in_progress', 'completed', 'rejected');
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- User roles table (first, so has_role can reference it)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- RLS for user_roles
CREATE POLICY "Admins can view roles" ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  child_age TEXT,
  problem TEXT NOT NULL,
  preferred_time TEXT,
  comment TEXT,
  admin_comment TEXT,
  status app_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit application" ON public.applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view applications" ON public.applications FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update applications" ON public.applications FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Hero images table
CREATE TABLE public.hero_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hero_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view hero images" ON public.hero_images FOR SELECT USING (true);
CREATE POLICY "Admins can insert hero images" ON public.hero_images FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete hero images" ON public.hero_images FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Work schedule table
CREATE TABLE public.work_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INT NOT NULL UNIQUE,
  start_time TEXT NOT NULL DEFAULT '09:00',
  end_time TEXT NOT NULL DEFAULT '18:00',
  is_working_day BOOLEAN NOT NULL DEFAULT true,
  slot_duration_minutes INT NOT NULL DEFAULT 45,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.work_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view schedule" ON public.work_schedule FOR SELECT USING (true);
CREATE POLICY "Admins can update schedule" ON public.work_schedule FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.work_schedule (day_of_week, is_working_day, start_time, end_time) VALUES
  (0, false, '09:00', '18:00'), (1, true, '09:00', '18:00'), (2, true, '09:00', '18:00'),
  (3, true, '09:00', '18:00'), (4, true, '09:00', '18:00'), (5, true, '09:00', '18:00'),
  (6, false, '09:00', '18:00');

-- Notification settings table
CREATE TABLE public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  config JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage notifications" ON public.notification_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_work_schedule_updated_at BEFORE UPDATE ON public.work_schedule FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON public.notification_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for site images
INSERT INTO storage.buckets (id, name, public) VALUES ('site-images', 'site-images', true);
CREATE POLICY "Anyone can view site images" ON storage.objects FOR SELECT USING (bucket_id = 'site-images');
CREATE POLICY "Authenticated can upload site images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-images');
CREATE POLICY "Authenticated can delete site images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'site-images');
