
-- Add approval workflow columns to creatives
ALTER TABLE public.creatives 
ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'none',
ADD COLUMN IF NOT EXISTS uploaded_by uuid,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Create creative_revisions table for timeline
CREATE TABLE public.creative_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creative_id uuid NOT NULL REFERENCES public.creatives(id) ON DELETE CASCADE,
  action text NOT NULL, -- 'uploaded', 'approved', 'rejected', 'resubmitted'
  actor_id uuid NOT NULL,
  actor_name text,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.creative_revisions ENABLE ROW LEVEL SECURITY;

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS for creative_revisions
CREATE POLICY "Gestors can do all on creative_revisions"
ON public.creative_revisions FOR ALL
USING (has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Authenticated can read revisions for own creatives"
ON public.creative_revisions FOR SELECT
USING (
  creative_id IN (
    SELECT cr.id FROM creatives cr
    JOIN products p ON p.id = cr.product_id
    JOIN clients c ON c.id = p.client_id
    WHERE c.user_id = auth.uid()
  )
  OR
  creative_id IN (
    SELECT cr.id FROM creatives cr
    JOIN products p ON p.id = cr.product_id
    JOIN clients c ON c.id = p.client_id
    JOIN client_team_members ctm ON ctm.client_id = c.id
    WHERE ctm.user_id = auth.uid()
  )
);

CREATE POLICY "Team members can insert revisions"
ON public.creative_revisions FOR INSERT
WITH CHECK (actor_id = auth.uid());

-- RLS for notifications
CREATE POLICY "Users can read own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Update RLS for client_team_members: allow clients to insert team members
CREATE POLICY "Clients can insert own team members"
ON public.client_team_members FOR INSERT
WITH CHECK (
  client_id IN (
    SELECT id FROM clients WHERE user_id = auth.uid()
  )
);

-- Team members need to read the client they belong to
CREATE POLICY "Team members can read own client"
ON public.clients FOR SELECT
USING (
  id IN (
    SELECT client_id FROM client_team_members WHERE user_id = auth.uid()
  )
);

-- Team members need to read products of their client
CREATE POLICY "Team members can read client products"
ON public.products FOR SELECT
USING (
  client_id IN (
    SELECT client_id FROM client_team_members WHERE user_id = auth.uid()
  )
);

-- Team members can insert creatives for client products
CREATE POLICY "Team members can insert creatives"
ON public.creatives FOR INSERT
WITH CHECK (
  product_id IN (
    SELECT p.id FROM products p
    JOIN client_team_members ctm ON ctm.client_id = p.client_id
    WHERE ctm.user_id = auth.uid()
  )
);

-- Team members can read creatives of their client
CREATE POLICY "Team members can read client creatives"
ON public.creatives FOR SELECT
USING (
  product_id IN (
    SELECT p.id FROM products p
    JOIN client_team_members ctm ON ctm.client_id = p.client_id
    WHERE ctm.user_id = auth.uid()
  )
);

-- Team members can update their own uploaded creatives (resubmit)
CREATE POLICY "Team members can update own creatives"
ON public.creatives FOR UPDATE
USING (uploaded_by = auth.uid());

-- Team members can insert creative_files for their creatives
CREATE POLICY "Team members can insert creative_files"
ON public.creative_files FOR INSERT
WITH CHECK (
  creative_id IN (
    SELECT cr.id FROM creatives cr
    JOIN products p ON p.id = cr.product_id
    JOIN client_team_members ctm ON ctm.client_id = p.client_id
    WHERE ctm.user_id = auth.uid()
  )
);

-- Team members can read creative_files of their client
CREATE POLICY "Team members can read client creative_files"
ON public.creative_files FOR SELECT
USING (
  creative_id IN (
    SELECT cr.id FROM creatives cr
    JOIN products p ON p.id = cr.product_id
    JOIN client_team_members ctm ON ctm.client_id = p.client_id
    WHERE ctm.user_id = auth.uid()
  )
);

-- Clients can update their own creatives (for approval/rejection)
CREATE POLICY "Clients can update own creatives"
ON public.creatives FOR UPDATE
USING (
  product_id IN (
    SELECT p.id FROM products p
    JOIN clients c ON c.id = p.client_id
    WHERE c.user_id = auth.uid()
  )
);

-- Team members can read/insert roteiros
CREATE POLICY "Team members can read client roteiros"
ON public.roteiros FOR SELECT
USING (
  product_id IN (
    SELECT p.id FROM products p
    JOIN client_team_members ctm ON ctm.client_id = p.client_id
    WHERE ctm.user_id = auth.uid()
  )
);

CREATE POLICY "Team members can insert roteiros"
ON public.roteiros FOR INSERT
WITH CHECK (
  product_id IN (
    SELECT p.id FROM products p
    JOIN client_team_members ctm ON ctm.client_id = p.client_id
    WHERE ctm.user_id = auth.uid()
  )
);

CREATE POLICY "Team members can update client roteiros"
ON public.roteiros FOR UPDATE
USING (
  product_id IN (
    SELECT p.id FROM products p
    JOIN client_team_members ctm ON ctm.client_id = p.client_id
    WHERE ctm.user_id = auth.uid()
  )
);

-- Team members can read briefings
CREATE POLICY "Team members can read client briefings"
ON public.product_briefings FOR SELECT
USING (
  product_id IN (
    SELECT p.id FROM products p
    JOIN client_team_members ctm ON ctm.client_id = p.client_id
    WHERE ctm.user_id = auth.uid()
  )
);
