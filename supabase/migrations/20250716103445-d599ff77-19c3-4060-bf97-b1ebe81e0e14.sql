-- Add column to store enhanced resume content
ALTER TABLE public.payments 
ADD COLUMN enhanced_content JSONB;