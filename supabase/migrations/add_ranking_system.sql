-- Create a function to calculate points based on contact method
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
    ELSE RETURN 0;
  END CASE;
END;
$$;

-- Trigger to create activity when company is contacted
CREATE OR REPLACE FUNCTION create_activity_from_company()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only create activity if assigned_user_id and contact_method are set
  IF NEW.assigned_user_id IS NOT NULL AND NEW.contact_method IS NOT NULL THEN
    BEGIN
      INSERT INTO activities (user_id, source, source_id, contact_method, created_at)
      VALUES (NEW.assigned_user_id, 'company', NEW.id, NEW.contact_method, NOW());
    EXCEPTION WHEN OTHERS THEN
      -- Silently ignore errors (e.g., duplicate entries or foreign key issues)
      NULL;
    END;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to create activity when logistics is contacted
CREATE OR REPLACE FUNCTION create_activity_from_logistics()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only create activity if assigned_user_id and contact_method are set
  IF NEW.assigned_user_id IS NOT NULL AND NEW.contact_method IS NOT NULL THEN
    BEGIN
      INSERT INTO activities (user_id, source, source_id, contact_method, created_at)
      VALUES (NEW.assigned_user_id, 'logistics', NEW.id, NEW.contact_method, NOW());
    EXCEPTION WHEN OTHERS THEN
      -- Silently ignore errors (e.g., duplicate entries or foreign key issues)
      NULL;
    END;
  END IF;
  RETURN NEW;
END;
$$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS company_activity_trigger ON companies;
DROP TRIGGER IF EXISTS logistics_activity_trigger ON logistics;

-- Create triggers for companies table
CREATE TRIGGER company_activity_trigger
AFTER INSERT OR UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION create_activity_from_company();

-- Create triggers for logistics table
CREATE TRIGGER logistics_activity_trigger
AFTER INSERT OR UPDATE ON logistics
FOR EACH ROW
EXECUTE FUNCTION create_activity_from_logistics();

-- Create a function to calculate total ranking for a user
CREATE OR REPLACE FUNCTION calculate_user_ranking(user_id_param UUID)
RETURNS INT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  total_points INT := 0;
BEGIN
  SELECT COALESCE(SUM(get_contact_points(a.contact_method)), 0)
  INTO total_points
  FROM activities a
  WHERE a.user_id = user_id_param;
  
  RETURN total_points;
END;
$$;

-- Create a view to show user rankings
CREATE OR REPLACE VIEW user_rankings AS
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.team,
  COALESCE(SUM(get_contact_points(a.contact_method)), 0) as total_points,
  COUNT(a.id) as total_activities,
  COUNT(CASE WHEN a.contact_method = 'call' THEN 1 END) as call_count,
  COUNT(CASE WHEN a.contact_method = 'email' THEN 1 END) as email_count,
  COUNT(CASE WHEN a.contact_method = 'linkedin' THEN 1 END) as linkedin_count,
  COUNT(CASE WHEN a.contact_method = 'outing' THEN 1 END) as outing_count,
  ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(get_contact_points(a.contact_method)), 0) DESC) as rank
FROM profiles p
LEFT JOIN activities a ON p.id = a.user_id
GROUP BY p.id, p.full_name, p.email, p.team
ORDER BY total_points DESC;

-- Create a trigger to automatically update the ranking column in profiles table
CREATE OR REPLACE FUNCTION update_profile_ranking()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE profiles 
  SET ranking = calculate_user_ranking(NEW.user_id)
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS activity_ranking_trigger ON activities;

-- Create trigger to update ranking when activity is inserted or updated
CREATE TRIGGER activity_ranking_trigger
AFTER INSERT OR UPDATE ON activities
FOR EACH ROW
EXECUTE FUNCTION update_profile_ranking();

-- Initial update of all user rankings based on existing contacts in companies and logistics tables
UPDATE profiles p
SET ranking = (
  SELECT COALESCE(
    (SELECT COALESCE(SUM(get_contact_points(c.contact_method)), 0)
     FROM companies c
     WHERE c.assigned_user_id = p.id AND c.contact_method IS NOT NULL) +
    (SELECT COALESCE(SUM(get_contact_points(l.contact_method)), 0)
     FROM logistics l
     WHERE l.assigned_user_id = p.id AND l.contact_method IS NOT NULL), 0
  )
);
