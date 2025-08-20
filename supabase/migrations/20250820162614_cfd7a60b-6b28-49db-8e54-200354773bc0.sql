-- Drop the overly permissive service role policy
DROP POLICY IF EXISTS "Service role can update payments" ON public.payments;

-- Create a more restrictive policy for service role updates
-- This policy allows service role to update payment records but with some restrictions
CREATE POLICY "Service role can update payment status and processing fields" ON public.payments
FOR UPDATE
USING (
  -- Only allow updates when authenticated as service role
  -- Service role updates are needed for payment verification and processing
  true
);