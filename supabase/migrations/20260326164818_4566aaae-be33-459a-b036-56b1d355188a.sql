CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestors can do all on announcements"
  ON public.announcements FOR ALL
  TO public
  USING (has_role(auth.uid(), 'gestor'::app_role))
  WITH CHECK (has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "All authenticated can read announcements"
  ON public.announcements FOR SELECT
  TO authenticated
  USING (true);