-- Add column to store enhanced file path
ALTER TABLE public.payments 
ADD COLUMN enhanced_file_path TEXT;