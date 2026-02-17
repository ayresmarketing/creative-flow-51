
-- Drop overly permissive storage policies
DROP POLICY IF EXISTS "Authenticated can upload creatives" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can read creatives" ON storage.objects;

-- Gestors can read all creatives
CREATE POLICY "Gestors can read creatives" ON storage.objects
FOR SELECT USING (
  bucket_id = 'creatives' AND
  has_role(auth.uid(), 'gestor'::app_role)
);

-- Clients can read only their own creatives (via product_id in path)
CREATE POLICY "Clients can read own creatives" ON storage.objects
FOR SELECT USING (
  bucket_id = 'creatives' AND
  (storage.foldername(name))[1] IN (
    SELECT p.id::text FROM products p
    JOIN clients c ON c.id = p.client_id
    WHERE c.user_id = auth.uid()
  )
);

-- Gestors can upload creatives
CREATE POLICY "Gestors can upload creatives" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'creatives' AND
  has_role(auth.uid(), 'gestor'::app_role)
);

-- Clients can upload only to their own product folders
CREATE POLICY "Clients can upload own creatives" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'creatives' AND
  (storage.foldername(name))[1] IN (
    SELECT p.id::text FROM products p
    JOIN clients c ON c.id = p.client_id
    WHERE c.user_id = auth.uid()
  )
);

-- Gestors can delete creatives
CREATE POLICY "Gestors can delete creatives" ON storage.objects
FOR DELETE USING (
  bucket_id = 'creatives' AND
  has_role(auth.uid(), 'gestor'::app_role)
);

-- Clients can delete only their own creatives
CREATE POLICY "Clients can delete own creatives" ON storage.objects
FOR DELETE USING (
  bucket_id = 'creatives' AND
  (storage.foldername(name))[1] IN (
    SELECT p.id::text FROM products p
    JOIN clients c ON c.id = p.client_id
    WHERE c.user_id = auth.uid()
  )
);
