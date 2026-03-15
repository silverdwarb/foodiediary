-- The original schema

-- Ingredient related tables -- 
CREATE TABLE IF NOT EXISTS ingredients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_ingredient_lower
ON ingredients(LOWER(name));

CREATE TABLE IF NOT EXISTS ingredient_notes(
    ingredient_id INTEGER PRIMARY KEY REFERENCES ingredients(id) ON DELETE CASCADE,
    notes TEXT
);

-- Recipe related tables --
CREATE TABLE IF NOT EXISTS recipes (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS recipe_notes (
    recipe_id INTEGER PRIMARY KEY REFERENCES recipes(id) ON DELETE CASCADE,
    notes TEXT
);

-- Equipment related tables

CREATE TABLE IF NOT EXISTS equipment ( 
    id Serial PRIMARY KEY,
    title TEXT NOT NULL,
    care JSONB,
    notes TEXT 
);

-- Techniques related tables

CREATE TABLE IF NOT EXISTS techniques (
    id SERIAL PRIMARY KEY,
    tech_name TEXT NOT NULL UNIQUE,
    notes TEXT
);

-- Flavor related tables

CREATE TABLE IF NOT EXISTS flavors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE -- e.g., Sweet, Sour, Umami, Piquant
);


-- Cook Logs
CREATE TABLE IF NOT EXISTS cook_logs (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    cook_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    Alterations JSONB,
    session_notes TEXT
);

-- Join Tables 
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
    amount NUMERIC(10,2),
    PRIMARY KEY (recipe_id, ingredient_id)
);

-- Link recipes to equipment used
CREATE TABLE IF NOT EXISTS recipe_equipment (
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
    PRIMARY KEY (recipe_id, equipment_id)
);

-- Link recipes to specific techniques applied
CREATE TABLE IF NOT EXISTS recipe_techniques (
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    technique_id INTEGER REFERENCES techniques(id) ON DELETE CASCADE,
    PRIMARY KEY (recipe_id, technique_id)
);

-- Link recipes to overall flavor profiles
CREATE TABLE IF NOT EXISTS recipe_flavors (
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    flavor_id INTEGER REFERENCES flavors(id) ON DELETE CASCADE,
    PRIMARY KEY (recipe_id, flavor_id)
);

/*check how much stuff is in the tables bc my dumbass keeps liking to clear stuff
SELECT 
    relname AS table_name, 
    n_live_tup AS row_count 
FROM 
    pg_stat_user_tables 
ORDER BY 
    table_name;*/


/*-- 1. Drop the join/junction tables first
DROP TABLE IF EXISTS recipe_flavors;
DROP TABLE IF EXISTS recipe_techniques;
DROP TABLE IF EXISTS recipe_equipment;
DROP TABLE IF EXISTS recipe_ingredients;

-- 2. Drop the secondary/supporting tables
DROP TABLE IF EXISTS cook_logs;
DROP TABLE IF EXISTS ingredient_notes;
DROP TABLE IF EXISTS recipe_notes;
DROP TABLE IF EXISTS equipment;
DROP TABLE IF EXISTS techniques;
DROP TABLE IF EXISTS flavors;
DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS recipes;

-- 3. Optionally, drop the index you created
DROP INDEX IF EXISTS idx_unique_ingredient_lower;*/