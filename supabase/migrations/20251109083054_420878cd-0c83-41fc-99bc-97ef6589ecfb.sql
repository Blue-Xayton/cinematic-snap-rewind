-- Enable RLS on media_files table
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their job media files" ON public.media_files;

-- Allow users to manage media files for their own jobs
CREATE POLICY "Users can manage their job media files"
ON public.media_files
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.jobs
    WHERE jobs.id = media_files.job_id
    AND jobs.user_id = auth.uid()
  )
);

-- Enable RLS on job_logs table
ALTER TABLE public.job_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their job logs" ON public.job_logs;
DROP POLICY IF EXISTS "System can insert job logs" ON public.job_logs;

-- Allow users to view logs for their own jobs
CREATE POLICY "Users can view their job logs"
ON public.job_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.jobs
    WHERE jobs.id = job_logs.job_id
    AND jobs.user_id = auth.uid()
  )
);

-- Allow system (service role) to insert job logs
CREATE POLICY "System can insert job logs"
ON public.job_logs
FOR INSERT
WITH CHECK (true);