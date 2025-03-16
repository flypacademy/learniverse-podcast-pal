
-- Create a storage bucket for podcast content
INSERT INTO storage.buckets (id, name, public)
VALUES ('podcast-content', 'Podcast Content', true);

-- RLS policies for the new bucket
-- Allow public read access
CREATE POLICY "Public Access" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'podcast-content');

-- Allow authenticated users to insert podcast files
CREATE POLICY "Authenticated users can upload podcast files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'podcast-content' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update and delete their own files
CREATE POLICY "Users can update their own podcast files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'podcast-content' 
  AND auth.uid() = owner
);

CREATE POLICY "Users can delete their own podcast files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'podcast-content' 
  AND auth.uid() = owner
);
