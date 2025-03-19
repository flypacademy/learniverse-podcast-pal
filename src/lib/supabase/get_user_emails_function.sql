
-- This function safely returns user emails for authorized users
CREATE OR REPLACE FUNCTION get_user_emails()
RETURNS TABLE (id uuid, email text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin first
  IF (SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid() AND role = 'admin'
  )) THEN
    RETURN QUERY SELECT au.id, au.email::text 
    FROM auth.users au;
  ELSE
    -- If not admin, only return current user's email
    RETURN QUERY SELECT auth.uid() as id, 
                       (SELECT email FROM auth.users WHERE id = auth.uid())::text as email;
  END IF;
END;
$$;

-- This function gets emails for specific user IDs for authorized users
CREATE OR REPLACE FUNCTION get_user_emails_for_ids(user_ids uuid[])
RETURNS TABLE (id uuid, email text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin first
  IF (SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid() AND role = 'admin'
  )) THEN
    RETURN QUERY SELECT au.id, au.email::text 
    FROM auth.users au
    WHERE au.id = ANY(user_ids);
  ELSE
    -- If not admin, only return current user's email
    RETURN QUERY SELECT auth.uid() as id, 
                       (SELECT email FROM auth.users WHERE id = auth.uid())::text as email
                 WHERE auth.uid() = ANY(user_ids);
  END IF;
END;
$$;
