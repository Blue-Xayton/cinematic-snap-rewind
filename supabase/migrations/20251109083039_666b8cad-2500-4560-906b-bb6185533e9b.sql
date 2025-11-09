-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can view their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can update their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can delete their own jobs" ON public.jobs;

-- Enable RLS on jobs table
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own jobs
CREATE POLICY "Users can insert their own jobs"
ON public.jobs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own jobs
CREATE POLICY "Users can view their own jobs"
ON public.jobs
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to update their own jobs
CREATE POLICY "Users can update their own jobs"
ON public.jobs
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow users to delete their own jobs
CREATE POLICY "Users can delete their own jobs"
ON public.jobs
FOR DELETE
USING (auth.uid() = user_id);