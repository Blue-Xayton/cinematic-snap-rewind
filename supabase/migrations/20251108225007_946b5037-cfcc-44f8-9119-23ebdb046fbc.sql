-- Add name column to jobs table for custom job naming
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '';

-- Add comment for documentation
COMMENT ON COLUMN public.jobs.name IS 'User-defined name for the reel job';