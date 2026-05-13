-- Convert the amount column to TEXT to support units and descriptive amounts
ALTER TABLE recipe_ingredients 
ALTER COLUMN amount TYPE TEXT 
USING amount::TEXT;

-- Add a comment to document why this is text
COMMENT ON COLUMN recipe_ingredients.amount IS 'Stores amount + unit (e.g., "2 cups", "a pinch", "to taste")';