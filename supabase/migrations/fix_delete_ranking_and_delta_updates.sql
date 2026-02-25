-- =============================================================
-- FIX 1: Replace full-recalculate ranking trigger with
--         delta-based triggers (add/subtract on each event).
--         This means manual edits to profiles.ranking persist.
-- FIX 2: On company/logistics DELETE, cascade-delete activities
--         so the subtract-points trigger fires automatically.
-- =============================================================

-- Drop the old full-recalculate trigger + function
DROP TRIGGER IF EXISTS activity_ranking_trigger ON activities;
DROP FUNCTION IF EXISTS update_profile_ranking() CASCADE;

-- ── INSERT: add the awarded points ──────────────────────────
CREATE OR REPLACE FUNCTION handle_activity_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE profiles
  SET ranking = GREATEST(0, COALESCE(ranking, 0) + get_contact_points(NEW.contact_method))
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS activity_insert_trigger ON activities;
CREATE TRIGGER activity_insert_trigger
AFTER INSERT ON activities
FOR EACH ROW EXECUTE FUNCTION handle_activity_insert();

-- ── UPDATE: swap old points for new points ───────────────────
CREATE OR REPLACE FUNCTION handle_activity_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE profiles
  SET ranking = GREATEST(0,
    COALESCE(ranking, 0)
    - get_contact_points(OLD.contact_method)
    + get_contact_points(NEW.contact_method)
  )
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS activity_update_trigger ON activities;
CREATE TRIGGER activity_update_trigger
AFTER UPDATE ON activities
FOR EACH ROW EXECUTE FUNCTION handle_activity_update();

-- ── DELETE: subtract the points that were originally awarded ─
CREATE OR REPLACE FUNCTION handle_activity_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE profiles
  SET ranking = GREATEST(0, COALESCE(ranking, 0) - get_contact_points(OLD.contact_method))
  WHERE id = OLD.user_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS activity_delete_trigger ON activities;
CREATE TRIGGER activity_delete_trigger
AFTER DELETE ON activities
FOR EACH ROW EXECUTE FUNCTION handle_activity_delete();

-- ── Company DELETE → delete associated activity ──────────────
--    The activity DELETE trigger above then subtracts the points.
CREATE OR REPLACE FUNCTION handle_company_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM activities
  WHERE source = 'company' AND source_id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS company_delete_trigger ON companies;
CREATE TRIGGER company_delete_trigger
AFTER DELETE ON companies
FOR EACH ROW EXECUTE FUNCTION handle_company_delete();

-- ── Logistics DELETE → delete associated activity ────────────
CREATE OR REPLACE FUNCTION handle_logistics_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM activities
  WHERE source = 'logistics' AND source_id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS logistics_delete_trigger ON logistics;
CREATE TRIGGER logistics_delete_trigger
AFTER DELETE ON logistics
FOR EACH ROW EXECUTE FUNCTION handle_logistics_delete();

-- ── Update user_rankings VIEW to use profiles.ranking as the ─
--    source of truth for points (respects manual edits). ──────
-- Must DROP first because the column type changes (bigint → int).
DROP VIEW IF EXISTS user_rankings;
CREATE VIEW user_rankings AS
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.team,
  COALESCE(p.ranking, 0) AS total_points,
  COUNT(a.id) AS total_activities,
  COUNT(CASE WHEN a.contact_method = 'call' THEN 1 END) AS call_count,
  COUNT(CASE WHEN a.contact_method = 'email' THEN 1 END) AS email_count,
  COUNT(CASE WHEN a.contact_method = 'linkedin' THEN 1 END) AS linkedin_count,
  COUNT(CASE WHEN a.contact_method = 'outing' THEN 1 END) AS outing_count,
  ROW_NUMBER() OVER (ORDER BY COALESCE(p.ranking, 0) DESC) AS rank
FROM profiles p
LEFT JOIN activities a ON p.id = a.user_id
GROUP BY p.id, p.full_name, p.email, p.team, p.ranking
ORDER BY total_points DESC;
