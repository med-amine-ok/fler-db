-- Update the trigger function for companies to be smarter about when to add activities
CREATE OR REPLACE FUNCTION create_activity_from_company()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- We only want to create an activity if:
  -- 1. This is a new record (INSERT) and has contact info
  -- 2. It's an UPDATE and the contact_method or assigned_user_id has CHANGED
  -- 3. It's an UPDATE and we are setting assigned_user_id/contact_method for the first time
  
  IF TG_OP = 'INSERT' THEN
    IF NEW.assigned_user_id IS NOT NULL AND NEW.contact_method IS NOT NULL THEN
      INSERT INTO activities (user_id, source, source_id, contact_method, created_at)
      VALUES (NEW.assigned_user_id, 'company', NEW.id, NEW.contact_method, NOW());
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only insert if method changed or user changed
    -- This prevents points adding when just editing notes or names
    IF (NEW.assigned_user_id IS NOT NULL AND NEW.contact_method IS NOT NULL) AND 
       (OLD.contact_method IS DISTINCT FROM NEW.contact_method OR 
        OLD.assigned_user_id IS DISTINCT FROM NEW.assigned_user_id) THEN
      BEGIN
        INSERT INTO activities (user_id, source, source_id, contact_method, created_at)
        VALUES (NEW.assigned_user_id, 'company', NEW.id, NEW.contact_method, NOW());
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update the trigger function for logistics to be smarter
CREATE OR REPLACE FUNCTION create_activity_from_logistics()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.assigned_user_id IS NOT NULL AND NEW.contact_method IS NOT NULL THEN
      INSERT INTO activities (user_id, source, source_id, contact_method, created_at)
      VALUES (NEW.assigned_user_id, 'logistics', NEW.id, NEW.contact_method, NOW());
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF (NEW.assigned_user_id IS NOT NULL AND NEW.contact_method IS NOT NULL) AND 
       (OLD.contact_method IS DISTINCT FROM NEW.contact_method OR 
        OLD.assigned_user_id IS DISTINCT FROM NEW.assigned_user_id) THEN
      BEGIN
        INSERT INTO activities (user_id, source, source_id, contact_method, created_at)
        VALUES (NEW.assigned_user_id, 'logistics', NEW.id, NEW.contact_method, NOW());
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;
