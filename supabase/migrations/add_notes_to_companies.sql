-- Add notes column to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS notes text;

-- Add comment explaining usage
COMMENT ON COLUMN public.companies.notes IS 'Optional notes or remarks about the company contact interaction';
