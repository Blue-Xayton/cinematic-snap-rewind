-- Fix function search path security issue by dropping trigger first
DROP TRIGGER IF EXISTS update_jobs_updated_at ON public.jobs;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;

-- Recreate function with proper search_path
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate trigger
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();