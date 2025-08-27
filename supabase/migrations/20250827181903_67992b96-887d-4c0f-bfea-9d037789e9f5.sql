-- Drop the conflicting function versions
DROP FUNCTION IF EXISTS public.update_payment_processing(uuid, text, text, text, jsonb, text);
DROP FUNCTION IF EXISTS public.update_payment_processing(uuid, text, text, text, jsonb, jsonb, text);

-- Create a single consolidated function that handles both Razorpay and PayU
CREATE OR REPLACE FUNCTION public.update_payment_processing(
  payment_id uuid, 
  new_status text DEFAULT NULL::text, 
  razorpay_payment_id text DEFAULT NULL::text, 
  razorpay_signature text DEFAULT NULL::text, 
  razorpay_response jsonb DEFAULT NULL::jsonb, 
  payu_response jsonb DEFAULT NULL::jsonb, 
  enhanced_file_path text DEFAULT NULL::text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
    razorpay_payment_id = COALESCE(update_payment_processing.razorpay_payment_id, payments.razorpay_payment_id),
    razorpay_signature = COALESCE(update_payment_processing.razorpay_signature, payments.razorpay_signature), 
    razorpay_response = COALESCE(update_payment_processing.razorpay_response, payments.razorpay_response),
    payu_response = COALESCE(update_payment_processing.payu_response, payments.payu_response),
    enhanced_file_path = COALESCE(update_payment_processing.enhanced_file_path, payments.enhanced_file_path),
    updated_at = now()
  WHERE id = payment_id 
    AND status = 'pending'; -- Only allow updates to pending payments
  
  RETURN FOUND;
END;
$$;