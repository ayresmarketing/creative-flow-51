
CREATE TABLE public.gestor_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL DEFAULT '',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.gestor_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestors can do all on gestor_settings"
ON public.gestor_settings FOR ALL
TO public
USING (has_role(auth.uid(), 'gestor'::app_role))
WITH CHECK (has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "All authenticated can read gestor_settings"
ON public.gestor_settings FOR SELECT
TO authenticated
USING (true);

INSERT INTO public.gestor_settings (key, value) VALUES ('simulator_url', ''), ('clickup_url', '');
