
-- Ad Campaigns
CREATE TABLE public.ad_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestors can do all on ad_campaigns" ON public.ad_campaigns FOR ALL USING (has_role(auth.uid(), 'gestor'::app_role)) WITH CHECK (has_role(auth.uid(), 'gestor'::app_role));
CREATE POLICY "Clients can read own ad_campaigns" ON public.ad_campaigns FOR SELECT USING (product_id IN (SELECT p.id FROM products p JOIN clients c ON c.id = p.client_id WHERE c.user_id = auth.uid()));
CREATE POLICY "Team members can read ad_campaigns" ON public.ad_campaigns FOR SELECT USING (product_id IN (SELECT p.id FROM products p JOIN client_team_members ctm ON ctm.client_id = p.client_id WHERE ctm.user_id = auth.uid()));

-- Keywords
CREATE TABLE public.ad_campaign_keywords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  approval_status TEXT NOT NULL DEFAULT 'pending',
  suggestion TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ad_campaign_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestors can do all on ad_campaign_keywords" ON public.ad_campaign_keywords FOR ALL USING (has_role(auth.uid(), 'gestor'::app_role)) WITH CHECK (has_role(auth.uid(), 'gestor'::app_role));
CREATE POLICY "Clients can read own keywords" ON public.ad_campaign_keywords FOR SELECT USING (campaign_id IN (SELECT ac.id FROM ad_campaigns ac JOIN products p ON p.id = ac.product_id JOIN clients c ON c.id = p.client_id WHERE c.user_id = auth.uid()));
CREATE POLICY "Clients can update own keywords" ON public.ad_campaign_keywords FOR UPDATE USING (campaign_id IN (SELECT ac.id FROM ad_campaigns ac JOIN products p ON p.id = ac.product_id JOIN clients c ON c.id = p.client_id WHERE c.user_id = auth.uid()));
CREATE POLICY "Team can read keywords" ON public.ad_campaign_keywords FOR SELECT USING (campaign_id IN (SELECT ac.id FROM ad_campaigns ac JOIN products p ON p.id = ac.product_id JOIN client_team_members ctm ON ctm.client_id = p.client_id WHERE ctm.user_id = auth.uid()));
CREATE POLICY "Team can update keywords" ON public.ad_campaign_keywords FOR UPDATE USING (campaign_id IN (SELECT ac.id FROM ad_campaigns ac JOIN products p ON p.id = ac.product_id JOIN client_team_members ctm ON ctm.client_id = p.client_id WHERE ctm.user_id = auth.uid()));

-- Titles
CREATE TABLE public.ad_campaign_titles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  approval_status TEXT NOT NULL DEFAULT 'pending',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ad_campaign_titles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestors can do all on ad_campaign_titles" ON public.ad_campaign_titles FOR ALL USING (has_role(auth.uid(), 'gestor'::app_role)) WITH CHECK (has_role(auth.uid(), 'gestor'::app_role));
CREATE POLICY "Clients can read own titles" ON public.ad_campaign_titles FOR SELECT USING (campaign_id IN (SELECT ac.id FROM ad_campaigns ac JOIN products p ON p.id = ac.product_id JOIN clients c ON c.id = p.client_id WHERE c.user_id = auth.uid()));
CREATE POLICY "Clients can update own titles" ON public.ad_campaign_titles FOR UPDATE USING (campaign_id IN (SELECT ac.id FROM ad_campaigns ac JOIN products p ON p.id = ac.product_id JOIN clients c ON c.id = p.client_id WHERE c.user_id = auth.uid()));
CREATE POLICY "Team can read titles" ON public.ad_campaign_titles FOR SELECT USING (campaign_id IN (SELECT ac.id FROM ad_campaigns ac JOIN products p ON p.id = ac.product_id JOIN client_team_members ctm ON ctm.client_id = p.client_id WHERE ctm.user_id = auth.uid()));
CREATE POLICY "Team can update titles" ON public.ad_campaign_titles FOR UPDATE USING (campaign_id IN (SELECT ac.id FROM ad_campaigns ac JOIN products p ON p.id = ac.product_id JOIN client_team_members ctm ON ctm.client_id = p.client_id WHERE ctm.user_id = auth.uid()));

