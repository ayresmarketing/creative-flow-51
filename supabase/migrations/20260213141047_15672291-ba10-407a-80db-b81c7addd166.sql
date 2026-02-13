
-- Role enum
CREATE TYPE public.app_role AS ENUM ('gestor', 'cliente');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Clients table (companies)
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  acronym TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Creatives table
CREATE TABLE public.creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL,
  objective TEXT NOT NULL,
  formats TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'PENDING',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.creatives ENABLE ROW LEVEL SECURITY;

-- Creative files (for carousel ordering and file references)
CREATE TABLE public.creative_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creative_id UUID REFERENCES public.creatives(id) ON DELETE CASCADE NOT NULL,
  file_path TEXT NOT NULL,
  format TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  file_name TEXT,
  file_size BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.creative_files ENABLE ROW LEVEL SECURITY;

-- Storage bucket for creative files
INSERT INTO storage.buckets (id, name, public) VALUES ('creatives', 'creatives', false);

-- ========== RLS POLICIES ==========

-- Profiles
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Gestors can read all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Gestors can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'gestor'));

-- User roles
CREATE POLICY "Gestors can read all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Gestors can insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'gestor'));

-- Clients
CREATE POLICY "Gestors can do all on clients" ON public.clients
  FOR ALL USING (public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Clients can read own" ON public.clients
  FOR SELECT USING (auth.uid() = user_id);

-- Products
CREATE POLICY "Gestors can do all on products" ON public.products
  FOR ALL USING (public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Clients can read own products" ON public.products
  FOR SELECT USING (
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
  );
CREATE POLICY "Clients can insert own products" ON public.products
  FOR INSERT WITH CHECK (
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
  );

-- Creatives
CREATE POLICY "Gestors can do all on creatives" ON public.creatives
  FOR ALL USING (public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Clients can read own creatives" ON public.creatives
  FOR SELECT USING (
    product_id IN (
      SELECT p.id FROM public.products p
      JOIN public.clients c ON c.id = p.client_id
      WHERE c.user_id = auth.uid()
    )
  );
CREATE POLICY "Clients can insert own creatives" ON public.creatives
  FOR INSERT WITH CHECK (
    product_id IN (
      SELECT p.id FROM public.products p
      JOIN public.clients c ON c.id = p.client_id
      WHERE c.user_id = auth.uid()
    )
  );

-- Creative files
CREATE POLICY "Gestors can do all on creative_files" ON public.creative_files
  FOR ALL USING (public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Clients can read own creative_files" ON public.creative_files
  FOR SELECT USING (
    creative_id IN (
      SELECT cr.id FROM public.creatives cr
      JOIN public.products p ON p.id = cr.product_id
      JOIN public.clients c ON c.id = p.client_id
      WHERE c.user_id = auth.uid()
    )
  );
CREATE POLICY "Clients can insert own creative_files" ON public.creative_files
  FOR INSERT WITH CHECK (
    creative_id IN (
      SELECT cr.id FROM public.creatives cr
      JOIN public.products p ON p.id = cr.product_id
      JOIN public.clients c ON c.id = p.client_id
      WHERE c.user_id = auth.uid()
    )
  );

-- Storage policies
CREATE POLICY "Authenticated can upload creatives" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'creatives' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated can read creatives" ON storage.objects
  FOR SELECT USING (bucket_id = 'creatives' AND auth.role() = 'authenticated');

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Acronym validation trigger (min 3 chars)
CREATE OR REPLACE FUNCTION public.validate_product_acronym()
RETURNS TRIGGER AS $$
BEGIN
  IF length(NEW.acronym) < 3 THEN
    RAISE EXCEPTION 'Acronym must have at least 3 characters';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_product_acronym_trigger
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_product_acronym();
