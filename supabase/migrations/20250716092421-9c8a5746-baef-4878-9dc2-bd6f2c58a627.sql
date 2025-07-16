-- Create storage bucket for resume files
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);

-- Create policies for resume file uploads
CREATE POLICY "Users can upload their own resume files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own resume files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Service can access all resume files"
ON storage.objects
FOR ALL
USING (bucket_id = 'resumes');

-- Add file_path column to payments table to store the file location
ALTER TABLE public.payments 
ADD COLUMN file_path TEXT;