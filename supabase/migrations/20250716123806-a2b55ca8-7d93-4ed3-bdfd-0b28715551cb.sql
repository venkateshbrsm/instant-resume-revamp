-- Add theme column to payments table to store selected color theme
ALTER TABLE public.payments 
ADD COLUMN theme_id TEXT DEFAULT 'navy';

-- Add comment to describe the column
COMMENT ON COLUMN public.payments.theme_id IS 'Selected color theme ID for the resume (navy, charcoal, burgundy, forest, bronze, slate)';