-- Add RLS policy for user_roles table
-- Only admins can view roles (but the security definer function bypasses RLS)
CREATE POLICY "Service role can manage user_roles"
ON public.user_roles
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');