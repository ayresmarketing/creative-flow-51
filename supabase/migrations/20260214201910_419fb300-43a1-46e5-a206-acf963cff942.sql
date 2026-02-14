
-- Create roteiros table
CREATE TABLE public.roteiros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  is_recorded BOOLEAN NOT NULL DEFAULT false,
  video_creative_id UUID REFERENCES public.creatives(id) ON DELETE SET NULL,
  video_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.roteiros ENABLE ROW LEVEL SECURITY;

-- Gestors can do all
CREATE POLICY "Gestors can do all on roteiros"
ON public.roteiros
FOR ALL
USING (has_role(auth.uid(), 'gestor'::app_role));

-- Clients can read their own roteiros
CREATE POLICY "Clients can read own roteiros"
ON public.roteiros
FOR SELECT
USING (product_id IN (
  SELECT p.id FROM products p
  JOIN clients c ON c.id = p.client_id
  WHERE c.user_id = auth.uid()
));

-- Clients can insert roteiros for their products
CREATE POLICY "Clients can insert own roteiros"
ON public.roteiros
FOR INSERT
WITH CHECK (product_id IN (
  SELECT p.id FROM products p
  JOIN clients c ON c.id = p.client_id
  WHERE c.user_id = auth.uid()
));

-- Clients can update their own roteiros
CREATE POLICY "Clients can update own roteiros"
ON public.roteiros
FOR UPDATE
USING (product_id IN (
  SELECT p.id FROM products p
  JOIN clients c ON c.id = p.client_id
  WHERE c.user_id = auth.uid()
));

-- Clients can delete their own roteiros
CREATE POLICY "Clients can delete own roteiros"
ON public.roteiros
FOR DELETE
USING (product_id IN (
  SELECT p.id FROM products p
  JOIN clients c ON c.id = p.client_id
  WHERE c.user_id = auth.uid()
));

-- Trigger for updated_at
CREATE TRIGGER update_roteiros_updated_at
BEFORE UPDATE ON public.roteiros
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
