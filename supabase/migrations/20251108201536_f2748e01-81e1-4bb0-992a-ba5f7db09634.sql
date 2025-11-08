-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload their own media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own media"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Media files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');