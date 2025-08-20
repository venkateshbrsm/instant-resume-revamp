-- Drop the overly permissive service role policy
DROP POLICY IF EXISTS "Service role can update payments" ON public.payments;

-- Create a more restrictive policy that only allows specific payment-related updates
-- This policy allows service role to update only payment processing fields, not sensitive data like amounts or user_id
CREATE POLICY "Service role can update payment processing fields" ON public.payments
FOR UPDATE
USING (true)
WITH CHECK (
  -- Only allow updates to payment processing fields, not financial or user data
  -- This prevents modification of sensitive fields like amount, user_id, email
  (
    -- Allow status transitions from pending to completed/failed
    (OLD.status = 'pending' AND NEW.status IN ('completed', 'failed', 'cancelled')) OR
    -- Allow same status (for other field updates)
    (OLD.status = NEW.status)
  )
  AND
  -- Prevent modification of critical financial and user data
  OLD.amount = NEW.amount AND
  OLD.user_id = NEW.user_id AND
  OLD.email = NEW.email AND
  OLD.currency = NEW.currency AND
  OLD.file_name = NEW.file_name AND
  OLD.created_at = NEW.created_at
);