
CREATE TABLE public.product_briefings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  responses jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(product_id)
);

ALTER TABLE public.product_briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestors can do all on product_briefings"
  ON public.product_briefings FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'gestor'::app_role))
  WITH CHECK (has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Clients can read own briefings"
  ON public.product_briefings FOR SELECT
  TO authenticated
  USING (product_id IN (
    SELECT p.id FROM products p
    JOIN clients c ON c.id = p.client_id
    WHERE c.user_id = auth.uid()
  ));

CREATE POLICY "Clients can insert own briefings"
  ON public.product_briefings FOR INSERT
  TO authenticated
  WITH CHECK (product_id IN (
    SELECT p.id FROM products p
    JOIN clients c ON c.id = p.client_id
    WHERE c.user_id = auth.uid()
  ));
