ALTER TABLE public.client_team_members
ADD COLUMN IF NOT EXISTS member_name text,
ADD COLUMN IF NOT EXISTS avatar_url text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'client_team_members'
      AND policyname = 'Team members can read own membership'
  ) THEN
    CREATE POLICY "Team members can read own membership"
    ON public.client_team_members
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'client_team_members'
      AND policyname = 'Clients can delete own team members'
  ) THEN
    CREATE POLICY "Clients can delete own team members"
    ON public.client_team_members
    FOR DELETE
    USING (public.user_owns_client(auth.uid(), client_id));
  END IF;
END $$;