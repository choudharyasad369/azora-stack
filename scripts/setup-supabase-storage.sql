-- Create the projects bucket for storing ZIP files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'projects',
  'projects',
  false, -- Private bucket (requires authentication)
  209715200, -- 200MB limit
  ARRAY['application/zip', 'application/x-zip-compressed']
)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the projects bucket

-- Policy: Users can upload their own project files
CREATE POLICY "Users can upload their own projects"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'projects' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own project files
CREATE POLICY "Users can read their own projects"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'projects' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own project files
CREATE POLICY "Users can update their own projects"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'projects' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own project files
CREATE POLICY "Users can delete their own projects"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'projects' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Service role can do everything (for admin operations)
CREATE POLICY "Service role has full access"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'projects');
