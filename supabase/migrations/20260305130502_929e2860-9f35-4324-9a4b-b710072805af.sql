-- Add support for storing multiple reference links on roteiros
ALTER TABLE public.roteiros
ADD COLUMN IF NOT EXISTS reference_links text[] NOT NULL DEFAULT '{}'::text[];

-- Track content access handoff per product/content
CREATE TABLE IF NOT EXISTS public.product_content_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  content_id uuid NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
  access_sent boolean NOT NULL DEFAULT false,
  sent_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT product_content_access_product_content_key UNIQUE (product_id, content_id)
);

ALTER TABLE public.product_content_access ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_product_content_access_product_id
  ON public.product_content_access(product_id);

CREATE INDEX IF NOT EXISTS idx_product_content_access_content_id
  ON public.product_content_access(content_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'product_content_access'
      AND policyname = 'Users can read product content access for own products'
  ) THEN
    CREATE POLICY "Users can read product content access for own products"
      ON public.product_content_access
      FOR SELECT
      USING (
        has_role(auth.uid(), 'gestor'::app_role)
        OR product_id IN (
          SELECT p.id
          FROM public.products p
          JOIN public.clients c ON c.id = p.client_id
          WHERE c.user_id = auth.uid()
        )
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'product_content_access'
      AND policyname = 'Gestors can insert product content access'
  ) THEN
    CREATE POLICY "Gestors can insert product content access"
      ON public.product_content_access
      FOR INSERT
      WITH CHECK (has_role(auth.uid(), 'gestor'::app_role));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'product_content_access'
      AND policyname = 'Gestors can update product content access'
  ) THEN
    CREATE POLICY "Gestors can update product content access"
      ON public.product_content_access
      FOR UPDATE
      USING (has_role(auth.uid(), 'gestor'::app_role))
      WITH CHECK (has_role(auth.uid(), 'gestor'::app_role));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'product_content_access'
      AND policyname = 'Gestors can delete product content access'
  ) THEN
    CREATE POLICY "Gestors can delete product content access"
      ON public.product_content_access
      FOR DELETE
      USING (has_role(auth.uid(), 'gestor'::app_role));
  END IF;
END
$$;

DROP TRIGGER IF EXISTS update_product_content_access_updated_at ON public.product_content_access;
CREATE TRIGGER update_product_content_access_updated_at
BEFORE UPDATE ON public.product_content_access
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();