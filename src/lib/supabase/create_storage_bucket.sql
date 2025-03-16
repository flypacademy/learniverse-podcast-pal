
-- Create a storage bucket for course content
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-content', 'Course Content', true)
ON CONFLICT (id) DO NOTHING;

-- Set up public access policy
INSERT INTO storage.policies (name, bucket_id, definition)
VALUES ('Public Access', 'course-content', '{"version": "1.0", "statement": [{"effect": "allow", "principal": "*", "action": ["select"], "resource": ["${resource}"]}]}')
ON CONFLICT (name, bucket_id) DO NOTHING;
