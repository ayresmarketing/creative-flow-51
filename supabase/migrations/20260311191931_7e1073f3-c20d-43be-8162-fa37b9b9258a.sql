CREATE TABLE public.client_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  email text NOT NULL,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(client_id, email)
);

ALTER TABLE public.client_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestors can manage team members" ON public.client_team_members
  FOR ALL TO public
  USING (has_role(auth.uid(), 'gestor'::app_role))
  WITH CHECK (has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Clients can read own team members" ON public.client_team_members
  FOR SELECT TO public
  USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));