-- Descriptions
CREATE TABLE public.ad_campaign_descriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  approval_status TEXT NOT NULL DEFAULT 'pending',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ad_campaign_descriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestors can do all on ad_campaign_descriptions" ON public.ad_campaign_descriptions FOR ALL USING (has_role(auth.uid(), 'gestor'::app_role)) WITH CHECK (has_role(auth.uid(), 'gestor'::app_role));
CREATE POLICY "Clients can read own descriptions" ON public.ad_campaign_descriptions FOR SELECT USING (campaign_id IN (SELECT ac.id FROM ad_campaigns ac JOIN products p ON p.id = ac.product_id JOIN clients c ON c.id = p.client_id WHERE c.user_id = auth.uid()));
CREATE POLICY "Clients can update own descriptions" ON public.ad_campaign_descriptions FOR UPDATE USING (campaign_id IN (SELECT ac.id FROM ad_campaigns ac JOIN products p ON p.id = ac.product_id JOIN clients c ON c.id = p.client_id WHERE c.user_id = auth.uid()));
CREATE POLICY "Team can read descriptions" ON public.ad_campaign_descriptions FOR SELECT USING (campaign_id IN (SELECT ac.id FROM ad_campaigns ac JOIN products p ON p.id = ac.product_id JOIN client_team_members ctm ON ctm.client_id = p.client_id WHERE ctm.user_id = auth.uid()));
CREATE POLICY "Team can update descriptions" ON public.ad_campaign_descriptions FOR UPDATE USING (campaign_id IN (SELECT ac.id FROM ad_campaigns ac JOIN products p ON p.id = ac.product_id JOIN client_team_members ctm ON ctm.client_id = p.client_id WHERE ctm.user_id = auth.uid()));

-- Sitelinks
CREATE TABLE public.ad_campaign_sitelinks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description1 TEXT NOT NULL,
  description2 TEXT NOT NULL,
  url TEXT NOT NULL,
  approval_status TEXT NOT NULL DEFAULT 'pending',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ad_campaign_sitelinks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestors can do all on ad_campaign_sitelinks" ON public.ad_campaign_sitelinks FOR ALL USING (has_role(auth.uid(), 'gestor'::app_role)) WITH CHECK (has_role(auth.uid(), 'gestor'::app_role));
CREATE POLICY "Clients can read own sitelinks" ON public.ad_campaign_sitelinks FOR SELECT USING (campaign_id IN (SELECT ac.id FROM ad_campaigns ac JOIN products p ON p.id = ac.product_id JOIN clients c ON c.id = p.client_id WHERE c.user_id = auth.uid()));
CREATE POLICY "Clients can update own sitelinks" ON public.ad_campaign_sitelinks FOR UPDATE USING (campaign_id IN (SELECT ac.id FROM ad_campaigns ac JOIN products p ON p.id = ac.product_id JOIN clients c ON c.id = p.client_id WHERE c.user_id = auth.uid()));
CREATE POLICY "Team can read sitelinks" ON public.ad_campaign_sitelinks FOR SELECT USING (campaign_id IN (SELECT ac.id FROM ad_campaigns ac JOIN products p ON p.id = ac.product_id JOIN client_team_members ctm ON ctm.client_id = p.client_id WHERE ctm.user_id = auth.uid()));
CREATE POLICY "Team can update sitelinks" ON public.ad_campaign_sitelinks FOR UPDATE USING (campaign_id IN (SELECT ac.id FROM ad_campaigns ac JOIN products p ON p.id = ac.product_id JOIN client_team_members ctm ON ctm.client_id = p.client_id WHERE ctm.user_id = auth.uid()));

-- Callouts
CREATE TABLE public.ad_campaign_callouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  approval_status TEXT NOT NULL DEFAULT 'pending',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ad_campaign_callouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestors can do all on ad_campaign_callouts" ON public.ad_campaign_callouts FOR ALL USING (has_role(auth.uid(), 'gestor'::app_role)) WITH CHECK (has_role(auth.uid(), 'gestor'::app_role));
CREATE POLICY "Clients can read own callouts" ON public.ad_campaign_callouts FOR SELECT USING (campaign_id IN (SELECT ac.id FROM ad_campaigns ac JOIN products p ON p.id = ac.product_id JOIN clients c ON c.id = p.client_id WHERE c.user_id = auth.uid()));
CREATE POLICY "Clients can update own callouts" ON public.ad_campaign_callouts FOR UPDATE USING (campaign_id IN (SELECT ac.id FROM ad_campaigns ac JOIN products p ON p.id = ac.product_id JOIN clients c ON c.id = p.client_id WHERE c.user_id = auth.uid()));
CREATE POLICY "Team can read callouts" ON public.ad_campaign_callouts FOR SELECT USING (campaign_id IN (SELECT ac.id FROM ad_campaigns ac JOIN products p ON p.id = ac.product_id JOIN client_team_members ctm ON ctm.client_id = p.client_id WHERE ctm.user_id = auth.uid()));
CREATE POLICY "Team can update callouts" ON public.ad_campaign_callouts FOR UPDATE USING (campaign_id IN (SELECT ac.id FROM ad_campaigns ac JOIN products p ON p.id = ac.product_id JOIN client_team_members ctm ON ctm.client_id = p.client_id WHERE ctm.user_id = auth.uid()));

