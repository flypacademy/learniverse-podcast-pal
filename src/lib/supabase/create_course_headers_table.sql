
-- Create a table for course headers
CREATE TABLE IF NOT EXISTS public.course_headers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  header_text TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_course_headers_course_id ON public.course_headers (course_id);

-- Add RLS policies
ALTER TABLE public.course_headers ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow read access to authenticated users"
ON public.course_headers
FOR SELECT
TO authenticated
USING (true);

-- Allow insert/update/delete access to admin users
CREATE POLICY "Allow insert/update/delete access to admin users"
ON public.course_headers
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid() AND role = 'admin'
  )
);
