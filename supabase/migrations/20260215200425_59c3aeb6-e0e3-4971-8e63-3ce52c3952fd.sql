
-- Table for content items (videos with descriptions and support files)
CREATE TABLE public.contents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  youtube_url TEXT NOT NULL,
  support_file_path TEXT,
  support_file_name TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read contents
CREATE POLICY "All authenticated can read contents"
ON public.contents FOR SELECT
TO authenticated
USING (true);

-- Only gestors can manage contents
CREATE POLICY "Gestors can insert contents"
ON public.contents FOR INSERT
WITH CHECK (has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Gestors can update contents"
ON public.contents FOR UPDATE
USING (has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Gestors can delete contents"
ON public.contents FOR DELETE
USING (has_role(auth.uid(), 'gestor'::app_role));

-- Table for tracking user completion
CREATE TABLE public.content_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(content_id, user_id)
);

ALTER TABLE public.content_completions ENABLE ROW LEVEL SECURITY;

-- Users can read their own completions
CREATE POLICY "Users can read own completions"
ON public.content_completions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own completions
CREATE POLICY "Users can insert own completions"
ON public.content_completions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own completions (unmark)
CREATE POLICY "Users can delete own completions"
ON public.content_completions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Trigger for updated_at on contents
CREATE TRIGGER update_contents_updated_at
BEFORE UPDATE ON public.contents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for support files
INSERT INTO storage.buckets (id, name, public) VALUES ('content-files', 'content-files', true);

CREATE POLICY "All authenticated can read content files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'content-files');

CREATE POLICY "Gestors can upload content files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'content-files' AND public.has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Gestors can delete content files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'content-files' AND public.has_role(auth.uid(), 'gestor'::app_role));