-- Images
CREATE TABLE public.ad_campaign_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT,
  image_type TEXT NOT NULL DEFAULT 'campaign',
  approval_status TEXT NOT NULL DEFAULT 'pending',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ad_campaign_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestors can do all on ad_campaign_images" ON public.ad_campaign_images FOR ALL USING (has_role(auth.uid(), 'gestor'::app_role)) WITH CHECK (has_role(auth.uid(), 'gestor'::app_role));
CREATE POLICY "Clients can read own images" ON public.ad_campaign_images FOR SELECT USING (campaign_id IN (SELECT ac.id FROM ad_campaigns ac JOIN products p ON p.id = ac.product_id JOIN clients c ON c.id = p.client_id WHERE c.user_id = auth.uid()));
CREATE POLICY "Clients can update own images" ON public.ad_campaign_images FOR UPDATE USING (campaign_id IN (SELECT ac.id FROM ad_campaigns ac JOIN products p ON p.id = ac.product_id JOIN clients c ON c.id = p.client_id WHERE c.user_id = auth.uid()));
CREATE POLICY "Team can read images" ON public.ad_campaign_images FOR SELECT USING (campaign_id IN (SELECT ac.id FROM ad_campaigns ac JOIN products p ON p.id = ac.product_id JOIN client_team_members ctm ON ctm.client_id = p.client_id WHERE ctm.user_id = auth.uid()));
CREATE POLICY "Team can update images" ON public.ad_campaign_images FOR UPDATE USING (campaign_id IN (SELECT ac.id FROM ad_campaigns ac JOIN products p ON p.id = ac.product_id JOIN client_team_members ctm ON ctm.client_id = p.client_id WHERE ctm.user_id = auth.uid()));

-- Revisions (timeline for all item types)
CREATE TABLE public.ad_campaign_revisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  action TEXT NOT NULL,
  actor_id UUID NOT NULL,
  actor_name TEXT,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ad_campaign_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestors can do all on ad_campaign_revisions" ON public.ad_campaign_revisions FOR ALL USING (has_role(auth.uid(), 'gestor'::app_role)) WITH CHECK (has_role(auth.uid(), 'gestor'::app_role));
CREATE POLICY "Clients can read own revisions" ON public.ad_campaign_revisions FOR SELECT USING (campaign_id IN (SELECT ac.id FROM ad_campaigns ac JOIN products p ON p.id = ac.product_id JOIN clients c ON c.id = p.client_id WHERE c.user_id = auth.uid()));
CREATE POLICY "Clients can insert revisions" ON public.ad_campaign_revisions FOR INSERT WITH CHECK (campaign_id IN (SELECT ac.id FROM ad_campaigns ac JOIN products p ON p.id = ac.product_id JOIN clients c ON c.id = p.client_id WHERE c.user_id = auth.uid()));
CREATE POLICY "Team can read revisions" ON public.ad_campaign_revisions FOR SELECT USING (campaign_id IN (SELECT ac.id FROM ad_campaigns ac JOIN products p ON p.id = ac.product_id JOIN client_team_members ctm ON ctm.client_id = p.client_id WHERE ctm.user_id = auth.uid()));
CREATE POLICY "Team can insert revisions" ON public.ad_campaign_revisions FOR INSERT WITH CHECK (campaign_id IN (SELECT ac.id FROM ad_campaigns ac JOIN products p ON p.id = ac.product_id JOIN client_team_members ctm ON ctm.client_id = p.client_id WHERE ctm.user_id = auth.uid()));

-- Storage bucket for ad campaign images
INSERT INTO storage.buckets (id, name, public) VALUES ('ad-campaign-images', 'ad-campaign-images', false) ON CONFLICT DO NOTHING;

CREATE POLICY "Gestors can do all on ad-campaign-images" ON storage.objects FOR ALL USING (bucket_id = 'ad-campaign-images' AND has_role(auth.uid(), 'gestor'::app_role));
CREATE POLICY "Clients can read own ad-campaign-images" ON storage.objects FOR SELECT USING (bucket_id = 'ad-campaign-images');
CREATE POLICY "Clients can upload ad-campaign-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ad-campaign-images' AND auth.uid() IS NOT NULL);

-- Trigger for updated_at on ad_campaigns
CREATE TRIGGER update_ad_campaigns_updated_at BEFORE UPDATE ON public.ad_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
