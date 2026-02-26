-- Add is_suspended column to clients table
ALTER TABLE public.clients ADD COLUMN is_suspended boolean NOT NULL DEFAULT false;