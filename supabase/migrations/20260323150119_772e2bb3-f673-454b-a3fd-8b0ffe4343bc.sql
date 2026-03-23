CREATE OR REPLACE FUNCTION public.user_owns_client(_user_id uuid, _client_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.clients c
    WHERE c.id = _client_id
      AND c.user_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.user_has_client_access(_user_id uuid, _client_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.user_owns_client(_user_id, _client_id)
    OR EXISTS (
      SELECT 1
      FROM public.client_team_members ctm
      WHERE ctm.client_id = _client_id
        AND ctm.user_id = _user_id
    )
$$;

DROP POLICY IF EXISTS "Clients can read own" ON public.clients;
DROP POLICY IF EXISTS "Team members can read own client" ON public.clients;
CREATE POLICY "Users can read accessible clients"
ON public.clients
FOR SELECT
TO public
USING (public.user_has_client_access(auth.uid(), id));

DROP POLICY IF EXISTS "Clients can read own team members" ON public.client_team_members;
DROP POLICY IF EXISTS "Clients can insert own team members" ON public.client_team_members;
CREATE POLICY "Clients can read own team members"
ON public.client_team_members
FOR SELECT
TO public
USING (public.user_owns_client(auth.uid(), client_id));

CREATE POLICY "Clients can insert own team members"
ON public.client_team_members
FOR INSERT
TO public
WITH CHECK (public.user_owns_client(auth.uid(), client_id));