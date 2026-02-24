-- Update the points function to include social_media
-- (contact_method columns are plain TEXT, no enum to alter)
CREATE OR REPLACE FUNCTION get_contact_points(contact_method TEXT)
RETURNS INT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  CASE contact_method
    WHEN 'call' THEN RETURN 6;
    WHEN 'email' THEN RETURN 3;
    WHEN 'linkedin' THEN RETURN 4;
    WHEN 'outing' THEN RETURN 10;
    WHEN 'social_media' THEN RETURN 4;
    ELSE RETURN 0;
  END CASE;
END;
$$;
