-- Update payments table for Razorpay integration
ALTER TABLE public.payments 
DROP COLUMN IF EXISTS payu_txnid,
DROP COLUMN IF EXISTS payu_hash,
DROP COLUMN IF EXISTS payu_response;

-- Add Razorpay specific columns
ALTER TABLE public.payments 
ADD COLUMN razorpay_order_id TEXT,
ADD COLUMN razorpay_payment_id TEXT,
ADD COLUMN razorpay_signature TEXT,
ADD COLUMN razorpay_response JSONB;