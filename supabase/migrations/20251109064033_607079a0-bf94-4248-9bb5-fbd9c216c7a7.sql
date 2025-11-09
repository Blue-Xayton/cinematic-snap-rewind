-- Make media bucket private and add RLS policies for secure file access

-- Update bucket to private
UPDATE storage.buckets
SET public = false
WHERE id = 'media';

-- Add RLS policy for users to view only their own media
CREATE POLICY "Users can only access their own media"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'media' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Add RLS policy for users to upload only to their own folder
CREATE POLICY "Users can only upload to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Add RLS policy for users to update only their own media
CREATE POLICY "Users can only update their own media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Add RLS policy for users to delete only their own media
CREATE POLICY "Users can only delete their own media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);