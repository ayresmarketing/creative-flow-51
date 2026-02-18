-- Add logo_url column to clients table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'logo_url') THEN
    ALTER TABLE public.clients ADD COLUMN logo_url TEXT;
  END IF;
END $$;
