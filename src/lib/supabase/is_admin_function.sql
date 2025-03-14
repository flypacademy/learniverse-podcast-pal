
-- This SQL has already been implemented in a previous step,
-- included here for reference only

CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = $1 AND role = 'admin'
  );
END;
$$;
