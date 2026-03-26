DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'client_team_members'
      AND policyname = 'Clients can update own team members'
  ) THEN
    CREATE POLICY "Clients can update own team members"
    ON public.client_team_members
    FOR UPDATE
    USING (public.user_owns_client(auth.uid(), client_id))
    WITH CHECK (public.user_owns_client(auth.uid(), client_id));
  END IF;
END $$;