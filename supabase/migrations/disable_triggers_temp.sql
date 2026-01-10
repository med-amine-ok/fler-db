-- Temporarily disable the problematic triggers to test if they're the issue
DROP TRIGGER IF EXISTS company_activity_trigger ON companies;
DROP TRIGGER IF EXISTS logistics_activity_trigger ON logistics;

-- Note: The triggers and functions still exist, they're just not active
-- To re-enable them later, run:
-- CREATE TRIGGER company_activity_trigger AFTER INSERT OR UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION create_activity_from_company();
-- CREATE TRIGGER logistics_activity_trigger AFTER INSERT OR UPDATE ON logistics FOR EACH ROW EXECUTE FUNCTION create_activity_from_logistics();
