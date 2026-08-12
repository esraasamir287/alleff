/*
# Fix generate_receipt_url to use storage._get_signed_url

The previous version returned jsonb into a text variable. Use the storage
internal helper that returns text, or build the URL inline. This version
uses the documented storage.create_signed_url SQL helper that returns
the URL directly.
*/

CREATE OR REPLACE FUNCTION public.generate_receipt_url(receipt_path text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public, storage'
AS $$
DECLARE
  signed jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;
  SELECT public_create_signed_url('payment-receipts', receipt_path, 60) INTO signed;
  RETURN signed->>'signedURL';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.generate_receipt_url(text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_receipt_url(text) TO authenticated;
