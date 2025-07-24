-- Fix RLS policies for payments table to address security vulnerabilities

-- First, make user_id NOT NULL since it's required for proper RLS
ALTER TABLE public.payments ALTER COLUMN user_id SET NOT NULL;

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create their own payments" ON public.payments;
DROP POLICY IF EXISTS "Service can update payments" ON public.payments;

-- Create more secure RLS policies
CREATE POLICY "Users can view their own payments" 
ON public.payments 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments" 
ON public.payments 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Restrict service updates to specific operations with service role only
CREATE POLICY "Service role can update payments" 
ON public.payments 
FOR UPDATE 
TO service_role
USING (true);

-- Add DELETE policy for users to delete their own payments
CREATE POLICY "Users can delete their own payments" 
ON public.payments 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Add constraints for data validation (including 'initiated' status found in existing data)
ALTER TABLE public.payments 
ADD CONSTRAINT valid_status 
CHECK (status IN ('pending', 'initiated', 'completed', 'failed', 'cancelled'));

ALTER TABLE public.payments 
ADD CONSTRAINT valid_currency 
CHECK (currency IN ('INR', 'USD', 'EUR', 'GBP'));

-- Fix the search path for the existing function
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;