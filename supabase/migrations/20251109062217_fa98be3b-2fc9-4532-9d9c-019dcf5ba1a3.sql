-- Fix infinite recursion in jobs RLS policies by using security definer functions

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view their own or shared jobs" ON public.jobs;
DROP POLICY IF EXISTS "Editors can update shared jobs" ON public.jobs;

-- Create security definer function to check if user can view job
CREATE OR REPLACE FUNCTION public.can_view_job(_user_id uuid, _job_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.jobs 
    WHERE id = _job_id 
    AND (
      user_id = _user_id 
      OR EXISTS (
        SELECT 1 FROM public.shared_jobs 
        WHERE job_id = _job_id 
        AND shared_with_user_id = _user_id
      )
    )
  )
$$;

-- Create security definer function to check if user can edit job
CREATE OR REPLACE FUNCTION public.can_edit_job(_user_id uuid, _job_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.jobs 
    WHERE id = _job_id 
    AND (
      user_id = _user_id 
      OR EXISTS (
        SELECT 1 FROM public.shared_jobs 
        WHERE job_id = _job_id 
        AND shared_with_user_id = _user_id 
        AND role IN ('owner', 'editor')
      )
    )
  )
$$;

-- Recreate the policies using the security definer functions
CREATE POLICY "Users can view their own or shared jobs"
ON public.jobs
FOR SELECT
USING (public.can_view_job(auth.uid(), id));

CREATE POLICY "Editors can update shared jobs"
ON public.jobs
FOR UPDATE
USING (public.can_edit_job(auth.uid(), id));