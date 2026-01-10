-- Add event_id column to companies table
ALTER TABLE companies
ADD COLUMN event_id INT REFERENCES events(id) ON DELETE SET NULL;

-- Add index for faster queries
CREATE INDEX idx_companies_event_id ON companies(event_id);
