-- Add custom_author column to articles table
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS custom_author text;

-- Make author_id nullable if it isn't already (though we might keep it for tracking who created it)
-- For now, we will require EITHER author_id OR custom_author (enforced by app logic)
-- But DB constraint usually requires author_id if it's a foreign key. 
-- Let's make author_id nullable just in case we want purely manual authors, 
-- catch is: existing code relies on author relationship. 
-- Safer approach: Always set author_id to current user (creator) but display custom_author if present.

COMMENT ON COLUMN articles.custom_author IS 'Overrides the linked author name if set';
