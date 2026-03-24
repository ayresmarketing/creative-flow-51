
ALTER TABLE public.client_team_members ADD COLUMN IF NOT EXISTS team_role text NOT NULL DEFAULT 'admin';
