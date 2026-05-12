---fix missing unique constraint for ingredient table
ALTER TABLE ingredients ADD CONSTRAINT unique_ingredient_name UNIQUE (name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ingredients_name ON ingredients(name);