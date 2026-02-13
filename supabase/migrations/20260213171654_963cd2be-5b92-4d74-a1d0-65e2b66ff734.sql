
-- Create storage bucket for creative files
INSERT INTO storage.buckets (id, name, public) VALUES ('creatives', 'creatives', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to creatives bucket
CREATE POLICY "Authenticated users can upload creative files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'creatives' AND auth.role() = 'authenticated');

-- Allow anyone to read creative files (public bucket)
CREATE POLICY "Public read access for creative files"
ON storage.objects FOR SELECT
USING (bucket_id = 'creatives');

-- Allow authenticated users to delete their own creative files
CREATE POLICY "Authenticated users can delete creative files"
ON storage.objects FOR DELETE
USING (bucket_id = 'creatives' AND auth.role() = 'authenticated');
