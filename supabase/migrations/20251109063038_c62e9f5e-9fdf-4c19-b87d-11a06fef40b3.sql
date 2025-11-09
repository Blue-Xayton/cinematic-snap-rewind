-- Fix profiles table RLS policy to restrict public access
-- Drop the overly permissive policy that allows unauthenticated access
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create restricted policy requiring authentication
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
USING (auth.role() = 'authenticated');