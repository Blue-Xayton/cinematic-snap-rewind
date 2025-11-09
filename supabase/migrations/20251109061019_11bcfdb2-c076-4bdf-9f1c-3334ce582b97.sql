-- Create app_role enum for collaboration
CREATE TYPE public.app_role AS ENUM ('owner', 'editor', 'viewer');

-- Create video_templates table
CREATE TABLE public.video_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  mood TEXT NOT NULL,
  track TEXT NOT NULL,
  target_duration INTEGER NOT NULL DEFAULT 30,
  default_transitions JSONB NOT NULL DEFAULT '["fade", "slide", "zoom"]'::jsonb,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on templates
ALTER TABLE public.video_templates ENABLE ROW LEVEL SECURITY;

-- Templates are viewable by everyone
CREATE POLICY "Anyone can view templates"
ON public.video_templates
FOR SELECT
USING (true);

-- Create user_tutorial_progress table
CREATE TABLE public.user_tutorial_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on tutorial progress
ALTER TABLE public.user_tutorial_progress ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own tutorial progress
CREATE POLICY "Users can view own tutorial progress"
ON public.user_tutorial_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tutorial progress"
ON public.user_tutorial_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tutorial progress"
ON public.user_tutorial_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Create user_roles table for collaboration
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create shared_jobs table for collaboration
CREATE TABLE public.shared_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  shared_with_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  UNIQUE (job_id, shared_with_user_id)
);

-- Enable RLS on shared_jobs
ALTER TABLE public.shared_jobs ENABLE ROW LEVEL SECURITY;

-- Job owner can manage shares
CREATE POLICY "Job owners can manage shares"
ON public.shared_jobs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.jobs
    WHERE jobs.id = shared_jobs.job_id
    AND jobs.user_id = auth.uid()
  )
);

-- Shared users can view their shares
CREATE POLICY "Users can view shares with them"
ON public.shared_jobs
FOR SELECT
USING (shared_with_user_id = auth.uid());

-- Update jobs table policies to include shared access
DROP POLICY IF EXISTS "Users can view their own jobs" ON public.jobs;

CREATE POLICY "Users can view their own or shared jobs"
ON public.jobs
FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.shared_jobs
    WHERE shared_jobs.job_id = jobs.id
    AND shared_jobs.shared_with_user_id = auth.uid()
  )
);

-- Editors can update shared jobs
CREATE POLICY "Editors can update shared jobs"
ON public.jobs
FOR UPDATE
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.shared_jobs
    WHERE shared_jobs.job_id = jobs.id
    AND shared_jobs.shared_with_user_id = auth.uid()
    AND shared_jobs.role IN ('owner', 'editor')
  )
);

-- Insert default templates
INSERT INTO public.video_templates (name, description, mood, track, target_duration, default_transitions, thumbnail_url, is_premium) VALUES
('Cinematic Journey', 'Epic and dramatic video with smooth transitions', 'cinematic', 'track1', 30, '["fade", "zoom", "fade"]', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400', false),
('Upbeat Memories', 'Fun and energetic video perfect for celebrations', 'upbeat', 'track2', 30, '["slide", "zoom", "slide"]', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400', false),
('Chill Vibes', 'Relaxed and smooth flow for peaceful moments', 'chill', 'track3', 45, '["fade", "fade", "fade"]', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', false),
('Adventure Reel', 'Fast-paced excitement for outdoor adventures', 'epic', 'track1', 30, '["zoom", "slide", "zoom"]', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400', false),
('Romantic Story', 'Gentle and emotional journey for special moments', 'romantic', 'track4', 60, '["fade", "zoom", "fade"]', 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=400', true);

-- Add triggers for updated_at
CREATE TRIGGER update_video_templates_updated_at
BEFORE UPDATE ON public.video_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_user_tutorial_progress_updated_at
BEFORE UPDATE ON public.user_tutorial_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();