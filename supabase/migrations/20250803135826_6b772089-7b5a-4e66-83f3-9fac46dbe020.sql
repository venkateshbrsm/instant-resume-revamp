-- Add coupon_code column to payments table
ALTER TABLE public.payments ADD COLUMN coupon_code TEXT;