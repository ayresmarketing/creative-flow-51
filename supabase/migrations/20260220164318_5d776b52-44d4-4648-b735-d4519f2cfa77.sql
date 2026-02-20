
-- Store Google Drive OAuth refresh token (single row, gestor-managed)
CREATE TABLE public.google_drive_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  access_token text,
  refresh_token text NOT NULL,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.google_drive_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestors can manage drive tokens"
  ON public.google_drive_tokens FOR ALL
  USING (has_role(auth.uid(), 'gestor'::app_role));

-- Store Drive folder IDs mapped to clients and products
CREATE TABLE public.google_drive_folders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  folder_id text NOT NULL,
  folder_name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(client_id, product_id)
);

ALTER TABLE public.google_drive_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestors can manage drive folders"
  ON public.google_drive_folders FOR ALL
  USING (has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Clients can read own drive folders"
  ON public.google_drive_folders FOR SELECT
  USING (client_id IN (SELECT clients.id FROM clients WHERE clients.user_id = auth.uid()));

CREATE TRIGGER update_google_drive_tokens_updated_at
  BEFORE UPDATE ON public.google_drive_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
