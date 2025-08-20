-- Drop the current policy
DROP POLICY IF EXISTS "Service role can update payment status and processing fields" ON public.payments;

-- Create a secure function for updating payment status and processing fields
CREATE OR REPLACE FUNCTION public.update_payment_processing(
  payment_id uuid,
  new_status text DEFAULT NULL,
  razorpay_payment_id text DEFAULT NULL,
  razorpay_signature text DEFAULT NULL,
  razorpay_response jsonb DEFAULT NULL,
  enhanced_file_path text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow specific status transitions
  IF new_status IS NOT NULL AND new_status NOT IN ('completed', 'failed', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status transition. Only completed, failed, or cancelled are allowed.';
  END IF;
  
  -- Update only the processing-related fields, never financial or user data
  UPDATE public.payments 
  SET 
    status = COALESCE(new_status, status),
    razorpay_payment_id = COALESCE(razorpay_payment_id, payments.razorpay_payment_id),
    razorpay_signature = COALESCE(razorpay_signature, payments.razorpay_signature), 
    razorpay_response = COALESCE(razorpay_response, payments.razorpay_response),
    enhanced_file_path = COALESCE(enhanced_file_path, payments.enhanced_file_path),
    updated_at = now()
  WHERE id = payment_id 
    AND status = 'pending'; -- Only allow updates to pending payments
  
  RETURN FOUND;
END;
$$;

-- Create a restrictive policy that prevents direct updates to the payments table
CREATE POLICY "Restrict direct payment updates" ON public.payments
FOR UPDATE
USING (false); -- Block all direct updates - must use the secure function instead