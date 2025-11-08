-- Create jobs table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'done', 'error')),
  mood TEXT NOT NULL CHECK (mood IN ('cinematic', 'energetic', 'chill')),
  track TEXT,
  target_duration INTEGER NOT NULL DEFAULT 30,
  progress INTEGER DEFAULT 0,
  error_message TEXT,
  final_video_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create media_files table for uploaded files
CREATE TABLE public.media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
  score FLOAT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create job_logs table for processing logs
CREATE TABLE public.job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('info', 'warn', 'error')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for jobs
CREATE POLICY "Users can view their own jobs"
  ON public.jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs"
  ON public.jobs FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for media_files
CREATE POLICY "Users can view media files for their jobs"
  ON public.media_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = media_files.job_id
      AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert media files for their jobs"
  ON public.media_files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = media_files.job_id
      AND jobs.user_id = auth.uid()
    )
  );

-- RLS Policies for job_logs
CREATE POLICY "Users can view logs for their jobs"
  ON public.job_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = job_logs.job_id
      AND jobs.user_id = auth.uid()
    )
  );

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for jobs
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_media_files_job_id ON public.media_files(job_id);
CREATE INDEX idx_job_logs_job_id ON public.job_logs(job_id);